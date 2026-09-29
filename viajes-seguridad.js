/* Cuadra Viajes — seguridad del viaje: compartir, SOS, chat con el chofer y cierre con calificación. */
(function () {
  "use strict";

  const C = window.Cuadra, VX = window.CuadraViajes;
  const { esc, money, hhmm, I } = C;
  const { V, trip, chofer, tipo } = VX;
  const QUICK = ["Ya bajo", "Estoy en la puerta", "Esperame 2 minutos", "¿Dónde estás?"];
  const draft = { id: null, estrellas: 0, propina: 0 };

  const shareLink = (id) => location.href.split("#")[0] + "#/viajes/seguir/" + id;

  /* ---------------- cierre del viaje ---------------- */
  VX.finalPanel = function (t) {
    const ch = chofer(t.choferId), f = t.tarifa;
    if (draft.id !== t.id) { draft.id = t.id; draft.estrellas = t.estrellas || 0; draft.propina = t.propina || 0; }
    const rate = !t.rated && t.mine ? `
      <div class="card card-pad center" style="margin-top:12px">
        <h2 class="h3">¿Cómo viajaste con ${esc(C.first(ch.nombre))}?</h2>
        <div class="stars" role="radiogroup" aria-label="Calificación">${[1, 2, 3, 4, 5].map((n) => `<button class="${n <= draft.estrellas ? "on" : ""}" data-act="v-star" data-n="${n}" role="radio" aria-checked="${n === draft.estrellas}" aria-label="${n} estrella${n > 1 ? "s" : ""}">★</button>`).join("")}</div>
        <h3 class="small bold" style="margin-top:14px">¿Le dejás propina?</h3>
        <div class="row" style="justify-content:center;gap:8px;flex-wrap:wrap;margin-top:8px">${[0, 500, 1000, 2000].map((p) => `<button class="chip ${draft.propina === p ? "on" : ""}" data-act="v-tip" data-p="${p}">${p ? money(p) : "Sin propina"}</button>`).join("")}</div>
        <label class="field" style="margin-top:14px;text-align:left"><span class="sr">Comentario</span><input class="input" id="v-coment" maxlength="140" placeholder="Contanos algo (opcional)"></label>
        <button class="btn btn-primary btn-block" style="margin-top:12px" data-act="v-rate" data-id="${t.id}" ${draft.estrellas ? "" : "disabled"}>Enviar calificación</button>
      </div>` : "";
    return `<div class="row" style="gap:10px"><span style="font-size:34px" aria-hidden="true">✅</span><div><h1 class="h2">Llegaste a ${esc(t.destino.nombre)}</h1>
        <p class="muted small">${C.fmtDate(t.history.finalizado || t.created)} · ${t.km.toFixed(1).replace(".", ",")} km · ${t.min} min</p></div></div>
      ${rate}
      <div class="card card-pad" style="margin-top:12px">${VX.driverCard(t, true)}</div>
      <div class="card card-pad totals" style="margin-top:12px">
        <div class="trip-od" style="margin-bottom:6px">
          <div class="row small"><span class="rb-dot o" aria-hidden="true"></span><span class="ellipsis">${esc(t.origen.nombre)} · ${hhmm(new Date(t.history.enviaje || t.created))}</span></div>
          <div class="row small"><span class="rb-dot d" aria-hidden="true"></span><span class="ellipsis">${esc(t.destino.nombre)} · ${hhmm(new Date(t.history.finalizado || t.created))}</span></div></div>
        <div class="row"><span class="muted">Bajada de bandera</span><span>${money(f.bajada)}</span></div>
        <div class="row"><span class="muted">Distancia (${t.km.toFixed(1).replace(".", ",")} km)</span><span>${money(f.km)}</span></div>
        ${f.extra ? `<div class="row"><span class="muted">Adicional ${tipo(t.tipo).nombre.toLowerCase()}</span><span>${money(f.extra)}</span></div>` : ""}
        ${f.nocturno ? `<div class="row"><span class="muted">Adicional nocturno</span><span>${money(f.nocturno)}</span></div>` : ""}
        <div class="row"><span class="muted">Espera</span><span>${f.espera ? money(f.espera) : "Sin cargo"}</span></div>
        ${t.propina ? `<div class="row"><span class="muted">Propina</span><span>${money(t.propina)}</span></div>` : ""}
        <div class="row total"><span>Total</span><span>${money(f.total + (t.propina || 0))}</span></div>
        <div class="tiny muted">${t.pago === "mp" ? "Pagado con Mercado Pago (simulado)" : "Pagado en efectivo"}</div>
      </div>
      ${t.rated ? `<p class="center small" style="margin-top:12px">Calificaste con <span style="color:var(--naranja-700)">${"★".repeat(t.estrellas)}</span>${t.propina ? ` y dejaste ${money(t.propina)} de propina` : ""}. ¡Gracias!</p>` : ""}
      <div class="btn-row" style="margin-top:12px"><button class="btn btn-soft" data-act="v-repeat" data-id="${t.id}">${I.refresh} Repetir</button><a class="btn btn-outline" href="#/viajes">Nuevo viaje</a></div>`;
  };

  /* ---------------- chat ---------------- */
  VX.viewChat = function (id) {
    const t = trip(id);
    if (!t || !t.choferId) return C.topbar("Chat", "#/viajes") + C.empty("💬", "No hay chat para este viaje", "El chat se abre cuando tenés chofer asignado.");
    const ch = chofer(t.choferId);
    t.unread = 0;
    C.save();
    const open = ["encamino", "llego", "enviaje"].includes(t.status);
    return `<div class="topbar"><a class="icon-btn flat" href="#/viajes/${t.id}" data-act="back" aria-label="Volver">${I.back}</a>${VX.avatar(ch, 40)}
        <div class="grow"><div class="bold">${esc(ch.nombre)}</div><div class="tiny muted">${esc(ch.auto.modelo.split(" (")[0])} · ${esc(ch.patente)}</div></div></div>
      <div class="chat" id="chat" aria-live="polite">
        <p class="tiny muted center" style="margin-bottom:6px">Chat simulado. En la app real los números de teléfono quedan ocultos.</p>
        ${t.chat.map((m) => `<div class="bubble ${m.from === "yo" ? "me" : ""}">${esc(m.text)}<small>${hhmm(new Date(m.t))}</small></div>`).join("")}
      </div>
      ${open ? `<div class="chat-foot">
        <div class="chips" style="padding:0 0 8px">${QUICK.map((q) => `<button class="chip" data-act="v-say" data-t="${esc(q)}">${esc(q)}</button>`).join("")}</div>
        <form class="row" data-form="v-chat" data-id="${t.id}" style="gap:8px"><input class="input" name="m" autocomplete="off" maxlength="200" placeholder="Escribile a ${esc(C.first(ch.nombre))}" aria-label="Mensaje"><button class="btn btn-primary" type="submit" aria-label="Enviar">Enviar</button></form>
      </div>` : `<p class="small muted center" style="padding:16px">El viaje terminó. El chat queda cerrado.</p>`}`;
  };
  function say(id, text) {
    const t = trip(id);
    if (!t || !text) return;
    t.chat.push({ from: "yo", text, t: Date.now() });
    C.save(); C.render();
    const box = document.getElementById("chat"); if (box) box.scrollIntoView({ block: "end" });
    setTimeout(() => {
      const tt = trip(id);
      if (!tt) return;
      const R = VX.VD.respuestasChofer;
      tt.chat.push({ from: "chofer", text: R[text] || R._default, t: Date.now() });
      const onChat = location.hash === `#/viajes/${id}/chat`;
      if (!onChat) tt.unread = (tt.unread || 0) + 1;
      C.save();
      if (onChat) VX.rerender(); else C.toast(`💬 ${C.first(chofer(tt.choferId).nombre)}: ${R[text] || R._default}`);
    }, 1600);
  }

  /* ---------------- link de seguimiento compartido ---------------- */
  VX.viewSeguir = function (id) {
    const t = trip(id);
    if (!t) return `<div class="seguir-head"><div class="mark">${C.LOGO}</div><b>Cuadra · Seguimiento</b></div>` + C.empty("🔗", "Este link no está disponible", "En la maqueta, el link de seguimiento funciona en el mismo navegador donde se pidió el viaje.", `<a class="btn btn-primary" href="#/">Ir a Cuadra</a>`);
    const ch = chofer(t.choferId), done = !["buscando", "encamino", "llego", "enviaje"].includes(t.status);
    const who = C.first(C.S.user.nombre);
    return `<div class="seguir-head"><div class="mark">${C.LOGO}</div><div class="grow"><b>Cuadra · Seguimiento de viaje</b><div class="tiny muted">Te compartió este link ${esc(who)}</div></div></div>
      ${VX.mapBlock("seguir", t.id, "", "")}
      <div class="vpanel">
        <span class="pill ${VX.ST[t.status].pill}">${VX.ST[t.status].corto}</span>
        <h1 class="h2" style="margin-top:8px">${done ? `El viaje de ${esc(who)} terminó` : `${esc(who)} está viajando${ch ? ` con ${esc(ch.nombre)}` : ""}`}</h1>
        <p class="muted small" style="margin-top:4px">${esc(t.origen.nombre)} → ${esc(t.destino.nombre)}${t.status === "enviaje" ? ` · llega a las ${hhmm(new Date(t.history.enviaje + t.min * 60000))}` : ""}${done && t.history.finalizado ? ` · ${hhmm(new Date(t.history.finalizado))}` : ""}</p>
        ${ch ? `<div class="card card-pad" style="margin-top:12px">${VX.driverCard(t)}</div>` : ""}
        <div class="notice info" style="margin-top:12px">${I.lock}<span>Ves la ubicación del auto solo mientras dura el viaje. Cuando termina, el link deja de mostrarla.</span></div>
        <p class="tiny muted center" style="margin-top:12px">Emergencias: 911 · Maqueta de Cuadra, datos de ejemplo.</p>
      </div>`;
  };

  /* ---------------- acciones ---------------- */
  Object.assign(C.ACT, {
    "v-star"(el) { draft.estrellas = Number(el.dataset.n); C.render(); },
    "v-tip"(el) { draft.propina = Number(el.dataset.p); C.render(); },
    "v-rate"(el) {
      const t = trip(Number(el.dataset.id));
      if (!draft.estrellas) return;
      const c = document.getElementById("v-coment");
      t.estrellas = draft.estrellas; t.propina = draft.propina; t.comentario = c ? c.value.trim() : ""; t.rated = true;
      C.save(); C.render();
      C.toast(t.propina ? `¡Gracias! ${C.first(chofer(t.choferId).nombre)} recibe tu propina completa.` : "¡Gracias por calificar!");
    },
    "v-say"(el) { const m = el.closest("[data-form]") || document.querySelector("form[data-form=v-chat]"); say(Number(m.dataset.id), el.dataset.t); },
    "v-share"(el) {
      const t = trip(Number(el.dataset.id));
      const link = shareLink(t.id), ch = chofer(t.choferId);
      const msg = `Estoy viajando en un remis de Cuadra con ${ch.nombre} (${ch.auto.modelo.split(" (")[0]}, patente ${ch.patente}). Seguí el viaje acá: ${link}`;
      t.shared = true; C.save();
      C.openSheet(`<div class="grip"></div><h2 class="h2">Compartir viaje</h2>
        <p class="muted small" style="margin-top:6px;line-height:1.45">Quien tenga el link ve en el mapa por dónde vas, los datos del chofer y a qué hora llegás. Deja de funcionar al terminar el viaje.</p>
        <label class="field" style="margin-top:14px"><span>Link de seguimiento</span><input class="input" id="share-link" readonly value="${esc(link)}"></label>
        <div class="stack" style="margin-top:12px">
          <button class="btn btn-primary btn-block" data-act="v-copy">Copiar link</button>
          <a class="btn btn-outline btn-block" href="https://wa.me/?text=${encodeURIComponent(msg)}" target="_blank" rel="noopener">Enviar por WhatsApp</a>
          <a class="btn btn-soft btn-block" href="#/viajes/seguir/${t.id}">Ver lo que ven ellos</a>
        </div>
        <p class="tiny muted" style="margin-top:10px">En la maqueta, el link funciona en este mismo navegador.</p>`);
    },
    "v-copy"() {
      const i = document.getElementById("share-link");
      try { navigator.clipboard.writeText(i.value); } catch (e) { i.select(); }
      C.toast("Link copiado");
    },
    "v-sos"(el) {
      const id = Number(el.dataset.id);
      C.confirmSheet({
        title: "🆘 ¿Activar SOS?",
        text: "Se comparte tu ubicación en vivo con tus contactos de confianza, la remisería y la central de monitoreo de Cuadra, y te ofrecemos llamar al 911. <b>En la maqueta no se avisa a nadie.</b>",
        ok: "Sí, activar SOS", danger: true,
        onOk: () => {
          let n = 3;
          const ov = C.openSheet(`<div class="center" style="padding:20px 8px"><div class="sos-count" id="sos-n">${n}</div><h2 class="h2" style="margin-top:12px">Activando SOS…</h2><p class="muted small" style="margin-top:6px">Si fue sin querer, cancelá ahora.</p><button class="btn btn-outline btn-block" style="margin-top:16px" data-act="v-sos-abort">Cancelar</button></div>`);
          ov.dataset.locked = "1";
          const timer = setInterval(() => {
            n--;
            const el2 = document.getElementById("sos-n");
            if (!el2) { clearInterval(timer); return; }
            if (n > 0) { el2.textContent = n; return; }
            clearInterval(timer);
            const t = trip(id);
            t.sos = true; C.save(); C.closeSheet(); C.render();
            C.toast("SOS activado (simulado)");
          }, 1000);
        }
      });
    },
    "v-sos-abort"() { C.closeSheet(); C.toast("SOS cancelado"); },
    "v-sos-off"(el) { const t = trip(Number(el.dataset.id)); t.sos = false; C.save(); C.render(); C.toast("SOS desactivado"); }
  });
  C.EXT.after.push(() => { if (document.getElementById("chat")) { const sc = document.getElementById("screen"); sc.scrollTop = sc.scrollHeight; } });
  C.FORMS["v-chat"] = (f) => {
    const txt = f.m.value.trim();
    if (!txt) return;
    f.m.value = "";
    say(Number(f.dataset.id), txt);
  };
})();
