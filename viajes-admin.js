/* Cuadra Viajes — pestañas del panel admin: choferes y remiserías, tarifas y viajes en vivo. */
(function () {
  "use strict";

  const C = window.Cuadra, VX = window.CuadraViajes;
  const { esc, money, I } = C;
  const { V, trip, chofer, remiseria, tipo, fare, avatar, plate, docStatus, DOCS, offset, rand, hav, bearing, ACTIVE } = VX;
  const DOC_CORTO = { licencia: "Licencia", seguro: "Seguro", vtv: "VTV", habilitacion: "Habilit." };
  const ESTADO = { activo: ["pill-open", "Activo"], pendiente: ["pill-warn", "Pendiente"], suspendido: ["pill-red", "Suspendido"] };

  const docOk = (ch, k) => ch.verif[k] && docStatus(ch.docs[k]).days >= 0;
  const allOk = (ch) => DOCS.every(([k]) => docOk(ch, k));

  /* ---------------- choferes y remiserías ---------------- */
  function tabChoferes() {
    const v = V(), ch = v.choferes;
    const n = (e) => ch.filter((c) => c.estado === e).length;
    const obs = ch.filter((c) => !allOk(c)).length;
    return `<div class="kpis">
        <div class="card kpi"><span>Choferes activos</span><b>${n("activo")}</b></div>
        <div class="card kpi"><span>Pendientes de verificación</span><b>${n("pendiente")}</b><small>${obs} con documentos observados</small></div>
        <div class="card kpi"><span>Suspendidos</span><b>${n("suspendido")}</b></div>
        <div class="card kpi"><span>Remiserías adheridas</span><b>${v.remiserias.length}</b></div></div>
      <div class="row between" style="flex-wrap:wrap;gap:10px"><h2 class="h2">Remiserías</h2><button class="btn btn-sm btn-soft" data-act="va-new-rm">${I.plus} Sumar remisería</button></div>
      <div class="cols cols-3">${v.remiserias.map((r) => `<div class="card card-pad">
          <div class="row between"><b>${esc(r.nombre)}</b><span class="pill pill-open">Activa</span></div>
          <div class="small muted" style="margin-top:4px">${esc(r.direccion)} · ${esc(r.habilitacion)}</div>
          <div class="small" style="margin-top:8px">${ch.filter((c) => c.remiseria === r.id).length} choferes · ${esc(r.telefono)}</div></div>`).join("")}</div>
      <div class="row between" style="flex-wrap:wrap;gap:10px"><h2 class="h2">Choferes (${ch.length})</h2><button class="btn btn-sm btn-primary" data-act="va-new-ch">${I.plus} Sumar chofer</button></div>
      <div class="card table-wrap"><table class="table"><thead><tr><th>Chofer</th><th>Remisería</th><th>Vehículo</th><th>Documentos</th><th>Estado</th><th></th></tr></thead><tbody>
      ${ch.map((c) => `<tr>
        <td><div class="row" style="gap:10px">${avatar(c, 38)}<div><b>${esc(c.nombre)}</b><div class="tiny muted">${esc(c.telefono)} · Hab. ${esc(c.habilitacion)}</div></div></div></td>
        <td class="small">${esc(remiseria(c.remiseria).nombre)}</td>
        <td class="small"><div>${tipo(c.tipo).emoji} ${esc(c.auto.modelo)}</div><div class="tiny muted">${esc(c.patente)} · ${esc(c.auto.color)}</div></td>
        <td><div class="row" style="gap:4px;flex-wrap:wrap">${DOCS.map(([k]) => `<span class="pill ${docOk(c, k) ? "pill-open" : c.verif[k] ? "pill-red" : "pill-warn"}" title="${docStatus(c.docs[k]).f}">${docOk(c, k) ? "✓" : c.verif[k] ? "!" : "⏳"} ${DOC_CORTO[k]}</span>`).join("")}</div></td>
        <td><span class="pill ${ESTADO[c.estado][0]}">${ESTADO[c.estado][1]}</span>${c.motivo && c.estado === "suspendido" ? `<div class="tiny muted" style="margin-top:4px">${esc(c.motivo)}</div>` : ""}</td>
        <td><div class="row" style="gap:6px"><button class="btn btn-sm btn-outline" data-act="va-verif" data-ch="${c.id}">Verificar</button>
          ${c.estado === "suspendido" ? `<button class="btn btn-sm btn-soft" data-act="va-reactivar" data-ch="${c.id}">Reactivar</button>` : `<button class="btn btn-sm btn-danger" data-act="va-suspender" data-ch="${c.id}">Suspender</button>`}</div></td>
      </tr>`).join("")}</tbody></table></div>
      <p class="tiny muted">Un chofer solo recibe viajes si está activo y tiene los cuatro documentos aprobados y vigentes.</p>`;
  }
  function verifSheet(id) {
    const c = chofer(id);
    C.openSheet(`<div class="grip"></div><div class="row" style="gap:12px">${avatar(c, 52)}<div><h2 class="h2">${esc(c.nombre)}</h2><div class="small muted">${esc(c.auto.modelo)} · ${esc(c.patente)} · ${esc(remiseria(c.remiseria).nombre)}</div></div></div>
      <div class="list" style="margin-top:14px">${DOCS.map(([k, n]) => {
        const s = docStatus(c.docs[k]);
        return `<div class="li" style="flex-wrap:wrap"><div class="grow"><b>${n}</b><div class="small muted">Vence el ${s.f}</div>
            <div class="row" style="gap:6px;margin-top:6px"><span class="pill ${s.cls}">${s.label}</span><span class="pill ${c.verif[k] ? "pill-open" : "pill-warn"}">${c.verif[k] ? "Aprobado" : "Sin aprobar"}</span></div></div>
          <div class="row" style="gap:6px"><button class="btn btn-sm btn-soft" data-act="va-doc" data-ch="${c.id}" data-k="${k}" data-ok="1" ${c.verif[k] ? "disabled" : ""}>Aprobar</button><button class="btn btn-sm btn-outline" data-act="va-doc" data-ch="${c.id}" data-k="${k}" data-ok="0" ${c.verif[k] ? "" : "disabled"}>Observar</button></div></div>`;
      }).join("")}</div>
      ${c.estado === "pendiente" ? `<button class="btn btn-primary btn-block" style="margin-top:14px" data-act="va-habilitar" data-ch="${c.id}" ${allOk(c) ? "" : "disabled"}>Habilitar chofer</button>${allOk(c) ? "" : `<p class="tiny muted" style="margin-top:6px">Para habilitarlo, todos los documentos tienen que estar aprobados y vigentes.</p>`}` : ""}
      <p class="tiny muted" style="margin-top:10px">En la versión real acá se ven las fotos de cada documento y se consulta la habilitación en el padrón municipal.</p>`);
  }

  /* ---------------- tarifas ---------------- */
  function tarifasPreview(t) {
    const day = new Date(); day.setHours(14, 0, 0, 0);
    const night = new Date(); night.setHours(23, 0, 0, 0);
    const rows = VX.VD.tipos.map((tp) => `<tr><td>${tp.emoji} ${tp.nombre}</td><td class="num">${money(fare(3, tp.id, day, t).total)}</td><td class="num">${money(fare(3, tp.id, night, t).total)}</td></tr>`).join("");
    const base = fare(3, "remis", day, t).total, com = Math.round(base * t.comision / 100);
    return `<div class="table-wrap"><table class="table"><thead><tr><th>Viaje de 3 km</th><th class="num">De día</th><th class="num">De noche</th></tr></thead><tbody>${rows}</tbody></table></div>
      <div class="divider"></div>
      <div class="totals"><div class="row"><span>🚗 Remis de 3 km de día</span><b>${money(base)}</b></div>
        <div class="row"><span>🧑‍✈️ Recibe el chofer</span><b>${money(base - com)}</b></div>
        <div class="row"><span>🟩 Comisión Cuadra (${t.comision}%)</span><b>${money(com)}</b></div>
        <div class="row"><span>⏱️ 5 min de espera</span><b>${money(Math.max(0, 5 - t.esperaGratis) * t.esperaMin)}</b></div></div>`;
  }
  function readTarifas(f) {
    const fd = new FormData(f), n = (k) => Number(String(fd.get(k) || "").replace(/[^\d]/g, "")) || 0;
    return { bajada: n("bajada"), porKm: n("porKm"), nocturno: n("nocturno"), esperaMin: n("esperaMin"), esperaGratis: n("esperaGratis"), comision: Number(fd.get("comision")) };
  }
  function tabTarifas() {
    const t = V().tarifas;
    const field = (name, label, val, hint) => `<label class="field"><span>${label}</span><input class="input" inputmode="numeric" name="${name}" value="${val}" data-bind="va-tar">${hint ? `<span class="tiny muted" style="font-weight:500">${hint}</span>` : ""}</label>`;
    return `<form class="cols cols-2" data-form="va-tarifas">
      <div class="card card-pad stack">
        <h2 class="h3">Tarifas de Cuadra Viajes</h2>
        ${field("bajada", "Bajada de bandera ($)", t.bajada)}
        ${field("porKm", "Precio por km ($)", t.porKm)}
        ${field("nocturno", "Adicional nocturno (%)", t.nocturno, "Se aplica de 22 a 6 h.")}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${field("esperaMin", "Espera ($ por minuto)", t.esperaMin)}${field("esperaGratis", "Minutos sin cargo", t.esperaGratis)}</div>
        <label class="field"><span>Comisión de la plataforma: <output id="vcom-out">${t.comision}%</output></span>
          <input class="range" type="range" min="5" max="25" step="1" name="comision" value="${t.comision}" data-bind="va-tar"></label>
        <p class="tiny muted">El Remis grande cobra ×1,35 y el Flete chico ×1,6 más un adicional fijo de ${money(2500)}.</p>
        <button class="btn btn-primary" type="submit">Guardar tarifas</button>
      </div>
      <div class="card card-pad"><h2 class="h3">Así quedan los precios</h2><div id="vtar-prev" style="margin-top:12px">${tarifasPreview(t)}</div></div>
    </form>`;
  }

  /* ---------------- viajes en vivo ---------------- */
  let fleet = null;
  function getFleet() {
    if (!fleet) {
      fleet = V().choferes.filter((c) => c.estado === "activo").map((c, i) => ({
        id: c.id, p: offset(VX.VD.centro, rand(0.2, 1.4), i * 37 + rand(0, 20)), target: offset(VX.VD.centro, rand(0.2, 1.4), rand(0, 360)), hd: 0,
        busy: i % 3 === 1
      }));
    }
    return fleet;
  }
  function liveStats() {
    const v = V(), now = new Date();
    const h = C.hash(now.toDateString() + "viajes");
    const real = v.trips.filter((t) => C.isToday(t.created) && t.status !== "cancelado" && t.created > v.seedTime);
    const viajes = Math.round((52 + (h % 18)) * Math.min(1, (now.getHours() + 1) / 22)) + real.length;
    const fact = viajes * 5100 + real.reduce((a, t) => a + t.tarifa.total, 0) - real.length * 5100;
    return { viajes, fact, com: Math.round(fact * v.tarifas.comision / 100), espera: (3.6 + (h % 14) / 10).toFixed(1).replace(".", ",") };
  }
  function tabViajes() {
    const v = V(), st = liveStats();
    const act = v.trips.filter((t) => ACTIVE.includes(t.status)).sort((a, b) => b.created - a.created);
    const fl = getFleet();
    const conectados = fl.length + (v.driver.online && !fl.find((f) => f.id === v.driver.id) ? 1 : 0);
    return `<div class="kpis">
        <div class="card kpi"><span>Viajes de hoy</span><b>${st.viajes}</b></div>
        <div class="card kpi"><span>Facturación de hoy</span><b>${money(st.fact)}</b></div>
        <div class="card kpi"><span>Comisión Cuadra (${v.tarifas.comision}%)</span><b>${money(st.com)}</b></div>
        <div class="card kpi"><span>Espera promedio</span><b>${st.espera} min</b><small>del pedido a la llegada del auto</small></div></div>
      <div class="cols cols-2">
        <div class="card card-pad"><div class="col-head"><h2 class="h3">Mapa en vivo</h2><span class="small muted">${conectados} choferes conectados · ${act.length + fl.filter((f) => f.busy).length} en viaje</span></div>
          <div class="vmap-wrap panel-map"><div class="vmap" data-vmap="admin" role="img" aria-label="Mapa con choferes conectados y viajes activos"></div></div>
          <div class="row small" style="gap:16px;margin-top:10px;flex-wrap:wrap"><span class="row" style="gap:6px"><span class="lg lg-free"></span>Libre</span><span class="row" style="gap:6px"><span class="lg lg-busy"></span>En viaje</span><span class="row" style="gap:6px"><span class="lg lg-route"></span>Recorrido de un viaje de la demo</span></div></div>
        <div class="card card-pad"><h2 class="h3" style="margin-bottom:10px">Viajes activos de la demo</h2>
          ${act.length ? `<div class="stack">${act.map((t) => { const ch = chofer(t.choferId); return `<a class="row between small" href="#/viajes/${t.id}" style="gap:10px"><span class="grow"><b>#${t.id}</b> · ${esc(t.pasajero.nombre)}${ch ? ` con ${esc(ch.nombre)}` : ""}<span class="tiny muted" style="display:block">${esc(t.origen.nombre)} → ${esc(t.destino.nombre)} · ${money(t.tarifa.total)}</span></span><span class="pill ${VX.ST[t.status].pill}">${VX.ST[t.status].corto}</span></a>`; }).join("")}</div>`
            : `<p class="muted small">No hay viajes activos. Pedí uno desde la app del vecino o conectate en la app del chofer y aparecen acá.</p>`}
          <div class="divider"></div>
          <h3 class="small bold">Choferes conectados</h3>
          <div class="stack small" style="margin-top:8px">${fl.map((f) => { const c = chofer(f.id); return `<div class="row between"><span>${esc(c.nombre)} · ${esc(c.patente)}</span><span class="pill ${f.busy ? "pill-new" : "pill-open"}">${f.busy ? "En viaje" : "Libre"}</span></div>`; }).join("")}</div>
        </div></div>
      <p class="tiny muted">Flota y métricas simuladas. Los viajes que hagas en la demo aparecen con su recorrido.</p>`;
  }
  VX.initMapExt.admin = function (el, baseMap) {
    const map = baseMap(el);
    map.setView(VX.VD.centro, 14);
    const fl = getFleet();
    const markers = fl.map((f) => {
      const c = chofer(f.id);
      const m = L.marker(f.p, { icon: VX.carIcon(c.auto.hex, f.hd), keyboard: false }).addTo(map);
      m.bindTooltip(`${c.nombre} · ${c.patente} · ${f.busy ? "en viaje" : "libre"}`);
      const el2 = m.getElement();
      if (el2) el2.classList.add(f.busy ? "busy" : "free");
      return { f, m };
    });
    const trips = V().trips.filter((t) => ["encamino", "llego", "enviaje"].includes(t.status)).map((t) => VX.tripMap(map, t, { noFetch: true }));
    map.setView(VX.VD.centro, 14);
    return {
      map,
      update() {
        markers.forEach(({ f, m }) => {
          const d = hav(f.p, f.target);
          if (d < 0.03) { f.target = offset(VX.VD.centro, rand(0.2, 1.4), rand(0, 360)); return; }
          f.hd = bearing(f.p, f.target);
          const k = 0.025 / d;
          f.p = [f.p[0] + (f.target[0] - f.p[0]) * k, f.p[1] + (f.target[1] - f.p[1]) * k];
          VX.setCar(m, f.p, f.hd);
        });
        trips.forEach((t) => t.update());
      }
    };
  };

  C.EXT.adminTabs.push(
    { id: "choferes", label: "Choferes", render: tabChoferes },
    { id: "tarifas", label: "Tarifas de viajes", render: tabTarifas },
    { id: "viajes", label: "Viajes en vivo", render: tabViajes }
  );

  const COLORES = [["Blanco", "#F2F2F2"], ["Gris plata", "#A7AEB4"], ["Negro", "#2B2D30"], ["Azul", "#2F4D7A"], ["Rojo", "#B3261E"], ["Bordó", "#7A2233"]];
  Object.assign(C.ACT, {
    "va-verif"(el) { verifSheet(el.dataset.ch); },
    "va-doc"(el) {
      const c = chofer(el.dataset.ch);
      c.verif[el.dataset.k] = el.dataset.ok === "1";
      C.save(); C.render(); verifSheet(c.id);
    },
    "va-habilitar"(el) {
      const c = chofer(el.dataset.ch);
      c.estado = "activo"; c.motivo = "";
      C.save(); C.closeSheet(); C.render(); C.toast(`${c.nombre} ya puede recibir viajes`);
    },
    "va-suspender"(el) {
      const c = chofer(el.dataset.ch);
      C.confirmSheet({
        title: `¿Suspender a ${esc(c.nombre)}?`, text: "Deja de recibir viajes hasta que lo reactives. Se le avisa por mensaje.", ok: "Suspender", danger: true,
        extra: `<div class="stack" style="margin-top:14px">${["Documentación vencida", "Reclamos de pasajeros", "Pedido de la remisería", "Otro motivo"].map((m, i) => `<label class="choice"><input type="radio" name="motivo" value="${m}" ${i === 0 ? "checked" : ""}><span>${m}</span></label>`).join("")}</div>`,
        onOk: (sh) => {
          const m = sh && sh.querySelector("input[name=motivo]:checked");
          c.estado = "suspendido"; c.motivo = m ? m.value : "";
          if (V().driver.id === c.id) { V().driver.online = false; V().driver.req = null; }
          C.save(); C.render(); C.toast(`Suspendiste a ${c.nombre}`);
        }
      });
    },
    "va-reactivar"(el) {
      const c = chofer(el.dataset.ch);
      c.estado = allOk(c) ? "activo" : "pendiente"; c.motivo = "";
      C.save(); C.render();
      C.toast(c.estado === "activo" ? `${c.nombre} está activo otra vez` : "Queda pendiente: tiene documentos sin aprobar o vencidos");
    },
    "va-new-ch"() {
      const v = V();
      C.openSheet(`<div class="grip"></div><h2 class="h2">Sumar chofer</h2>
        <form class="stack" data-form="va-ch" style="margin-top:14px">
          <label class="field"><span>Nombre y apellido</span><input class="input" name="nombre" required placeholder="Ej: Ricardo Álvarez"></label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Remisería</span><select class="select" name="remiseria">${v.remiserias.map((r) => `<option value="${r.id}">${esc(r.nombre)}</option>`).join("")}</select></label>
            <label class="field"><span>Tipo de viaje</span><select class="select" name="tipo">${VX.VD.tipos.map((t) => `<option value="${t.id}">${t.nombre}</option>`).join("")}</select></label></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Auto</span><input class="input" name="modelo" required placeholder="Ej: Fiat Cronos"></label>
            <label class="field"><span>Color</span><select class="select" name="color">${COLORES.map(([n]) => `<option>${n}</option>`).join("")}</select></label></div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Patente</span><input class="input" name="patente" required placeholder="AB 123 CD" style="text-transform:uppercase"></label>
            <label class="field"><span>N° de habilitación</span><input class="input" name="hab" required placeholder="R-0000"></label></div>
          <label class="field"><span>Celular</span><input class="input" name="tel" inputmode="tel" placeholder="11 ..."></label>
          <p class="tiny muted">Queda pendiente hasta que apruebes sus cuatro documentos.</p>
          <button class="btn btn-primary btn-block" type="submit">Dar de alta</button></form>`);
    },
    "va-new-rm"() {
      C.openSheet(`<div class="grip"></div><h2 class="h2">Sumar remisería</h2>
        <form class="stack" data-form="va-rm" style="margin-top:14px">
          <label class="field"><span>Nombre</span><input class="input" name="nombre" required placeholder="Ej: Remises San Martín"></label>
          <label class="field"><span>Dirección</span><input class="input" name="direccion" required placeholder="Ej: Calle 151 y 18"></label>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
            <label class="field"><span>Teléfono</span><input class="input" name="tel" inputmode="tel"></label>
            <label class="field"><span>N° de agencia</span><input class="input" name="agencia" placeholder="Agencia N° 000"></label></div>
          <button class="btn btn-primary btn-block" type="submit">Sumar remisería</button></form>`);
    }
  });
  Object.assign(C.FORMS, {
    "va-ch"(f) {
      const fd = new FormData(f), v = V();
      const color = COLORES.find(([n]) => n === fd.get("color")) || COLORES[0];
      const y = new Date().getFullYear() + 1, md = new Date().toISOString().slice(4, 10);
      v.choferes.push({
        id: "ch" + Date.now(), nombre: fd.get("nombre").trim(), remiseria: fd.get("remiseria"), tipo: fd.get("tipo"), rating: 5, viajes: 0, desde: new Date().getFullYear(),
        auto: { modelo: fd.get("modelo").trim(), color: color[0], hex: color[1] }, patente: fd.get("patente").trim().toUpperCase(), habilitacion: fd.get("hab").trim(), telefono: fd.get("tel").trim(),
        docs: { licencia: y + md, seguro: y + md, vtv: y + md, habilitacion: y + md }, verif: { licencia: false, seguro: false, vtv: false, habilitacion: false },
        estado: "pendiente", piel: ["#C99A76", "#E2B99A", "#8D5B3E", "#B98561"][v.choferes.length % 4], pelo: "#2A1B14"
      });
      C.save(); C.closeSheet(); C.render(); C.toast("Chofer dado de alta. Falta verificar sus documentos.");
    },
    "va-rm"(f) {
      const fd = new FormData(f);
      V().remiserias.push({ id: "rm" + Date.now(), nombre: fd.get("nombre").trim(), direccion: fd.get("direccion").trim(), telefono: fd.get("tel").trim() || "—", habilitacion: fd.get("agencia").trim() || "Agencia en trámite", estado: "activa" });
      C.save(); C.closeSheet(); C.render(); C.toast("Remisería sumada");
    },
    "va-tarifas"(f) {
      const t = readTarifas(f);
      if (!t.bajada || !t.porKm) { C.toast("La bajada y el precio por km no pueden ser cero"); return; }
      V().tarifas = t;
      C.save(); C.render(); C.toast("Tarifas guardadas. Se aplican a los próximos viajes.");
    }
  });
  C.BIND["va-tar"] = (el) => {
    const f = el.form, t = readTarifas(f);
    f.querySelector("#vcom-out").textContent = t.comision + "%";
    f.querySelector("#vtar-prev").innerHTML = tarifasPreview(t);
  };
  void trip;
})();
