// js/ocr.js
(function () {
  const A = window.RMAPP;

  function pick4Digits(text) {
    const m = String(text || "").match(/(\d{4})/);
    return m ? m[1] : "";
  }

  function fileToImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = reject;
      img.src = url;
    });
  }

  function cropToCanvas(img, box) {
    const [x, y, w, h] = box;

    const sx = Math.round(img.naturalWidth * x);
    const sy = Math.round(img.naturalHeight * y);
    const sw = Math.max(1, Math.round(img.naturalWidth * w));
    const sh = Math.max(1, Math.round(img.naturalHeight * h));

    const canvas = document.createElement("canvas");
    const scale = 3;
    canvas.width = sw * scale;
    canvas.height = sh * scale;

    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    // preprocess: grayscale + threshold
    const im = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i], g = d[i + 1], b = d[i + 2];
      const gray = r * 0.299 + g * 0.587 + b * 0.114;
      const v = gray > 140 ? 255 : 0;
      d[i] = d[i + 1] = d[i + 2] = v;
    }
    ctx.putImageData(im, 0, 0);

    return canvas;
  }

  async function ocrText(canvas) {
    if (!window.Tesseract) throw new Error("Tesseract.js not loaded");
    const { data } = await Tesseract.recognize(canvas, "eng");
    return (data.text || "").trim();
  }

  A.importScreenshot = async function (sectionId) {
    const boxes = A.OCR_BOXES?.[sectionId];
    if (!boxes?.length) return alert("ยังไม่มี OCR_BOXES ของหมวดนี้ครับ");

    const fileInput = document.getElementById("imgFile");
    if (!fileInput) return alert('ไม่พบ <input id="imgFile"> ใน HTML ครับ');

    if (!window.Tesseract) {
      return alert("ยังไม่ได้โหลด tesseract.min.js ครับ\n(ต้องโหลดก่อน ocr.js)");
    }

    fileInput.value = "";
    fileInput.onchange = async () => {
      const file = fileInput.files?.[0];
      if (!file) return;

      const calcBtn = document.getElementById("calcBtn");
      calcBtn?.classList.add("is-loading");

      try {
        const img = await fileToImage(file);

        const points = [];
        for (let i = 0; i < boxes.length; i++) {
          const canvas = cropToCanvas(img, boxes[i].pointBox);
          const raw = await ocrText(canvas);
          points.push(pick4Digits(raw) || "");
        }

        const rows = document.querySelectorAll(`#${sectionId} .row`);
        rows.forEach((r, idx) => {
          const inp = r.querySelector("input");
          if (inp) inp.value = points[idx] || "";
        });

        A.saveState();
        A.calc();

        const ok = points.filter(Boolean).length;
        alert(`Import ${sectionId.toUpperCase()} เสร็จ ✅\nอ่านแต้มได้ ${ok}/${points.length}`);
      } catch (e) {
        console.error(e);
        alert("Import ไม่สำเร็จ ❌\nเช็ก Console ได้ (F12) ว่ามี error อะไร");
      } finally {
        calcBtn?.classList.remove("is-loading");
      }
    };

    fileInput.click();
  };
})();