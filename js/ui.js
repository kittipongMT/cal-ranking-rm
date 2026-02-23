// js/ui.js
(function () {
  const A = window.RMAPP;

  A.makeRow = function (sectionId, idx, value, isLocked, carValue) {
    const wrap = document.createElement("div");
    wrap.className = "row";
    wrap.dataset.locked = isLocked ? "true" : "false";
    if (isLocked) wrap.classList.add("locked");

    const input = document.createElement("input");
    input.className = "num mono";
    input.type = "number";
    input.inputMode = "numeric";
    input.placeholder = `ใส่แต้ม #${idx + 1}`;
    input.value = value ?? "";

    const lockBtn = document.createElement("button");
    lockBtn.className = "icon-btn";
    lockBtn.type = "button";
    lockBtn.title = "ล็อคช่องนี้ (Reset จะไม่ล้างช่องที่ล็อค)";
    lockBtn.innerHTML = `<svg class="icon"><use href="${isLocked ? "#ico-lock" : "#ico-unlock"}" xlink:href="${isLocked ? "#ico-lock" : "#ico-unlock"}"></use></svg>`;

    lockBtn.addEventListener("click", () => {
      const locked = wrap.dataset.locked === "true";
      const nextLocked = !locked;

      wrap.dataset.locked = nextLocked ? "true" : "false";
      wrap.classList.toggle("locked", nextLocked);

      lockBtn.innerHTML = `<svg class="icon"><use href="${nextLocked ? "#ico-lock" : "#ico-unlock"}" xlink:href="${nextLocked ? "#ico-lock" : "#ico-unlock"}"></use></svg>`;
      A.saveState();
    });

    const select = document.createElement("select");
    select.className = "car-select";
    A.buildSelectOptions(select, sectionId, carValue ?? "");
    select.addEventListener("change", A.saveState);

    // ✅ Edit name (✎) คงไว้
    const edit = document.createElement("button");
    edit.className = "edit-btn";
    edit.type = "button";
    edit.title = "แก้ชื่อรถ";
    edit.textContent = "✎";
    edit.addEventListener("click", () => {
      const current = select.value || "";
      const next = A.normName(prompt("แก้ชื่อรถเป็น:", current));
      if (!next) return;

      if (!A.STATE.customCars) A.STATE.customCars = A.emptyState().customCars;
      if (!Array.isArray(A.STATE.customCars[sectionId])) A.STATE.customCars[sectionId] = [];

      const exists = A.getCarsForSection(sectionId).some(c => A.lower(c) === A.lower(next));
      if (!exists) {
        A.STATE.customCars[sectionId].push(next);
        localStorage.setItem(A.STORAGE_KEY, JSON.stringify(A.STATE));
        A.refreshSectionSelects(sectionId);
      }

      select.value = next;
      A.saveState();
    });

    input.addEventListener("input", A.saveState);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") A.calc(); });

    wrap.appendChild(input);
    wrap.appendChild(lockBtn);
    wrap.appendChild(select);
    wrap.appendChild(edit);
    return wrap;
  };

  A.ensureAddButtons = function () {
    A.sections.forEach((sec) => {
      const root = document.getElementById(sec.id);
      if (!root) return;

      const card = root.closest(".card");
      const header = card?.querySelector(".section-title");
      if (!header) return;

      if (header.querySelector(`[data-addcar="${sec.id}"]`)) return;

      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "addcar-btn";
      addBtn.dataset.addcar = sec.id;
      addBtn.textContent = "+ Add";

      addBtn.addEventListener("click", () => {
        const name = A.normName(prompt(`เพิ่มชื่อรถในหมวด ${sec.label}\n(พิมพ์ชื่อรถ)`, ""));
        if (!name) return;

        const exists = A.getCarsForSection(sec.id).some((c) => A.lower(c) === A.lower(name));
        if (exists) return alert("มีชื่อนี้อยู่แล้ว ✅");

        if (!A.STATE.customCars) A.STATE.customCars = A.emptyState().customCars;
        if (!Array.isArray(A.STATE.customCars[sec.id])) A.STATE.customCars[sec.id] = [];
        A.STATE.customCars[sec.id].push(name);

        localStorage.setItem(A.STORAGE_KEY, JSON.stringify(A.STATE));
        A.refreshSectionSelects(sec.id);
      });

      header.appendChild(addBtn);
    });
  };

  A.buildUIFromState = function (state) {
    A.sections.forEach((sec) => {
      const root = document.getElementById(sec.id);
      if (root) root.innerHTML = "";
    });

    document.getElementById("bonus").value = state.bonus ?? 1200;

    A.sections.forEach((sec) => {
      const root = document.getElementById(sec.id);
      for (let i = 0; i < sec.count; i++) {
        root.appendChild(
          A.makeRow(
            sec.id,
            i,
            state.sections?.[sec.id]?.[i] ?? "",
            !!state.locked?.[sec.id]?.[i],
            state.cars?.[sec.id]?.[i] ?? ""
          )
        );
      }
    });

    A.ensureAddButtons();
  };
})();