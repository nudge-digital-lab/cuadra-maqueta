/* Cuadra — maqueta navegable. Sin backend: todo vive en localStorage. */
(function () {
  "use strict";

  const D = window.CUADRA_DATA;
  const KEY = "cuadra-demo-v1";
  const phone = document.getElementById("phone");
  const screen = document.getElementById("screen");
  const nav = document.getElementById("nav");
  const side = document.getElementById("side");

  const STEPS = ["recibido", "preparacion", "camino", "entregado"];
  const STEP_INFO = {
    recibido: { t: "Pedido recibido", emo: "🧾", sub: "El comercio lo está por confirmar.", corto: "Recibido" },
    preparacion: { t: "En preparación", emo: "👩‍🍳", sub: "Ya lo están preparando.", corto: "En preparación" },
    camino: { t: "En camino", emo: "🛵", sub: "Tu pedido salió del local.", corto: "En camino" },
    entregado: { t: "Entregado", emo: "✅", sub: "¡Que lo disfrutes!", corto: "Entregado" },
    rechazado: { t: "El comercio no pudo tomarlo", emo: "😕", sub: "No se te cobró nada.", corto: "Rechazado" },
    cancelado: { t: "Pedido cancelado", emo: "🚫", sub: "Lo cancelaste antes de que lo confirmen.", corto: "Cancelado" }
  };
  // Demo acelerada: cuánto dura cada estado si nadie lo mueve desde el panel
  const AUTO = { recibido: 15000, preparacion: 25000, camino: 30000 };
  const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
  const DIAS_C = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const TICKET_CAT = { rotiserias: 16500, pizzerias: 19000, heladerias: 14000, almacenes: 12000, farmacias: 9000, kioscos: 6000 };

  /* ---------------- utilidades ---------------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const money = (n) => "$" + Math.round(n).toLocaleString("es-AR");
  const pad2 = (n) => String(n).padStart(2, "0");
  const hhmm = (d) => pad2(d.getHours()) + ":" + pad2(d.getMinutes());
  const toMin = (h) => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };
  const minToH = (m) => pad2(Math.floor(m / 60) % 24) + ":" + pad2(m % 60);
  const norm = (s) => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const first = (n) => String(n).split(" ")[0];
  const initials = (n) => String(n).split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const hash = (s) => { let h = 0; for (const ch of String(s)) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function ago(ts) {
    const m = Math.round((Date.now() - ts) / 60000);
    if (m < 1) return "recién";
    if (m < 60) return `hace ${m} min`;
    const h = Math.round(m / 60);
    if (h < 24) return `hace ${h} h`;
    if (h < 48) return "ayer";
    return `hace ${Math.round(h / 24)} días`;
  }
  function fmtDate(ts) {
    const d = new Date(ts), now = new Date();
    const day0 = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    if (ts >= day0) return `Hoy ${hhmm(d)}`;
    if (ts >= day0 - 86400000) return `Ayer ${hhmm(d)}`;
    const dn = DIAS[d.getDay()];
    return `${dn[0].toUpperCase() + dn.slice(1)} ${d.getDate()}/${d.getMonth() + 1} · ${hhmm(d)}`;
  }
  const isToday = (ts) => new Date(ts).toDateString() === new Date().toDateString();

  const sv = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const I = {
    home: sv('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h5v-6h4v6h5V9.5"/>'),
    orders: sv('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6M9 16h3"/>'),
    shield: sv('<path d="M12 3 20 6v6c0 5-3.4 8.2-8 9-4.6-.8-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
    user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21c1.4-4 4.4-6 8-6s6.6 2 8 6"/>'),
    search: sv('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
    back: sv('<path d="M15 5l-7 7 7 7"/>'),
    chevR: sv('<path d="m9 5 7 7-7 7"/>'),
    chevD: sv('<path d="m6 9 6 6 6-6"/>'),
    plus: sv('<path d="M12 5v14M5 12h14"/>'),
    minus: sv('<path d="M5 12h14"/>'),
    x: sv('<path d="M6 6l12 12M18 6 6 18"/>'),
    check: sv('<path d="m5 12 5 5 9-10"/>'),
    pin: sv('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
    clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    bell: sv('<path d="M6 16v-5a6 6 0 1 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>'),
    share: sv('<path d="M12 3v12"/><path d="m7 8 5-5 5 5"/><path d="M5 14v6h14v-6"/>'),
    info: sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    alert: sv('<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>'),
    lock: sv('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
    edit: sv('<path d="M4 20h4L19 9l-4-4L4 16z"/>'),
    trash: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
    store: sv('<path d="M4 9 5.5 4h13L20 9"/><path d="M4 9h16v2a3 3 0 0 1-5.3 2 3 3 0 0 1-5.4 0A3 3 0 0 1 4 11z"/><path d="M5 13v7h14v-7"/>'),
    card: sv('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/>'),
    cash: sv('<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'),
    msg: sv('<path d="M4 5h16v11H9l-5 4z"/>'),
    camera: sv('<rect x="3" y="7" width="13" height="10" rx="2"/><path d="m16 11 5-3v8l-5-3"/>'),
    refresh: sv('<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>'),
    phone: sv('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>')
  };
  const LOGO = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="2" fill="#fff"/><rect x="13" y="3" width="8" height="8" rx="2" fill="#fff" opacity=".55"/><rect x="3" y="13" width="8" height="8" rx="2" fill="#fff" opacity=".55"/><rect x="13" y="13" width="8" height="8" rx="2" fill="#E8772E"/></svg>';

  /* ---------------- estado ---------------- */
  function rawShop(id) { return D.comercios.find((s) => s.id === id); }
  function buildOrder(o) {
    const s = rawShop(o.localId);
    const items = o.items.map(([pid, qty]) => {
      const p = s.menu.find((x) => x.id === pid);
      return { pid, qty, nombre: p.nombre, precio: p.precio, emoji: p.emoji };
    });
    const subtotal = items.reduce((a, i) => a + i.precio * i.qty, 0);
    const envio = D.config.envioBase + (s.envioExtra || 0);
    const history = { recibido: o.created };
    const gaps = { preparacion: 3, camino: 22, entregado: 38 };
    for (const st of STEPS.slice(1, STEPS.indexOf(o.status) + 1)) history[st] = o.created + gaps[st] * 60000;
    return {
      id: o.id, localId: o.localId, items, subtotal, envio, total: subtotal + envio, pago: o.pago, pagaCon: o.pagaCon || 0,
      created: o.created, status: o.status, history, mine: o.mine, cliente: o.cliente, direccion: o.direccion, note: o.note || ""
    };
  }
  function seed() {
    const now = Date.now();
    const orders = [];
    D.historial.forEach((h) => orders.push(buildOrder({
      ...h, created: now - h.diasAtras * 86400000 - ((h.id % 5) + 1) * 3600000, status: "entregado", mine: true,
      cliente: "Lucía G.", direccion: D.usuario.direcciones[0].linea
    })));
    D.entrantes.forEach((e) => orders.push(buildOrder({ ...e, created: now - e.minutos * 60000, status: e.estado, mine: false })));
    return {
      v: 1,
      cart: { localId: null, items: {}, note: "" },
      orders, nextId: 1043,
      alerts: D.alertas.map((a) => ({ ...a, created: now - a.minutos * 60000 })),
      useful: {}, menu: {}, extraProducts: {}, shops: {}, extraShops: [],
      config: clone(D.config), zonas: clone(D.zonas), user: clone(D.usuario), addrId: "d1",
      merchantId: "la-esquina-de-tito", pay: "mp", pagaCon: "", ind: null
    };
  }
  let S = null;
  try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; }
  if (!S || S.v !== 1) S = seed();
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* modo privado: la demo sigue en memoria */ } }

  /* ---------------- modelo ---------------- */
  const cat = (id) => D.categorias.find((c) => c.id === id) || D.categorias[0];
  const tipo = (id) => D.tiposAlerta.find((t) => t.id === id) || D.tiposAlerta[5];
  const allShops = () => D.comercios.concat(S.extraShops);
  const shop = (id) => allShops().find((s) => s.id === id);
  const shopSt = (id) => S.shops[id] || (S.shops[id] = {});
  const isActive = (s) => !(S.shops[s.id] && S.shops[s.id].activo === false);
  const visibleShops = () => allShops().filter(isActive);
  const horarioOf = (s) => (S.shops[s.id] && S.shops[s.id].horario) || s.horario;
  const cerradoOf = (s) => (S.shops[s.id] && S.shops[s.id].diasCerrado) || s.diasCerrado || [];
  const is24 = (h) => h.length === 1 && h[0][0] === "00:00" && h[0][1] === "24:00";

  function openInfo(s, d) {
    d = d || new Date();
    const st = S.shops[s.id] || {};
    if (st.pausado) return { open: false, label: "Cerrado por hoy", paused: true };
    const mins = d.getHours() * 60 + d.getMinutes();
    const day = d.getDay(), yday = (day + 6) % 7;
    const ranges = horarioOf(s), closed = cerradoOf(s);
    for (const [a, b] of ranges) {
      const A = toMin(a), B = toMin(b);
      if (!closed.includes(day) && (B > A ? mins >= A && mins < B : mins >= A)) return { open: true, label: "Abierto", until: b };
      if (B <= A && !closed.includes(yday) && mins < B) return { open: true, label: "Abierto", until: b };
    }
    for (let k = 0; k < 8; k++) {
      const dd = (day + k) % 7;
      if (closed.includes(dd)) continue;
      const opts = ranges.map((r) => toMin(r[0])).filter((A) => k > 0 || A > mins).sort((x, y) => x - y);
      if (opts.length) {
        const h = minToH(opts[0]);
        return { open: false, opensAt: h, label: k === 0 ? `Abre a las ${h}` : k === 1 ? `Abre mañana ${h}` : `Abre el ${DIAS[dd]} ${h}` };
      }
    }
    return { open: false, label: "Cerrado" };
  }
  function horarioTxt(s) {
    const h = horarioOf(s);
    if (is24(h)) return "Abierto las 24 horas";
    return h.map(([a, b]) => `${a} a ${b}`).join(" y ");
  }
  function products(localId) {
    const s = shop(localId);
    if (!s) return [];
    return (s.menu || []).concat(S.extraProducts[localId] || [])
      .map((p) => Object.assign({}, p, S.menu[p.id] || {}))
      .filter((p) => !p.borrado);
  }
  const product = (localId, pid) => products(localId).find((p) => p.id === pid);
  function envioDe(s, subtotal) {
    const c = S.config;
    if (c.envioGratisDesde > 0 && subtotal >= c.envioGratisDesde) return 0;
    return Number(c.envioBase) + (s.envioExtra || 0);
  }
  function cartLines() {
    const c = S.cart;
    if (!c.localId) return [];
    return Object.keys(c.items).map((pid) => {
      const p = product(c.localId, pid);
      return p ? { p, qty: c.items[pid] } : null;
    }).filter(Boolean);
  }
  const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
  const cartSubtotal = () => cartLines().reduce((a, l) => a + l.qty * l.p.precio, 0);
  const activeOrders = () => S.orders.filter((o) => o.mine && ["recibido", "preparacion", "camino"].includes(o.status)).sort((a, b) => b.created - a.created);
  const currentAddr = () => S.user.direcciones.find((d) => d.id === S.addrId) || S.user.direcciones[0] || { linea: "Agregá una dirección", indicaciones: "" };

  /* ---------------- router ---------------- */
  function parse() {
    const h = location.hash.slice(1) || "/";
    const [path, qs] = h.split("?");
    return { parts: path.split("/").filter(Boolean), q: new URLSearchParams(qs || "") };
  }
  const go = (h) => { location.hash = h; };
  let dirty = false;

  function render(isNav) {
    const r = parse();
    const [a, b, c] = r.parts;
    let view = "", mode = "vecino", tab = null;
    if (a === "comercio") { mode = "comercio"; view = viewComercio(b || "hoy"); }
    else if (a === "admin") { mode = "admin"; view = viewAdmin(b || "metricas"); }
    else {
      switch (a) {
        case undefined: tab = "inicio"; view = viewHome(); break;
        case "buscar": tab = "inicio"; view = viewBuscar(r.q); break;
        case "local": tab = "inicio"; view = viewLocal(b); break;
        case "carrito": view = viewCarrito(); break;
        case "checkout": view = viewCheckout(); break;
        case "pedidos": tab = "pedidos"; view = b ? viewPedido(Number(b)) : viewPedidos(); break;
        case "seguridad":
          if (b === "camara") view = viewCamara(c);
          else if (b === "alertas" && c === "nueva") view = viewNuevaAlerta(r.q);
          else { tab = "seguridad"; view = viewSeguridad(b === "alertas" ? "alertas" : "camaras", r.q); }
          break;
        case "perfil": tab = "perfil"; view = viewPerfil(); break;
        default: tab = "inicio"; view = viewHome();
      }
    }
    phone.classList.toggle("wide", mode !== "vecino");
    const y = isNav ? 0 : screen.scrollTop;
    screen.innerHTML = view;
    nav.innerHTML = tab ? bottomNav(tab) : "";
    nav.hidden = !tab;
    screen.scrollTop = y;
    if (isNav) closeSheet();
    renderSide(mode);
    dirty = false;
    liveUpdate();
  }
  let navDepth = 0;
  window.addEventListener("hashchange", () => { navDepth = Math.max(0, navDepth + 1); render(true); });

  function bottomNav(tab) {
    const n = activeOrders().length;
    const it = (id, href, icon, label, badge) => `<a href="${href}" class="${tab === id ? "on" : ""}" ${tab === id ? 'aria-current="page"' : ""}>${icon}<span>${label}</span>${badge ? `<span class="badge">${badge}</span>` : ""}</a>`;
    return it("inicio", "#/", I.home, "Inicio") + it("pedidos", "#/pedidos", I.orders, "Pedidos", n) + it("seguridad", "#/seguridad", I.shield, "Seguridad") + it("perfil", "#/perfil", I.user, "Perfil");
  }

  function renderSide(mode) {
    side.innerHTML = `
      <div class="logo-big"><div class="mark" style="width:48px;height:48px;border-radius:14px">${LOGO}</div>Cuadra</div>
      <p>Delivery de barrio para el centro de Berazategui. Es una <b>maqueta navegable</b>: los comercios y los datos son de ejemplo, y no se cobra nada.</p>
      <div class="roles" role="navigation" aria-label="Elegí qué ver">
        <a class="role ${mode === "vecino" ? "on" : ""}" href="#/"><span style="font-size:24px">🏠</span><span>App del vecino<small>Pedir, seguir el pedido, seguridad</small></span></a>
        <a class="role ${mode === "comercio" ? "on" : ""}" href="#/comercio"><span style="font-size:24px">🏪</span><span>Panel del comercio<small>Recibir y preparar pedidos</small></span></a>
        <a class="role ${mode === "admin" ? "on" : ""}" href="#/admin"><span style="font-size:24px">📊</span><span>Panel de administración<small>Comercios, zonas y comisión</small></span></a>
      </div>
      <p class="fine">Probá esto: hacé un pedido en la app y después aceptalo desde el panel del comercio. Si nadie lo toca, avanza solo cada unos segundos.</p>
      <p class="fine">En el celu: abrí este mismo link y tocá “Agregar a pantalla de inicio” para instalarla.</p>
      <button class="reset" data-act="reset">Reiniciar la demo</button>`;
  }

  /* ---------------- piezas comunes ---------------- */
  function statusPill(o) {
    if (o.open) return `<span class="pill pill-open"><span class="dot"></span>Abierto</span>`;
    return `<span class="pill pill-closed">${esc(o.label)}</span>`;
  }
  function shopTags(s) {
    let t = "";
    if (s.nuevo) t += `<span class="pill pill-new">Nuevo</span>`;
    if (s.etiqueta) t += `<span class="pill pill-new">${esc(s.etiqueta)}</span>`;
    return t;
  }
  const ratingTxt = (s) => s.rating ? `<span><span style="color:var(--naranja-700)">★</span> <b>${s.rating}</b></span>` : `<span>Nuevo en Cuadra</span>`;
  function shopRow(s) {
    const o = openInfo(s), c = cat(s.cat);
    return `<a class="shop card ${o.open ? "" : "closed"}" href="#/local/${s.id}">
      <div class="thumb" style="background:${c.color}" aria-hidden="true">${s.emoji}</div>
      <div class="grow">
        <h3 class="h3 ellipsis">${esc(s.nombre)}</h3>
        <div class="meta" style="margin-top:3px">${ratingTxt(s)}<span>${esc(s.demora)} min</span><span>Envío ${money(envioDe(s, 0))}</span></div>
        <div class="row" style="margin-top:7px;gap:6px;flex-wrap:wrap">${statusPill(o)}${shopTags(s)}</div>
      </div></a>`;
  }
  function topbar(title, back, right) {
    return `<div class="topbar"><a class="icon-btn flat" href="${back || "#/"}" data-act="back" aria-label="Volver">${I.back}</a><h1 class="title ellipsis">${esc(title)}</h1>${right || ""}</div>`;
  }
  function cartBar() {
    const n = cartCount();
    if (!n) return "";
    const s = shop(S.cart.localId);
    return `<div class="cartbar"><a class="btn btn-primary" href="#/carrito"><span class="row" style="gap:10px"><span class="count">${n}</span>Ver pedido${s ? ` · ${esc(s.nombre)}` : ""}</span><span>${money(cartSubtotal())}</span></a></div>`;
  }
  function empty(emo, title, text, cta) {
    return `<div class="center" style="padding:48px 24px"><div style="font-size:64px">${emo}</div><h2 class="h2" style="margin-top:12px">${title}</h2><p class="muted" style="margin-top:8px;line-height:1.5">${text}</p>${cta ? `<div style="margin-top:20px">${cta}</div>` : ""}</div>`;
  }
  const notFound = () => topbar("No encontrado") + empty("🧭", "Esta página no existe", "Puede que el link esté viejo.", `<a class="btn btn-primary" href="#/">Ir al inicio</a>`);

  /* ---------------- INICIO ---------------- */
  function viewHome() {
    const shops = visibleShops();
    const open = shops.filter((s) => openInfo(s).open);
    const closed = shops.filter((s) => !openInfo(s).open);
    const feat = shops.filter((s) => s.destacado);
    const act = activeOrders()[0];
    const addr = currentAddr();
    return `
      <header class="home-head">
        <div class="row between">
          <div class="row"><div class="mark">${LOGO}</div><span class="wordmark" style="font-size:23px">Cuadra</span></div>
          <a class="icon-btn" href="#/seguridad/alertas" aria-label="Alertas vecinales">${I.bell}</a>
        </div>
        <button class="addr-btn" data-act="pick-addr" aria-label="Cambiar dirección de entrega">${I.pin}<span class="ellipsis">${esc(addr.linea)}</span>${I.chevD}</button>
        <h1 class="h1" style="margin-top:2px">¿Qué pedimos hoy, ${esc(first(S.user.nombre))}?</h1>
      </header>
      ${act ? activeOrderCard(act) : ""}
      <form class="pad" data-form="search" role="search" style="margin-top:14px">
        <label class="search">${I.search}<input name="q" type="search" enterkeyhint="search" placeholder="Milanesa, helado, ibuprofeno…" aria-label="Buscar comercios o productos"></label>
      </form>
      <section class="section">
        <div class="section-head"><h2 class="h2">Categorías</h2></div>
        <div class="cats">${D.categorias.map((c) => `<a class="cat" href="#/buscar?cat=${c.id}" style="background:${c.color}"><span class="emo" aria-hidden="true">${c.emoji}</span>${c.nombre}</a>`).join("")}</div>
      </section>
      <div class="banner">
        <h3>Comprale al barrio, sin salir de casa</h3>
        <p>La comisión es baja y el envío lo hacen vecinos de la zona. La plata queda en la cuadra.</p>
        <svg class="blocks" width="110" height="110" viewBox="0 0 110 110" aria-hidden="true"><rect x="8" y="8" width="44" height="44" rx="10" fill="#fff" opacity=".14"/><rect x="58" y="8" width="44" height="44" rx="10" fill="#fff" opacity=".22"/><rect x="8" y="58" width="44" height="44" rx="10" fill="#fff" opacity=".22"/><rect x="58" y="58" width="44" height="44" rx="10" fill="#E8772E"/></svg>
      </div>
      <section class="section">
        <div class="section-head"><h2 class="h2">Los que más piden</h2></div>
        <div class="hscroll">${feat.map(featCard).join("")}</div>
      </section>
      <section class="section">
        <div class="section-head"><h2 class="h2">Abiertos ahora <span class="muted" style="font-weight:600">(${open.length})</span></h2></div>
        <div class="pad stack">${open.length ? open.map(shopRow).join("") : `<p class="muted">A esta hora no hay comercios abiertos. Podés dejar un pedido programado.</p>`}</div>
      </section>
      ${closed.length ? `<section class="section"><div class="section-head"><h2 class="h2">Más tarde</h2></div><div class="pad stack">${closed.map(shopRow).join("")}</div></section>` : ""}
      <div style="height:20px"></div>
      ${cartBar()}`;
  }
  function featCard(s) {
    const o = openInfo(s);
    return `<a class="feat card" href="#/local/${s.id}">
      <div class="cover" style="background:${s.color}"><span class="big" aria-hidden="true">${s.emoji}</span></div>
      <div class="body"><h3 class="h3 ellipsis">${esc(s.nombre)}</h3>
      <div class="meta" style="margin-top:4px">${ratingTxt(s)}<span>${esc(s.demora)} min</span></div>
      <div class="row" style="margin-top:8px;gap:6px">${statusPill(o)}${shopTags(s)}</div></div></a>`;
  }
  function activeOrderCard(o) {
    const s = shop(o.localId), st = STEP_INFO[o.status];
    return `<a class="card card-pad row" href="#/pedidos/${o.id}" style="margin:12px 16px 0;border:2px solid var(--verde)">
      <span style="font-size:32px" aria-hidden="true">${st.emo}</span>
      <div class="grow"><b>${st.t}</b><div class="small muted ellipsis">Pedido #${o.id} · ${esc(s ? s.nombre : "")}</div></div>
      <span class="link small">Seguir</span></a>`;
  }

  /* ---------------- BUSCAR ---------------- */
  function viewBuscar(q) {
    const term = (q.get("q") || "").trim();
    const catId = q.get("cat") || "";
    const t = norm(term);
    const shops = visibleShops().filter((s) => (!catId || s.cat === catId) && (!t || norm(s.nombre + " " + cat(s.cat).nombre + " " + (s.descripcion || "")).includes(t)));
    const hits = [];
    if (t) visibleShops().filter((s) => !catId || s.cat === catId).forEach((s) => products(s.id).forEach((p) => { if (norm(p.nombre + " " + (p.desc || "")).includes(t)) hits.push({ s, p }); }));
    const qs = (c) => `#/buscar?${new URLSearchParams(Object.assign({}, term ? { q: term } : {}, c ? { cat: c } : {}))}`;
    const title = catId ? cat(catId).nombre : "Buscar";
    return `${topbar(title, "#/")}
      <form class="pad" data-form="search" role="search" data-cat="${esc(catId)}">
        <label class="search">${I.search}<input name="q" type="search" enterkeyhint="search" value="${esc(term)}" placeholder="Comercios o productos" aria-label="Buscar"></label>
      </form>
      <div class="chips" style="margin-top:12px">
        <a class="chip ${!catId ? "on" : ""}" href="${qs("")}">Todo</a>
        ${D.categorias.map((c) => `<a class="chip ${catId === c.id ? "on" : ""}" href="${qs(c.id)}">${c.emoji} ${c.nombre}</a>`).join("")}
      </div>
      <section class="section" style="margin-top:14px">
        <div class="section-head"><h2 class="h3">${shops.length} ${shops.length === 1 ? "comercio" : "comercios"}</h2></div>
        <div class="pad stack">${shops.map(shopRow).join("") || `<p class="muted">Ningún comercio coincide.</p>`}</div>
      </section>
      ${t ? `<section class="section"><div class="section-head"><h2 class="h3">Productos (${hits.length})</h2></div>
        ${hits.length ? `<div class="list" style="margin:0 16px">${hits.slice(0, 30).map(({ s, p }) => prodRow(s, p, true)).join("")}</div>` : `<p class="muted pad">No encontramos “${esc(term)}”. Probá con otra palabra.</p>`}</section>` : ""}
      <div style="height:20px"></div>${cartBar()}`;
  }

  /* ---------------- COMERCIO (vista del vecino) ---------------- */
  function prodRow(s, p, showShop) {
    const qty = S.cart.localId === s.id ? S.cart.items[p.id] || 0 : 0;
    const off = !!p.pausado;
    return `<div class="prod ${off ? "off" : ""}" ${off ? "" : `role="button" tabindex="0" data-act="open-prod" data-local="${s.id}" data-pid="${p.id}"`}>
      <div class="grow">
        <h4>${esc(p.nombre)}</h4>
        ${showShop ? `<p>${esc(s.nombre)}</p>` : p.desc ? `<p>${esc(p.desc)}</p>` : ""}
        <div class="price">${money(p.precio)}</div>
        ${off ? `<span class="pill pill-closed" style="margin-top:6px">Sin stock por hoy</span>` : ""}
      </div>
      <div class="pthumb" aria-hidden="${off}">${p.emoji || "🛍️"}
        ${off ? "" : qty ? `<span class="qty" aria-label="${qty} en el pedido">${qty}</span>` : `<button class="add" data-act="add" data-local="${s.id}" data-pid="${p.id}" aria-label="Agregar ${esc(p.nombre)}">${I.plus}</button>`}
      </div></div>`;
  }
  function viewLocal(id) {
    const s = shop(id);
    if (!s || !isActive(s)) return notFound();
    const o = openInfo(s), c = cat(s.cat);
    const prods = products(id);
    const secs = [...new Set(prods.map((p) => p.seccion))];
    return `
      <div class="cover local-cover" style="background:${s.color}">
        <div class="over"><a class="icon-btn" href="#/" data-act="back" aria-label="Volver">${I.back}</a><button class="icon-btn" data-act="share" aria-label="Compartir">${I.share}</button></div>
        <span class="big" aria-hidden="true">${s.emoji}</span>
      </div>
      <div class="card local-info">
        <div class="row between" style="align-items:flex-start"><h1 class="h1" style="font-size:23px">${esc(s.nombre)}</h1></div>
        <div class="meta" style="margin-top:6px">${ratingTxt(s)}${s.resenas ? `<span>(${s.resenas} opiniones)</span>` : ""}<span>${c.nombre}</span></div>
        ${s.descripcion ? `<p class="small" style="margin-top:10px;line-height:1.45;color:var(--ink-2)">${esc(s.descripcion)}</p>` : ""}
        <div class="row" style="margin-top:10px;gap:8px;flex-wrap:wrap">${statusPill(o)}${shopTags(s)}<span class="small muted">${esc(horarioTxt(s))}</span></div>
        <div class="row small muted" style="margin-top:8px;gap:6px"><span style="width:18px;display:inline-block">${I.pin}</span>${esc(s.direccion)}</div>
        <div class="facts">
          <div class="fact"><b>${esc(s.demora)}'</b><span>Demora</span></div>
          <div class="fact"><b>${money(envioDe(s, 0))}</b><span>Envío</span></div>
          <div class="fact"><b>${money(s.pedidoMin)}</b><span>Mínimo</span></div>
        </div>
      </div>
      ${!o.open ? `<div class="notice warn" style="margin:14px 16px 0">${I.clock}<span>Ahora está cerrado${o.opensAt ? ` (${esc(o.label.toLowerCase())})` : ""}. Podés armar el pedido igual: lo programamos para cuando abra.</span></div>` : ""}
      ${prods.length ? `
      <div class="chips menu-tabs" style="top:0">${secs.map((x, i) => `<button class="chip" data-act="jump" data-to="sec-${i}">${esc(x)}</button>`).join("")}</div>
      ${secs.map((x, i) => `<section id="sec-${i}"><h2 class="h2 pad" style="margin:18px 0 10px">${esc(x)}</h2>
        <div class="list" style="margin:0 16px">${prods.filter((p) => p.seccion === x).map((p) => prodRow(s, p)).join("")}</div></section>`).join("")}`
        : empty("🧑‍🍳", "Está cargando su menú", "Este comercio se sumó hace poco. En unos días vas a poder pedirle por acá.")}
      <div style="height:24px"></div>
      ${cartBar()}`;
  }
  let sheetQty = 1;
  function openProduct(localId, pid) {
    const s = shop(localId), p = product(localId, pid);
    if (!p) return;
    sheetQty = 1;
    openSheet(`<div class="grip"></div>
      <div class="center" style="font-size:76px;background:var(--bg);border-radius:18px;padding:18px 0" aria-hidden="true">${p.emoji || "🛍️"}</div>
      <h2 class="h2" style="margin-top:14px">${esc(p.nombre)}</h2>
      ${p.desc ? `<p class="muted" style="margin-top:6px;line-height:1.45">${esc(p.desc)}</p>` : ""}
      <p class="small muted" style="margin-top:6px">${esc(s.nombre)}</p>
      <div class="row between" style="margin-top:18px">
        <b style="font-size:21px">${money(p.precio)}</b>
        <div class="stepper"><button data-act="sq" data-d="-1" aria-label="Menos">${I.minus}</button><span id="sq">1</span><button data-act="sq" data-d="1" aria-label="Más">${I.plus}</button></div>
      </div>
      <button class="btn btn-primary btn-block" style="margin-top:18px" data-act="add-sheet" data-local="${s.id}" data-pid="${p.id}" data-price="${p.precio}">Agregar al pedido · <span id="sqt">${money(p.precio)}</span></button>`);
  }
  function addToCart(localId, pid, qty) {
    const doIt = () => {
      if (S.cart.localId !== localId) S.cart = { localId, items: {}, note: "" };
      S.cart.items[pid] = (S.cart.items[pid] || 0) + qty;
      save(); render();
      const p = product(localId, pid);
      toast(`Agregaste ${qty > 1 ? qty + " × " : ""}${p ? p.nombre : "el producto"}`);
    };
    if (S.cart.localId && S.cart.localId !== localId && cartCount() > 0) {
      const prev = shop(S.cart.localId);
      confirmSheet({
        title: "¿Empezamos un pedido nuevo?",
        text: `Ya tenés productos de ${esc(prev ? prev.nombre : "otro comercio")}. Cada pedido es de un solo comercio, así llega calentito y rápido.`,
        ok: "Vaciar y agregar", onOk: doIt
      });
      return;
    }
    doIt();
  }
  function setQty(pid, q) {
    if (q <= 0) delete S.cart.items[pid]; else S.cart.items[pid] = q;
    if (!Object.keys(S.cart.items).length) S.cart = { localId: null, items: {}, note: "" };
    save(); render();
  }

  /* ---------------- CARRITO ---------------- */
  function totalsHtml(sub, env) {
    return `<div class="totals">
      <div class="row"><span class="muted">Productos</span><span>${money(sub)}</span></div>
      <div class="row"><span class="muted">Envío</span><span>${env ? money(env) : "Gratis"}</span></div>
      <div class="row total"><span>Total</span><span>${money(sub + env)}</span></div></div>`;
  }
  function viewCarrito() {
    const lines = cartLines();
    if (!lines.length) return topbar("Tu pedido") + empty("🛍️", "Tu pedido está vacío", "Date una vuelta por los comercios del barrio.", `<a class="btn btn-primary" href="#/">Ver comercios</a>`);
    const s = shop(S.cart.localId);
    const sub = cartSubtotal(), env = envioDe(s, sub);
    const falta = s.pedidoMin - sub;
    return `${topbar("Tu pedido", "#/local/" + s.id)}
      <div class="pad stack">
        <a class="card shop" href="#/local/${s.id}"><div class="thumb" style="background:${cat(s.cat).color}" aria-hidden="true">${s.emoji}</div>
          <div class="grow"><h2 class="h3">${esc(s.nombre)}</h2><div class="small muted">${esc(s.demora)} min · ${esc(s.direccion)}</div></div><span class="link small">Agregar más</span></a>
        <div class="list">${lines.map(({ p, qty }) => `
          <div class="li"><span style="font-size:28px" aria-hidden="true">${p.emoji || "🛍️"}</span>
            <div class="grow"><div class="bold">${esc(p.nombre)}</div><div class="small muted">${money(p.precio)} c/u</div><div class="bold small" style="margin-top:2px">${money(p.precio * qty)}</div></div>
            <div class="stepper"><button data-act="qty" data-pid="${p.id}" data-d="-1" aria-label="${qty === 1 ? "Quitar" : "Uno menos"}">${qty === 1 ? I.trash : I.minus}</button><span>${qty}</span><button data-act="qty" data-pid="${p.id}" data-d="1" aria-label="Uno más">${I.plus}</button></div>
          </div>`).join("")}</div>
        <label class="field"><span>Nota para el comercio</span>
          <textarea class="textarea" data-bind="cart-note" maxlength="200" placeholder="Ej: sin sal, la milanesa bien cocida, gustos de helado…">${esc(S.cart.note)}</textarea></label>
        <div class="card card-pad">${totalsHtml(sub, env)}</div>
        ${falta > 0 ? `<div class="notice warn">${I.info}<span>Te faltan <b>${money(falta)}</b> para el pedido mínimo de este comercio (${money(s.pedidoMin)}).</span></div>` : ""}
      </div>
      <div style="height:16px"></div>
      <div class="cartbar">${falta > 0 ? `<button class="btn btn-primary" disabled>Ir a pagar</button>` : `<a class="btn btn-primary" href="#/checkout"><span>Ir a pagar</span><span>${money(sub + env)}</span></a>`}</div>`;
  }

  /* ---------------- CHECKOUT ---------------- */
  function viewCheckout() {
    const lines = cartLines();
    if (!lines.length) return topbar("Confirmar pedido", "#/carrito") + empty("🛍️", "No hay nada para confirmar", "Tu pedido está vacío.", `<a class="btn btn-primary" href="#/">Ver comercios</a>`);
    const s = shop(S.cart.localId), o = openInfo(s);
    const sub = cartSubtotal(), env = envioDe(s, sub), total = sub + env;
    const addr = currentAddr();
    if (S.ind == null) S.ind = addr.indicaciones || "";
    const [dmin, dmax] = String(s.demora).split("-").map(Number);
    const now = new Date();
    const eta = o.open
      ? `Llega entre las ${hhmm(new Date(+now + dmin * 60000))} y las ${hhmm(new Date(+now + dmax * 60000))}`
      : `Programado: lo preparan cuando abran (${esc(o.label.toLowerCase())})`;
    return `${topbar("Confirmar pedido", "#/carrito")}
      <div class="pad stack">
        <h2 class="h3" style="margin-top:4px">¿A dónde lo llevamos?</h2>
        ${S.user.direcciones.map((d) => `<label class="choice"><input type="radio" name="addr" value="${d.id}" data-bind="addr" ${d.id === addr.id ? "checked" : ""}>
          <span class="grow"><b>${esc(d.etiqueta)}</b><span class="small muted" style="display:block">${esc(d.linea)}</span></span></label>`).join("")}
        <label class="field"><span>Indicaciones para quien reparte</span>
          <input class="input" data-bind="ind" value="${esc(S.ind)}" placeholder="Ej: portón verde, tocar timbre 2"></label>

        <h2 class="h3" style="margin-top:22px">¿Cómo pagás?</h2>
        <label class="choice"><input type="radio" name="pago" value="mp" data-bind="pay" ${S.pay === "mp" ? "checked" : ""}>
          <span style="color:var(--verde)">${I.card}</span><span class="grow"><b>Mercado Pago</b><span class="small muted" style="display:block">Tarjeta o dinero en cuenta · simulado</span></span></label>
        <label class="choice"><input type="radio" name="pago" value="efectivo" data-bind="pay" ${S.pay === "efectivo" ? "checked" : ""}>
          <span style="color:var(--verde)">${I.cash}</span><span class="grow"><b>Efectivo</b><span class="small muted" style="display:block">Le pagás a quien te lo lleva</span></span></label>
        ${S.pay === "efectivo" ? `<label class="field"><span>¿Con cuánto pagás? <span class="muted" style="font-weight:500">(para que lleven cambio)</span></span>
          <input class="input" inputmode="numeric" data-bind="pagaCon" value="${esc(S.pagaCon)}" placeholder="Ej: ${money(Math.ceil(total / 10000) * 10000)}"></label>` : ""}

        <h2 class="h3" style="margin-top:22px">Resumen</h2>
        <div class="card card-pad">
          <div class="row" style="margin-bottom:12px"><span style="font-size:26px" aria-hidden="true">${s.emoji}</span><div class="grow"><b>${esc(s.nombre)}</b><div class="small muted">${lines.map((l) => `${l.qty}× ${esc(l.p.nombre)}`).join(", ")}</div></div></div>
          ${S.cart.note ? `<div class="small" style="margin-bottom:12px;color:var(--ink-2)">📝 ${esc(S.cart.note)}</div>` : ""}
          ${totalsHtml(sub, env)}
        </div>
        <div class="notice info">${I.clock}<span>${eta}</span></div>
        <p class="tiny muted center" style="line-height:1.5">Es una maqueta: no se cobra nada y el pedido no le llega a ningún comercio real.</p>
      </div>
      <div style="height:16px"></div>
      <div class="cartbar"><button class="btn btn-primary" data-act="confirm-order"><span>Confirmar pedido</span><span>${money(total)}</span></button></div>`;
  }
  function placeOrder() {
    const s = shop(S.cart.localId);
    const lines = cartLines();
    const sub = cartSubtotal(), env = envioDe(s, sub);
    const addr = currentAddr();
    const id = S.nextId++;
    const now = Date.now();
    S.orders.push({
      id, localId: s.id, items: lines.map((l) => ({ pid: l.p.id, qty: l.qty, nombre: l.p.nombre, precio: l.p.precio, emoji: l.p.emoji })),
      subtotal: sub, envio: env, total: sub + env, pago: S.pay, pagaCon: Number(String(S.pagaCon).replace(/\D/g, "")) || 0,
      created: now, status: "recibido", history: { recibido: now }, mine: true, cliente: first(S.user.nombre) + " " + S.user.nombre.split(" ").slice(1).map((w) => w[0] + ".").join(""),
      direccion: addr.linea + (S.ind ? ` (${S.ind})` : ""), note: S.cart.note
    });
    S.cart = { localId: null, items: {}, note: "" };
    S.pagaCon = ""; S.ind = null;
    save();
    go("#/pedidos/" + id);
  }

  /* ---------------- SEGUIMIENTO ---------------- */
  const MAP = { X: (c) => 20 + (c - 12) * 34, Y: (r) => 18 + (r - 147) * 30, home: { c: 14.5, r: 150 } };
  function routePts(s) {
    const p = s.pos || { c: 18, r: 149 }, h = MAP.home;
    return [[MAP.X(p.c), MAP.Y(p.r)], [MAP.X(p.c), MAP.Y(h.r)], [MAP.X(h.c), MAP.Y(h.r)]];
  }
  function pointAt(pts, f) {
    const segs = [];
    let total = 0;
    for (let i = 1; i < pts.length; i++) { const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); segs.push(l); total += l; }
    let d = total * Math.max(0, Math.min(1, f));
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const t = segs[i] ? Math.min(1, d / segs[i]) : 0;
        return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * t, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * t];
      }
      d -= segs[i];
    }
    return pts[pts.length - 1];
  }
  function motoProgress(o) {
    if (o.status === "entregado") return 1;
    if (o.status !== "camino") return 0;
    return Math.min(0.96, (Date.now() - o.history.camino) / AUTO.camino);
  }
  function mapSVG(o, s) {
    const pts = routePts(s);
    let blocks = "";
    for (let c = 12; c < 21; c++) for (let r = 147; r < 153; r++) {
      const plaza = c === 13 && r === 149;
      blocks += `<rect x="${MAP.X(c) + 5}" y="${MAP.Y(r) + 5}" width="24" height="20" rx="3" fill="${plaza ? "#CFE3C8" : "#E3DCCD"}"/>`;
    }
    const [mx, my] = pointAt(pts, motoProgress(o));
    const sp = pts[0], hp = pts[2];
    return `<svg viewBox="0 0 346 222" role="img" aria-label="Mapa del recorrido desde ${esc(s.nombre)} hasta tu casa">
      <rect width="346" height="222" fill="#F7F4EE"/>
      <rect x="${MAP.X(14) - 4}" y="0" width="8" height="222" fill="#FFE9D2"/>
      ${blocks}
      <text x="${MAP.X(14) + 6}" y="12" class="axis" font-size="10" fill="#8A6A4A" font-weight="700">Av. 14</text>
      ${[148, 150, 152].map((r) => `<text x="2" y="${MAP.Y(r) + 3}" font-size="9" fill="#8A8277">${r}</text>`).join("")}
      <polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="#1E6B52" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="${o.status === "camino" || o.status === "entregado" ? "0" : "2 7"}"/>
      <g transform="translate(${sp[0]},${sp[1]})"><circle r="13" fill="#fff" stroke="${s.color}" stroke-width="3"/><text text-anchor="middle" dy="5" font-size="13">${s.emoji}</text></g>
      <g transform="translate(${hp[0]},${hp[1]})"><circle r="13" fill="#E8772E"/><text text-anchor="middle" dy="5" font-size="13">🏠</text></g>
      <g id="moto" data-order="${o.id}" transform="translate(${mx},${my})" style="${o.status === "camino" ? "" : "display:none"}"><circle r="14" fill="#103D2F" stroke="#fff" stroke-width="2"/><text text-anchor="middle" dy="5" font-size="14">🛵</text></g>
    </svg>`;
  }
  function viewPedido(id) {
    const o = S.orders.find((x) => x.id === id);
    if (!o) return notFound();
    const s = shop(o.localId), st = STEP_INFO[o.status];
    const ended = ["rechazado", "cancelado"].includes(o.status);
    const idx = STEPS.indexOf(o.status);
    const [, dmax] = String(s.demora).split("-").map(Number);
    const eta = o.status === "entregado" ? `Entregado ${fmtDate(o.history.entregado).toLowerCase()}` : ended ? "" : `Llegada estimada: ${hhmm(new Date(o.created + dmax * 60000))}`;
    return `${topbar("Pedido #" + o.id, "#/pedidos")}
      <div class="track-hero" aria-live="polite">
        <div class="emo" aria-hidden="true">${st.emo}</div>
        <h1 class="h1" style="margin-top:4px">${st.t}</h1>
        <p class="muted" style="margin-top:4px">${st.sub}${eta ? ` · <b style="color:var(--ink)">${eta}</b>` : ""}</p>
      </div>
      <div class="pad stack" style="margin-top:16px">
        ${ended ? `<div class="notice danger">${I.info}<span>${o.status === "rechazado" ? `${esc(s.nombre)} no pudo tomar el pedido${o.motivo ? ` (${esc(o.motivo.toLowerCase())})` : ""}. Si pagaste con Mercado Pago, el reintegro es automático.` : "Cancelaste el pedido. No se te cobró nada."}</span></div>` : `
        <div class="card card-pad"><ol class="steps">${STEPS.map((k, i) => {
          const cls = i < idx || o.status === "entregado" ? "done" : i === idx ? "now" : "";
          const t = o.history[k];
          return `<li class="${cls}"><span class="bullet">${cls === "done" ? I.check : ""}</span><div><b>${STEP_INFO[k].corto}</b><span class="tiny muted">${t ? hhmm(new Date(t)) : ""}</span></div></li>`;
        }).join("")}</ol></div>
        <div class="map card">${mapSVG(o, s)}</div>
        ${o.status === "camino" || o.status === "entregado" ? `<div class="card card-pad rider"><div class="avatar" aria-hidden="true">R</div><div class="grow"><b>Ramiro te lo lleva</b><div class="small muted">Repartidor de la zona · moto</div></div><button class="btn btn-sm btn-soft" data-act="soon" data-msg="El chat con quien reparte llega en la próxima etapa.">${I.msg} Escribir</button></div>` : ""}
        ${o.mine && AUTO[o.status] ? `<p class="demo-note">${I.info}<span>Demo: el pedido avanza solo cada ~20 segundos, o lo podés mover desde el <a class="link" href="#/comercio/pedidos" data-act="as-merchant" data-local="${s.id}">panel del comercio</a>.</span></p>` : ""}`}
        <div class="card card-pad">
          <div class="row" style="margin-bottom:12px"><span style="font-size:26px" aria-hidden="true">${s.emoji}</span><div class="grow"><b>${esc(s.nombre)}</b><div class="small muted">${fmtDate(o.created)}</div></div></div>
          <div class="stack small">${o.items.map((i) => `<div class="row between"><span>${i.qty}× ${esc(i.nombre)}</span><span>${money(i.precio * i.qty)}</span></div>`).join("")}</div>
          ${o.note ? `<div class="small" style="margin-top:12px;color:var(--ink-2)">📝 ${esc(o.note)}</div>` : ""}
          <div class="divider"></div>${totalsHtml(o.subtotal, o.envio)}
          <div class="small muted" style="margin-top:10px">${o.pago === "mp" ? "Pagado con Mercado Pago (simulado)" : `Efectivo${o.pagaCon ? ` · pagás con ${money(o.pagaCon)}` : ""}`}</div>
          <div class="small muted" style="margin-top:4px">${I.pin.replace("<svg", '<svg style="width:14px;height:14px;display:inline;vertical-align:-2px"')} ${esc(o.direccion)}</div>
        </div>
        ${o.status === "recibido" ? `<button class="btn btn-outline btn-block" data-act="cancel-order" data-id="${o.id}">Cancelar pedido</button>` : ""}
        ${o.status === "entregado" || ended ? `<button class="btn btn-primary btn-block" data-act="repeat" data-id="${o.id}">${I.refresh} Repetir pedido</button>` : ""}
      </div><div style="height:24px"></div>`;
  }

  /* ---------------- MIS PEDIDOS ---------------- */
  function orderPill(o) {
    const cls = { recibido: "pill-warn", preparacion: "pill-new", camino: "pill-open", entregado: "pill-closed", rechazado: "pill-red", cancelado: "pill-red" }[o.status];
    return `<span class="pill ${cls}">${STEP_INFO[o.status].corto}</span>`;
  }
  function viewPedidos() {
    const mine = S.orders.filter((o) => o.mine).sort((a, b) => b.created - a.created);
    const act = mine.filter((o) => AUTO[o.status]);
    const past = mine.filter((o) => !AUTO[o.status]);
    const card = (o) => {
      const s = shop(o.localId);
      return `<article class="card order-card">
        <a class="row" href="#/pedidos/${o.id}" style="align-items:flex-start">
          <div class="thumb" style="width:52px;height:52px;font-size:26px;background:${cat(s.cat).color}" aria-hidden="true">${s.emoji}</div>
          <div class="grow"><div class="row between"><b class="ellipsis">${esc(s.nombre)}</b>${orderPill(o)}</div>
            <div class="tiny muted" style="margin-top:2px">#${o.id} · ${fmtDate(o.created)}</div>
            <div class="items">${o.items.map((i) => `${i.qty}× ${esc(i.nombre)}`).join(", ")}</div>
            <div class="bold" style="margin-top:6px">${money(o.total)}</div></div></a>
        <div class="btn-row" style="margin-top:12px">
          ${AUTO[o.status] ? `<a class="btn btn-sm btn-primary" href="#/pedidos/${o.id}">Seguir pedido</a>` : `<a class="btn btn-sm btn-outline" href="#/pedidos/${o.id}">Ver detalle</a><button class="btn btn-sm btn-soft" data-act="repeat" data-id="${o.id}">${I.refresh} Repetir</button>`}
        </div></article>`;
    };
    return `<header class="home-head"><h1 class="h1">Tus pedidos</h1></header>
      ${act.length ? `<section class="section" style="margin-top:12px"><div class="section-head"><h2 class="h3">En curso</h2></div><div class="pad stack">${act.map(card).join("")}</div></section>` : ""}
      <section class="section" style="margin-top:${act.length ? 24 : 12}px"><div class="section-head"><h2 class="h3">Anteriores</h2></div>
        <div class="pad stack">${past.length ? past.map(card).join("") : `<p class="muted">Todavía no hiciste pedidos.</p>`}</div></section>
      <div style="height:24px"></div>`;
  }
  function repeatOrder(id) {
    const o = S.orders.find((x) => x.id === id);
    const s = o && shop(o.localId);
    if (!s || !isActive(s)) { toast("Ese comercio ya no está en Cuadra."); return; }
    const doIt = () => {
      S.cart = { localId: s.id, items: {}, note: o.note || "" };
      let missing = 0;
      o.items.forEach((i) => { const p = product(s.id, i.pid); if (p && !p.pausado) S.cart.items[i.pid] = i.qty; else missing++; });
      if (!Object.keys(S.cart.items).length) { S.cart = { localId: null, items: {}, note: "" }; save(); toast("Ninguno de esos productos está disponible hoy."); return; }
      save(); go("#/carrito");
      setTimeout(() => toast(missing ? `Cargamos tu pedido. ${missing} producto${missing > 1 ? "s no están" : " no está"} disponible${missing > 1 ? "s" : ""} hoy.` : "Cargamos el mismo pedido. Revisalo y confirmá."), 50);
    };
    if (S.cart.localId && cartCount() && S.cart.localId !== s.id) {
      confirmSheet({ title: "¿Reemplazamos tu pedido actual?", text: "Ya tenés productos de otro comercio en el pedido.", ok: "Reemplazar", onOk: doIt });
    } else doIt();
  }

  /* ---------------- PERFIL ---------------- */
  function viewPerfil() {
    const u = S.user;
    return `<header class="home-head"><h1 class="h1">Perfil</h1></header>
      <div class="pad stack" style="margin-top:12px">
        <div class="card card-pad row"><div class="avatar" style="background:var(--verde-50);color:var(--verde-900);width:60px;height:60px;font-size:20px" aria-hidden="true">${esc(initials(u.nombre))}</div>
          <div class="grow"><h2 class="h2">${esc(u.nombre)}</h2><div class="small muted">${esc(u.telefono)}</div><div class="small muted ellipsis">${esc(u.email)}</div></div>
          <button class="btn btn-sm btn-outline" data-act="edit-user">Editar</button></div>

        <h2 class="h3" style="margin-top:14px">Direcciones guardadas</h2>
        <div class="list">${u.direcciones.map((d) => `
          <div class="li" style="align-items:flex-start">${I.pin}
            <div class="grow"><div class="row" style="gap:8px"><b>${esc(d.etiqueta)}</b>${d.id === S.addrId ? `<span class="pill pill-open">Principal</span>` : ""}</div>
              <div class="small">${esc(d.linea)}</div>${d.indicaciones ? `<div class="small muted">${esc(d.indicaciones)}</div>` : ""}
              <div class="row" style="margin-top:8px;gap:8px">${d.id !== S.addrId ? `<button class="btn btn-sm btn-soft" data-act="addr-main" data-id="${d.id}">Usar como principal</button>` : ""}
              ${u.direcciones.length > 1 ? `<button class="btn btn-sm btn-outline" data-act="addr-del" data-id="${d.id}" aria-label="Borrar ${esc(d.etiqueta)}">${I.trash}</button>` : ""}</div></div></div>`).join("")}
          <button class="li" data-act="addr-new" style="color:var(--verde);font-weight:700">${I.plus.replace("<svg", '<svg style="color:var(--verde)"')} Agregar dirección</button>
        </div>

        <h2 class="h3" style="margin-top:14px">Formas de pago</h2>
        <div class="list">
          <div class="li"><span style="color:var(--verde)">${I.card}</span><div class="grow"><b>Mercado Pago</b><div class="small muted">Se conecta en la próxima etapa</div></div></div>
          <div class="li"><span style="color:var(--verde)">${I.cash}</span><div class="grow"><b>Efectivo</b><div class="small muted">Siempre disponible</div></div></div>
        </div>

        <h2 class="h3" style="margin-top:14px">Probar la maqueta</h2>
        <div class="list">
          <a class="li" href="#/comercio"><span style="font-size:22px">🏪</span><div class="grow"><b>Panel del comercio</b><div class="small muted">Recibir, aceptar y preparar pedidos</div></div>${I.chevR}</a>
          <a class="li" href="#/admin"><span style="font-size:22px">📊</span><div class="grow"><b>Panel de administración</b><div class="small muted">Comercios, zonas, comisión y métricas</div></div>${I.chevR}</a>
          <button class="li" data-act="reset"><span style="font-size:22px">↺</span><div class="grow"><b>Reiniciar la demo</b><div class="small muted">Vuelve todo a los datos de ejemplo</div></div></button>
        </div>
        <p class="tiny muted center" style="margin-top:10px;line-height:1.5">Cuadra · maqueta v0.1 · datos de ejemplo, sin pagos reales</p>
      </div><div style="height:24px"></div>`;
  }

  /* ---------------- SEGURIDAD ---------------- */
  const isNight = () => { const h = new Date().getHours(); return h < 7 || h >= 19; };
  function camScene(i) {
    const n = isNight();
    const sky = n ? "#0D1820" : "#9DB2BC", bld = n ? "#18252D" : "#71838A", side = n ? "#2A3236" : "#A9A49A", road = n ? "#1B2124" : "#50585C";
    const win = n ? "#E9C46A" : "#B8CCD4";
    let houses = "", x = -8, k = 0;
    while (x < 330) {
      const w = 44 + ((i * 37 + k * 23) % 38), h = 46 + ((i * 53 + k * 31) % 58);
      houses += `<rect x="${x}" y="${128 - h}" width="${w}" height="${h}" fill="${bld}"/>`;
      for (let wy = 128 - h + 10; wy < 118; wy += 18) for (let wx = x + 8; wx < x + w - 10; wx += 16) {
        if ((wx * 7 + wy * 3 + i) % 5 < (n ? 2 : 4)) houses += `<rect x="${wx}" y="${wy}" width="8" height="9" fill="${win}" opacity="${n ? 0.85 : 0.6}"/>`;
      }
      x += w + 6; k++;
    }
    const carA = ["#C8553D", "#E9ECEF", "#3A86A8", "#F4D35E", "#2B2D42", "#8D99AE"][i % 6];
    const carB = ["#6C757D", "#D1495B", "#EDF2F4", "#577590", "#F28482", "#43AA8B"][i % 6];
    const car = (y, col, cls) => `<g class="${cls}"><rect x="0" y="${y}" width="48" height="15" rx="4" fill="${col}"/><rect x="9" y="${y - 9}" width="28" height="11" rx="3" fill="${col}"/><rect x="12" y="${y - 7}" width="10" height="7" fill="#9FB3BF" opacity=".7"/><circle cx="11" cy="${y + 16}" r="4.5" fill="#111"/><circle cx="37" cy="${y + 16}" r="4.5" fill="#111"/>${n ? `<rect x="46" y="${y + 3}" width="5" height="4" fill="#FFF1B8"/><rect x="0" y="${y + 3}" width="3" height="4" fill="#D62828"/>` : ""}</g>`;
    const lamp = (lx) => `<rect x="${lx}" y="70" width="3" height="68" fill="#3B4347"/><rect x="${lx - 8}" y="68" width="14" height="4" rx="2" fill="#3B4347"/>${n ? `<circle cx="${lx - 2}" cy="74" r="16" fill="#FFE8A3" opacity=".25"/>` : ""}`;
    let zebra = "";
    for (let z = 0; z < 6; z++) zebra += `<rect x="${226 + z * 11}" y="146" width="6" height="58" fill="#E7E3DA" opacity="${n ? 0.35 : 0.7}"/>`;
    return `<svg viewBox="0 0 320 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect width="320" height="240" fill="${sky}"/>${houses}
      <rect y="128" width="320" height="16" fill="${side}"/>${lamp(60 + (i % 3) * 20)}${lamp(230)}
      <rect y="144" width="320" height="62" fill="${road}"/>${zebra}
      <rect y="174" width="320" height="2" fill="#E7E3DA" opacity=".35" stroke-dasharray="14 10"/>
      ${car(152, carA, "car")}${car(182, carB, "car slow")}
      <rect y="206" width="320" height="34" fill="${side}"/>
      <g class="walker"><circle cx="40" cy="206" r="4" fill="${n ? "#50595E" : "#2F3A3F"}"/><rect x="37" y="210" width="6" height="14" rx="3" fill="${n ? "#50595E" : "#2F3A3F"}"/></g>
    </svg>`;
  }
  function camTile(c, i, big) {
    const off = c.estado !== "vivo";
    return `<${big ? "div" : "a"} class="cam ${off ? "off" : ""}" ${big ? "" : `href="#/seguridad/camara/${c.id}" aria-label="Ver cámara de ${esc(c.esquina)}"`}>
      <div class="scene" style="filter:saturate(.55) contrast(1.05)">${camScene(i)}</div>
      ${off ? `<div class="offmsg">🔧 En mantenimiento<br>Vuelve a estar en línea mañana</div>` : `<div class="noise"></div><div class="scan"></div>`}
      <div class="hud">${off ? `<span class="pill pill-closed">SIN SEÑAL</span>` : `<span class="pill pill-live"><span class="dot pulse"></span>EN VIVO</span>`}<span>CAM ${pad2(i + 1)}</span></div>
      ${big ? "" : `<div class="label"><b>${esc(c.esquina)}</b><span>${esc(c.zona)}</span></div>`}
      ${!off ? `<span data-clock style="position:absolute;${big ? "right:12px;bottom:12px;font-size:13px" : "left:8px;top:32px;font-size:10px"};font-family:ui-monospace,Menlo,monospace;opacity:.85;text-shadow:0 1px 2px #000"></span>` : ""}
    </${big ? "div" : "a"}>`;
  }
  const privacyNotice = () => `<div class="privacy" role="note">${I.lock}<div><b>Uso responsable</b>Las cámaras miran la vía pública y las mantienen vecinos y comercios adheridos. No muestran el interior de casas, no se pueden descargar y no reemplazan al 911. Describí hechos, no personas: no publiques nombres, fotos ni datos de nadie.</div></div>`;
  function viewSeguridad(tabName, q) {
    const today = S.alerts.filter((a) => Date.now() - a.created < 86400000).length;
    const f = q.get("tipo") || "";
    const alerts = S.alerts.slice().sort((a, b) => b.created - a.created).filter((a) => !f || a.tipo === f);
    return `<header class="home-head"><h1 class="h1">Seguridad barrial</h1><p class="muted" style="margin-top:4px">Cámaras comunitarias y avisos entre vecinos.</p></header>
      <div style="margin-top:12px">${privacyNotice()}</div>
      <div class="chips" style="margin-top:14px" role="tablist">
        <a class="chip ${tabName === "camaras" ? "on" : ""}" href="#/seguridad" role="tab" aria-selected="${tabName === "camaras"}">📹 Cámaras</a>
        <a class="chip ${tabName === "alertas" ? "on" : ""}" href="#/seguridad/alertas" role="tab" aria-selected="${tabName === "alertas"}">📣 Alertas${today ? ` · ${today} hoy` : ""}</a>
        <button class="chip" data-act="call911">🚓 Emergencias</button>
      </div>
      ${tabName === "camaras" ? `
        <div class="cam-grid" style="margin-top:8px">${D.camaras.map((c, i) => camTile(c, i)).join("")}</div>
        <p class="tiny muted pad" style="margin-top:12px;line-height:1.5">Imágenes simuladas para la maqueta. En la versión real se conectan las cámaras que ya tienen los vecinos y comercios, con su permiso.</p>
      ` : `
        <div class="chips" style="margin-top:4px">
          <a class="chip ${!f ? "on" : ""}" href="#/seguridad/alertas">Todas</a>
          ${D.tiposAlerta.map((t) => `<a class="chip ${f === t.id ? "on" : ""}" href="#/seguridad/alertas?tipo=${t.id}">${t.emoji} ${t.nombre.split(" ")[0] === "Mascota" ? "Mascotas" : t.nombre}</a>`).join("")}
        </div>
        <div class="pad stack" style="margin-top:8px">${alerts.map(alertCard).join("") || `<p class="muted">No hay alertas de este tipo.</p>`}</div>
        <div class="fab" style="margin-top:16px"><a class="btn btn-accent" href="#/seguridad/alertas/nueva">${I.plus} Publicar alerta</a></div>
      `}
      <div style="height:24px"></div>`;
  }
  function alertCard(a) {
    const t = tipo(a.tipo), on = !!S.useful[a.id];
    return `<article class="card alert-card">
      <div class="row between"><span class="type" style="background:${t.color}14;color:${t.color}">${t.emoji} ${t.nombre}</span><span class="tiny muted">${ago(a.created)}</span></div>
      <h3>${esc(a.titulo)}</h3>
      <div class="row small muted" style="gap:6px;margin-top:4px"><span style="width:16px;display:inline-block">${I.pin}</span>${esc(a.esquina)}</div>
      <p>${esc(a.texto)}</p>
      <div class="tiny muted" style="margin-top:8px">Publicado por ${esc(a.autor)}</div>
      <div class="actions">
        <button class="chip useful ${on ? "on" : ""}" data-act="useful" data-id="${a.id}" aria-pressed="${on}">👍 Me sirve · ${a.utiles + (on ? 1 : 0)}</button>
        ${a.camara ? `<a class="chip" href="#/seguridad/camara/${a.camara}">📹 Ver cámara cercana</a>` : ""}
      </div></article>`;
  }
  function viewCamara(id) {
    const i = D.camaras.findIndex((c) => c.id === id);
    if (i < 0) return notFound();
    const c = D.camaras[i];
    return `<div class="camfull">
      <div class="bar"><a class="icon-btn" href="#/seguridad" data-act="back" aria-label="Volver a las cámaras">${I.back}</a>
        <div class="grow"><b>${esc(c.esquina)}</b><div class="tiny" style="opacity:.8">${esc(c.zona)}</div></div></div>
      ${camTile(c, i, true)}
      <div class="foot">
        <div style="opacity:.85;line-height:1.45">Cámara comunitaria N° ${i + 1} · la mantiene ${esc(c.mantiene)}. Las imágenes no se descargan ni se comparten.</div>
        <div class="btn-row"><a class="btn btn-outline" href="#/seguridad/alertas/nueva?esquina=${encodeURIComponent(c.esquina)}">📣 Avisar algo</a><button class="btn btn-accent" data-act="call911">🚓 Emergencia</button></div>
        <div class="chips" style="padding:0">${D.camaras.map((x) => `<a class="chip" style="${x.id === id ? "background:#fff;color:#111" : "background:transparent;color:#fff;border-color:rgba(255,255,255,.3)"}" href="#/seguridad/camara/${x.id}">${esc(x.esquina)}</a>`).join("")}</div>
      </div></div>`;
  }
  function viewNuevaAlerta(q) {
    const pre = q.get("esquina") || "";
    return `${topbar("Publicar alerta", "#/seguridad/alertas")}
      <form class="pad stack" data-form="alert" novalidate>
        <div class="notice danger">${I.alert}<span><b>¿Es una emergencia?</b> Primero llamá al 911. Las alertas son para avisar a los vecinos, no para pedir ayuda urgente. <button type="button" class="link" data-act="call911" style="background:none;border:0;padding:0;text-decoration:underline">Ver teléfonos</button></span></div>
        <fieldset style="border:0;padding:0;margin:0"><legend class="bold" style="font-size:14.5px;margin-bottom:8px">¿Qué pasó?</legend>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${D.tiposAlerta.map((t, i) => `<label class="choice" style="padding:12px"><input type="radio" name="tipo" value="${t.id}" ${i === 0 ? "checked" : ""}><span class="small bold">${t.emoji} ${t.nombre}</span></label>`).join("")}</div>
        </fieldset>
        <label class="field"><span>Título</span><input class="input" name="titulo" maxlength="60" required placeholder="Ej: Corte de luz en la 150"></label>
        <label class="field"><span>Esquina o cuadra</span><input class="input" name="esquina" list="esquinas" required value="${esc(pre)}" placeholder="Ej: Calle 150 y 15"></label>
        <datalist id="esquinas">${D.camaras.map((c) => `<option value="${esc(c.esquina)}">`).join("")}</datalist>
        <label class="field"><span>Contá qué viste</span><textarea class="textarea" name="texto" maxlength="280" required placeholder="Contá el hecho: qué, dónde y a qué hora."></textarea></label>
        <label class="check"><input type="checkbox" name="ok" required><span>No incluyo nombres, fotos ni datos de personas. Describo hechos, no personas.</span></label>
        <p class="small muted">Se publica como <b>Vecina/o de la 150</b>. No mostramos tu nombre.</p>
        <p class="small" id="alert-err" style="color:var(--rojo);font-weight:600" role="alert"></p>
        <button class="btn btn-accent btn-block" type="submit">Publicar alerta</button>
      </form><div style="height:24px"></div>`;
  }

  /* ---------------- PANEL DEL COMERCIO ---------------- */
  function panelShell(kind, tabs, current, body) {
    const isC = kind === "comercio";
    const s = isC ? shop(S.merchantId) : null;
    return `<div class="panel">
      <div class="panel-top">
        <div class="mark">${LOGO}</div>
        <div class="who">${isC ? "Cuadra Comercios" : "Cuadra Admin"}<small>${isC ? esc(s.nombre) : "Berazategui · Centro"}</small></div>
        <div class="grow"></div>
        ${isC ? `<label class="sr" for="msel">Elegí el comercio</label><select id="msel" class="select" style="width:auto;max-width:220px;min-height:44px;padding:8px 12px" data-bind="merchant">${allShops().map((x) => `<option value="${x.id}" ${x.id === S.merchantId ? "selected" : ""}>${esc(x.nombre)}</option>`).join("")}</select>` : ""}
        <a class="btn btn-sm btn-outline" href="#/">${I.back} App del vecino</a>
      </div>
      <nav class="panel-tabs" aria-label="Secciones">${tabs.map(([id, label, badge]) => `<a href="#/${kind}${id === tabs[0][0] ? "" : "/" + id}" class="${current === id ? "on" : ""}" ${current === id ? 'aria-current="page"' : ""}>${label}${badge ? `<span class="badge">${badge}</span>` : ""}</a>`).join("")}</nav>
      <div class="panel-body">${body}</div></div>`;
  }
  function todayStats(localId) {
    const s = shop(localId);
    const h = hash(localId);
    const base = s.menu && s.menu.length ? 6 + (h % 9) : 0;
    const ticket = TICKET_CAT[s.cat] || 12000;
    const baseRev = Math.round(base * ticket * (0.9 + (h % 20) / 100) / 100) * 100;
    const real = S.orders.filter((o) => o.localId === localId && isToday(o.created) && !["rechazado", "cancelado"].includes(o.status));
    const pedidos = base + real.length;
    const fact = baseRev + real.reduce((a, o) => a + o.subtotal, 0);
    const com = Math.round(fact * S.config.comision / 100);
    return { pedidos, fact, com, neto: fact - com };
  }
  function viewComercio(tab) {
    let s = shop(S.merchantId);
    if (!s) { S.merchantId = D.comercios[0].id; s = shop(S.merchantId); }
    const orders = S.orders.filter((o) => o.localId === s.id);
    const nuevos = orders.filter((o) => o.status === "recibido");
    const tabs = [["hoy", "Hoy"], ["pedidos", "Pedidos", nuevos.length], ["menu", "Menú"], ["horarios", "Horarios"]];
    let body = "";
    if (tab === "pedidos") body = merchantOrders(s, orders);
    else if (tab === "menu") body = merchantMenu(s);
    else if (tab === "horarios") body = merchantHours(s);
    else { tab = "hoy"; body = merchantToday(s, orders, nuevos); }
    return panelShell("comercio", tabs, tab, body);
  }
  function openSwitchCard(s) {
    const o = openInfo(s), st = S.shops[s.id] || {};
    return `<div class="card card-pad row between" style="flex-wrap:wrap">
      <div><div class="row" style="gap:8px"><b style="font-size:17px">${o.open ? "Abierto" : "Cerrado"}</b>${statusPill(o)}</div>
        <div class="small muted" style="margin-top:4px">${o.open ? `Recibís pedidos hasta las ${o.until === "24:00" ? "24 hs" : o.until}` : st.pausado ? "Pausaste la recepción de pedidos por hoy." : "Fuera de horario."} Horario: ${esc(horarioTxt(s))}.</div></div>
      <label class="row" style="gap:10px;font-weight:650"><span>Recibir pedidos</span><span class="switch"><input type="checkbox" data-bind="m-open" ${st.pausado ? "" : "checked"} aria-label="Recibir pedidos"><i></i></span></label>
    </div>`;
  }
  function merchantToday(s, orders, nuevos) {
    const t = todayStats(s.id);
    const activos = orders.filter((o) => AUTO[o.status]);
    const prods = products(s.id).slice(0, 3);
    return `
      ${nuevos.length ? `<a class="notice warn" href="#/comercio/pedidos" style="font-size:15.5px"><span style="font-size:20px">🔔</span><span><b>${nuevos.length} pedido${nuevos.length > 1 ? "s" : ""} nuevo${nuevos.length > 1 ? "s" : ""}</b> esperando que lo${nuevos.length > 1 ? "s" : ""} aceptes. Ver pedidos →</span></a>` : ""}
      ${openSwitchCard(s)}
      <div class="kpis">
        <div class="card kpi"><span>Pedidos de hoy</span><b>${t.pedidos}</b></div>
        <div class="card kpi"><span>Facturación</span><b>${money(t.fact)}</b></div>
        <div class="card kpi"><span>Comisión Cuadra (${S.config.comision}%)</span><b>${money(t.com)}</b></div>
        <div class="card kpi"><span>Te queda</span><b>${money(t.neto)}</b><small>Se acredita mañana</small></div>
      </div>
      <div class="cols cols-2">
        <div class="card card-pad"><div class="col-head"><h2 class="h3">En curso (${activos.length})</h2><a class="link" href="#/comercio/pedidos">Ver todos</a></div>
          ${activos.length ? `<div class="stack">${activos.map((o) => `<div class="row between small"><span><b>#${o.id}</b> · ${esc(o.cliente)} · ${o.items.reduce((a, i) => a + i.qty, 0)} productos</span>${orderPill(o)}</div>`).join("")}</div>` : `<p class="muted small">No hay pedidos en curso.</p>`}</div>
        <div class="card card-pad"><h2 class="h3" style="margin-bottom:10px">Lo más pedido hoy</h2>
          ${prods.length ? `<div class="stack">${prods.map((p, i) => `<div class="row between small"><span>${p.emoji} ${esc(p.nombre)}</span><b>${(hash(p.id) % 6) + 6 - i * 2}</b></div>`).join("")}</div>` : `<p class="muted small">Cargá tu menú para empezar a vender.</p>`}</div>
      </div>
      <p class="tiny muted">La comisión de Cuadra es del ${S.config.comision}% sobre los productos. El envío lo paga el vecino y va directo a quien reparte.</p>`;
  }
  function incomingCard(o) {
    const nx = { recibido: "Aceptar", preparacion: "Listo, sale el pedido", camino: "Marcar entregado" }[o.status];
    return `<article class="card incoming ${o.status === "recibido" ? "new" : ""}">
      <div class="row between"><b>#${o.id} · ${esc(o.cliente)}</b><span class="tiny muted">${ago(o.created)}</span></div>
      <div class="items">${o.items.map((i) => `${i.qty}× ${esc(i.nombre)}`).join("<br>")}</div>
      ${o.note ? `<div class="notice warn" style="padding:8px 10px;font-size:13.5px">📝 ${esc(o.note)}</div>` : ""}
      <div class="row between small"><span>${o.pago === "mp" ? "✅ Pagado con Mercado Pago" : `💵 Cobrar en efectivo${o.pagaCon ? ` (paga con ${money(o.pagaCon)})` : ""}`}</span><b>${money(o.subtotal)}</b></div>
      <div class="tiny muted">📍 ${esc(o.direccion)}</div>
      <div class="btn-row">${o.status === "recibido" ? `<button class="btn btn-sm btn-danger" data-act="m-reject" data-id="${o.id}">Rechazar</button>` : ""}<button class="btn btn-sm btn-primary" data-act="m-advance" data-id="${o.id}">${nx}</button></div>
    </article>`;
  }
  function merchantOrders(s, orders) {
    const col = (st, title, emptyTxt) => {
      const list = orders.filter((o) => o.status === st).sort((a, b) => a.created - b.created);
      return `<section><div class="col-head"><h2 class="h3">${title} <span class="muted">(${list.length})</span></h2></div>
        <div class="stack">${list.map(incomingCard).join("") || `<div class="card card-pad muted small">${emptyTxt}</div>`}</div></section>`;
    };
    const done = orders.filter((o) => ["entregado", "rechazado", "cancelado"].includes(o.status) && isToday(o.history.entregado || o.created));
    return `${openSwitchCard(s)}
      <div class="cols cols-3">${col("recibido", "🔔 Nuevos", "Cuando entre un pedido lo vas a ver acá.")}${col("preparacion", "👩‍🍳 En preparación", "Nada en la cocina.")}${col("camino", "🛵 En camino", "Nadie en la calle.")}</div>
      ${done.length ? `<div class="card card-pad"><h2 class="h3" style="margin-bottom:10px">Terminados hoy</h2><div class="stack small">${done.map((o) => `<div class="row between"><span>#${o.id} · ${esc(o.cliente)}</span><span class="row" style="gap:8px">${money(o.subtotal)} ${orderPill(o)}</span></div>`).join("")}</div></div>` : ""}
      <p class="tiny muted">Tip de la demo: hacé un pedido desde la app del vecino y aparece acá. Mientras estés en este panel no avanza solo: lo movés vos.</p>`;
  }
  function merchantMenu(s) {
    const prods = products(s.id);
    const secs = [...new Set(prods.map((p) => p.seccion))];
    return `<div class="row between"><h2 class="h2">Menú <span class="muted" style="font-weight:600">(${prods.length} productos)</span></h2><button class="btn btn-sm btn-primary" data-act="m-edit" data-pid="">${I.plus} Nuevo producto</button></div>
      ${prods.length ? secs.map((x) => `<section><h3 class="h3" style="margin:6px 0 8px">${esc(x)}</h3><div class="list">${prods.filter((p) => p.seccion === x).map((p) => `
        <div class="menu-row ${p.pausado ? "paused" : ""}"><div class="emo" aria-hidden="true">${p.emoji || "🛍️"}</div>
          <div class="grow"><b>${esc(p.nombre)}</b><div class="small muted">${money(p.precio)}${p.pausado ? " · Sin stock" : ""}</div></div>
          <label class="row small" style="gap:8px"><span class="muted" style="min-width:74px;text-align:right">${p.pausado ? "Pausado" : "Disponible"}</span><span class="switch"><input type="checkbox" data-bind="m-pause" data-pid="${p.id}" ${p.pausado ? "" : "checked"} aria-label="${esc(p.nombre)} disponible"><i></i></span></label>
          <button class="icon-btn flat" data-act="m-edit" data-pid="${p.id}" aria-label="Editar ${esc(p.nombre)}">${I.edit}</button>
        </div>`).join("")}</div></section>`).join("") : `<div class="card">${empty("🧾", "Tu menú está vacío", "Cargá tus productos para que los vecinos te puedan pedir.")}</div>`}
      <p class="tiny muted">Pausar un producto lo marca “Sin stock por hoy” en la app al instante.</p>`;
  }
  function merchantHours(s) {
    const h = horarioOf(s), closed = cerradoOf(s), full = is24(h);
    return `${openSwitchCard(s)}
      <form class="card card-pad stack" data-form="hours">
        <h2 class="h3">Días que abrís</h2>
        <div class="days">${[1, 2, 3, 4, 5, 6, 0].map((d) => `<label><input type="checkbox" name="dia" value="${d}" ${closed.includes(d) ? "" : "checked"} aria-label="${DIAS[d]}"><span>${DIAS_C[d]}</span></label>`).join("")}</div>
        <label class="check" style="margin-top:16px"><input type="checkbox" name="full" data-bind="h-full" ${full ? "checked" : ""}><span><b>Abierto las 24 horas</b></span></label>
        <div id="turnos" class="${full ? "hidden" : ""}"><h2 class="h3" style="margin-top:8px">Turnos</h2>
          ${(full ? [["11:00", "15:00"]] : h).map(([a, b], i) => `<div class="hours-row" style="margin-top:10px">
            <label class="field"><span>Abre</span><input class="input" type="time" name="abre" value="${a}"></label>
            <label class="field"><span>Cierra</span><input class="input" type="time" name="cierra" value="${b === "24:00" ? "23:59" : b}"></label>
            <button type="button" class="icon-btn flat" data-act="h-del" data-i="${i}" aria-label="Borrar turno" ${h.length < 2 ? "disabled" : ""}>${I.trash}</button></div>`).join("")}
          <button type="button" class="btn btn-sm btn-soft" style="margin-top:12px" data-act="h-add">${I.plus} Agregar turno</button></div>
        <div class="divider"></div>
        <button class="btn btn-primary" type="submit">Guardar horarios</button>
      </form>`;
  }
  function readHours(form) {
    const fd = new FormData(form);
    const dias = fd.getAll("dia").map(Number);
    const abre = fd.getAll("abre"), cierra = fd.getAll("cierra");
    const turnos = abre.map((a, i) => [a || "00:00", cierra[i] === "23:59" ? "24:00" : cierra[i] || "23:00"]).filter(([a, b]) => a !== b);
    return { diasCerrado: [0, 1, 2, 3, 4, 5, 6].filter((d) => !dias.includes(d)), horario: fd.get("full") ? [["00:00", "24:00"]] : turnos.length ? turnos : [["09:00", "18:00"]] };
  }

  /* ---------------- PANEL ADMIN ---------------- */
  function dailySeries(days) {
    const out = [];
    const now = new Date();
    for (let k = days - 1; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k);
      const dow = d.getDay();
      let v = 34 + (dow === 5 || dow === 6 ? 22 : dow === 0 ? 14 : 0) + (hash(d.toDateString()) % 11) + Math.round((days - k) * 0.35);
      if (k === 0) v = Math.round(v * Math.min(1, (now.getHours() + 1) / 22)) + S.orders.filter((o) => o.mine && isToday(o.created)).length;
      out.push({ d, v });
    }
    return out;
  }
  function barChart(series) {
    const W = 640, H = 230, pl = 34, pr = 6, pt = 14, pb = 30;
    const max = Math.ceil(Math.max(...series.map((x) => x.v)) / 20) * 20;
    const bw = (W - pl - pr) / series.length, ih = H - pt - pb;
    let g = "";
    [0, max / 2, max].forEach((t) => { const y = pt + ih * (1 - t / max); g += `<line class="grid" x1="${pl}" x2="${W - pr}" y1="${y}" y2="${y}"/><text class="axis" x="${pl - 6}" y="${y + 4}" text-anchor="end">${t}</text>`; });
    series.forEach((p, i) => {
      const x = pl + i * bw + 1, w = bw - 2, y = pt + ih * (1 - p.v / max), yb = pt + ih, r = Math.min(4, w / 2, yb - y);
      const dl = `${DIAS_C[p.d.getDay()]} ${p.d.getDate()}/${p.d.getMonth() + 1}`;
      g += `<path class="bar" data-i="${i}" d="M${x},${yb} V${y + r} Q${x},${y} ${x + r},${y} H${x + w - r} Q${x + w},${y} ${x + w},${y + r} V${yb} Z"/>`;
      g += `<rect x="${pl + i * bw}" y="${pt}" width="${bw}" height="${ih}" fill="transparent" data-tip="${dl}: ${p.v} pedidos${i === series.length - 1 ? " (hasta ahora)" : ""}" data-i="${i}"/>`;
      if (i % 2 === series.length % 2 || i === series.length - 1) g += `<text class="axis" x="${x + w / 2}" y="${H - 10}" text-anchor="middle">${i === series.length - 1 ? "Hoy" : dl}</text>`;
    });
    return `<div class="chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Pedidos por día en los últimos ${series.length} días">${g}</svg><div class="tip hidden"></div></div>`;
  }
  function adminStats() {
    const s30 = dailySeries(30);
    const pedidos = s30.reduce((a, x) => a + x.v, 0);
    const gmv = pedidos * 15800;
    return { s30, pedidos, gmv, com: Math.round(gmv * S.config.comision / 100), ticket: 15800 };
  }
  function viewAdmin(tab) {
    const tabs = [["metricas", "Métricas"], ["comercios", "Comercios"], ["zonas", "Zonas"], ["config", "Comisión y envío"]];
    let body;
    if (tab === "comercios") body = adminShops();
    else if (tab === "zonas") body = adminZones();
    else if (tab === "config") body = adminConfig();
    else { tab = "metricas"; body = adminMetrics(); }
    return panelShell("admin", tabs, tab, body);
  }
  function adminMetrics() {
    const st = adminStats();
    const active = allShops().filter(isActive);
    const s14 = st.s30.slice(-14);
    const catRows = D.categorias.map((c) => {
      const n = active.filter((s) => s.cat === c.id).reduce((a, s) => a + 60 + (hash(s.id) % 160), 0);
      return { c, n };
    }).sort((a, b) => b.n - a.n);
    const cmax = Math.max(...catRows.map((r) => r.n));
    const top = active.map((s) => ({ s, n: s.menu && s.menu.length ? 60 + (hash(s.id) % 160) : 0 })).sort((a, b) => b.n - a.n).slice(0, 5);
    const liveCams = D.camaras.filter((c) => c.estado === "vivo").length;
    return `<div class="kpis">
        <div class="card kpi"><span>Pedidos (30 días)</span><b>${st.pedidos.toLocaleString("es-AR")}</b><small>+12% vs. mes anterior</small></div>
        <div class="card kpi"><span>Facturación de comercios</span><b>${money(st.gmv)}</b></div>
        <div class="card kpi"><span>Comisiones Cuadra (${S.config.comision}%)</span><b>${money(st.com)}</b></div>
        <div class="card kpi"><span>Ticket promedio</span><b>${money(st.ticket)}</b></div>
        <div class="card kpi"><span>Comercios activos</span><b>${active.length}</b></div>
        <div class="card kpi"><span>Vecinos registrados</span><b>1.284</b><small>+86 este mes</small></div>
        <div class="card kpi"><span>Cámaras en línea</span><b>${liveCams} de ${D.camaras.length}</b></div>
        <div class="card kpi"><span>Alertas esta semana</span><b>${S.alerts.filter((a) => Date.now() - a.created < 7 * 86400000).length}</b></div>
      </div>
      <div class="card card-pad"><div class="col-head"><h2 class="h3">Pedidos por día · últimos 14 días</h2></div>${barChart(s14)}
        <details style="margin-top:8px"><summary class="small link" style="cursor:pointer">Ver como tabla</summary>
          <div class="table-wrap"><table class="table" style="margin-top:8px"><thead><tr><th>Día</th><th class="num">Pedidos</th></tr></thead><tbody>${s14.map((p) => `<tr><td>${DIAS[p.d.getDay()]} ${p.d.getDate()}/${p.d.getMonth() + 1}</td><td class="num">${p.v}</td></tr>`).join("")}</tbody></table></div></details></div>
      <div class="cols cols-2">
        <div class="card card-pad"><h2 class="h3" style="margin-bottom:10px">Comercios con más pedidos (30 días)</h2>
          <div class="table-wrap"><table class="table"><thead><tr><th>Comercio</th><th class="num">Pedidos</th><th class="num">Comisión</th></tr></thead><tbody>
          ${top.map(({ s, n }) => `<tr><td>${s.emoji} ${esc(s.nombre)}</td><td class="num">${n}</td><td class="num">${money(n * (TICKET_CAT[s.cat] || 12000) * S.config.comision / 100)}</td></tr>`).join("")}</tbody></table></div></div>
        <div class="card card-pad"><h2 class="h3" style="margin-bottom:10px">Pedidos por categoría (30 días)</h2>
          ${catRows.map((r) => `<div class="hbar"><span>${r.c.emoji} ${r.c.nombre}</span><div class="track"><div class="fill" style="width:${(r.n / cmax) * 100}%"></div></div><span class="num">${r.n}</span></div>`).join("")}</div>
      </div>
      <p class="tiny muted">Métricas simuladas para la maqueta.</p>`;
  }
  function adminShops() {
    const list = allShops();
    return `<div class="row between" style="flex-wrap:wrap;gap:10px"><h2 class="h2">${list.filter(isActive).length} comercios adheridos</h2><button class="btn btn-sm btn-primary" data-act="a-new-shop">${I.plus} Sumar comercio</button></div>
      <div class="card table-wrap"><table class="table"><thead><tr><th>Comercio</th><th>Rubro</th><th>Estado</th><th class="num">Productos</th><th class="num">Calif.</th><th></th></tr></thead><tbody>
      ${list.map((s) => `<tr>
        <td><div class="row" style="gap:10px"><span class="thumb" style="width:40px;height:40px;font-size:20px;border-radius:10px;background:${cat(s.cat).color}" aria-hidden="true">${s.emoji}</span><div><b>${esc(s.nombre)}</b><div class="tiny muted">${esc(s.direccion)}</div></div></div></td>
        <td class="small">${cat(s.cat).nombre}</td>
        <td><label class="row" style="gap:8px"><span class="switch"><input type="checkbox" data-bind="a-active" data-id="${s.id}" ${isActive(s) ? "checked" : ""} aria-label="${esc(s.nombre)} activo"><i></i></span><span class="small">${isActive(s) ? "Activo" : "Pausado"}</span></label></td>
        <td class="num">${products(s.id).length}</td>
        <td class="num">${s.rating ? "★ " + s.rating : "—"}</td>
        <td><a class="link small" href="#/local/${s.id}">Ver</a></td></tr>`).join("")}
      </tbody></table></div>
      <p class="tiny muted">Pausar un comercio lo oculta de la app del vecino sin borrar sus datos.</p>`;
  }
  function adminZones() {
    const z = S.zonas;
    const fill = (i) => z[i] && z[i].activa ? "#1E6B52" : "#B9B2A6";
    const op = (i) => z[i] && z[i].activa ? ".85" : ".45";
    return `<div class="cols cols-2">
      <div class="card card-pad zonemap"><h2 class="h3" style="margin-bottom:10px">Mapa de cobertura</h2>
        <svg viewBox="0 0 400 260" role="img" aria-label="Mapa esquemático de zonas de cobertura">
          <rect width="400" height="260" rx="12" fill="#F4F0E8"/>
          <path d="M20 40 L140 30 L150 130 L30 140 Z" fill="${fill(2)}" opacity="${op(2)}"/>
          <path d="M150 40 L260 40 L260 170 L150 170 Z" fill="${fill(0)}" opacity="${op(0)}"/>
          <path d="M268 40 L380 55 L375 175 L268 170 Z" fill="${fill(1)}" opacity="${op(1)}"/>
          <path d="M20 150 L145 140 L150 240 L30 235 Z" fill="${fill(3)}" opacity="${op(3)}"/>
          ${[["Villa España", 85, 88, 2], ["Centro", 205, 108, 0], ["Oeste", 322, 112, 1], ["Ranelagh", 88, 195, 3]].map(([n, x, y, i]) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="14" font-weight="700" fill="${z[i] && z[i].activa ? "#fff" : "#3F3A33"}">${n}</text>`).join("")}
          <circle cx="205" cy="80" r="5" fill="#E8772E"/><text x="214" y="72" font-size="11" fill="#fff">Av. 14 y 148</text>
        </svg>
        <div class="row small" style="gap:16px;margin-top:10px"><span class="row" style="gap:6px"><span style="width:14px;height:14px;border-radius:4px;background:#1E6B52;display:inline-block"></span>Activa</span><span class="row" style="gap:6px"><span style="width:14px;height:14px;border-radius:4px;background:#B9B2A6;display:inline-block"></span>Próximamente</span></div>
      </div>
      <div class="stack">${z.map((x) => `<div class="card card-pad">
          <div class="row between"><div><b>${esc(x.nombre)}</b><div class="small muted">${esc(x.limites)} · ${x.comercios} comercios</div></div>
            <label class="row" style="gap:8px"><span class="small">${x.activa ? "Activa" : "Inactiva"}</span><span class="switch"><input type="checkbox" data-bind="a-zone" data-id="${x.id}" ${x.activa ? "checked" : ""} aria-label="Zona ${esc(x.nombre)} activa"><i></i></span></label></div>
          <label class="field" style="margin-top:10px"><span class="small">Recargo de envío para esta zona</span><input class="input" inputmode="numeric" data-bind="a-zone-fee" data-id="${x.id}" value="${x.recargo}"></label>
        </div>`).join("")}
        <button class="btn btn-soft" data-act="a-new-zone">${I.plus} Nueva zona</button></div>
      </div>`;
  }
  function adminConfig() {
    const c = S.config;
    return `<form class="cols cols-2" data-form="config">
      <div class="card card-pad stack">
        <h2 class="h3">Comisión y envío</h2>
        <label class="field"><span>Comisión por pedido: <output id="com-out">${c.comision}%</output></span>
          <input class="range" type="range" min="5" max="25" step="1" name="comision" value="${c.comision}" data-bind="cfg"></label>
        <p class="tiny muted" style="margin-top:-4px">Se cobra sobre los productos, no sobre el envío.</p>
        <label class="field"><span>Costo de envío base</span><input class="input" inputmode="numeric" name="envioBase" value="${c.envioBase}" data-bind="cfg"></label>
        <label class="field"><span>Envío gratis desde (0 = nunca)</span><input class="input" inputmode="numeric" name="envioGratisDesde" value="${c.envioGratisDesde}" data-bind="cfg"></label>
        <button class="btn btn-primary" type="submit">Guardar cambios</button>
      </div>
      <div class="card card-pad"><h2 class="h3">Así queda un pedido de ejemplo</h2><div id="cfg-prev" style="margin-top:12px">${cfgPreview(c)}</div></div>
    </form>`;
  }
  function cfgPreview(c) {
    const sub = 20000, com = Math.round(sub * c.comision / 100), env = c.envioGratisDesde > 0 && sub >= c.envioGratisDesde ? 0 : Number(c.envioBase);
    return `<div class="totals">
      <div class="row"><span class="muted">Productos</span><span>${money(sub)}</span></div>
      <div class="row"><span class="muted">Envío (lo paga el vecino)</span><span>${env ? money(env) : "Gratis"}</span></div>
      <div class="row total"><span>Paga el vecino</span><span>${money(sub + env)}</span></div></div>
      <div class="divider"></div>
      <div class="totals">
      <div class="row"><span>🏪 Recibe el comercio</span><b>${money(sub - com)}</b></div>
      <div class="row"><span>🟩 Comisión Cuadra (${c.comision}%)</span><b>${money(com)}</b></div>
      <div class="row"><span>🛵 Para quien reparte</span><b>${money(env)}</b></div></div>`;
  }

  /* ---------------- sheet, toast, confirm ---------------- */
  function openSheet(html) {
    closeSheet();
    const ov = document.createElement("div");
    ov.className = "overlay";
    ov.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
    ov.addEventListener("click", (e) => { if (e.target === ov && !ov.dataset.locked) closeSheet(); });
    phone.appendChild(ov);
    const f = ov.querySelector("input:not([type=hidden]),textarea,button");
    if (f && f.tagName !== "BUTTON") f.focus();
    return ov;
  }
  function closeSheet() { phone.querySelectorAll(".overlay").forEach((o) => o.remove()); }
  let toastT;
  function toast(msg) {
    const old = phone.querySelector(".toast");
    if (old) old.remove();
    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.textContent = msg;
    phone.appendChild(t);
    clearTimeout(toastT);
    toastT = setTimeout(() => t.remove(), 2800);
  }
  let pending = null;
  function confirmSheet({ title, text, ok, cancel, danger, onOk, extra }) {
    pending = onOk;
    openSheet(`<div class="grip"></div><h2 class="h2">${title}</h2><p class="muted" style="margin-top:8px;line-height:1.45">${text}</p>${extra || ""}
      <div class="btn-row" style="margin-top:18px"><button class="btn btn-outline" data-act="close-sheet">${cancel || "Cancelar"}</button><button class="btn ${danger ? "btn-danger" : "btn-primary"}" data-act="confirm-ok">${ok || "Sí"}</button></div>`);
  }

  /* ---------------- acciones ---------------- */
  const ACT = {
    back(el) { if (navDepth > 0) { navDepth -= 2; history.back(); } else go(el.getAttribute("href") || "#/"); },
    "close-sheet": closeSheet,
    "confirm-ok"() {
      const sh = phone.querySelector(".sheet");
      const f = pending; pending = null;
      closeSheet();
      if (f) f(sh);
    },
    share() {
      try { if (navigator.clipboard) navigator.clipboard.writeText(location.href); } catch (e) { /* sin permiso */ }
      toast("Copiamos el link del comercio");
    },
    soon(el) { toast(el.dataset.msg || "Llega en la próxima etapa"); },
    "open-prod"(el) { openProduct(el.dataset.local, el.dataset.pid); },
    add(el) { addToCart(el.dataset.local, el.dataset.pid, 1); },
    sq(el) {
      sheetQty = Math.max(1, Math.min(20, sheetQty + Number(el.dataset.d)));
      const b = phone.querySelector("[data-act=add-sheet]");
      phone.querySelector("#sq").textContent = sheetQty;
      phone.querySelector("#sqt").textContent = money(Number(b.dataset.price) * sheetQty);
    },
    "add-sheet"(el) { closeSheet(); addToCart(el.dataset.local, el.dataset.pid, sheetQty); },
    qty(el) { setQty(el.dataset.pid, (S.cart.items[el.dataset.pid] || 0) + Number(el.dataset.d)); },
    jump(el) {
      const t = document.getElementById(el.dataset.to);
      if (t) screen.scrollTo({ top: t.offsetTop - 60, behavior: "smooth" });
    },
    "pick-addr"() {
      openSheet(`<div class="grip"></div><h2 class="h2">¿A dónde te lo llevamos?</h2><div class="stack" style="margin-top:14px">
        ${S.user.direcciones.map((d) => `<button class="choice" style="width:100%;text-align:left" data-act="addr-main" data-id="${d.id}"><span style="color:var(--verde);width:22px">${d.id === S.addrId ? I.check : I.pin}</span><span class="grow"><b>${esc(d.etiqueta)}</b><span class="small muted" style="display:block">${esc(d.linea)}</span></span></button>`).join("")}
        <a class="btn btn-soft btn-block" href="#/perfil">Administrar direcciones</a></div>`);
    },
    "addr-main"(el) { S.addrId = el.dataset.id; S.ind = null; save(); closeSheet(); render(); toast("Listo, usamos esa dirección"); },
    "addr-del"(el) {
      const d = S.user.direcciones.find((x) => x.id === el.dataset.id);
      confirmSheet({ title: `¿Borrar “${esc(d.etiqueta)}”?`, text: esc(d.linea), ok: "Borrar", danger: true, onOk: () => {
        S.user.direcciones = S.user.direcciones.filter((x) => x.id !== d.id);
        if (S.addrId === d.id) S.addrId = S.user.direcciones[0].id;
        save(); render();
      } });
    },
    "addr-new"() {
      openSheet(`<div class="grip"></div><h2 class="h2">Nueva dirección</h2>
        <form class="stack" data-form="addr" style="margin-top:14px">
          <label class="field"><span>Nombre</span><input class="input" name="etiqueta" required placeholder="Ej: Casa de mamá"></label>
          <label class="field"><span>Calle y número</span><input class="input" name="linea" required placeholder="Ej: Calle 148 N° 1520, e/ 15 y 16"></label>
          <label class="field"><span>Indicaciones</span><input class="input" name="indicaciones" placeholder="Ej: casa con rejas negras"></label>
          <button class="btn btn-primary btn-block" type="submit">Guardar dirección</button></form>`);
    },
    "edit-user"() {
      const u = S.user;
      openSheet(`<div class="grip"></div><h2 class="h2">Tus datos</h2>
        <form class="stack" data-form="user" style="margin-top:14px">
          <label class="field"><span>Nombre y apellido</span><input class="input" name="nombre" required value="${esc(u.nombre)}"></label>
          <label class="field"><span>Celular</span><input class="input" name="telefono" inputmode="tel" value="${esc(u.telefono)}"></label>
          <label class="field"><span>Email</span><input class="input" name="email" type="email" value="${esc(u.email)}"></label>
          <button class="btn btn-primary btn-block" type="submit">Guardar</button></form>`);
    },
    "confirm-order"() {
      const s = shop(S.cart.localId);
      if (!s) return;
      const ov = openSheet(`<div class="center" style="padding:28px 8px"><div class="spinner"></div><h2 class="h2" style="margin-top:18px" id="pay-t">${S.pay === "mp" ? "Conectando con Mercado Pago…" : "Enviando tu pedido…"}</h2><p class="muted small" style="margin-top:6px">Simulado: no se cobra nada.</p></div>`);
      ov.dataset.locked = "1";
      setTimeout(() => {
        if (S.pay === "mp") {
          const t = ov.querySelector("#pay-t");
          if (t) { t.textContent = "Pago aprobado ✅"; ov.querySelector(".spinner").style.display = "none"; }
          setTimeout(placeOrder, 800);
        } else placeOrder();
      }, 1300);
    },
    "cancel-order"(el) {
      const o = S.orders.find((x) => x.id === Number(el.dataset.id));
      confirmSheet({ title: "¿Cancelar el pedido?", text: "Todavía no lo confirmaron, así que no se te cobra nada.", ok: "Sí, cancelar", cancel: "No", danger: true, onOk: () => {
        if (o.status !== "recibido") { toast("El comercio ya lo aceptó, no se puede cancelar."); return; }
        o.status = "cancelado"; o.history.cancelado = Date.now(); save(); render();
      } });
    },
    repeat(el) { repeatOrder(Number(el.dataset.id)); },
    reset() {
      confirmSheet({ title: "¿Reiniciar la demo?", text: "Se borran los pedidos, alertas y cambios que hiciste, y vuelve todo a los datos de ejemplo.", ok: "Reiniciar", danger: true, onOk: () => {
        S = seed(); save(); go("#/"); render(true); toast("Demo reiniciada");
      } });
    },
    call911() {
      openSheet(`<div class="grip"></div><h2 class="h2">Teléfonos de emergencia</h2>
        <p class="muted small" style="margin-top:6px">En la app real, cada botón llama directo. En la maqueta no marca.</p>
        <div class="stack" style="margin-top:14px">
          ${[["🚓", "Policía", "911"], ["🚒", "Bomberos", "100"], ["🚑", "Emergencias médicas (SAME)", "107"], ["🛡️", "Defensa Civil", "103"]].map(([e, n, t]) => `<button class="choice" style="width:100%;text-align:left" data-act="soon" data-msg="En la maqueta no se hacen llamadas."><span style="font-size:24px">${e}</span><span class="grow"><b>${n}</b></span><b style="font-size:20px">${t}</b></button>`).join("")}
        </div>`);
    },
    useful(el) { const id = el.dataset.id; S.useful[id] = !S.useful[id]; save(); render(); },
    "as-merchant"(el) { S.merchantId = el.dataset.local; save(); go("#/comercio/pedidos"); },
    // comercio
    "m-advance"(el) {
      const o = S.orders.find((x) => x.id === Number(el.dataset.id));
      const nx = STEPS[STEPS.indexOf(o.status) + 1];
      if (!nx) return;
      o.status = nx; o.history[nx] = Date.now(); save(); render();
      toast({ preparacion: `Pedido #${o.id} aceptado. Le avisamos al vecino.`, camino: `#${o.id} salió. Ya lo lleva el repartidor.`, entregado: `#${o.id} entregado 🎉` }[nx]);
    },
    "m-reject"(el) {
      const o = S.orders.find((x) => x.id === Number(el.dataset.id));
      confirmSheet({
        title: `¿Rechazar el pedido #${o.id}?`, text: "Le avisamos al vecino y, si pagó con Mercado Pago, se le devuelve la plata.", ok: "Rechazar", danger: true,
        extra: `<div class="stack" style="margin-top:14px">${["Nos falta un producto", "Tenemos mucha demora", "Está fuera de nuestra zona", "Estamos por cerrar"].map((m, i) => `<label class="choice"><input type="radio" name="motivo" value="${m}" ${i === 0 ? "checked" : ""}><span>${m}</span></label>`).join("")}</div>`,
        onOk: (sh) => {
          const m = sh && sh.querySelector("input[name=motivo]:checked");
          o.status = "rechazado"; o.history.rechazado = Date.now(); o.motivo = m ? m.value : ""; save(); render();
          toast(`Rechazaste el pedido #${o.id}`);
        }
      });
    },
    "m-edit"(el) {
      const pid = el.dataset.pid, s = shop(S.merchantId);
      const p = pid ? product(s.id, pid) : { nombre: "", desc: "", precio: "", seccion: "", emoji: "🍽️" };
      const secs = [...new Set(products(s.id).map((x) => x.seccion))];
      openSheet(`<div class="grip"></div><h2 class="h2">${pid ? "Editar producto" : "Nuevo producto"}</h2>
        <form class="stack" data-form="product" style="margin-top:14px"><input type="hidden" name="pid" value="${esc(pid)}">
          <div style="display:grid;grid-template-columns:84px 1fr;gap:10px">
            <label class="field"><span>Ícono</span><input class="input center" name="emoji" maxlength="4" value="${esc(p.emoji || "")}" style="font-size:22px"></label>
            <label class="field"><span>Nombre</span><input class="input" name="nombre" required value="${esc(p.nombre)}" placeholder="Ej: Milanesa con puré"></label></div>
          <label class="field"><span>Descripción</span><input class="input" name="desc" value="${esc(p.desc || "")}" placeholder="Opcional"></label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Precio</span><input class="input" name="precio" inputmode="numeric" required value="${esc(p.precio)}" placeholder="12500"></label>
            <label class="field"><span>Sección</span><input class="input" name="seccion" list="secs" required value="${esc(p.seccion)}" placeholder="Ej: Minutas"></label></div>
          <datalist id="secs">${secs.map((x) => `<option value="${esc(x)}">`).join("")}</datalist>
          <button class="btn btn-primary btn-block" type="submit">${pid ? "Guardar cambios" : "Agregar al menú"}</button>
          ${pid ? `<button type="button" class="btn btn-danger btn-block" data-act="m-del" data-pid="${esc(pid)}">${I.trash} Borrar producto</button>` : ""}
        </form>`);
    },
    "m-del"(el) {
      S.menu[el.dataset.pid] = Object.assign({}, S.menu[el.dataset.pid], { borrado: true });
      save(); closeSheet(); render(); toast("Producto borrado del menú");
    },
    "h-add"() {
      const f = screen.querySelector("form[data-form=hours]");
      const h = readHours(f), st = shopSt(S.merchantId);
      st.diasCerrado = h.diasCerrado;
      st.horario = (is24(h.horario) ? [] : h.horario).concat([["19:00", "23:00"]]);
      save(); render();
    },
    "h-del"(el) {
      const f = screen.querySelector("form[data-form=hours]");
      const h = readHours(f), st = shopSt(S.merchantId);
      st.diasCerrado = h.diasCerrado;
      st.horario = h.horario.filter((_, i) => i !== Number(el.dataset.i));
      if (!st.horario.length) st.horario = [["09:00", "18:00"]];
      save(); render();
    },
    // admin
    "a-new-shop"() {
      openSheet(`<div class="grip"></div><h2 class="h2">Sumar comercio</h2>
        <form class="stack" data-form="shop" style="margin-top:14px">
          <label class="field"><span>Nombre del comercio</span><input class="input" name="nombre" required placeholder="Ej: Panadería La Espiga"></label>
          <label class="field"><span>Rubro</span><select class="select" name="cat">${D.categorias.map((c) => `<option value="${c.id}">${c.emoji} ${c.nombre}</option>`).join("")}</select></label>
          <label class="field"><span>Dirección</span><input class="input" name="direccion" required placeholder="Ej: Calle 151 y 15"></label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Responsable</span><input class="input" name="responsable" placeholder="Nombre"></label>
            <label class="field"><span>Celular</span><input class="input" name="tel" inputmode="tel" placeholder="11 ..."></label></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Abre</span><input class="input" type="time" name="abre" value="09:00"></label>
            <label class="field"><span>Cierra</span><input class="input" type="time" name="cierra" value="21:00"></label></div>
          <label class="check"><input type="checkbox" name="ok" required><span>El comercio aceptó los términos y la comisión del ${S.config.comision}%.</span></label>
          <button class="btn btn-primary btn-block" type="submit">Dar de alta</button></form>`);
    },
    "a-new-zone"() {
      openSheet(`<div class="grip"></div><h2 class="h2">Nueva zona</h2>
        <form class="stack" data-form="zone" style="margin-top:14px">
          <label class="field"><span>Nombre</span><input class="input" name="nombre" required placeholder="Ej: Hudson"></label>
          <label class="field"><span>Límites</span><input class="input" name="limites" placeholder="Ej: Calles 30 a 40 · 140 a 150"></label>
          <label class="field"><span>Recargo de envío</span><input class="input" name="recargo" inputmode="numeric" value="500"></label>
          <button class="btn btn-primary btn-block" type="submit">Crear zona (inactiva)</button></form>`);
    }
  };

  const FORMS = {
    search(f) {
      const q = new FormData(f).get("q").trim();
      const c = f.dataset.cat;
      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (c) p.set("cat", c);
      go("#/buscar?" + p);
    },
    alert(f) {
      const fd = new FormData(f);
      const err = f.querySelector("#alert-err");
      const titulo = String(fd.get("titulo") || "").trim(), esquina = String(fd.get("esquina") || "").trim(), texto = String(fd.get("texto") || "").trim();
      if (!titulo || !esquina || !texto) { err.textContent = "Completá el título, la esquina y qué pasó."; return; }
      if (!fd.get("ok")) { err.textContent = "Confirmá que no incluís datos de personas."; return; }
      S.alerts.push({ id: "al-" + Date.now(), tipo: fd.get("tipo"), titulo, esquina, texto, autor: "vos (se ve como Vecina/o de la 150)", utiles: 0, created: Date.now(), mine: true });
      save(); go("#/seguridad/alertas");
      setTimeout(() => toast("Alerta publicada. Les llega a los vecinos de la zona."), 60);
    },
    addr(f) {
      const fd = new FormData(f);
      const id = "d" + Date.now();
      S.user.direcciones.push({ id, etiqueta: fd.get("etiqueta").trim(), linea: fd.get("linea").trim(), indicaciones: fd.get("indicaciones").trim() });
      save(); closeSheet(); render(); toast("Dirección guardada");
    },
    user(f) {
      const fd = new FormData(f);
      S.user.nombre = fd.get("nombre").trim() || S.user.nombre;
      S.user.telefono = fd.get("telefono").trim();
      S.user.email = fd.get("email").trim();
      save(); closeSheet(); render(); toast("Datos actualizados");
    },
    product(f) {
      const fd = new FormData(f);
      const pid = fd.get("pid");
      const data = {
        nombre: fd.get("nombre").trim(), desc: fd.get("desc").trim(), seccion: fd.get("seccion").trim() || "Otros",
        emoji: fd.get("emoji").trim() || "🍽️", precio: Number(String(fd.get("precio")).replace(/\D/g, "")) || 0
      };
      if (!data.nombre || !data.precio) { toast("Poné nombre y precio"); return; }
      if (pid) S.menu[pid] = Object.assign({}, S.menu[pid], data);
      else (S.extraProducts[S.merchantId] = S.extraProducts[S.merchantId] || []).push(Object.assign({ id: "x" + Date.now() }, data));
      save(); closeSheet(); render(); toast(pid ? "Producto actualizado" : "Producto agregado. Ya se ve en la app.");
    },
    hours(f) {
      const h = readHours(f), st = shopSt(S.merchantId);
      st.horario = h.horario; st.diasCerrado = h.diasCerrado;
      save(); render(); toast("Horarios guardados");
    },
    shop(f) {
      const fd = new FormData(f);
      if (!fd.get("ok")) { toast("Falta confirmar que aceptó los términos"); return; }
      const nombre = fd.get("nombre").trim();
      const c = cat(fd.get("cat"));
      const colors = ["#8E5572", "#3D5A80", "#6A994E", "#BC6C25", "#5E548E", "#227C9D"];
      const id = norm(nombre).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + String(Date.now()).slice(-4);
      S.extraShops.push({
        id, nombre, cat: c.id, emoji: c.emoji, color: colors[S.extraShops.length % colors.length], direccion: fd.get("direccion").trim(),
        pos: { c: 18, r: 149 }, rating: 0, resenas: 0, demora: "30-45", envioExtra: 0, pedidoMin: 5000,
        horario: [[fd.get("abre") || "09:00", fd.get("cierra") || "21:00"]], diasCerrado: [], destacado: false, nuevo: true,
        descripcion: "Recién sumado a Cuadra.", menu: []
      });
      save(); closeSheet(); render(); toast("Comercio dado de alta. Ya aparece en la app.");
    },
    zone(f) {
      const fd = new FormData(f);
      S.zonas.push({ id: "z" + Date.now(), nombre: fd.get("nombre").trim(), limites: fd.get("limites").trim() || "A definir", activa: false, recargo: Number(fd.get("recargo")) || 0, comercios: 0 });
      save(); closeSheet(); render(); toast("Zona creada. Activala cuando haya comercios.");
    },
    config(f) {
      const fd = new FormData(f);
      S.config = {
        comision: Number(fd.get("comision")),
        envioBase: Number(String(fd.get("envioBase")).replace(/\D/g, "")) || 0,
        envioGratisDesde: Number(String(fd.get("envioGratisDesde")).replace(/\D/g, "")) || 0
      };
      save(); render(); toast("Guardado. Se aplica a los próximos pedidos.");
    }
  };

  const BIND = {
    "cart-note"(el) { S.cart.note = el.value; save(); },
    addr(el, ev) { if (ev === "change") { S.addrId = el.value; S.ind = null; save(); render(); } },
    ind(el) { S.ind = el.value; save(); },
    pay(el, ev) { if (ev === "change") { S.pay = el.value; save(); render(); } },
    pagaCon(el) { S.pagaCon = el.value; save(); },
    merchant(el, ev) { if (ev === "change") { S.merchantId = el.value; save(); render(); } },
    "m-open"(el, ev) { if (ev === "change") { shopSt(S.merchantId).pausado = !el.checked; save(); render(); toast(el.checked ? "Volviste a recibir pedidos" : "Pausaste los pedidos por hoy"); } },
    "m-pause"(el, ev) {
      if (ev !== "change") return;
      S.menu[el.dataset.pid] = Object.assign({}, S.menu[el.dataset.pid], { pausado: !el.checked });
      save(); render(); toast(el.checked ? "Producto disponible otra vez" : "Producto pausado: se ve “Sin stock”");
    },
    "h-full"(el, ev) { if (ev === "change") screen.querySelector("#turnos").classList.toggle("hidden", el.checked); },
    "a-active"(el, ev) { if (ev === "change") { shopSt(el.dataset.id).activo = el.checked; save(); render(); } },
    "a-zone"(el, ev) { if (ev === "change") { const z = S.zonas.find((x) => x.id === el.dataset.id); z.activa = el.checked; save(); render(); } },
    "a-zone-fee"(el) { const z = S.zonas.find((x) => x.id === el.dataset.id); z.recargo = Number(el.value.replace(/\D/g, "")) || 0; save(); },
    cfg(el) {
      const f = el.form, fd = new FormData(f);
      const c = { comision: Number(fd.get("comision")), envioBase: Number(String(fd.get("envioBase")).replace(/\D/g, "")) || 0, envioGratisDesde: Number(String(fd.get("envioGratisDesde")).replace(/\D/g, "")) || 0 };
      f.querySelector("#com-out").textContent = c.comision + "%";
      f.querySelector("#cfg-prev").innerHTML = cfgPreview(c);
    }
  };

  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-act]");
    if (!el || el.disabled) return;
    const fn = ACT[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
    if ((e.key === "Enter" || e.key === " ") && e.target.matches("[role=button][data-act]")) { e.preventDefault(); e.target.click(); }
  });
  document.addEventListener("submit", (e) => {
    const f = e.target.closest("form[data-form]");
    if (!f) return;
    e.preventDefault();
    if (FORMS[f.dataset.form]) FORMS[f.dataset.form](f);
  });
  ["input", "change"].forEach((type) => document.addEventListener(type, (e) => {
    const el = e.target.closest && e.target.closest("[data-bind]");
    if (el && BIND[el.dataset.bind]) BIND[el.dataset.bind](el, type);
  }));
  // Tooltip de los gráficos
  document.addEventListener("pointerover", (e) => {
    const t = e.target.closest && e.target.closest("[data-tip]");
    const ch = t && t.closest(".chart");
    document.querySelectorAll(".chart .bar.hl").forEach((b) => b.classList.remove("hl"));
    document.querySelectorAll(".chart .tip").forEach((x) => x.classList.add("hidden"));
    if (!ch) return;
    const tip = ch.querySelector(".tip"), bar = ch.querySelector(`.bar[data-i="${t.dataset.i}"]`);
    const cb = ch.getBoundingClientRect(), bb = bar.getBoundingClientRect();
    bar.classList.add("hl");
    tip.textContent = t.dataset.tip;
    tip.style.left = bb.left - cb.left + bb.width / 2 + "px";
    tip.style.top = bb.top - cb.top - 4 + "px";
    tip.classList.remove("hidden");
  });

  /* ---------------- reloj de la demo ---------------- */
  function liveUpdate() {
    const d = new Date();
    const stamp = `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${hhmm(d)}:${pad2(d.getSeconds())}`;
    screen.querySelectorAll("[data-clock]").forEach((el) => { el.textContent = stamp; });
    const m = screen.querySelector("#moto");
    if (m) {
      const o = S.orders.find((x) => x.id === Number(m.dataset.order));
      if (o && o.status === "camino") {
        const [x, y] = pointAt(routePts(shop(o.localId)), motoProgress(o));
        m.setAttribute("transform", `translate(${x},${y})`);
      }
    }
  }
  setInterval(() => {
    const r = parse();
    const inPanel = r.parts[0] === "comercio";
    let changed = null;
    if (!inPanel) {
      const now = Date.now();
      S.orders.forEach((o) => {
        if (!o.mine || !AUTO[o.status]) return;
        if (now - o.history[o.status] >= AUTO[o.status]) {
          const nx = STEPS[STEPS.indexOf(o.status) + 1];
          o.status = nx; o.history[nx] = now; changed = o;
        }
      });
    }
    if (changed) {
      save();
      if (r.parts[0] !== "admin") toast(`${STEP_INFO[changed.status].emo} Pedido #${changed.id}: ${STEP_INFO[changed.status].t.toLowerCase()}`);
      dirty = true;
    }
    const typing = document.activeElement && document.activeElement.matches("input,textarea,select");
    const sheetOpen = !!phone.querySelector(".overlay");
    const safe = [undefined, "pedidos", "local", "buscar", "comercio"].includes(r.parts[0]);
    if (dirty && safe && !typing && !sheetOpen) render();
    else liveUpdate();
  }, 1000);

  render(true);

  if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
