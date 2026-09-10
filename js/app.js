(function () {
  const KEY = "catu-blindaje-v1";
  const MODULES = window.CATU_MODULES;
  const LABELS = window.CATU_STATUS_LABEL;
  const $ = (id) => document.getElementById(id);

  const state = {
    obras: [],
    view: "landing",
    obraId: null,
    moduleId: null,
  };

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "{}");
      state.obras = raw.obras || [];
    } catch {
      state.obras = [];
    }
  }
  function save() {
    localStorage.setItem(KEY, JSON.stringify({ obras: state.obras }));
  }
  function uid() {
    return crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
  }
  function emptyItems() {
    const items = {};
    MODULES.forEach((m) => m.items.forEach((i) => { items[i.id] = { status: "pendiente", note: "" }; }));
    return items;
  }
  function obraById(id) {
    return state.obras.find((o) => o.id === id);
  }
  function progress(obra, moduleId) {
    const mods = moduleId ? MODULES.filter((m) => m.id === moduleId) : MODULES;
    let total = 0, answered = 0, risk = 0, ok = 0, app = 0;
    mods.forEach((m) => {
      m.items.forEach((item) => {
        total += 1;
        const st = (obra.items[item.id] || {}).status || "pendiente";
        if (st !== "pendiente") answered += 1;
        if (st === "no_cumple") risk += 1;
        if (st === "cumple" || st === "no_cumple") {
          app += 1;
          if (st === "cumple") ok += 1;
        }
      });
    });
    return {
      total, answered, risk,
      pending: total - answered,
      reviewPct: total ? Math.round((answered / total) * 100) : 0,
      shieldPct: app ? Math.round((ok / app) * 100) : 0,
    };
  }
  function fmt(iso) {
    try {
      return new Intl.DateTimeFormat("es-MX", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(iso));
    } catch { return iso; }
  }

  function show(name) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
    $("screen-" + name).classList.add("active");
    state.view = name;
    window.scrollTo(0, 0);
  }

  function renderLanding() {
    const list = state.obras.length
      ? state.obras.map((o) => {
          const p = progress(o);
          return `<a class="obra-row" href="#" data-obra="${o.id}">
            <h4>${esc(o.nombre)}</h4>
            <p>${esc([o.dependencia, o.contrato].filter(Boolean).join(" · ") || "Sin clave")} · ${fmt(o.updatedAt)}</p>
            <div class="bar"><i style="width:${p.reviewPct}%"></i></div>
          </a>`;
        }).join("")
      : `<div class="empty">Aún no hay obras. Cree la primera para abrir los anexos A a E.</div>`;

    $("screen-landing").innerHTML = `
      <div class="hero">
        <img src="icons/logo-catu-dorado.png" alt="CATU" />
        <h2>Checklists de blindaje<br><span>que resisten la fiscalización</span></h2>
        <p class="lead">Herramienta de campo para ejecutores del gasto en Guerrero. Expediente, evidencia, contratación, control interno y bitácora (Ley 266). El avance se guarda en este dispositivo.</p>
        <div class="stats">
          <div class="stat"><div class="num">5</div><div class="label">Anexos</div></div>
          <div class="stat"><div class="num">Ley 266</div><div class="label">Guerrero</div></div>
          <div class="stat"><div class="num">Offline</div><div class="label">Sin red</div></div>
        </div>
        <button class="btn btn-primary btn-block" id="btn-nueva">Nueva obra</button>
      </div>
      <div class="features">
        <div class="feature"><div class="icon">A–E</div><div><h3>Cinco anexos de blindaje</h3><p>Expediente, materialidad, adjudicaciones, MICI y bitácora preventiva.</p></div></div>
        <div class="feature"><div class="icon">266</div><div><h3>Marco estatal de obra</h3><p>Artículos de la Ley de Obras Públicas y sus Servicios del Estado de Guerrero.</p></div></div>
        <div class="feature"><div class="icon">PDF</div><div><h3>Reporte de expediente</h3><p>Imprima o guarde el avance, los riesgos y el inventario de puntos.</p></div></div>
      </div>
      <h3 style="margin:1.2rem 0 .5rem;color:var(--navy)">Obras en este dispositivo</h3>
      <div id="obra-list">${list}</div>
      <form id="form-obra" class="card" hidden>
        <h3>Nueva obra o contrato</h3>
        <label>Nombre de la obra</label><input id="f-nombre" required placeholder="Pavimentación calle…" />
        <div class="grid-2">
          <div><label>Dependencia ejecutora</label><input id="f-dep" placeholder="Ayuntamiento / OPDS" /></div>
          <div><label>Contrato o clave</label><input id="f-cto" placeholder="OP-2026-…" /></div>
        </div>
        <div class="grid-2">
          <div><label>Ubicación</label><input id="f-ubi" placeholder="Municipio, Guerrero" /></div>
          <div><label>Revisado por</label><input id="f-rev" /></div>
        </div>
        <div class="btn-row">
          <button class="btn btn-primary" type="submit">Abrir checklists</button>
          <button class="btn btn-ghost" type="button" id="btn-cancel">Cancelar</button>
        </div>
      </form>
      <div class="legal-box"><strong>Aviso jurídico.</strong> Esta herramienta estructura control preventivo para el área ejecutora. No sustituye el expediente oficial, la bitácora (Ley 266 Art. 57) ni un dictamen de auditoría. Tras la primera apertura funciona sin red.</div>
    `;
    $("btn-nueva").onclick = () => { $("form-obra").hidden = false; $("f-nombre").focus(); };
    $("btn-cancel").onclick = () => { $("form-obra").hidden = true; };
    $("form-obra").onsubmit = (e) => {
      e.preventDefault();
      const now = new Date().toISOString();
      const obra = {
        id: uid(),
        nombre: $("f-nombre").value.trim(),
        dependencia: $("f-dep").value.trim(),
        contrato: $("f-cto").value.trim(),
        ubicacion: $("f-ubi").value.trim(),
        revisadoPor: $("f-rev").value.trim(),
        createdAt: now, updatedAt: now, items: emptyItems(),
      };
      state.obras.unshift(obra);
      save();
      openObra(obra.id);
    };
    $("obra-list").onclick = (e) => {
      const a = e.target.closest("[data-obra]");
      if (!a) return;
      e.preventDefault();
      openObra(a.dataset.obra);
    };
    show("landing");
  }

  function openObra(id) {
    state.obraId = id;
    const obra = obraById(id);
    if (!obra) return renderLanding();
    const overall = progress(obra);
    $("screen-obra").innerHTML = `
      <p class="no-print" style="font-size:.75rem;color:var(--muted);margin-bottom:.4rem"><a href="#" id="back-home">← Obras</a></p>
      <h2 style="color:var(--navy)">${esc(obra.nombre)}</h2>
      <p style="color:var(--muted);font-size:.85rem">${esc([obra.dependencia, obra.contrato, obra.ubicacion].filter(Boolean).join(" · ") || "Sin datos")}</p>
      <div class="kpi-row">
        <div class="kpi"><div class="k">Avance de revisión</div><div class="v">${overall.reviewPct}%</div><div class="bar"><i style="width:${overall.reviewPct}%"></i></div></div>
        <div class="kpi"><div class="k">Nivel de blindaje</div><div class="v">${overall.shieldPct}%</div><div class="bar"><i style="width:${overall.shieldPct}%;background:var(--gold)"></i></div></div>
      </div>
      <p style="font-size:.75rem;color:var(--muted);margin-bottom:.7rem">${overall.risk} puntos en riesgo · ${overall.pending} pendientes</p>
      ${MODULES.map((m) => {
        const p = progress(obra, m.id);
        return `<a class="mod-row" href="#" data-mod="${m.id}">
          <p style="font-size:.65rem;color:var(--gold);font-weight:700">${m.annex}</p>
          <h4>${m.title}</h4>
          <p>${m.audience} · ${p.answered}/${p.total}</p>
          <div class="bar"><i style="width:${p.reviewPct}%"></i></div>
        </a>`;
      }).join("")}
      <div class="btn-row no-print">
        <button class="btn btn-primary" id="btn-rep">Ver reporte</button>
        <button class="btn btn-danger" id="btn-del">Eliminar</button>
      </div>
    `;
    $("back-home").onclick = (e) => { e.preventDefault(); renderLanding(); };
    $("screen-obra").querySelectorAll("[data-mod]").forEach((el) => {
      el.onclick = (e) => { e.preventDefault(); openModulo(el.dataset.mod); };
    });
    $("btn-rep").onclick = renderReporte;
    $("btn-del").onclick = () => {
      if (!confirm("¿Eliminar esta obra de este dispositivo?")) return;
      state.obras = state.obras.filter((o) => o.id !== id);
      save();
      renderLanding();
    };
    show("obra");
  }

  function openModulo(moduleId) {
    state.moduleId = moduleId;
    const obra = obraById(state.obraId);
    const mod = MODULES.find((m) => m.id === moduleId);
    if (!obra || !mod) return;
    const p = progress(obra, moduleId);
    const sections = [...new Set(mod.items.map((i) => i.section))];
    $("screen-modulo").innerHTML = `
      <div class="btn-row no-print" style="margin-top:0">
        <button class="btn btn-ghost" id="back-obra">← Anexos de la obra</button>
        <button class="btn btn-ghost" id="back-home2">Inicio</button>
      </div>
      <p style="font-size:.65rem;color:var(--gold);font-weight:700;margin-top:.6rem">${mod.annex}</p>
      <h2 style="color:var(--navy)">${mod.title}</h2>
      <p style="color:var(--muted);font-size:.85rem">${mod.purpose}</p>
      <div class="bar" style="margin:.6rem 0 1rem"><i style="width:${p.reviewPct}%"></i></div>
      ${sections.map((sec) => {
        const items = mod.items.filter((i) => i.section === sec);
        const done = items.filter((i) => ((obra.items[i.id] || {}).status || "pendiente") !== "pendiente").length;
        return `<h2 class="sec">${sec}</h2>
          <p style="font-size:.75rem;color:var(--muted);margin-bottom:.4rem">${done} de ${items.length} puntos capturados</p>
          ${items.map((item) => {
            const st = obra.items[item.id] || { status: "pendiente", note: "" };
            return `<div class="check-card" data-item="${item.id}">
              <div class="t">${esc(item.text)}</div>
              ${item.hint ? `<div class="f">${esc(item.hint)}</div>` : ""}
              <div class="status">
                ${["cumple","no_cumple","na","pendiente"].map((s) =>
                  `<button type="button" data-st="${s}" class="${st.status===s?"on-"+s:""}">${LABELS[s]}</button>`
                ).join("")}
              </div>
              <textarea placeholder="Nota de evidencia o hallazgo (opcional)">${esc(st.note || "")}</textarea>
            </div>`;
          }).join("")}
          <div class="section-done">
            <p>¿Terminó esta sección?</p>
            <div class="btn-row" style="margin:0">
              <button class="btn btn-primary go-obra">Sección lista · Volver a anexos</button>
              <button class="btn btn-ghost go-home">Ir al inicio</button>
            </div>
          </div>`;
      }).join("")}
      <div class="sticky-bar no-print">
        <p>${mod.annex}: ${p.answered} de ${p.total} puntos</p>
        <div class="btn-row" style="margin:0">
          <button class="btn btn-gold go-obra">Volver a anexos</button>
          <button class="btn btn-ghost go-home" style="background:transparent;color:#fff;border-color:rgba(201,162,39,.4)">Inicio</button>
        </div>
      </div>
    `;
    $("back-obra").onclick = () => openObra(state.obraId);
    $("back-home2").onclick = renderLanding;
    $("screen-modulo").querySelectorAll(".go-obra").forEach((b) => b.onclick = () => openObra(state.obraId));
    $("screen-modulo").querySelectorAll(".go-home").forEach((b) => b.onclick = renderLanding);
    $("screen-modulo").querySelectorAll(".check-card").forEach((card) => {
      const id = card.dataset.item;
      card.querySelectorAll("[data-st]").forEach((btn) => {
        btn.onclick = () => {
          obra.items[id] = obra.items[id] || { status: "pendiente", note: "" };
          obra.items[id].status = btn.dataset.st;
          obra.updatedAt = new Date().toISOString();
          save();
          openModulo(moduleId);
        };
      });
      card.querySelector("textarea").onchange = (e) => {
        obra.items[id] = obra.items[id] || { status: "pendiente", note: "" };
        obra.items[id].note = e.target.value;
        obra.updatedAt = new Date().toISOString();
        save();
      };
    });
    show("modulo");
  }

  function renderReporte() {
    const obra = obraById(state.obraId);
    if (!obra) return;
    const overall = progress(obra);
    $("screen-reporte").innerHTML = `
      <div class="no-print btn-row" style="margin-top:0">
        <button class="btn btn-ghost" id="rep-back">← Volver</button>
        <button class="btn btn-primary" id="rep-print">Imprimir o guardar PDF</button>
      </div>
      <article class="card">
        <img src="icons/logo-catu-dorado.png" alt="CATU" style="height:56px" />
        <p style="font-size:.65rem;color:var(--gold);font-weight:700;margin-top:.6rem">CENTRO DE AUDITORÍA TÉCNICA Y URBANA</p>
        <h2 style="color:var(--navy)">Reporte de blindaje preventivo</h2>
        <p><strong>${esc(obra.nombre)}</strong></p>
        <p style="font-size:.85rem;color:var(--muted)">Dependencia: ${esc(obra.dependencia||"—")} · Contrato: ${esc(obra.contrato||"—")}<br>
        Ubicación: ${esc(obra.ubicacion||"—")} · Revisado por: ${esc(obra.revisadoPor||"—")} · ${fmt(obra.updatedAt)}</p>
        <div class="kpi-row">
          <div class="kpi"><div class="k">Avance</div><div class="v">${overall.reviewPct}%</div></div>
          <div class="kpi"><div class="k">Blindaje</div><div class="v">${overall.shieldPct}%</div></div>
        </div>
        <p style="font-size:.8rem">${overall.risk} en riesgo</p>
        ${MODULES.map((mod) => {
          const p = progress(obra, mod.id);
          const risks = mod.items.filter((i) => (obra.items[i.id] || {}).status === "no_cumple");
          const pending = mod.items.filter((i) => ((obra.items[i.id] || {}).status || "pendiente") === "pendiente");
          return `<h2 class="sec">${mod.annex} · ${mod.title}</h2>
            <p style="font-size:.75rem;color:var(--muted)">Revisión ${p.reviewPct}% · Blindaje ${p.shieldPct}% · ${p.risk} en riesgo</p>
            ${risks.length ? risks.map((i) => `<p><span class="risk">No cumple.</span> ${esc(i.text)}${(obra.items[i.id]||{}).note ? `<br><small>${esc(obra.items[i.id].note)}</small>` : ""}</p>`).join("") : `<p class="ok-msg">Sin puntos en riesgo en este anexo.</p>`}
            ${pending.length ? `<p style="font-size:.75rem;color:var(--muted)">Pendientes: ${pending.length} de ${mod.items.length}.</p>` : ""}`;
        }).join("")}
        <h2 class="sec">Inventario de puntos</h2>
        <table><thead><tr><th>Anexo</th><th>Punto</th><th>Estado</th></tr></thead><tbody>
        ${MODULES.flatMap((mod) => mod.items.map((item) => {
          const st = (obra.items[item.id] || {}).status || "pendiente";
          return `<tr><td>${mod.annex}</td><td>${esc(item.text)}</td><td>${LABELS[st]}</td></tr>`;
        })).join("")}
        </tbody></table>
        <p style="font-size:.7rem;color:var(--muted);margin-top:1rem">Documento de control preventivo generado por CATU Blindaje Preventivo. Marco: Ley 266 de Guerrero. No sustituye el expediente oficial ni constituye dictamen de auditoría. Vigencia del programa: 30 de septiembre de 2027.</p>
      </article>
    `;
    $("rep-back").onclick = () => openObra(state.obraId);
    $("rep-print").onclick = () => window.print();
    show("reporte");
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&#38;")
      .replace(/</g, "&#60;")
      .replace(/>/g, "&#62;")
      .replace(/"/g, "&#34;")
      .replace(/'/g, "&#39;");
  }

  $("brand-home").onclick = renderLanding;

  function syncNet() {
    const off = !navigator.onLine;
    $("chip-offline").classList.toggle("off", !off);
    $("chip-offline").classList.toggle("warn", off);
    $("chip-ready").classList.toggle("off", off || !navigator.serviceWorker || !navigator.serviceWorker.controller);
  }
  window.addEventListener("online", syncNet);
  window.addEventListener("offline", syncNet);

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").then(() => {
      $("chip-ready").classList.remove("off");
      syncNet();
    }).catch(() => {});
  }

  try {
    load();
    renderLanding();
    syncNet();
  } catch (err) {
    const el = $("screen-landing");
    if (el) el.innerHTML = "<p style='padding:1rem'>No se pudo iniciar la PWA. Recargue con Ctrl+Shift+R.<br>" + String(err) + "</p>";
  }
})();
