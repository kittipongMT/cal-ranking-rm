// js/calc.js
(function () {
  const A = window.RMAPP;

  A.pointsToRank = function (totalPoints) {
    if (!Number.isFinite(totalPoints) || totalPoints < 0) totalPoints = 0;

    const totalStepsCompleted = Math.floor(totalPoints / A.STEP_POINTS);
    const inStep = totalPoints % A.STEP_POINTS;

    let cum = 0;
    for (const h of A.hats) {
      const next = cum + h.steps;
      if (totalStepsCompleted < next) {
        const stepInHat = totalStepsCompleted - cum + 1;
        return { hat: h.name, stepInHat, inStep, stepMax: A.STEP_POINTS, hatSteps: h.steps };
      }
      cum = next;
    }

    const last = A.hats[A.hats.length - 1];
    return { hat: last.name, stepInHat: last.steps, inStep: A.STEP_POINTS - 1, stepMax: A.STEP_POINTS, hatSteps: last.steps };
  };

  A.readAllPoints = function () {
    let sum = 0;
    document.querySelectorAll(".row").forEach((r) => {
      const v = Number(r.querySelector("input")?.value);
      if (Number.isFinite(v)) sum += v;
    });

    const bonus = Number(document.getElementById("bonus")?.value);
    const bonusVal = Number.isFinite(bonus) ? bonus : 0;

    return { sum, bonus: bonusVal, total: sum + bonusVal };
  };

  A.calc = function () {
    const btn = document.getElementById("calcBtn");
    btn?.classList.add("is-loading");

    setTimeout(() => {
      const { sum, bonus, total } = A.readAllPoints();
      const r = A.pointsToRank(total);

      document.getElementById("rankOut").textContent =
        `${r.hat} ${r.stepInHat} (${r.inStep}/${r.stepMax})`;

      document.getElementById("totalOut").textContent =
        `รวมแต้ม: ${total.toLocaleString()}  (ช่องรวม ${sum.toLocaleString()} + โบนัส ${bonus.toLocaleString()})`;

      document.getElementById("detailOut").textContent =
        `คำนวณจาก 1 ขั้น = ${A.STEP_POINTS} แต้ม • อยู่ใน "${r.hat}" ขั้นที่ ${r.stepInHat} / ${r.hatSteps}`;

      btn?.classList.remove("is-loading");
      A.saveState();
    }, 450);
  };

  A.resetUnlocked = function () {
    A.sections.forEach((sec) => {
      document.querySelectorAll(`#${sec.id} .row`).forEach((r) => {
        if (r.dataset.locked !== "true") r.querySelector("input").value = "";
      });
    });

    document.getElementById("rankOut").textContent = "-";
    document.getElementById("totalOut").textContent = "รวมแต้ม: -";
    document.getElementById("detailOut").textContent =
      `ระบบ: 1 ขั้น = ${A.STEP_POINTS} แต้ม • จะคำนวณจาก “แต้มทุกช่อง + แต้มพิเศษ”`;

    A.saveState();
  };
})();