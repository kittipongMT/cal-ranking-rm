// js/main.js
(function () {
  const A = window.RMAPP;

  function bindEvents() {
    document.getElementById("bonus")?.addEventListener("input", A.saveState);
    document.getElementById("calcBtn")?.addEventListener("click", A.calc);
    document.getElementById("resetBtn")?.addEventListener("click", A.resetUnlocked);

    document.querySelectorAll("[data-import]").forEach((btn) => {
      btn.addEventListener("click", () => A.importScreenshot(btn.dataset.import));
    });
  }

  async function tryLoadCloud(user) {
    if (!user) return;

    try {
      const cloudState = await A.cloud.loadState();

      // ถ้ามีข้อมูลใน cloud → ใช้ cloud เป็นหลัก
      if (cloudState) {
        A.STATE = cloudState;
        localStorage.setItem(A.STORAGE_KEY, JSON.stringify(A.STATE));
        A.buildUIFromState(A.STATE);
        A.calc();
        return;
      }

      // ถ้า cloud ยังไม่มี → ส่ง local ขึ้นไปเป็นครั้งแรก
      if (A.STATE && A.cloud?.saveStateDebounced) {
        A.cloud.saveStateDebounced(A.STATE);
      }
    } catch (e) {
      console.warn("Cloud load failed:", e);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    // โหลด local ก่อน (เร็ว + offline)
    A.STATE = A.loadState();
    A.buildUIFromState(A.STATE);
    bindEvents();
    A.calc();

    // พอล็อกอินแล้วค่อยดึงจาก cloud
    if (A.cloud?.onAuthChanged) {
      A.cloud.onAuthChanged(async (user) => {
        await tryLoadCloud(user);
      });
    }
  });
})();