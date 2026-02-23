// js/storage.js
(function () {
  const A = window.RMAPP;
  A.STORAGE_KEY = "rm_rank_calc_split_v1";

  A.emptyState = function () {
    return {
      bonus: 1200,
      sections: {
        extream: Array(8).fill(""),
        sport: Array(7).fill(""),
        standard: Array(7).fill(""),
      },
      locked: {
        extream: Array(8).fill(false),
        sport: Array(7).fill(false),
        standard: Array(7).fill(false),
      },
      cars: {
        extream: Array(8).fill(""),
        sport: Array(7).fill(""),
        standard: Array(7).fill(""),
      },
      customCars: {
        extream: [],
        sport: [],
        standard: [],
      },
    };
  };

  A.loadState = function () {
    try {
      const raw = localStorage.getItem(A.STORAGE_KEY);
      if (!raw) return A.emptyState();
      const parsed = JSON.parse(raw);
      const base = A.emptyState();

      for (const s of ["extream", "sport", "standard"]) {
        if (Array.isArray(parsed.sections?.[s])) base.sections[s] = parsed.sections[s].slice(0, base.sections[s].length);
        if (Array.isArray(parsed.locked?.[s])) base.locked[s] = parsed.locked[s].slice(0, base.locked[s].length);
        if (Array.isArray(parsed.cars?.[s])) base.cars[s] = parsed.cars[s].slice(0, base.cars[s].length);
        if (Array.isArray(parsed.customCars?.[s])) base.customCars[s] = parsed.customCars[s];
      }
      if (Number.isFinite(Number(parsed.bonus))) base.bonus = Number(parsed.bonus);

      return base;
    } catch {
      return A.emptyState();
    }
  };

  A.collectStateFromUI = function () {
    const state = A.emptyState();
    state.bonus = Number(document.getElementById("bonus")?.value) || 0;

    // keep customCars from current STATE
    state.customCars = JSON.parse(JSON.stringify((A.STATE && A.STATE.customCars) || A.emptyState().customCars));

    for (const sec of A.sections) {
      const rows = document.querySelectorAll(`#${sec.id} .row`);
      rows.forEach((r, idx) => {
        state.sections[sec.id][idx] = r.querySelector("input")?.value ?? "";
        state.locked[sec.id][idx] = r.dataset.locked === "true";
        state.cars[sec.id][idx] = r.querySelector("select")?.value ?? "";
      });
    }
    return state;
  };

  A.saveState = function () {
    A.STATE = A.collectStateFromUI();
    localStorage.setItem(A.STORAGE_KEY, JSON.stringify(A.STATE));
  };
})();