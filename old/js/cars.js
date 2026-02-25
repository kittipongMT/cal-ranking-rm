// js/cars.js
(function () {
  const A = window.RMAPP;

  A.normName = (s) => String(s || "").trim();
  A.lower = (s) => A.normName(s).toLowerCase();

  A.getCarsForSection = function (sectionId) {
    const base = A.defaultCars[sectionId] || [];
    const extra = (A.STATE?.customCars?.[sectionId] || []);
    const all = [...base, ...extra].map(A.normName).filter(Boolean);

    const seen = new Set();
    const out = [];
    for (const n of all) {
      const k = A.lower(n);
      if (!seen.has(k)) { seen.add(k); out.push(n); }
    }
    return out;
  };

  A.buildSelectOptions = function (selectEl, sectionId, currentValue) {
    const cars = A.getCarsForSection(sectionId);

    selectEl.innerHTML = "";
    const opt0 = document.createElement("option");
    opt0.value = "";
    opt0.textContent = "เลือกรถ...";
    selectEl.appendChild(opt0);

    cars.forEach((name) => {
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      selectEl.appendChild(opt);
    });

    const tryVal = A.normName(currentValue);
    selectEl.value = cars.some((c) => A.lower(c) === A.lower(tryVal))
      ? cars.find((c) => A.lower(c) === A.lower(tryVal))
      : "";
  };

  A.refreshSectionSelects = function (sectionId) {
    document.querySelectorAll(`#${sectionId} select.car-select`).forEach((sel) => {
      const cur = sel.value;
      A.buildSelectOptions(sel, sectionId, cur);
    });
  };
})();