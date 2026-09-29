/* Cuadra Viajes — núcleo: estado, tarifas, mapas (Leaflet + OSM) y flujo del pasajero.
   Se enchufa a app.js por window.Cuadra.EXT. Seguridad, chofer y admin viven en archivos aparte. */
(function () {
  "use strict";

  const C = window.Cuadra;
  const VD = window.CUADRA_VIAJES_DATA;
  const { esc, money, hhmm, I } = C;

  const ST = {
    buscando: { t: "Buscando chofer", corto: "Buscando", pill: "pill-warn" },
    encamino: { t: "Chofer en camino", corto: "Chofer en camino", pill: "pill-new" },
    llego: { t: "Tu chofer llegó", corto: "Llegó", pill: "pill-open" },
    enviaje: { t: "En viaje", corto: "En viaje", pill: "pill-open" },
    finalizado: { t: "Viaje finalizado", corto: "Finalizado", pill: "pill-closed" },
    cancelado: { t: "Viaje cancelado", corto: "Cancelado", pill: "pill-red" }
  };
  const FLOW = ["encamino", "llego", "enviaje", "finalizado"];
  // Demo acelerada: cuánto dura cada estado si nadie lo mueve desde la app del chofer
  const DUR = { encamino: 20000, llego: 8000, enviaje: 30000 };
  const ACTIVE = ["buscando", "encamino", "llego", "enviaje"];

  /* ---------------- geometría ---------------- */
  const toR = Math.PI / 180;
  function hav(a, b) {
    const dLat = (b[0] - a[0]) * toR, dLng = (b[1] - a[1]) * toR;
    const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * toR) * Math.cos(b[0] * toR) * Math.sin(dLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(s));
  }
  function bearing(a, b) {
    const y = (b[1] - a[1]) * Math.cos(a[0] * toR), x = b[0] - a[0];
    return (Math.atan2(y, x) / toR + 360) % 360;
  }
  function offset(p, km, deg) {
    return [p[0] + (km / 111.2) * Math.cos(deg * toR), p[1] + (km / (111.2 * Math.cos(p[0] * toR))) * Math.sin(deg * toR)];
  }
  function along(coords, f) {
    if (!coords || !coords.length) return null;
    if (coords.length === 1) return { pt: coords[0], hd: 0 };
    const segs = [];
    let total = 0;
    for (let i = 1; i < coords.length; i++) { const l = hav(coords[i - 1], coords[i]); segs.push(l); total += l; }
    let d = total * Math.max(0, Math.min(1, f));
    for (let i = 0; i < segs.length; i++) {
      if (d <= segs[i] || i === segs.length - 1) {
        const t = segs[i] ? Math.min(1, d / segs[i]) : 0;
        const a = coords[i], b = coords[i + 1];
        return { pt: [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], hd: bearing(a, b) };
      }
      d -= segs[i];
    }
    return { pt: coords[coords.length - 1], hd: 0 };
  }
  const round50 = (n) => Math.round(n / 50) * 50;
  // Deja lugar a los controles que flotan arriba del mapa y al panel de abajo
  const FIT = { paddingTopLeft: [30, 84], paddingBottomRight: [30, 44], maxZoom: 16 };
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const rand = (a, b) => a + Math.random() * (b - a);

  /* ---------------- estado ---------------- */
  function placeRef(p) { return { id: p.id, nombre: p.nombre, linea: p.linea, emoji: p.emoji, lat: p.lat, lng: p.lng }; }
  function histTrip(h, now) {
    const [hh, mm] = h.hora.split(":").map(Number);
    const d = new Date(now - h.diasAtras * 86400000);
    d.setHours(hh, mm, 0, 0);
    const created = d.getTime();
    const o = place(h.desde), de = place(h.hasta);
    const tarifa = fare(h.km, h.tipo, d, VD.tarifas);
    return {
      id: h.id, mine: true, pasajero: { nombre: "Lucía G.", rating: 4.9 }, origen: placeRef(o), destino: placeRef(de), tipo: h.tipo,
      km: h.km, min: h.min, tarifa, pago: h.pago, status: "finalizado", created, choferId: h.chofer,
      history: { buscando: created, encamino: created + 30000, llego: created + 4 * 60000, enviaje: created + 5 * 60000, finalizado: created + (5 + h.min) * 60000 },
      route: [[o.lat, o.lng], [de.lat, de.lng]], estrellas: h.estrellas, propina: h.propina, rated: true, chat: [], unread: 0
    };
  }
  function seedV() {
    const now = Date.now();
    return {
      v: 1, tarifas: clone(VD.tarifas), choferes: clone(VD.choferes).map((c) => Object.assign(c, { verif: c.verif || { licencia: true, seguro: true, vtv: c.estado !== "pendiente", habilitacion: true } })),
      remiserias: clone(VD.remiserias), trips: [], nextId: 5040,
      origen: "actual", destino: null, tipo: "remis", pago: "efectivo",
      driver: { id: "ch1", online: false, req: null, tripId: null, idleSince: 0, pos: [-34.7608, -58.2112], onlineSince: 0, onlineMs: 3.2 * 3600000 },
      seedTime: now
    };
  }
  function V() {
    const S = C.S;
    if (!S.viajes || S.viajes.v !== 1) {
      S.viajes = seedV();
      S.viajes.trips = VD.historial.map((h) => histTrip(h, S.viajes.seedTime));
    }
    return S.viajes;
  }
  const tipo = (id) => VD.tipos.find((t) => t.id === id) || VD.tipos[0];
  const chofer = (id) => V().choferes.find((c) => c.id === id);
  const remiseria = (id) => V().remiserias.find((r) => r.id === id) || { nombre: "Independiente" };
  const trip = (id) => V().trips.find((t) => t.id === id);
  const myActive = () => V().trips.filter((t) => t.mine && ACTIVE.includes(t.status)).sort((a, b) => b.created - a.created);

  function place(id) {
    if (!id) return null;
    if (id === "actual") return Object.assign({ id: "actual", emoji: "📍" }, VD.ubicacionActual);
    const f = VD.frecuentes.find((x) => x.id === id);
    if (f) return Object.assign({}, f);
    const d = C.S.user.direcciones.find((x) => x.id === id);
    if (d) {
      const c = VD.coordsDirecciones[id] || offset(VD.centro, 0.4 + (C.hash(id) % 10) / 10, C.hash(id + "x") % 360);
      const emoji = /casa/i.test(d.etiqueta) ? "🏠" : /trabajo/i.test(d.etiqueta) ? "💼" : "📌";
      return { id, nombre: d.etiqueta, linea: d.linea, emoji, lat: c[0], lng: c[1] };
    }
    return null;
  }
  const isNight = (d) => { const h = (d || new Date()).getHours(); return h >= 22 || h < 6; };
  function fare(km, tipoId, date, tarifas) {
    const t = tarifas || V().tarifas, tp = tipo(tipoId);
    const bajada = round50(t.bajada * tp.mult);
    const kmCost = round50(km * t.porKm * tp.mult);
    const sub = bajada + kmCost + tp.extra;
    const nocturno = isNight(date) ? round50(sub * t.nocturno / 100) : 0;
    return { bajada, km: kmCost, extra: tp.extra, nocturno, espera: 0, total: sub + nocturno };
  }

  /* ---------------- ruteo (OSRM público, sin API key) ---------------- */
  const routeCache = {};
  const inFlight = {};
  function estimate(a, b) {
    const km = Math.max(0.3, hav([a.lat, a.lng], [b.lat, b.lng]) * 1.35);
    return { coords: [[a.lat, a.lng], [b.lat, b.lng]], km, min: Math.max(3, Math.round(km * 2.4)), approx: true };
  }
  const rkey = (a, b) => `${a.lat.toFixed(5)},${a.lng.toFixed(5)};${b.lat.toFixed(5)},${b.lng.toFixed(5)}`;
  function fetchRoute(a, b) {
    const k = rkey(a, b);
    if (routeCache[k]) return Promise.resolve(routeCache[k]);
    if (inFlight[k]) return inFlight[k];
    const url = `https://router.project-osrm.org/route/v1/driving/${a.lng},${a.lat};${b.lng},${b.lat}?overview=full&geometries=geojson`;
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 5000));
    inFlight[k] = Promise.race([fetch(url).then((r) => r.json()), timeout]).then((j) => {
      const r = j.routes[0];
      const res = { coords: r.geometry.coordinates.map(([x, y]) => [y, x]), km: r.distance / 1000, min: Math.max(2, Math.round((r.duration / 60) * 1.2)), approx: false };
      routeCache[k] = res;
      return res;
    }).catch(() => { const e = estimate(a, b); e.failed = true; routeCache[k] = e; return e; }).finally(() => { delete inFlight[k]; });
    return inFlight[k];
  }
  // Devuelve lo que haya ya (ruta real o estimación) y, si falta, la pide y vuelve a dibujar
  function routeNow(a, b) {
    const k = rkey(a, b);
    if (routeCache[k]) return routeCache[k];
    fetchRoute(a, b).then(() => rerender());
    return Object.assign(estimate(a, b), { loading: true });
  }
  function rerender() {
    const typing = document.activeElement && document.activeElement.matches("input,textarea,select");
    if (!typing && !document.querySelector(".overlay")) C.render();
  }

  /* ---------------- avatares ilustrados ---------------- */
  const BGS = ["#DDEFE6", "#FDEEE3", "#E4DDF3", "#D6E7F2", "#F3DADF", "#F9E0B8"];
  function avatar(ch, size) {
    size = size || 56;
    const bg = BGS[C.hash(ch.id) % BGS.length];
    const shirt = ["#1E6B52", "#2F4D7A", "#7A2233", "#55595E", "#A94F12"][C.hash(ch.nombre) % 5];
    const hair = ch.largo
      ? `<path d="M19 28c0-10 6-16 13-16s13 6 13 16v13c-2 0-4-2-4-4V27c-3-3-5-4-9-4s-6 1-9 4v10c0 2-2 4-4 4z" fill="${ch.pelo}"/>`
      : `<path d="M20 27c0-9 5-15 12-15s12 6 12 15c-2-4-6-7-12-7s-10 3-12 7z" fill="${ch.pelo}"/>`;
    return `<svg class="avatar-svg" viewBox="0 0 64 64" width="${size}" height="${size}" role="img" aria-label="Foto de ${esc(ch.nombre)}">
      <defs><clipPath id="av-${ch.id}"><circle cx="32" cy="32" r="32"/></clipPath></defs>
      <g clip-path="url(#av-${ch.id})"><rect width="64" height="64" fill="${bg}"/>
      <path d="M10 66c2-13 11-20 22-20s20 7 22 20z" fill="${shirt}"/><rect x="27" y="37" width="10" height="9" rx="3" fill="${ch.piel}"/>
      <circle cx="32" cy="28" r="12" fill="${ch.piel}"/>${hair}
      <circle cx="27.5" cy="29" r="1.5" fill="#2A2420"/><circle cx="36.5" cy="29" r="1.5" fill="#2A2420"/>
      <path d="M28 34q4 3 8 0" stroke="#2A2420" stroke-width="1.6" fill="none" stroke-linecap="round"/></g></svg>`;
  }
  const plate = (p) => `<span class="plate" aria-label="Patente ${esc(p)}"><i>ARGENTINA</i>${esc(p)}</span>`;
  const stars = (n) => `<span class="stars-txt" aria-label="${n} de 5">★ ${Number(n).toFixed(n % 1 ? 2 : 1).replace(/0$/, "")}</span>`;
  function docStatus(dateStr) {
    const d = new Date(dateStr + "T12:00:00"), days = Math.round((d - Date.now()) / 86400000);
    const f = `${C.pad2(d.getDate())}/${C.pad2(d.getMonth() + 1)}/${d.getFullYear()}`;
    if (days < 0) return { cls: "pill-red", label: "Vencido", f, days };
    if (days < 60) return { cls: "pill-warn", label: "Vence pronto", f, days };
    return { cls: "pill-open", label: "Vigente", f, days };
  }
  const DOCS = [["licencia", "Licencia de conducir profesional"], ["seguro", "Seguro con cobertura a pasajeros"], ["vtv", "VTV"], ["habilitacion", "Habilitación municipal"]];

  /* ---------------- mapas ---------------- */
  let maps = [];
  const nearby = {};
  function carSVG(hex) {
    return `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="6.5" y="2" width="11" height="20" rx="4.5" fill="${hex}" stroke="#1D2420" stroke-width="1.3"/><rect x="8.2" y="6.2" width="7.6" height="4.2" rx="1.3" fill="#1D2420" opacity=".78"/><rect x="8.2" y="15.4" width="7.6" height="3" rx="1" fill="#1D2420" opacity=".55"/></svg>`;
  }
  const carIcon = (hex, hd) => L.divIcon({ className: "vcar", html: `<div class="vcar-in" style="transform:rotate(${hd || 0}deg)">${carSVG(hex || "#1E6B52")}</div>`, iconSize: [28, 28], iconAnchor: [14, 14] });
  const pinIcon = (kind, emoji) => L.divIcon({ className: "vpin-wrap", html: `<div class="vpin ${kind}">${emoji ? `<span>${emoji}</span>` : ""}</div>`, iconSize: [30, 30], iconAnchor: [15, 15] });
  const meIcon = () => L.divIcon({ className: "vpin-wrap", html: `<div class="vme"><i></i></div>`, iconSize: [22, 22], iconAnchor: [11, 11] });
  function setCar(marker, pt, hd) {
    marker.setLatLng(pt);
    const el = marker.getElement();
    if (el && hd != null) { const inner = el.querySelector(".vcar-in"); if (inner) inner.style.transform = `rotate(${hd}deg)`; }
  }
  function baseMap(el, opts) {
    const map = L.map(el, Object.assign({ zoomControl: false, attributionControl: true, tap: true }, opts || {}));
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);
    map.attributionControl.setPrefix(false);
    return map;
  }
  function routeLine(map, coords, dashed) {
    const casing = L.polyline(coords, { color: "#fff", weight: dashed ? 6 : 9, opacity: 0.9 }).addTo(map);
    const line = L.polyline(coords, { color: dashed ? "#E8772E" : "#1E6B52", weight: dashed ? 4 : 5, opacity: 1, dashArray: dashed ? "2 9" : null, lineCap: "round" }).addTo(map);
    return { set(c) { casing.setLatLngs(c); line.setLatLngs(c); }, remove() { casing.remove(); line.remove(); } };
  }
  function nearbyCars(origin) {
    const k = origin.id + origin.lat;
    if (!nearby[k]) {
      nearby[k] = Array.from({ length: 7 }, (_, i) => {
        const p = offset([origin.lat, origin.lng], rand(0.25, 0.9), i * 51 + rand(0, 30));
        return { p, target: offset([origin.lat, origin.lng], rand(0.2, 1), rand(0, 360)), hd: rand(0, 360), hex: ["#F2F2F2", "#A7AEB4", "#2B2D30", "#2F4D7A", "#7A2233", "#8C9196", "#EFEFEF"][i] };
      });
    }
    return nearby[k];
  }
  function stepCar(c, origin, kmPerTick) {
    const d = hav(c.p, c.target);
    if (d < kmPerTick) { c.target = offset([origin.lat, origin.lng], rand(0.2, 1), rand(0, 360)); return; }
    c.hd = bearing(c.p, c.target);
    const f = kmPerTick / d;
    c.p = [c.p[0] + (c.target[0] - c.p[0]) * f, c.p[1] + (c.target[1] - c.p[1]) * f];
  }
  // Posición del auto de un viaje según su estado
  function carState(t) {
    const now = Date.now();
    if (t.status === "encamino") {
      const f = Math.min(0.97, (now - t.history.encamino) / DUR.encamino);
      return along(t.pickup || [[t.origen.lat, t.origen.lng]], f);
    }
    if (t.status === "llego") return { pt: [t.origen.lat, t.origen.lng], hd: t.pickup && t.pickup.length > 1 ? bearing(t.pickup[t.pickup.length - 2], t.pickup[t.pickup.length - 1]) : 0 };
    if (t.status === "enviaje") return along(t.route, Math.min(0.97, (now - t.history.enviaje) / DUR.enviaje));
    if (t.status === "finalizado") return { pt: [t.destino.lat, t.destino.lng], hd: 0 };
    return null;
  }
  function tripMap(map, t, opts) {
    opts = opts || {};
    const o = [t.origen.lat, t.origen.lng], d = [t.destino.lat, t.destino.lng];
    L.marker(o, { icon: pinIcon("o", ""), keyboard: false }).addTo(map);
    L.marker(d, { icon: pinIcon("d", ""), keyboard: false }).addTo(map);
    const main = routeLine(map, t.route || [o, d]);
    const pick = t.status === "encamino" && t.pickup ? routeLine(map, t.pickup, true) : null;
    const ch = chofer(t.choferId);
    const cs = carState(t);
    const car = cs && t.status !== "finalizado" ? L.marker(cs.pt, { icon: carIcon(ch ? ch.auto.hex : null, cs.hd), keyboard: false, zIndexOffset: 500 }).addTo(map) : null;
    const pts = [o, d].concat(t.status === "encamino" && t.pickup ? t.pickup : []);
    map.fitBounds(L.latLngBounds(pts), VX.FIT);
    if (!opts.noFetch && t.route && t.route.length <= 2) {
      fetchRoute(t.origen, t.destino).then((r) => { if (!r.failed) { t.route = r.coords; C.save(); main.set(r.coords); } });
    }
    return {
      update() {
        const tt = trip(t.id);
        if (!car || !tt) return;
        if (pick && tt.pickup) pick.set(tt.pickup);
        const s = carState(tt);
        if (s) setCar(car, s.pt, s.hd);
      }
    };
  }
  function initMap(el) {
    const kind = el.dataset.vmap, v = V();
    let entry = null;
    if (kind === "pedir") {
      const o = place(v.origen) || place("actual");
      const map = baseMap(el);
      L.marker([o.lat, o.lng], { icon: meIcon(), keyboard: false, zIndexOffset: 600 }).addTo(map);
      const cars = nearbyCars(o).map((c) => ({ c, m: L.marker(c.p, { icon: carIcon(c.hex, c.hd), keyboard: false }).addTo(map) }));
      const dest = place(v.destino);
      if (dest) {
        L.marker([dest.lat, dest.lng], { icon: pinIcon("d", ""), keyboard: false }).addTo(map);
        map.fitBounds(L.latLngBounds([[o.lat, o.lng], [dest.lat, dest.lng]]), VX.FIT);
      } else { map.setView([o.lat, o.lng], 15); map.panBy([0, -24], { animate: false }); }
      entry = { map, update() { cars.forEach(({ c, m }) => { stepCar(c, o, 0.02); setCar(m, c.p, c.hd); }); } };
    } else if (kind === "cotizar") {
      const o = place(v.origen), d = place(v.destino);
      const map = baseMap(el);
      L.marker([o.lat, o.lng], { icon: pinIcon("o", ""), keyboard: false }).addTo(map);
      L.marker([d.lat, d.lng], { icon: pinIcon("d", ""), keyboard: false }).addTo(map);
      const r = routeNow(o, d);
      routeLine(map, r.coords);
      map.fitBounds(L.latLngBounds(r.coords.concat([[o.lat, o.lng], [d.lat, d.lng]])), VX.FIT);
      entry = { map };
    } else if (kind === "viaje" || kind === "seguir") {
      const t = trip(Number(el.dataset.id));
      if (!t) return;
      const map = baseMap(el);
      entry = Object.assign({ map }, tripMap(map, t));
    } else if (VX.initMapExt[kind]) {
      entry = VX.initMapExt[kind](el, baseMap);
    }
    if (entry) {
      maps.push(entry);
      setTimeout(() => { if (maps.includes(entry)) entry.map.invalidateSize(); }, 60);
    }
  }
  C.EXT.before.push(() => { maps.forEach((m) => { try { m.map.remove(); } catch (e) { /* ya estaba desmontado */ } }); maps = []; });
  C.EXT.after.push(() => {
    if (!window.L) return;
    document.querySelectorAll("[data-vmap]").forEach((el) => {
      try { initMap(el); } catch (e) { el.innerHTML = `<p class="small muted" style="padding:16px">No se pudo cargar el mapa.</p>`; }
    });
  });

  /* ---------------- simulación de viajes ---------------- */
  function pickDriver(tipoId, except) {
    const pool = V().choferes.filter((c) => c.estado === "activo" && c.tipo === tipoId && c.id !== except);
    const fallback = V().choferes.filter((c) => c.estado === "activo" && c.id !== except);
    const list = pool.length ? pool : fallback;
    return list[Math.floor(Math.random() * list.length)];
  }
  function assign(t, ch, start) {
    const now = Date.now();
    t.choferId = ch.id;
    t.status = "encamino";
    t.history.encamino = now;
    const s = start || offset([t.origen.lat, t.origen.lng], rand(0.7, 1.2), rand(0, 360));
    t.pickup = [s, [t.origen.lat, t.origen.lng]];
    t.pickupMin = Math.max(2, Math.round(hav(s, [t.origen.lat, t.origen.lng]) * 1.35 * 2.4));
    const sp = { lat: s[0], lng: s[1] };
    fetchRoute(sp, t.origen).then((r) => { const tt = trip(t.id); if (tt && !r.failed) { tt.pickup = r.coords; tt.pickupMin = r.min; C.save(); } });
    if (t.mine) {
      t.chat.push({ from: "chofer", text: `Hola, soy ${C.first(ch.nombre)}. Ya salgo para allá 🚗`, t: now });
      t.unread = (t.unread || 0) + 1;
    }
  }
  function nextStatus(t) {
    const i = FLOW.indexOf(t.status);
    const nx = FLOW[i + 1];
    if (!nx) return null;
    t.status = nx;
    t.history[nx] = Date.now();
    const ch = chofer(t.choferId);
    if (nx === "llego" && t.mine && ch) {
      t.chat.push({ from: "chofer", text: `Llegué, estoy en la puerta con el ${ch.auto.modelo.split(" (")[0]} ${ch.auto.color.toLowerCase()}.`, t: Date.now() });
      t.unread = (t.unread || 0) + 1;
    }
    if (nx === "finalizado" && t.choferId === V().driver.id) V().driver.pos = [t.destino.lat, t.destino.lng];
    return nx;
  }
  const TOASTS = {
    encamino: (t) => `🚗 ${C.first(chofer(t.choferId).nombre)} va en camino`,
    llego: () => "📍 Tu chofer llegó",
    enviaje: () => "🛣️ Arrancó el viaje",
    finalizado: () => "✅ Llegaste a destino"
  };
  VX_tick();
  function VX_tick() {
    setInterval(() => {
      const v = V(), r = C.parse(), now = Date.now();
      const onChofer = r.parts[0] === "chofer";
      let changed = null;
      v.trips.forEach((t) => {
        if (t.status === "buscando") {
          const esperaChofer = t.mine && v.driver.online && !v.driver.tripId;
          if (now - t.created < (esperaChofer ? 20000 : t.buscaMs)) return;
          if (onChofer && v.driver.online && !v.driver.tripId) return; // la solicitud la ve el chofer
          assign(t, pickDriver(t.tipo, v.driver.id));
          changed = t;
        } else if (DUR[t.status]) {
          if (onChofer && t.choferId === v.driver.id) return; // la maneja el chofer
          if (now - t.history[t.status] >= DUR[t.status]) { nextStatus(t); changed = t; }
        }
      });
      if (VX.tickExt) VX.tickExt(now, onChofer) && (changed = changed || true);
      if (changed) {
        C.save();
        if (changed !== true && changed.mine && r.parts[0] !== "chofer" && r.parts[0] !== "admin") C.toast(TOASTS[changed.status](changed));
        const live = ["viajes", "chofer", "pedidos", undefined].includes(r.parts[0]) || (r.parts[0] === "admin" && r.parts[1] === "viajes");
        if (live) rerender();
      } else {
        maps.forEach((m) => m.update && m.update());
        if (VX.liveExt) VX.liveExt(now);
      }
    }, 1000);
  }

  /* ---------------- vistas del pasajero ---------------- */
  function mapBlock(kind, id, cls, top) {
    return `<div class="vmap-wrap ${cls || ""}"><div class="vmap" data-vmap="${kind}" ${id ? `data-id="${id}"` : ""} role="img" aria-label="Mapa"></div>${top ? `<div class="vmap-top">${top}</div>` : ""}</div>`;
  }
  function placeBtn(which, p) {
    return `<button class="rb-row" data-act="v-pick" data-which="${which}">
      <span class="rb-dot ${which === "origen" ? "o" : "d"}" aria-hidden="true"></span>
      <span class="grow"><small>${which === "origen" ? "Desde" : "Hasta"}</small>${p ? `<b class="ellipsis">${esc(p.nombre)}</b><span class="ellipsis">${esc(p.linea)}</span>` : `<b style="color:var(--muted)">¿A dónde vas?</b>`}</span>${I.chevR}</button>`;
  }
  function viewPedir() {
    const v = V();
    const o = place(v.origen) || place("actual");
    if (!place(v.origen)) v.origen = "actual";
    const d = place(v.destino);
    const act = myActive()[0];
    const last = v.trips.filter((t) => t.mine && t.status === "finalizado").sort((a, b) => b.created - a.created).slice(0, 2);
    const quick = C.S.user.direcciones.map((x) => place(x.id)).concat(VD.frecuentes).filter((p) => p.id !== v.origen);
    return `${mapBlock("pedir", null, "tall", `<a class="icon-btn" href="#/" data-act="back" aria-label="Volver">${I.back}</a><span class="vpill">🚗 7 autos cerca · llegan en ~4 min</span>`)}
      <div class="vpanel">
        ${act ? `<a class="card card-pad row" href="#/viajes/${act.id}" style="border:2px solid var(--verde);margin-bottom:14px"><span style="font-size:28px" aria-hidden="true">🚗</span><div class="grow"><b>${ST[act.status].t}</b><div class="small muted ellipsis">${esc(act.origen.nombre)} → ${esc(act.destino.nombre)}</div></div><span class="link small">Ver</span></a>` : ""}
        <h1 class="h2">¿A dónde vamos?</h1>
        <div class="route-box card">
          ${placeBtn("origen", o)}
          <div class="rb-sep"><span></span><button class="icon-btn flat" data-act="v-swap" aria-label="Invertir origen y destino" ${d ? "" : "disabled"}>⇅</button></div>
          ${placeBtn("destino", d)}
        </div>
        <div class="chips" style="padding:12px 0 4px">${quick.map((p) => `<button class="chip ${v.destino === p.id ? "on" : ""}" data-act="v-set" data-which="destino" data-place="${p.id}">${p.emoji} ${esc(p.nombre)}</button>`).join("")}</div>
        <button class="btn btn-primary btn-block" style="margin-top:10px" data-act="v-cotizar" ${d ? "" : "disabled"}>Ver precios</button>
        <div class="notice info" style="margin-top:14px">${I.shield}<span>Todos los choferes están habilitados por el municipio y tienen licencia profesional, seguro y VTV al día.</span></div>
        ${last.length ? `<h2 class="h3" style="margin:20px 0 10px">Tus últimos viajes</h2><div class="list">${last.map((t) => `
          <button class="li" data-act="v-repeat" data-id="${t.id}"><span style="font-size:22px" aria-hidden="true">${tipo(t.tipo).emoji}</span>
            <div class="grow"><b class="ellipsis" style="display:block">${esc(t.destino.nombre)}</b><div class="small muted ellipsis">desde ${esc(t.origen.nombre)} · ${money(t.tarifa.total)}</div></div><span class="link small">Repetir</span></button>`).join("")}</div>` : ""}
        <div style="height:16px"></div>
      </div>`;
  }
  function pickerSheet(which) {
    const v = V();
    const saved = C.S.user.direcciones.map((x) => place(x.id));
    const item = (p, extra) => `<button class="li" data-act="v-set" data-which="${which}" data-place="${p.id}" data-q="${esc((p.nombre + " " + p.linea).toLowerCase())}"><span style="font-size:22px" aria-hidden="true">${p.emoji}</span><div class="grow"><b style="display:block">${esc(p.nombre)}${extra || ""}</b><div class="small muted">${esc(p.linea)}</div></div>${(which === "origen" ? v.origen : v.destino) === p.id ? `<span style="color:var(--verde);width:22px">${I.check}</span>` : ""}</button>`;
    C.openSheet(`<div class="grip"></div><h2 class="h2">${which === "origen" ? "¿Dónde te buscamos?" : "¿A dónde vas?"}</h2>
      <label class="search" style="margin-top:12px">${I.search}<input type="search" data-bind="v-filter" placeholder="Buscá un lugar o dirección" aria-label="Buscar lugar"></label>
      <div class="list" style="margin-top:12px" id="v-places">
        ${which === "origen" ? item(place("actual"), ` <span class="pill pill-open" style="margin-left:4px">Simulada</span>`) : ""}
        ${saved.map((p) => item(p)).join("")}
        ${VD.frecuentes.map((p) => item(p)).join("")}
      </div>
      <p class="tiny muted" style="margin-top:10px">En la versión real vas a poder escribir cualquier dirección o marcarla en el mapa.</p>`);
  }
  function viewCotizar() {
    const v = V();
    const o = place(v.origen), d = place(v.destino);
    if (!o || !d) return C.topbar("Elegí el viaje", "#/viajes") + C.empty("🗺️", "Falta el destino", "Elegí a dónde vas para ver los precios.", `<a class="btn btn-primary" href="#/viajes">Elegir destino</a>`);
    const r = routeNow(o, d);
    const now = new Date();
    const night = isNight(now);
    const tp = tipo(v.tipo);
    const f = fare(r.km, v.tipo, now);
    return `${mapBlock("cotizar", null, "", `<a class="icon-btn" href="#/viajes" data-act="back" aria-label="Volver">${I.back}</a><span class="vpill">${r.km.toFixed(1).replace(".", ",")} km · ${r.min} min${r.loading ? " · calculando ruta…" : r.approx ? " · estimado" : ""}</span>`)}
      <div class="vpanel">
        <div class="trip-od">
          <div class="row"><span class="rb-dot o" aria-hidden="true"></span><span class="ellipsis"><b>${esc(o.nombre)}</b> <span class="muted small">${esc(o.linea)}</span></span></div>
          <div class="row"><span class="rb-dot d" aria-hidden="true"></span><span class="ellipsis"><b>${esc(d.nombre)}</b> <span class="muted small">${esc(d.linea)}</span></span></div>
        </div>
        <h2 class="h3" style="margin:16px 0 10px">Elegí el tipo de viaje</h2>
        <div class="stack">${VD.tipos.map((t) => {
          const ff = fare(r.km, t.id, now);
          return `<label class="choice vtipo"><input type="radio" name="vtipo" value="${t.id}" data-bind="v-tipo" ${v.tipo === t.id ? "checked" : ""}>
            <span class="vtipo-emo" aria-hidden="true">${t.emoji}</span>
            <span class="grow"><b>${t.nombre}</b><span class="small muted" style="display:block">${t.desc}</span><span class="tiny" style="color:var(--verde);font-weight:700">Llega en ~${t.eta} min</span></span>
            <b class="vtipo-price">${money(ff.total)}</b></label>`;
        }).join("")}</div>
        ${night ? `<div class="notice warn" style="margin-top:12px">🌙<span>Tarifa nocturna: +${V().tarifas.nocturno}% de 22 a 6 h.</span></div>` : ""}
        <details class="small" style="margin-top:12px"><summary class="link" style="cursor:pointer">¿Cómo se calcula el precio?</summary>
          <div class="card card-pad totals" style="margin-top:8px">
            <div class="row"><span class="muted">Bajada de bandera</span><span>${money(f.bajada)}</span></div>
            <div class="row"><span class="muted">${r.km.toFixed(1).replace(".", ",")} km × ${money(V().tarifas.porKm * tp.mult)}</span><span>${money(f.km)}</span></div>
            ${f.extra ? `<div class="row"><span class="muted">Adicional flete</span><span>${money(f.extra)}</span></div>` : ""}
            ${f.nocturno ? `<div class="row"><span class="muted">Adicional nocturno</span><span>${money(f.nocturno)}</span></div>` : ""}
            <div class="row total"><span>Estimado</span><span>${money(f.total)}</span></div>
            <p class="tiny muted">La espera cuesta ${money(V().tarifas.esperaMin)} por minuto después de los primeros ${V().tarifas.esperaGratis} minutos.</p>
          </div></details>
        <h2 class="h3" style="margin:18px 0 10px">¿Cómo pagás?</h2>
        <div class="pay-row">
          <label class="choice"><input type="radio" name="vpago" value="efectivo" data-bind="v-pago" ${v.pago === "efectivo" ? "checked" : ""}><span style="color:var(--verde)">${I.cash}</span><b>Efectivo</b></label>
          <label class="choice"><input type="radio" name="vpago" value="mp" data-bind="v-pago" ${v.pago === "mp" ? "checked" : ""}><span style="color:var(--verde)">${I.card}</span><b>Mercado Pago</b></label>
        </div>
        <p class="tiny muted" style="margin-top:8px">Mercado Pago es simulado: no se cobra nada.</p>
        <div style="height:12px"></div>
      </div>
      <div class="cartbar"><button class="btn btn-primary" data-act="v-pedir"><span>Pedir ${tp.nombre}</span><span>${money(f.total)}</span></button></div>`;
  }
  function stepsH(t) {
    const i = FLOW.indexOf(t.status);
    return `<ol class="hsteps" aria-label="Estado del viaje">${FLOW.map((k, j) => `<li class="${j < i || t.status === "finalizado" ? "done" : j === i ? "now" : ""}"><span></span>${ST[k].corto}</li>`).join("")}</ol>`;
  }
  function driverCard(t, compact) {
    const ch = chofer(t.choferId);
    if (!ch) return "";
    const rm = remiseria(ch.remiseria);
    return `<div class="driver">
      <div class="row" style="align-items:flex-start;gap:12px">${avatar(ch, 60)}
        <div class="grow"><b style="font-size:17px">${esc(ch.nombre)}</b>
          <div class="small muted">${stars(ch.rating)} · ${ch.viajes.toLocaleString("es-AR")} viajes · desde ${ch.desde}</div>
          <div class="small" style="margin-top:4px"><span class="swatch" style="background:${ch.auto.hex}"></span>${esc(ch.auto.modelo)} · ${esc(ch.auto.color)}</div></div>
        ${plate(ch.patente)}</div>
      ${compact ? "" : `<div class="driver-meta small"><span>🏢 ${esc(rm.nombre)}</span><span>🪪 Habilitación municipal N° ${esc(ch.habilitacion)}</span></div>
      <button class="verified" data-act="v-docs" data-ch="${ch.id}">${DOCS.map(([k, n]) => `<span class="${ch.verif[k] && docStatus(ch.docs[k]).days >= 0 ? "ok" : "ko"}">${ch.verif[k] && docStatus(ch.docs[k]).days >= 0 ? "✓" : "!"} ${k === "vtv" ? "VTV" : n.split(" ")[0]}</span>`).join("")}<span class="link tiny">Ver</span></button>`}
    </div>`;
  }
  function viewViaje(id) {
    const t = trip(id);
    if (!t) return C.topbar("Viaje", "#/viajes") + C.empty("🧭", "No encontramos ese viaje", "Puede que el link esté viejo.", `<a class="btn btn-primary" href="#/viajes">Pedir un viaje</a>`);
    const ch = chofer(t.choferId), tp = tipo(t.tipo);
    const inTrip = ["encamino", "llego", "enviaje"].includes(t.status);
    const sos = inTrip ? `<button class="sos-btn" data-act="v-sos" data-id="${t.id}" aria-label="SOS: pedir ayuda">SOS</button>` : "";
    const back = t.status === "finalizado" || t.status === "cancelado" ? "#/pedidos?tab=viajes" : "#/viajes";
    let panel = "";
    if (t.status === "buscando") {
      panel = `<div class="center" style="padding:6px 0 4px">
          <div class="radar" aria-hidden="true"><span></span><span></span><span></span><i>${tp.emoji}</i></div>
          <h1 class="h2" style="margin-top:14px">Buscando chofer cerca tuyo…</h1>
          <p class="muted small" style="margin-top:6px">Le avisamos a los choferes habilitados de la zona.</p></div>
        ${V().driver.online && !V().driver.tripId ? `<p class="demo-note" style="margin-top:10px">${I.info}<span>Demo: tenés la app del chofer conectada. <a class="link" href="#/chofer">Abrila</a> para aceptar este viaje vos, o en unos segundos lo toma otro chofer.</span></p>` : ""}
        ${tripSummary(t)}
        <button class="btn btn-outline btn-block" style="margin-top:12px" data-act="v-cancel" data-id="${t.id}">Cancelar</button>`;
    } else if (inTrip) {
      const cs = carState(t);
      let title, sub;
      if (t.status === "encamino") {
        const f = Math.min(0.97, (Date.now() - t.history.encamino) / DUR.encamino);
        title = `${esc(C.first(ch.nombre))} llega en ${Math.max(1, Math.ceil((t.pickupMin || 4) * (1 - f)))} min`;
        sub = `Te busca en ${esc(t.origen.nombre)}`;
      } else if (t.status === "llego") {
        title = "Tu chofer llegó 🙌"; sub = `Te espera en ${esc(t.origen.linea)}. Tenés ${V().tarifas.esperaGratis} minutos sin cargo.`;
      } else {
        title = "En viaje"; sub = `Llegás a ${esc(t.destino.nombre)} a las ${hhmm(new Date(t.history.enviaje + t.min * 60000))}`;
      }
      panel = `${t.sos ? `<div class="notice danger" style="margin-bottom:12px"><span style="font-size:18px">🆘</span><span><b>SOS activo.</b> Estamos compartiendo tu ubicación con tus contactos y la central (simulado). <button class="link" data-act="v-sos-off" data-id="${t.id}" style="background:none;border:0;padding:0;text-decoration:underline">Desactivar</button></span></div>` : ""}
        <h1 class="h2" aria-live="polite">${title}</h1><p class="muted small" style="margin-top:4px">${sub}</p>
        ${stepsH(t)}
        <div class="card card-pad" style="margin-top:12px">${driverCard(t)}</div>
        <div class="vactions">
          <a class="vaction" href="#/viajes/${t.id}/chat">💬<span>Chat</span>${t.unread ? `<em>${t.unread}</em>` : ""}</a>
          <button class="vaction" data-act="v-share" data-id="${t.id}">🔗<span>Compartir viaje</span></button>
          <button class="vaction" data-act="v-call" data-ch="${ch.id}">📞<span>Llamar</span></button>
        </div>
        ${tripSummary(t)}
        ${t.status === "encamino" ? `<button class="btn btn-outline btn-block" style="margin-top:12px" data-act="v-cancel" data-id="${t.id}">Cancelar viaje</button>` : ""}
        ${t.mine ? `<p class="demo-note" style="margin-top:12px">${I.info}<span>Demo: el viaje avanza solo, o lo manejás desde la <a class="link" href="#/chofer">app del chofer</a> si lo aceptás ahí.</span></p>` : ""}`;
      void cs;
    } else if (t.status === "finalizado") {
      panel = VX.finalPanel(t);
    } else {
      panel = `<h1 class="h2">Cancelaste el viaje</h1><p class="muted small" style="margin-top:4px">No se te cobró nada.</p>
        <a class="btn btn-primary btn-block" style="margin-top:14px" href="#/viajes">Pedir otro viaje</a>`;
    }
    return `${mapBlock("viaje", t.id, t.status === "finalizado" ? "short" : "", `<a class="icon-btn" href="${back}" data-act="back" aria-label="Volver">${I.back}</a>${sos}`)}
      <div class="vpanel">${panel}<div style="height:18px"></div></div>`;
  }
  function tripSummary(t) {
    return `<div class="card card-pad" style="margin-top:12px">
      <div class="trip-od">
        <div class="row"><span class="rb-dot o" aria-hidden="true"></span><span class="ellipsis"><b>${esc(t.origen.nombre)}</b></span></div>
        <div class="row"><span class="rb-dot d" aria-hidden="true"></span><span class="ellipsis"><b>${esc(t.destino.nombre)}</b></span></div>
      </div>
      <div class="row between small" style="margin-top:10px"><span class="muted">${tipo(t.tipo).emoji} ${tipo(t.tipo).nombre} · ${t.km.toFixed(1).replace(".", ",")} km</span><b>${money(t.tarifa.total)}</b></div>
      <div class="tiny muted" style="margin-top:2px">${t.pago === "mp" ? "Mercado Pago (simulado)" : "Efectivo, al bajar"}</div></div>`;
  }
  function historyView() {
    const v = V();
    const mine = v.trips.filter((t) => t.mine).sort((a, b) => b.created - a.created);
    const act = mine.filter((t) => ACTIVE.includes(t.status));
    const past = mine.filter((t) => !ACTIVE.includes(t.status));
    const card = (t) => {
      const ch = chofer(t.choferId);
      return `<article class="card order-card">
        <a href="#/viajes/${t.id}" style="display:block">
          <div class="row between"><b>${tipo(t.tipo).emoji} ${tipo(t.tipo).nombre}</b><span class="pill ${ST[t.status].pill}">${ST[t.status].corto}</span></div>
          <div class="tiny muted" style="margin-top:2px">${C.fmtDate(t.created)}${ch ? ` · ${esc(ch.nombre)}` : ""}</div>
          <div class="trip-od" style="margin-top:8px">
            <div class="row small"><span class="rb-dot o" aria-hidden="true"></span><span class="ellipsis">${esc(t.origen.nombre)}</span></div>
            <div class="row small"><span class="rb-dot d" aria-hidden="true"></span><span class="ellipsis">${esc(t.destino.nombre)}</span></div></div>
          <div class="row between" style="margin-top:8px"><b>${money(t.tarifa.total + (t.propina || 0))}</b>${t.estrellas ? `<span class="small" style="color:var(--naranja-700)">${"★".repeat(t.estrellas)}<span style="color:var(--line)">${"★".repeat(5 - t.estrellas)}</span></span>` : ""}</div></a>
        <div class="btn-row" style="margin-top:12px">
          ${ACTIVE.includes(t.status) ? `<a class="btn btn-sm btn-primary" href="#/viajes/${t.id}">Seguir viaje</a>` : `<a class="btn btn-sm btn-outline" href="#/viajes/${t.id}">Ver detalle</a><button class="btn btn-sm btn-soft" data-act="v-repeat" data-id="${t.id}">${I.refresh} Repetir viaje</button>`}
        </div></article>`;
    };
    return `${act.length ? `<section class="section" style="margin-top:12px"><div class="section-head"><h2 class="h3">En curso</h2></div><div class="pad stack">${act.map(card).join("")}</div></section>` : ""}
      <section class="section" style="margin-top:${act.length ? 24 : 12}px"><div class="section-head"><h2 class="h3">Viajes anteriores</h2><a href="#/viajes">Pedir un remis</a></div>
        <div class="pad stack">${past.length ? past.map(card).join("") : `<p class="muted">Todavía no hiciste viajes.</p>`}</div></section>
      <div style="height:24px"></div>`;
  }

  /* ---------------- integración con Cuadra ---------------- */
  const VX = {
    V, ST, FLOW, DUR, ACTIVE, VD, FIT, tipo, chofer, remiseria, trip, place, placeRef, fare, isNight, hav, offset, along, bearing, rand, round50,
    fetchRoute, routeNow, estimate, rerender, avatar, plate, stars, docStatus, DOCS, carIcon, pinIcon, meIcon, setCar, routeLine, tripMap, carState,
    assign, nextStatus, pickDriver, driverCard, tripSummary, mapBlock, stepsH, myActive,
    initMapExt: {}, tickExt: null, liveExt: null, finalPanel: () => ""
  };
  window.CuadraViajes = VX;

  C.EXT.routes.push((r) => {
    const [a, b, c] = r.parts;
    if (a !== "viajes") return null;
    if (!b) return { view: viewPedir(), tab: "viajes" };
    if (b === "cotizar") return { view: viewCotizar() };
    if (b === "seguir") return VX.viewSeguir ? { view: VX.viewSeguir(Number(c)), mode: "seguir" } : null;
    if (c === "chat" && VX.viewChat) return { view: VX.viewChat(Number(b)) };
    return { view: viewViaje(Number(b)) };
  });
  C.EXT.navBadges.viajes = () => myActive().length;
  C.EXT.ordersTabs.push({ id: "viajes", label: "🚗 Viajes", render: historyView });
  C.EXT.homeCards.push(() => {
    const act = myActive()[0];
    return `${act ? `<a class="card card-pad row" href="#/viajes/${act.id}" style="margin:14px 16px 0;border:2px solid var(--verde)"><span style="font-size:30px" aria-hidden="true">🚗</span><div class="grow"><b>${ST[act.status].t}</b><div class="small muted ellipsis">${esc(act.origen.nombre)} → ${esc(act.destino.nombre)}</div></div><span class="link small">Ver</span></a>` : ""}
      <a class="remis-cta" href="#/viajes">
        <span class="remis-emo" aria-hidden="true">🚗</span>
        <span class="grow"><b>Pedí un remis</b><span>Choferes habilitados del barrio · llegan en ~4 min</span></span>
        <span class="remis-go" aria-hidden="true">${I.chevR}</span></a>`;
  });

  Object.assign(C.ACT, {
    "v-pick"(el) { pickerSheet(el.dataset.which); },
    "v-set"(el) {
      const v = V(), which = el.dataset.which, id = el.dataset.place;
      const other = which === "origen" ? v.destino : v.origen;
      if (id === other) { C.toast("El origen y el destino no pueden ser iguales"); return; }
      v[which] = id; C.save(); C.closeSheet(); C.render();
    },
    "v-swap"() {
      const v = V();
      if (!v.destino) return;
      [v.origen, v.destino] = [v.destino, v.origen]; C.save(); C.render();
    },
    "v-cotizar"() { if (V().destino) C.go("#/viajes/cotizar"); },
    "v-pedir"() {
      const v = V(), o = place(v.origen), d = place(v.destino);
      if (!o || !d) return;
      const r = routeNow(o, d), now = Date.now();
      const t = {
        id: v.nextId++, mine: true, pasajero: { nombre: C.first(C.S.user.nombre) + " " + (C.S.user.nombre.split(" ")[1] || "")[0] + ".", rating: 4.9 },
        origen: placeRef(o), destino: placeRef(d), tipo: v.tipo, km: r.km, min: r.min, tarifa: fare(r.km, v.tipo, new Date()), pago: v.pago,
        status: "buscando", created: now, history: { buscando: now }, buscaMs: Math.round(rand(3000, 5000)), choferId: null, route: r.coords, chat: [], unread: 0
      };
      v.trips.push(t);
      v.destino = null;
      C.save(); C.go("#/viajes/" + t.id);
    },
    "v-cancel"(el) {
      const t = trip(Number(el.dataset.id));
      C.confirmSheet({
        title: "¿Cancelar el viaje?", text: t.status === "buscando" ? "Todavía no hay chofer asignado." : "Todavía no llegó a buscarte, así que no se te cobra nada.",
        ok: "Sí, cancelar", cancel: "No", danger: true,
        onOk: () => {
          if (!["buscando", "encamino"].includes(t.status)) { C.toast("El chofer ya llegó, no se puede cancelar."); return; }
          t.status = "cancelado"; t.history.cancelado = Date.now();
          const v = V();
          if (v.driver.tripId === t.id) v.driver.tripId = null;
          if (v.driver.req && v.driver.req.tripId === t.id) v.driver.req = null;
          C.save(); C.render();
        }
      });
    },
    "v-repeat"(el) {
      const t = trip(Number(el.dataset.id)), v = V();
      const ok = (p) => p && (p.id === "actual" || place(p.id));
      v.origen = ok(t.origen) ? t.origen.id : "actual";
      v.destino = ok(t.destino) && t.destino.id !== v.origen ? t.destino.id : null;
      v.tipo = t.tipo;
      C.save();
      C.go(v.destino ? "#/viajes/cotizar" : "#/viajes");
    },
    "v-docs"(el) {
      const ch = chofer(el.dataset.ch);
      C.openSheet(`<div class="grip"></div><div class="row" style="gap:12px">${avatar(ch, 52)}<div><h2 class="h2">${esc(ch.nombre)}</h2><div class="small muted">Documentación verificada por Cuadra</div></div></div>
        <div class="list" style="margin-top:14px">${DOCS.map(([k, n]) => { const s = docStatus(ch.docs[k]); return `<div class="li"><span style="font-size:20px">${ch.verif[k] && s.days >= 0 ? "✅" : "⚠️"}</span><div class="grow"><b>${n}</b><div class="small muted">Vence el ${s.f}</div></div><span class="pill ${s.cls}">${s.label}</span></div>`; }).join("")}</div>
        <div class="card card-pad small" style="margin-top:12px;line-height:1.6"><div>🚗 ${esc(ch.auto.modelo)} · ${esc(ch.auto.color)} · ${esc(ch.patente)}</div><div>🏢 ${esc(remiseria(ch.remiseria).nombre)} · ${esc(remiseria(ch.remiseria).habilitacion || "")}</div><div>🪪 Habilitación municipal N° ${esc(ch.habilitacion)}</div></div>`);
    },
    "v-call"() { C.toast("En la maqueta no se hacen llamadas. En la real, el número queda enmascarado."); }
  });
  Object.assign(C.BIND, {
    "v-tipo"(el, ev) { if (ev === "change") { V().tipo = el.value; C.save(); C.render(); } },
    "v-pago"(el, ev) { if (ev === "change") { V().pago = el.value; C.save(); } },
    "v-filter"(el) {
      const q = el.value.trim().toLowerCase();
      document.querySelectorAll("#v-places [data-q]").forEach((b) => { b.hidden = q && !b.dataset.q.includes(q); });
    }
  });
})();
