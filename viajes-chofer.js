/* Cuadra Viajes — app del chofer (#/chofer): conexión, solicitudes, navegación simulada, ganancias y documentos. */
(function () {
  "use strict";

  const C = window.Cuadra, VX = window.CuadraViajes;
  const { esc, money, hhmm, I } = C;
  const { V, trip, chofer, remiseria, place, fare, hav, offset, carState, assign, nextStatus, pickDriver, avatar, plate, stars, docStatus, DOCS, rand } = VX;
  const REQ_MS = 15000;
  const RING = 163.4;

  const drv = () => V().driver;
  const me = () => chofer(drv().id);
  const kmTxt = (n) => n.toFixed(1).replace(".", ",") + " km";

  /* ---------------- solicitudes ---------------- */
  function makeReq(now) {
    const d = drv();
    const near = VX.VD.frecuentes.filter((f) => hav(d.pos, [f.lat, f.lng]) < 2.5);
    const o = near[Math.floor(Math.random() * near.length)] || VX.VD.frecuentes[0];
    const dests = VX.VD.frecuentes.filter((f) => f.id !== o.id);
    const de = dests[Math.floor(Math.random() * dests.length)];
    const km = Math.max(0.8, hav([o.lat, o.lng], [de.lat, de.lng]) * 1.35);
    const p = VX.VD.pasajeros[Math.floor(Math.random() * VX.VD.pasajeros.length)];
    return {
      tripId: null, pasajero: p, origen: VX.placeRef(o), destino: VX.placeRef(de), km, min: Math.max(3, Math.round(km * 2.4)),
      tarifa: fare(km, "remis", new Date()), pago: Math.random() < 0.5 ? "efectivo" : "mp", expires: now + REQ_MS
    };
  }
  function reqView(req) {
    if (req.tripId) {
      const t = trip(req.tripId);
      if (!t || t.status !== "buscando") return null;
      return Object.assign({}, req, { pasajero: t.pasajero, origen: t.origen, destino: t.destino, km: t.km, min: t.min, tarifa: t.tarifa, pago: t.pago, fromApp: true });
    }
    return req;
  }
  VX.tickExt = function (now, onChofer) {
    const d = drv();
    if (!onChofer || !d.online || d.tripId) return false;
    if (d.req) {
      const valid = !d.req.tripId || (trip(d.req.tripId) || {}).status === "buscando";
      if (!valid) { d.req = null; d.idleSince = now; return true; }
      if (now > d.req.expires) {
        const t = d.req.tripId && trip(d.req.tripId);
        if (t) assign(t, pickDriver(t.tipo, d.id));
        d.req = null; d.idleSince = now;
        C.toast("La solicitud venció y pasó a otro chofer");
        return true;
      }
      return false;
    }
    const pend = V().trips.find((t) => t.status === "buscando" && now - t.created >= 1200);
    if (pend) { d.req = { tripId: pend.id, expires: now + REQ_MS }; ding(); return true; }
    if (now - d.idleSince > 6000) { d.req = makeReq(now); ding(); return true; }
    return false;
  };
  function ding() { try { if (navigator.vibrate) navigator.vibrate([120, 80, 120]); } catch (e) { /* sin vibración */ } }
  VX.liveExt = function (now) {
    const d = drv();
    const ring = document.getElementById("req-ring");
    if (ring && d.req) {
      const left = Math.max(0, d.req.expires - now);
      ring.setAttribute("stroke-dashoffset", String(RING * (1 - left / REQ_MS)));
      const n = document.getElementById("req-count");
      if (n) n.textContent = Math.ceil(left / 1000);
    }
    const t = d.tripId && trip(d.tripId);
    if (t) { const s = carState(t); if (s) d.pos = s.pt; }
    const w = document.getElementById("wait-t");
    if (w && t && t.status === "llego") { const s = Math.floor((now - t.history.llego) / 1000); w.textContent = `${Math.floor(s / 60)}:${C.pad2(s % 60)}`; }
  };

  /* ---------------- mapa del chofer ---------------- */
  VX.initMapExt.chofer = function (el, baseMap) {
    const d = drv(), ch = me();
    const map = baseMap(el);
    const t = d.tripId && trip(d.tripId);
    if (t && t.status !== "finalizado") return Object.assign({ map }, VX.tripMap(map, t));
    const car = L.marker(d.pos, { icon: VX.carIcon(ch.auto.hex, 0), keyboard: false, zIndexOffset: 500 }).addTo(map);
    const rq = d.req && reqView(d.req);
    if (rq) {
      const o = [rq.origen.lat, rq.origen.lng], de = [rq.destino.lat, rq.destino.lng];
      L.marker(o, { icon: VX.pinIcon("o", ""), keyboard: false }).addTo(map);
      L.marker(de, { icon: VX.pinIcon("d", ""), keyboard: false }).addTo(map);
      VX.routeLine(map, [d.pos, o], true);
      const line = VX.routeLine(map, [o, de]);
      VX.fetchRoute(rq.origen, rq.destino).then((r) => line.set(r.coords));
      map.fitBounds(L.latLngBounds([d.pos, o, de]), VX.FIT);
    } else { map.setView(d.pos, 15); map.panBy([0, -40], { animate: false }); }
    let target = offset(d.pos, 0.5, rand(0, 360));
    return {
      map,
      update() {
        if (!d.online || d.req) return;
        const dist = hav(d.pos, target);
        if (dist < 0.02) { target = offset(VX.VD.centro, rand(0.1, 1), rand(0, 360)); return; }
        const hd = VX.bearing(d.pos, target), f = 0.012 / dist;
        d.pos = [d.pos[0] + (target[0] - d.pos[0]) * f, d.pos[1] + (target[1] - d.pos[1]) * f];
        VX.setCar(car, d.pos, hd);
      }
    };
  };

  /* ---------------- ganancias ---------------- */
  function dayBase(date) {
    const h = C.hash(date.toDateString() + "ch1");
    const viajes = 8 + (h % 9), bruto = viajes * (4600 + (h % 1400));
    return { viajes, bruto };
  }
  function earnings() {
    const v = V(), com = v.tarifas.comision / 100, now = new Date();
    const mineDone = v.trips.filter((t) => t.choferId === drv().id && t.status === "finalizado" && t.history.finalizado > v.seedTime);
    const days = [];
    for (let k = 6; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - k);
      let { viajes, bruto } = dayBase(d);
      if (k === 0) { const f = Math.min(1, (now.getHours() + 1) / 20); viajes = Math.round(viajes * f); bruto = Math.round(bruto * f); }
      const real = mineDone.filter((t) => new Date(t.history.finalizado).toDateString() === d.toDateString());
      viajes += real.length;
      bruto += real.reduce((a, t) => a + t.tarifa.total, 0);
      const propinas = real.reduce((a, t) => a + (t.propina || 0), 0);
      days.push({ d, viajes, bruto, neto: Math.round(bruto * (1 - com)) + propinas, propinas });
    }
    const hoy = days[6];
    const semana = days.reduce((a, x) => ({ viajes: a.viajes + x.viajes, neto: a.neto + x.neto }), { viajes: 0, neto: 0 });
    return { days, hoy, semana, real: mineDone, com };
  }

  /* ---------------- vistas ---------------- */
  function head() {
    const ch = me(), d = drv();
    return `<div class="drv-head">${avatar(ch, 42)}
      <div class="grow"><b>Hola, ${esc(C.first(ch.nombre))}</b><div class="tiny muted ellipsis">${esc(remiseria(ch.remiseria).nombre)} · ${stars(ch.rating)}</div></div>
      <span class="pill ${d.online ? "pill-open" : "pill-closed"}">${d.online ? "Conectado" : "Desconectado"}</span>
      <a class="btn btn-sm btn-outline" href="#/" aria-label="Salir de la app del chofer">Salir</a></div>`;
  }
  function choferNav(tab) {
    const it = (id, href, icon, label) => `<a href="${href}" class="${tab === id ? "on" : ""}" ${tab === id ? 'aria-current="page"' : ""}>${icon}<span>${label}</span></a>`;
    return it("manejar", "#/chofer", I.car, "Manejar") + it("ganancias", "#/chofer/ganancias", I.cash, "Ganancias") + it("documentos", "#/chofer/documentos", I.orders, "Documentos");
  }
  function onlineToggle() {
    const on = drv().online;
    return `<label class="online-toggle ${on ? "on" : ""}"><span class="switch"><input type="checkbox" data-bind="v-online" ${on ? "checked" : ""} aria-label="Conectado para recibir viajes"><i></i></span><b>${on ? "Conectado" : "Desconectado"}</b></label>`;
  }
  function reqCard(rq) {
    const d = drv();
    const left = Math.max(0, d.req.expires - Date.now());
    const toO = hav(d.pos, [rq.origen.lat, rq.origen.lng]) * 1.35;
    return `<div class="card req" role="alertdialog" aria-label="Nueva solicitud de viaje">
      <div class="row between"><div><span class="pill pill-new">Nueva solicitud</span>${rq.fromApp ? `<span class="pill pill-open" style="margin-left:6px">Pedido desde la app</span>` : ""}</div>
        <div class="ring" aria-label="Tiempo para aceptar"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="ring-bg"/><circle id="req-ring" cx="30" cy="30" r="26" class="ring-fg" stroke-dasharray="${RING}" stroke-dashoffset="${RING * (1 - left / REQ_MS)}"/></svg><span id="req-count">${Math.ceil(left / 1000)}</span></div></div>
      <div class="row" style="margin-top:10px"><span style="font-size:26px" aria-hidden="true">🙋</span><div class="grow"><b>${esc(rq.pasajero.nombre)}</b> <span class="small muted">${stars(rq.pasajero.rating)}</span></div></div>
      <div class="trip-od" style="margin-top:10px">
        <div class="row"><span class="rb-dot o" aria-hidden="true"></span><span class="grow ellipsis"><b>${esc(rq.origen.nombre)}</b><span class="small muted"> · a ${kmTxt(toO)} de vos</span></span></div>
        <div class="row"><span class="rb-dot d" aria-hidden="true"></span><span class="grow ellipsis"><b>${esc(rq.destino.nombre)}</b></span></div></div>
      <div class="facts" style="margin-top:12px">
        <div class="fact"><b>${kmTxt(rq.km)}</b><span>Distancia</span></div>
        <div class="fact"><b>${money(rq.tarifa.total)}</b><span>Tarifa</span></div>
        <div class="fact"><b>${rq.pago === "mp" ? "MP" : "Efectivo"}</b><span>Pago</span></div></div>
      <div class="btn-row" style="margin-top:14px"><button class="btn btn-outline" data-act="v-d-reject">Rechazar</button><button class="btn btn-primary" style="flex:2" data-act="v-d-accept">Aceptar</button></div>
    </div>`;
  }
  function navCard(t) {
    const pas = C.first(t.pasajero.nombre);
    const com = V().tarifas.comision;
    if (t.status === "finalizado") {
      const neto = Math.round(t.tarifa.total * (1 - com / 100));
      return `<div class="card card-pad">
        <h2 class="h2">Viaje terminado 🎉</h2>
        <div class="notice ${t.pago === "mp" ? "info" : "warn"}" style="margin-top:10px;font-size:16px">${t.pago === "mp" ? I.card : I.cash}<span>${t.pago === "mp" ? `Pagado con Mercado Pago. Te acreditamos <b>${money(neto)}</b>.` : `Cobrale <b>${money(t.tarifa.total)}</b> en efectivo a ${esc(pas)}.`}</span></div>
        <div class="totals" style="margin-top:12px">
          <div class="row"><span class="muted">Tarifa del viaje</span><span>${money(t.tarifa.total)}</span></div>
          <div class="row"><span class="muted">Comisión Cuadra (${com}%)</span><span>−${money(t.tarifa.total - neto)}</span></div>
          <div class="row total"><span>Te queda</span><span>${money(neto)}</span></div></div>
        <button class="btn btn-primary btn-block" style="margin-top:14px" data-act="v-d-done">Listo, seguir conectado</button></div>`;
    }
    const cfg = {
      encamino: { t: `Buscá a ${esc(pas)}`, s: `${esc(t.origen.nombre)} · ${esc(t.origen.linea)}`, b: "Llegué" },
      llego: { t: `Esperando a ${esc(pas)}`, s: `Espera: <b id="wait-t">0:00</b> · ${V().tarifas.esperaGratis} min sin cargo`, b: "Empezar viaje" },
      enviaje: { t: `Llevá a ${esc(pas)} a ${esc(t.destino.nombre)}`, s: esc(t.destino.linea), b: "Finalizar viaje" }
    }[t.status];
    return `<div class="card card-pad">
      <div class="row between"><span class="pill ${VX.ST[t.status].pill}">${VX.ST[t.status].corto}</span><b>${money(t.tarifa.total)}</b></div>
      <h2 class="h2" style="margin-top:8px">${cfg.t}</h2><p class="small muted" style="margin-top:4px">${cfg.s}</p>
      ${VX.stepsH(t)}
      <div class="btn-row" style="margin-top:12px"><button class="btn btn-soft" data-act="soon" data-msg="En la app real se abre la navegación paso a paso.">🧭 Navegar</button><button class="btn btn-primary" style="flex:2" data-act="v-d-next" data-id="${t.id}">${cfg.b}</button></div>
      <p class="tiny muted" style="margin-top:10px">${t.pago === "mp" ? "Paga con Mercado Pago" : "Paga en efectivo"} · ${t.mine ? "pedido desde la app del vecino" : "pasajero de ejemplo"}</p></div>`;
  }
  function viewManejar() {
    const d = drv(), v = V();
    const t = d.tripId && trip(d.tripId);
    const rq = !t && d.online && d.req && reqView(d.req);
    const e = earnings();
    let panel;
    if (t) panel = navCard(t);
    else if (!d.online) panel = `<div class="card card-pad center"><div style="font-size:40px">😴</div><h2 class="h2" style="margin-top:6px">Estás desconectado</h2><p class="muted small" style="margin-top:6px">Conectate para empezar a recibir viajes cerca tuyo.</p><button class="btn btn-primary btn-block" style="margin-top:14px" data-act="v-d-online">Conectarme</button></div>`;
    else if (rq) panel = reqCard(rq);
    else panel = `<div class="card card-pad center"><div class="radar small" aria-hidden="true"><span></span><span></span><i>🚗</i></div><h2 class="h3" style="margin-top:10px">Buscando viajes cerca…</h2><p class="muted small" style="margin-top:4px">Te avisamos apenas entre una solicitud.</p></div>`;
    void v;
    return `${head()}
      ${VX.mapBlock("chofer", null, "", onlineToggle())}
      <div class="vpanel">${panel}
        <div class="kpis" style="margin-top:14px">
          <div class="card kpi"><span>Hoy</span><b>${money(e.hoy.neto)}</b></div>
          <div class="card kpi"><span>Viajes hoy</span><b>${e.hoy.viajes}</b></div></div>
        <p class="demo-note" style="margin-top:12px">${I.info}<span>Demo: conectado te entra una solicitud de ejemplo cada tanto. Si pedís un viaje desde la app del vecino, te llega acá.</span></p>
        <div style="height:16px"></div></div>`;
  }
  function viewGanancias() {
    const e = earnings(), ch = me(), d = drv();
    const hoyReal = e.real.filter((t) => C.isToday(t.history.finalizado));
    const efectivo = hoyReal.filter((t) => t.pago === "efectivo").reduce((a, t) => a + t.tarifa.total, 0);
    const mp = hoyReal.filter((t) => t.pago === "mp").reduce((a, t) => a + Math.round(t.tarifa.total * (1 - e.com)), 0);
    const horas = (d.onlineMs + (d.online ? Date.now() - d.onlineSince : 0)) / 3600000;
    const series = e.days.map((x) => ({ d: x.d, v: x.neto }));
    return `${head()}<div class="pad stack" style="margin-top:12px">
      <h1 class="h1">Ganancias</h1>
      <div class="kpis">
        <div class="card kpi"><span>Hoy</span><b>${money(e.hoy.neto)}</b><small>${e.hoy.viajes} viajes</small></div>
        <div class="card kpi"><span>Esta semana</span><b>${money(e.semana.neto)}</b><small>${e.semana.viajes} viajes</small></div>
        <div class="card kpi"><span>Calificación</span><b>★ ${ch.rating}</b><small>${ch.viajes.toLocaleString("es-AR")} viajes</small></div>
        <div class="card kpi"><span>Conectado hoy</span><b>${Math.floor(horas)} h ${Math.round((horas % 1) * 60)} min</b></div>
      </div>
      <div class="card card-pad"><h2 class="h3" style="margin-bottom:8px">Últimos 7 días (neto)</h2>
        ${C.barChart(series, { tip: (v) => money(v), axis: (v) => (v ? "$" + Math.round(v / 1000) + "k" : "0"), step: 10000, pl: 40, label: "Ganancias netas de los últimos 7 días" })}</div>
      <div class="card card-pad totals"><h2 class="h3">Hoy en detalle</h2>
        <div class="row"><span class="muted">Viajes en efectivo (ya cobrados)</span><span>${money(efectivo)}</span></div>
        <div class="row"><span class="muted">Mercado Pago a acreditar</span><span>${money(mp)}</span></div>
        <div class="row"><span class="muted">Propinas</span><span>${money(e.hoy.propinas)}</span></div>
        <div class="row"><span class="muted">Comisión Cuadra</span><span>${V().tarifas.comision}% por viaje</span></div>
        <p class="tiny muted">Lo de Mercado Pago se acredita al día siguiente. La comisión de los viajes en efectivo se descuenta de esa acreditación.</p></div>
      ${hoyReal.length ? `<h2 class="h3">Viajes de hoy en la demo</h2><div class="list">${hoyReal.map((t) => `<div class="li"><span style="font-size:20px">🚗</span><div class="grow"><b class="ellipsis" style="display:block">${esc(t.origen.nombre)} → ${esc(t.destino.nombre)}</b><div class="small muted">${hhmm(new Date(t.history.finalizado))} · ${t.pago === "mp" ? "Mercado Pago" : "Efectivo"}</div></div><b>${money(t.tarifa.total)}</b></div>`).join("")}</div>` : ""}
      <p class="tiny muted">Números de ejemplo más los viajes que hagas en la demo.</p>
      <div style="height:16px"></div></div>`;
  }
  function viewDocumentos() {
    const ch = me(), rm = remiseria(ch.remiseria);
    return `${head()}<div class="pad stack" style="margin-top:12px">
      <h1 class="h1">Documentación</h1>
      <div class="card card-pad"><div class="row between" style="align-items:flex-start"><div><b style="font-size:17px">${esc(ch.auto.modelo)}</b><div class="small muted">${esc(ch.auto.color)} · ${esc(rm.nombre)}</div><div class="small" style="margin-top:6px">🪪 Habilitación municipal N° ${esc(ch.habilitacion)}</div></div>${plate(ch.patente)}</div></div>
      <div class="list">${DOCS.map(([k, n]) => {
        const s = docStatus(ch.docs[k]);
        const review = !ch.verif[k];
        return `<div class="li" style="align-items:flex-start"><span style="font-size:22px">${review ? "⏳" : s.days < 0 ? "⚠️" : "✅"}</span>
          <div class="grow"><b>${n}</b><div class="small muted">Vence el ${s.f}${s.days >= 0 ? ` · faltan ${s.days} días` : ""}</div>
            <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><span class="pill ${s.cls}">${s.label}</span>${review ? `<span class="pill pill-warn">En revisión</span>` : `<span class="pill pill-open">Verificado por Cuadra</span>`}</div></div>
          <button class="btn btn-sm btn-outline" data-act="v-d-doc" data-k="${k}">Actualizar</button></div>`;
      }).join("")}</div>
      <div class="notice info">${I.info}<span>Si un documento se vence, dejás de recibir viajes hasta que lo actualices y lo aprobemos. Te avisamos 30 días antes.</span></div>
      <div style="height:16px"></div></div>`;
  }
  function viewChofer(tab) {
    if (tab === "ganancias") return viewGanancias();
    if (tab === "documentos") return viewDocumentos();
    return viewManejar();
  }

  C.EXT.routes.push((r) => {
    if (r.parts[0] !== "chofer") return null;
    const tab = ["ganancias", "documentos"].includes(r.parts[1]) ? r.parts[1] : "manejar";
    return { view: viewChofer(tab), mode: "chofer", nav: choferNav(tab), navClass: "n3" };
  });
  C.EXT.sideRoles.push({ mode: "chofer", href: "#/chofer", emoji: "🚗", label: "App del chofer", sub: "Conectarse, aceptar y hacer viajes" });
  C.EXT.perfilLinks.push({ href: "#/chofer", emoji: "🚗", label: "App del chofer", sub: "Recibir y hacer viajes de Cuadra Viajes" });

  function setOnline(on) {
    const d = drv(), now = Date.now();
    if (on === d.online) return;
    if (on) { d.onlineSince = now; d.idleSince = now; }
    else { d.onlineMs += now - d.onlineSince; d.req = null; }
    d.online = on;
    C.save(); C.render();
    C.toast(on ? "Estás conectado. Te avisamos cuando entre un viaje." : "Te desconectaste");
  }
  Object.assign(C.ACT, {
    "v-d-online"() { setOnline(true); },
    "v-d-accept"() {
      const d = drv(), v = V(), now = Date.now();
      const rq = d.req && reqView(d.req);
      if (!rq) { d.req = null; C.render(); return; }
      let t;
      if (rq.tripId) {
        t = trip(rq.tripId);
        assign(t, me(), d.pos);
      } else {
        t = {
          id: v.nextId++, mine: false, pasajero: rq.pasajero, origen: rq.origen, destino: rq.destino, tipo: "remis", km: rq.km, min: rq.min,
          tarifa: rq.tarifa, pago: rq.pago, status: "buscando", created: now, history: { buscando: now }, choferId: null,
          route: [[rq.origen.lat, rq.origen.lng], [rq.destino.lat, rq.destino.lng]], chat: [], unread: 0
        };
        v.trips.push(t);
        assign(t, me(), d.pos);
        VX.fetchRoute(t.origen, t.destino).then((r) => { if (!r.failed) { t.route = r.coords; C.save(); } });
      }
      d.tripId = t.id; d.req = null;
      C.save(); C.render();
      C.toast(`Aceptaste el viaje. ${C.first(t.pasajero.nombre)} ya sabe que vas.`);
    },
    "v-d-reject"() {
      const d = drv();
      const t = d.req && d.req.tripId && trip(d.req.tripId);
      if (t && t.status === "buscando") assign(t, pickDriver(t.tipo, d.id));
      d.req = null; d.idleSince = Date.now();
      C.save(); C.render(); C.toast("Rechazaste la solicitud");
    },
    "v-d-next"(el) {
      const t = trip(Number(el.dataset.id));
      const nx = nextStatus(t);
      C.save(); C.render();
      if (nx) C.toast({ llego: "Le avisamos al pasajero que llegaste", enviaje: "¡Buen viaje!", finalizado: "Viaje finalizado" }[nx]);
    },
    "v-d-done"() { const d = drv(); d.tripId = null; d.idleSince = Date.now(); C.save(); C.render(); },
    "v-d-doc"(el) {
      const k = el.dataset.k, ch = me();
      const n = DOCS.find((x) => x[0] === k)[1];
      C.openSheet(`<div class="grip"></div><h2 class="h2">Actualizar ${esc(n.toLowerCase())}</h2>
        <p class="muted small" style="margin-top:6px">Sacale una foto clara, de frente y con buena luz. La revisamos en menos de 24 horas.</p>
        <label class="field" style="margin-top:14px"><span>Nueva fecha de vencimiento</span><input class="input" type="date" id="doc-date" value="${ch.docs[k]}"></label>
        <label class="field" style="margin-top:12px"><span>Foto del documento</span><input class="input" type="file" accept="image/*" capture="environment"></label>
        <button class="btn btn-primary btn-block" style="margin-top:16px" data-act="v-d-doc-send" data-k="${k}">Enviar a revisión</button>
        <p class="tiny muted" style="margin-top:8px">En la maqueta la foto no se sube a ningún lado.</p>`);
    },
    "v-d-doc-send"(el) {
      const ch = me(), k = el.dataset.k, date = document.getElementById("doc-date").value;
      if (date) ch.docs[k] = date;
      ch.verif[k] = false;
      C.save(); C.closeSheet(); C.render(); C.toast("Enviado. Queda en revisión hasta que lo apruebe Cuadra.");
    }
  });
  C.BIND["v-online"] = (el, ev) => { if (ev === "change") setOnline(el.checked); };
})();
