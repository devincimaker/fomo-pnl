/* fomo all-time PnL panel. Runs inside fomo.family (as a bookmarklet), so it
   uses your existing fomo login, no token copying. index.html turns this
   file into the draggable bookmark. Block comments only: pasting into a
   bookmark's URL field collapses the code onto one line. */
(async () => {
  const API = "https://prod-api.fomo.family";
  const ID = "fomo-alltime-pnl";
  if (location.hostname !== "fomo.family") {
    location.href = "https://fomo.family/leaderboard";
    return;
  }
  document.getElementById(ID)?.remove();

  const usd = (n) => (n < 0 ? "-" : n > 0 ? "+" : "") + "$" + Math.abs(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const color = (n) => (n > 0 ? "#3ddc84" : n < 0 ? "#ff5c6c" : "#ecebf5");
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const box = document.createElement("div");
  box.id = ID;
  box.style.cssText = "position:fixed;top:16px;right:16px;z-index:2147483647;width:320px;max-width:calc(100vw - 32px);background:#15132a;color:#ecebf5;border:1px solid #2a2747;border-radius:14px;padding:16px;font:14px/1.4 system-ui,sans-serif;box-shadow:0 12px 40px rgba(0,0,0,.5)";
  box.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b>All-time PnL</b><button data-x style="background:none;border:0;color:#8c89a8;font-size:18px;cursor:pointer">×</button></div>
    <form style="display:flex;gap:6px"><input placeholder="handle" style="flex:1;min-width:0;background:#0b0a14;border:1px solid #2a2747;color:#ecebf5;border-radius:8px;padding:8px 10px;font:inherit"><button style="background:#8b7cff;color:#fff;border:0;border-radius:8px;padding:0 12px;font:inherit;font-weight:600;cursor:pointer">Go</button></form>
    <div data-out style="margin-top:12px"></div>`;
  document.body.appendChild(box);
  const input = box.querySelector("input");
  const out = box.querySelector("[data-out]");
  box.querySelector("[data-x]").onclick = () => box.remove();

  async function api(path) {
    const token = JSON.parse(localStorage.getItem("privy:token") || "null");
    if (!token) throw new Error("Not logged in to fomo");
    const r = await fetch(API + path, { headers: { Authorization: `Bearer ${token}` } });
    const body = await r.json().catch(() => ({}));
    if (r.status === 404) throw new Error("User not found");
    if (!r.ok) throw new Error(r.status >= 430 ? "fomo login expired, reload the page" : body.message || `Error ${r.status}`);
    return body.responseObject;
  }

  async function lookup(handle) {
    handle = handle.trim().replace(/^@/, "");
    if (!handle) return;
    out.innerHTML = `<span style="color:#8c89a8">Loading…</span>`;
    try {
      const user = await api(`/v2/users/userHandle/${encodeURIComponent(handle)}`);
      const lb = await api(`/v2/users/${user.id}/leaderboard`);
      const pnl = lb.rank?.pnl ?? 0;
      const tile = (label, r) => `<div style="border:1px solid #2a2747;border-radius:8px;padding:6px 8px"><div style="color:#8c89a8;font-size:11px">${label}</div><b style="color:${color(r?.pnl)};font-size:13px">${r ? usd(r.pnl) : "—"}</b></div>`;
      out.innerHTML = `
        <div style="color:#8c89a8">${esc(user.displayName)} · @${esc(user.userHandle)}</div>
        <div style="font-size:30px;font-weight:700;color:${color(pnl)}">${usd(pnl)}</div>
        <div style="color:#8c89a8;font-size:12px">${lb.rank?.rank ? "Rank #" + lb.rank.rank.toLocaleString() + " all-time" : ""}</div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:10px">${tile("30d", lb.rank30d)}${tile("7d", lb.rank7d)}${tile("24h", lb.rank24h)}</div>
        <div style="color:#8c89a8;font-size:12px;margin-top:10px">${(lb.numTrades ?? 0).toLocaleString()} trades · $${Math.round(lb.totalVolume ?? 0).toLocaleString()} volume</div>`;
    } catch (e) {
      out.innerHTML = `<span style="color:#ff5c6c">${esc(e.message)}</span>`;
    }
  }

  box.querySelector("form").onsubmit = (e) => { e.preventDefault(); lookup(input.value); };
  const fromUrl = location.pathname.match(/^\/(?:profile|u)\/([^/]+)/)?.[1];
  if (fromUrl) { input.value = decodeURIComponent(fromUrl); lookup(input.value); } else input.focus();
})();
