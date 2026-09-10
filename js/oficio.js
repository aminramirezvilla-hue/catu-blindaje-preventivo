/* Oficio de concentrado */
(function () {
  const KEY = "catu-blindaje-v1";
  const _set = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (k === KEY && typeof v === "string") {
      try {
        const n = JSON.parse(v);
        const cur = JSON.parse(this.getItem(k) || "{}");
        if (cur.programa && !n.programa) n.programa = cur.programa;
        v = JSON.stringify(n);
      } catch (e) {}
    }
    return _set.call(this, k, v);
  };
  const MODULES = window.CATU_MODULES || [];
  const EMPTY = {
    ejercicio: "2026", municipio: "", dependencia: "",
    totalObras: 0, montoProgramado: "", reporta: "", cargo: "", updatedAt: ""
  };
  const $ = (id) => document.getElementById(id);
  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&#38;").replace(/</g, "&#60;").replace(/>/g, "&#62;")
      .replace(/"/g, "&#34;").replace(/'/g, "&#39;");
  }
  function read() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      return { obras: raw.obras || [], programa: Object.assign({}, EMPTY, raw.programa || {}) };
    } catch {
      return { obras: [], programa: Object.assign({}, EMPTY) };
    }
  }
  function writePrograma(pa) {
    const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
    raw.programa = pa;
    if (!raw.obras) raw.obras = [];
    localStorage.setItem(KEY, JSON.stringify(raw));
  }
  function progress(obra) {
    let total = 0, answered = 0, risk = 0, ok = 0, app = 0;
    MODULES.forEach((m) => m.items.forEach((item) => {
      total += 1;
      const st = (obra.items[item.id] || {}).status || "pendiente";
      if (st !== "pendiente") answered += 1;
      if (st === "no_cumple") risk += 1;
      if (st === "cumple" || st === "no_cumple") { app += 1; if (st === "cumple") ok += 1; }
    }));
    return {
      answered: answered, risk: risk,
      reviewPct: total ? Math.round((answered / total) * 100) : 0,
      shieldPct: app ? Math.round((ok / app) * 100) : 0
    };
  }
  function semaforo(p) {
    if (p.risk > 0 || (p.shieldPct > 0 && p.shieldPct < 70)) return "rojo";
    if (p.reviewPct === 100 && p.shieldPct >= 90 && p.risk === 0) return "verde";
    return "amarillo";
  }
  function fmt(iso) {
    try {
      return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
    } catch { return iso; }
  }
  function show(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    const el = $("screen-" + name);
    if (el) el.classList.add("active");
    window.scrollTo(0, 0);
  }
  function inject() {
    const nueva = $("btn-nueva");
    if (!nueva || $("btn-presidencia")) return;
    const b = document.createElement("button");
    b.id = "btn-presidencia";
    b.className = "btn btn-gold btn-block";
    b.style.marginTop = ".5rem";
    b.type = "button";
    b.textContent = "Reporte a Presidencia";
    b.addEventListener("click", renderOficio);
    nueva.insertAdjacentElement("afterend", b);
  }
  function renderOficio() {
    const st = read();
    const pa = st.programa;
    const labels = { rojo: "En riesgo", amarillo: "En proceso", verde: "Blindada" };
    const filas = st.obras.map((obra) => {
      const p = progress(obra);
      const sem = semaforo(p);
      const est = p.reviewPct === 0 ? "sin_iniciar" : p.reviewPct >= 100 ? "completa" : "en_proceso";
      return { obra: obra, p: p, sem: sem, est: est };
    });
    const rank = { rojo: 0, amarillo: 1, verde: 2 };
    filas.sort((a, b) => rank[a.sem] - rank[b.sem] || b.p.risk - a.p.risk);
    let completa = 0, enProceso = 0, sinIniciar = 0, enRiesgo = 0, shieldSum = 0, shieldN = 0;
    filas.forEach((f) => {
      if (f.est === "completa") completa += 1;
      else if (f.est === "en_proceso") enProceso += 1;
      else sinIniciar += 1;
      if (f.sem === "rojo") enRiesgo += 1;
      if (f.p.answered > 0) { shieldSum += f.p.shieldPct; shieldN += 1; }
    });
    const registrados = st.obras.length;
    const totalPa = Number(pa.totalObras) || 0;
    const coberturaPct = totalPa > 0 ? Math.round((registrados / totalPa) * 100) : 0;
    const sinIncorporar = Math.max(0, totalPa - registrados);
    const blindajePromedio = shieldN ? Math.round(shieldSum / shieldN) : 0;
    const top = filas.filter((f) => f.sem !== "verde").slice(0, 8);
    const rows = top.map((f) => "<tr><td><strong>" + esc(f.obra.nombre) + "</strong></td><td>" +
      esc(f.obra.contrato || "\u2014") + "</td><td>" + f.p.shieldPct + "%</td><td>" + f.p.risk +
      "</td><td>" + labels[f.sem] + "</td></tr>").join("");
    const conclusion = totalPa > 0
      ? "<strong>Conclusi\u00f3n.</strong> Quedan <strong>" + sinIncorporar + "</strong> obras del Programa Anual " +
        esc(pa.ejercicio) + " sin incorporar al proceso de blindaje preventivo. Cobertura actual: <strong>" +
        coberturaPct + "%</strong> (" + registrados + " de " + totalPa + ")."
      : "<strong>Conclusi\u00f3n.</strong> Capture el n\u00famero total de obras del Programa Anual para calcular cobertura. Hoy hay " +
        registrados + " obras en este dispositivo, " + enRiesgo + " con sem\u00e1foro en riesgo.";
    const host = $("screen-concentrado");
    if (!host) return;
    host.innerHTML =
      "<div class='no-print btn-row' style='margin-top:0'>" +
        "<button class='btn btn-ghost' id='conc-back' type='button'>\u2190 Inicio</button>" +
        "<button class='btn btn-primary' id='conc-print' type='button'>Imprimir oficio / PDF</button>" +
      "</div>" +
      "<form id='form-pa' class='card no-print'>" +
        "<h3>Ficha del Programa Anual</h3>" +
        "<div class='grid-2'><div><label>Ejercicio</label><input id='pa-ej' value='" + esc(pa.ejercicio) + "'></div>" +
        "<div><label>Municipio</label><input id='pa-mun' value='" + esc(pa.municipio) + "' placeholder='Chilpancingo, Gro.'></div></div>" +
        "<div class='grid-2'><div><label>Dependencia ejecutora</label><input id='pa-dep' value='" + esc(pa.dependencia) + "'></div>" +
        "<div><label>Obras del Programa Anual</label><input id='pa-total' type='number' min='0' value='" + (pa.totalObras || "") + "' placeholder='42'></div></div>" +
        "<div class='grid-2'><div><label>Monto programado (opcional)</label><input id='pa-monto' value='" + esc(pa.montoProgramado) + "'></div>" +
        "<div><label>Reporta</label><input id='pa-rep' value='" + esc(pa.reporta) + "'></div></div>" +
        "<label>Cargo</label><input id='pa-cargo' value='" + esc(pa.cargo) + "' placeholder='Director de Obras / Contralor interno'>" +
        "<div class='btn-row'><button class='btn btn-primary' type='submit'>Guardar ficha</button></div>" +
      "</form>" +
      "<article class='card oficio'>" +
        "<img src='icons/logo-catu-dorado.png' alt='CATU' style='height:48px'>" +
        "<p style='font-size:.65rem;color:var(--gold);font-weight:700;margin-top:.5rem'>CENTRO DE AUDITOR\u00cdA T\u00c9CNICA Y URBANA \u00b7 Oficio de concentrado \u00b7 Corte " + fmt(new Date().toISOString()) + "</p>" +
        "<h2 style='color:var(--navy);margin-top:.4rem'>Estado general de blindaje preventivo</h2>" +
        "<p style='color:var(--gold);font-weight:700'>Obra p\u00fablica \u00b7 Programa Anual " + esc(pa.ejercicio) + "</p>" +
        "<p style='font-size:.85rem;color:var(--muted)'>" + esc(pa.municipio || "\u2014") + " \u00b7 " + esc(pa.dependencia || "\u00c1rea ejecutora") +
          (pa.montoProgramado ? " \u00b7 Monto " + esc(pa.montoProgramado) : "") +
          "<br>Destinatario: Presidencia Municipal. Elabora: " + esc(pa.reporta || "\u2014") + (pa.cargo ? ", " + esc(pa.cargo) : "") + ".</p>" +
        "<div class='kpi-row five'>" +
          "<div class='kpi'><div class='k'>Programa Anual</div><div class='v'>" + (totalPa || "\u2014") + "</div></div>" +
          "<div class='kpi'><div class='k'>En PWA</div><div class='v'>" + registrados + (totalPa ? " \u00b7 " + coberturaPct + "%" : "") + "</div></div>" +
          "<div class='kpi'><div class='k'>Revisi\u00f3n completa</div><div class='v'>" + completa + "</div></div>" +
          "<div class='kpi'><div class='k'>Blindaje promedio</div><div class='v'>" + blindajePromedio + "%</div></div>" +
          "<div class='kpi'><div class='k'>En riesgo</div><div class='v'>" + enRiesgo + "</div></div>" +
        "</div>" +
        "<p style='font-size:.85rem;margin-top:.6rem'>De las " + registrados + " obras en este dispositivo: " + completa +
          " con revisi\u00f3n completa, " + enProceso + " en proceso y " + sinIniciar + " sin iniciar checklists.</p>" +
        "<h2 class='sec'>Obras que requieren atenci\u00f3n (m\u00e1x. 8)</h2>" +
        (rows
          ? "<table><thead><tr><th>Obra</th><th>Contrato</th><th>Blindaje</th><th>Riesgo</th><th>Estado</th></tr></thead><tbody>" + rows + "</tbody></table>"
          : "<p class='ok-msg'>" + (registrados === 0 ? "A\u00fan no hay obras registradas en la PWA." : "Ninguna obra registrada presenta sem\u00e1foro en riesgo o en proceso.") + "</p>") +
        "<div class='legal-box' style='margin-top:1rem'>" + conclusion + "</div>" +
        "<p style='font-size:.7rem;color:var(--muted);margin-top:1rem'>Documento de control preventivo generado por CATU Blindaje Preventivo v2.2. Cifras de este dispositivo. El denominador del Programa Anual es el declarado por el \u00e1rea ejecutora. No sustituye el expediente oficial ni un dictamen de auditor\u00eda. Vigencia: 30 de septiembre de 2027.</p>" +
      "</article>";
    $("conc-back").onclick = function () { show("landing"); };
    $("conc-print").onclick = function () { window.print(); };
    $("form-pa").onsubmit = function (e) {
      e.preventDefault();
      writePrograma({
        ejercicio: $("pa-ej").value.trim() || "2026",
        municipio: $("pa-mun").value.trim(),
        dependencia: $("pa-dep").value.trim(),
        totalObras: Number($("pa-total").value) || 0,
        montoProgramado: $("pa-monto").value.trim(),
        reporta: $("pa-rep").value.trim(),
        cargo: $("pa-cargo").value.trim(),
        updatedAt: new Date().toISOString()
      });
      renderOficio();
    };
    show("concentrado");
  }
  new MutationObserver(inject).observe(document.body, { childList: true, subtree: true });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", inject);
  else inject();
})();
