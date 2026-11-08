/* KinPrep — stockage local + client Supabase minimal (fetch, sans dépendance) */
(function (KP) {
  const KEY = 'kinprep.v1', AKEY = 'kinprep.auth';
  const safe = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* stockage indisponible */ } },
  };
  const uid = () => (crypto && crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2));

  const blank = () => ({ profile: null, logs: [], checkins: {}, feedback: [], updated: Date.now() });
  const S = { data: safe.get(KEY) || blank(), mem: false };
  S.save = function () {
    S.data.updated = Date.now();
    if (!safe.set(KEY, S.data)) S.mem = true;
  };
  S.reset = function () { S.data = blank(); safe.del(KEY); };
  S.uid = uid;

  // ---------- Supabase ----------
  const cfg = () => KP.CONFIG || {};
  const enabled = () => !!(cfg().supabaseUrl && cfg().supabaseKey);
  let auth = safe.get(AKEY);
  async function api(path, opts = {}) {
    const headers = Object.assign({ apikey: cfg().supabaseKey, 'Content-Type': 'application/json' }, opts.headers || {});
    if (auth && auth.access_token && !opts.anon) headers.Authorization = 'Bearer ' + auth.access_token;
    const r = await fetch(cfg().supabaseUrl.replace(/\/$/, '') + path, Object.assign({}, opts, { headers }));
    const txt = await r.text();
    let body = null; try { body = txt ? JSON.parse(txt) : null; } catch (e) { body = txt; }
    if (!r.ok) { const msg = (body && (body.msg || body.message || body.error_description || body.error)) || ('Erreur ' + r.status); const err = new Error(msg); err.status = r.status; throw err; }
    return body;
  }
  async function ensureFresh() {
    if (!auth) return false;
    if (auth.expires_at && auth.expires_at * 1000 - Date.now() > 60000) return true;
    try {
      const b = await api('/auth/v1/token?grant_type=refresh_token', { method: 'POST', anon: true, body: JSON.stringify({ refresh_token: auth.refresh_token }) });
      setAuth(b); return true;
    } catch (e) { setAuth(null); return false; }
  }
  function setAuth(b) {
    if (b && b.access_token) { auth = { access_token: b.access_token, refresh_token: b.refresh_token, expires_at: b.expires_at || Math.floor(Date.now() / 1000) + (b.expires_in || 3600), user: b.user }; safe.set(AKEY, auth); }
    else { auth = null; safe.del(AKEY); }
  }
  const SB = {
    enabled,
    user: () => (auth && auth.user) || null,
    async signUp(email, password, name) {
      const b = await api('/auth/v1/signup', { method: 'POST', anon: true, body: JSON.stringify({ email, password, data: { name } }) });
      if (b && b.access_token) setAuth(b);
      return b;
    },
    async signIn(email, password) { const b = await api('/auth/v1/token?grant_type=password', { method: 'POST', anon: true, body: JSON.stringify({ email, password }) }); setAuth(b); return b; },
    async resetPassword(email) { return api('/auth/v1/recover', { method: 'POST', anon: true, body: JSON.stringify({ email }) }); },
    signOut() { setAuth(null); },
    async rest(path, opts) { await ensureFresh(); return api('/rest/v1/' + path, opts); },
    async upsert(table, rows, conflict) {
      return SB.rest(`${table}${conflict ? '?on_conflict=' + conflict : ''}`, { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify(rows) });
    },
    async me() { const u = SB.user(); if (!u) return null; const r = await SB.rest(`profiles?id=eq.${u.id}&select=*`); return r && r[0]; },
    async pushProfile(p) { const u = SB.user(); if (!u) return; await SB.upsert('profiles', [{ id: u.id, display_name: p.name || u.email, data: p, share: p.share !== false, updated_at: new Date().toISOString() }], 'id'); },
    async pushLog(l) {
      const u = SB.user(); if (!u) return;
      await SB.upsert('logs', [{ id: l.id, user_id: u.id, week: l.week, session_key: l.key, title: l.title, done_at: l.date, data: l, shared: l.shared !== false }], 'id');
      if (l.shared !== false) await SB.upsert('feed', [{ id: l.id, user_id: u.id, author: (KP.store.data.profile || {}).name || u.email, week: l.week, session_key: l.key, title: l.title, done_at: l.date, dur: l.dur || null, rpe: l.rpe || null, km: l.km || null }], 'id');
      else await SB.rest(`feed?id=eq.${l.id}`, { method: 'DELETE' });
    },
    async deleteLog(id) { await SB.rest(`logs?id=eq.${id}`, { method: 'DELETE' }); },
    async pushCheckin(week, c) { const u = SB.user(); if (!u) return; await SB.upsert('checkins', [{ user_id: u.id, week, data: c, updated_at: new Date().toISOString() }], 'user_id,week'); },
    async pull() {
      const u = SB.user(); if (!u) return null;
      const [p, logs, cis] = await Promise.all([SB.rest(`profiles?id=eq.${u.id}&select=*`), SB.rest(`logs?user_id=eq.${u.id}&select=data&order=done_at.asc`), SB.rest(`checkins?user_id=eq.${u.id}&select=week,data`)]);
      return { profile: p && p[0], logs: (logs || []).map(x => x.data), checkins: Object.fromEntries((cis || []).map(c => [c.week, c.data])) };
    },
    async feed() {
      const [logs, reacts] = await Promise.all([
        SB.rest('feed?select=*&order=done_at.desc&limit=60'),
        SB.rest('reactions?select=log_id,user_id'),
      ]);
      return { logs: logs || [], reacts: reacts || [] };
    },
    async react(logId, on) {
      const u = SB.user();
      if (on) return SB.upsert('reactions', [{ log_id: logId, user_id: u.id }], 'log_id,user_id');
      return SB.rest(`reactions?log_id=eq.${logId}&user_id=eq.${u.id}`, { method: 'DELETE' });
    },
    async team() {
      const [profs, logs, cis] = await Promise.all([
        SB.rest('profiles?select=id,display_name,role,approved,data,updated_at'),
        SB.rest('logs?select=user_id,week,session_key,title,done_at,data&order=done_at.desc&limit=2000'),
        SB.rest('checkins?select=user_id,week,data'),
      ]);
      return { profs: profs || [], logs: logs || [], cis: cis || [] };
    },
    async approve(id, v) { return SB.rest(`profiles?id=eq.${id}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ approved: v }) }); },
    async ai(payload) { await ensureFresh(); return api('/functions/v1/coach-ia', { method: 'POST', body: JSON.stringify(payload) }); },
  };

  // synchronisation en arrière-plan (file d'attente simple)
  const queue = S.data.queue || [];
  S.data.queue = queue;
  async function flush() {
    if (!enabled() || !SB.user() || !navigator.onLine) return;
    while (S.data.queue.length) {
      const job = S.data.queue[0];
      if (!S.data.profile || S.data.profile.demo) { S.data.queue.shift(); continue; }
      try {
        if (job.t === 'profile') await SB.pushProfile(S.data.profile);
        if (job.t === 'log') { const l = S.data.logs.find(x => x.id === job.id); if (l) await SB.pushLog(l); }
        if (job.t === 'dellog') await SB.deleteLog(job.id);
        if (job.t === 'checkin') await SB.pushCheckin(job.week, S.data.checkins[job.week]);
        S.data.queue.shift(); S.save();
      } catch (e) { console.warn('Synchro reportée', e.message); break; }
    }
  }
  S.sync = function (job) { if (!enabled()) return; S.data.queue.push(job); S.save(); flush(); };
  S.flush = flush;
  window.addEventListener('online', flush);

  KP.store = S; KP.sb = SB;
})(window.KP = window.KP || {});
