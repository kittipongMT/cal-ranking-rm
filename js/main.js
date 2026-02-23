// js/main.js
(function () {
  const A = window.RMAPP;

  function bindEvents() {
    document.getElementById("bonus")?.addEventListener("input", A.saveState);
    document.getElementById("calcBtn")?.addEventListener("click", A.calc);
    document.getElementById("resetBtn")?.addEventListener("click", A.resetUnlocked);

    // Import buttons: <button data-import="extream|sport|standard">
    document.querySelectorAll("[data-import]").forEach((btn) => {
      btn.addEventListener("click", () => A.importScreenshot(btn.dataset.import));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    A.STATE = A.loadState();
    A.buildUIFromState(A.STATE);
    bindEvents();
    A.calc();
  });
})();