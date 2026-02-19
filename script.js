// ---------- Rank setup ----------
const STEP_POINTS = 200;
const hats = [
  { name: "หมวกเทา", steps: 5 },
  { name: "หมวกเขียวอ่อน", steps: 10 },
  { name: "หมวกเขียวเข้ม", steps: 10 },
  { name: "หมวกฟ้า", steps: 20 },
  { name: "หมวกม่วง", steps: 25 },
  { name: "หมวกทอง", steps: 25 },
  { name: "หมวกส้ม", steps: 25 },
  { name: "หมวกแดง", steps: 25 },
  { name: "หมวกแดงทอง", steps: 50 },
  { name: "หมวกเขียวทอง", steps: 50 },
];

function pointsToRank(totalPoints){
  if (!Number.isFinite(totalPoints) || totalPoints < 0) totalPoints = 0;

  const totalStepsCompleted = Math.floor(totalPoints / STEP_POINTS);
  const inStep = totalPoints % STEP_POINTS;

  let cum = 0;
  for (const h of hats){
    const next = cum + h.steps;
    if (totalStepsCompleted < next){
      const stepInHat = (totalStepsCompleted - cum) + 1;
      return { hat: h.name, stepInHat, inStep, stepMax: STEP_POINTS, hatSteps: h.steps };
    }
    cum = next;
  }

  const last = hats[hats.length - 1];
  return { hat: last.name, stepInHat: last.steps, inStep: STEP_POINTS - 1, stepMax: STEP_POINTS, hatSteps: last.steps };
}

// ---------- Sections ----------
const sections = [
  { id: "extream", count: 8, label: "Extream" },
  { id: "sport", count: 7, label: "Sport" },
  { id: "standard", count: 7, label: "Standard" },
];

// ---------- Default cars by category ----------
const defaultCars = {
  extream: ["LaFerrari","Huayra BC","Ford GT","Centodieci","SVJ","Benz GT R","Chiron","Vulcan"],
  sport: ["Reventon","Giulia","GT-R","XJ220","F-Type","NSX-R","4C Spider"],
  standard: ["RX7","DB5","Emira","911 Carrera","Mach 1","Camaro Z/28","S15"],
};

// ---------- Storage ----------
const STORAGE_KEY = "rm_rank_calc_v4";

function emptyState(){
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
    cars: { // เลือกรถต่อแถว
      extream: Array(8).fill(""),
      sport: Array(7).fill(""),
      standard: Array(7).fill(""),
    },
    customCars: { // รถที่ผู้ใช้ Add เองต่อหมวด
      extream: [],
      sport: [],
      standard: [],
    }
  };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw);

    const base = emptyState();

    for (const s of ["extream","sport","standard"]){
      if (Array.isArray(parsed.sections?.[s])) base.sections[s] = parsed.sections[s].slice(0, base.sections[s].length);
      if (Array.isArray(parsed.locked?.[s])) base.locked[s] = parsed.locked[s].slice(0, base.locked[s].length);
      if (Array.isArray(parsed.cars?.[s])) base.cars[s] = parsed.cars[s].slice(0, base.cars[s].length);
      if (Array.isArray(parsed.customCars?.[s])) base.customCars[s] = parsed.customCars[s];
    }
    if (Number.isFinite(Number(parsed.bonus))) base.bonus = Number(parsed.bonus);

    return base;
  }catch(e){
    return emptyState();
  }
}

let STATE = loadState();

function saveState(){
  STATE = collectStateFromUI();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
}

function collectStateFromUI(){
  const state = emptyState();

  // bonus
  state.bonus = Number(document.getElementById("bonus").value) || 0;

  // customCars (คงไว้จาก STATE ปัจจุบัน)
  state.customCars = JSON.parse(JSON.stringify(STATE.customCars || emptyState().customCars));

  // inputs + locked + cars
  for (const sec of sections){
    const rows = document.querySelectorAll(`#${sec.id} .row`);
    rows.forEach((r, idx) => {
      state.sections[sec.id][idx] = r.querySelector("input")?.value ?? "";
      state.locked[sec.id][idx] = (r.dataset.locked === "true");
      state.cars[sec.id][idx] = r.querySelector("select")?.value ?? "";
    });
  }

  return state;
}

// ---------- Cars helpers ----------
function normName(s){ return String(s || "").trim(); }
function lower(s){ return normName(s).toLowerCase(); }

function getCarsForSection(sectionId){
  const base = defaultCars[sectionId] || [];
  const extra = (STATE.customCars?.[sectionId] || []);
  const all = [...base, ...extra].map(normName).filter(Boolean);

  // unique (case-insensitive)
  const seen = new Set();
  const out = [];
  for (const n of all){
    const k = lower(n);
    if (!seen.has(k)){
      seen.add(k);
      out.push(n);
    }
  }
  return out;
}

function buildSelectOptions(selectEl, sectionId, currentValue){
  const cars = getCarsForSection(sectionId);

  selectEl.innerHTML = "";
  const opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = "เลือกรถ...";
  selectEl.appendChild(opt0);

  cars.forEach(name => {
    const opt = document.createElement("option");
    opt.value = name;
    opt.textContent = name;
    selectEl.appendChild(opt);
  });

  // restore value if still exists
  const tryVal = normName(currentValue);
  selectEl.value = cars.some(c => lower(c) === lower(tryVal)) ? cars.find(c => lower(c) === lower(tryVal)) : "";
}

function refreshSectionSelects(sectionId){
  document.querySelectorAll(`#${sectionId} select.car-select`).forEach(sel => {
    const cur = sel.value;
    buildSelectOptions(sel, sectionId, cur);
  });
}

// ---------- UI build ----------
function makeRow(sectionId, idx, value, isLocked, carValue){
  const wrap = document.createElement("div");
  wrap.className = "row";
  wrap.dataset.locked = isLocked ? "true" : "false";
  if (isLocked) wrap.classList.add("locked");

  const input = document.createElement("input");
  input.className = "num mono";
  input.type = "number";
  input.inputMode = "numeric";
  input.placeholder = `ใส่แต้ม #${idx+1}`;
  input.value = value ?? "";

  const btn = document.createElement("button");
  btn.className = "icon-btn";
  btn.type = "button";
  btn.title = "ล็อคช่องนี้ (Reset จะไม่ล้างช่องที่ล็อค)";
  btn.innerHTML = `<svg class="icon"><use href="${isLocked ? "#ico-lock" : "#ico-unlock"}" xlink:href="${isLocked ? "#ico-lock" : "#ico-unlock"}"></use></svg>`;

  btn.addEventListener("click", () => {
    const locked = wrap.dataset.locked === "true";
    const nextLocked = !locked;

    wrap.dataset.locked = nextLocked ? "true" : "false";
    wrap.classList.toggle("locked", nextLocked);

    btn.innerHTML = `<svg class="icon"><use href="${nextLocked ? "#ico-lock" : "#ico-unlock"}" xlink:href="${nextLocked ? "#ico-lock" : "#ico-unlock"}"></use></svg>`;
    saveState();
  });

  // Dropdown car
  const select = document.createElement("select");
  select.className = "car-select";
  buildSelectOptions(select, sectionId, carValue ?? "");
  select.addEventListener("change", saveState);

  // Auto-save when typing
  input.addEventListener("input", saveState);

  // Enter = calculate
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") calc();
  });

  wrap.appendChild(input);
  wrap.appendChild(btn);
  wrap.appendChild(select);
  return wrap;
}

function ensureAddButtons(){
  sections.forEach(sec => {
    const root = document.getElementById(sec.id);
    if (!root) return;

    const card = root.closest(".card");
    if (!card) return;

    const header = card.querySelector(".section-title");
    if (!header) return;

    // กันซ้ำ
    if (header.querySelector(`[data-addcar="${sec.id}"]`)) return;

    const addBtn = document.createElement("button");
    addBtn.type = "button";
    addBtn.className = "addcar-btn";
    addBtn.dataset.addcar = sec.id;
    addBtn.textContent = "+ Add";

    addBtn.addEventListener("click", () => {
      const msg = `เพิ่มชื่อรถในหมวด ${sec.label}\n(พิมพ์ชื่อรถ เช่น "Huracan STO")`;
      const name = normName(prompt(msg, ""));
      if (!name) return;

      const current = STATE.customCars?.[sec.id] || [];
      const exists =
        getCarsForSection(sec.id).some(c => lower(c) === lower(name));

      if (exists){
        alert("มีชื่อนี้อยู่แล้วครับ ✅");
        return;
      }

      // add + save + refresh dropdowns
      if (!STATE.customCars) STATE.customCars = emptyState().customCars;
      if (!Array.isArray(STATE.customCars[sec.id])) STATE.customCars[sec.id] = [];
      STATE.customCars[sec.id].push(name);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE));
      refreshSectionSelects(sec.id);
    });

    header.appendChild(addBtn);
  });
}

function buildUIFromState(state){
  // clear
  sections.forEach(sec => {
    const root = document.getElementById(sec.id);
    root.innerHTML = "";
  });

  // bonus
  document.getElementById("bonus").value = state.bonus ?? 1200;

  // rows
  sections.forEach(sec => {
    const root = document.getElementById(sec.id);
    for (let i=0;i<sec.count;i++){
      const v = state.sections?.[sec.id]?.[i] ?? "";
      const locked = !!state.locked?.[sec.id]?.[i];
      const car = state.cars?.[sec.id]?.[i] ?? "";
      root.appendChild(makeRow(sec.id, i, v, locked, car));
    }
  });

  ensureAddButtons();
}

// ---------- Calculation ----------
function readAllPoints(){
  let sum = 0;
  document.querySelectorAll(".row").forEach(r => {
    const inp = r.querySelector("input");
    const v = Number(inp.value);
    if (Number.isFinite(v)) sum += v;
  });
  const bonus = Number(document.getElementById("bonus").value);
  const bonusVal = Number.isFinite(bonus) ? bonus : 0;
  return { sum, bonus: bonusVal, total: sum + bonusVal };
}

function calc(){
  const btn = document.getElementById("calcBtn");
  btn.classList.add("is-loading");

  setTimeout(() => {
    const { sum, bonus, total } = readAllPoints();
    const r = pointsToRank(total);

    document.getElementById("rankOut").textContent =
      `${r.hat} ${r.stepInHat} (${r.inStep}/${r.stepMax})`;

    document.getElementById("totalOut").textContent =
      `รวมแต้ม: ${total.toLocaleString()}  (ช่องรวม ${sum.toLocaleString()} + โบนัส ${bonus.toLocaleString()})`;

    document.getElementById("detailOut").textContent =
      `คำนวณจาก 1 ขั้น = ${STEP_POINTS} แต้ม • อยู่ใน "${r.hat}" ขั้นที่ ${r.stepInHat} / ${r.hatSteps}`;

    btn.classList.remove("is-loading");
    saveState();
  }, 600);
}

function resetUnlocked(){
  // ล้างเฉพาะช่องที่ไม่ล็อค (รถไม่ล้างตามที่เหมาะกับการใช้งานจริง)
  sections.forEach(sec => {
    document.querySelectorAll(`#${sec.id} .row`).forEach(r => {
      const locked = r.dataset.locked === "true";
      if (!locked){
        r.querySelector("input").value = "";
      }
    });
  });

  document.getElementById("rankOut").textContent = "-";
  document.getElementById("totalOut").textContent = "รวมแต้ม: -";
  document.getElementById("detailOut").textContent =
    `ระบบ: 1 ขั้น = ${STEP_POINTS} แต้ม • จะคำนวณจาก “แต้มทุกช่อง + แต้มพิเศษ”`;

  saveState();
}

// ---------- Init ----------
buildUIFromState(STATE);

// save bonus changes too
document.getElementById("bonus").addEventListener("input", saveState);

// Buttons
document.getElementById("calcBtn").addEventListener("click", calc);
document.getElementById("resetBtn").addEventListener("click", resetUnlocked);

// First calc
calc();
