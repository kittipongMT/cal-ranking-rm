// js/cloud.js (MODULE)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ✅ 1) ใส่ config ของคุณตรงนี้ (อันเดิมที่คุณใช้ login ได้)
const firebaseConfig = {
  apiKey: "PUT_YOUR_API_KEY_HERE",
  authDomain: "PUT_YOUR_AUTH_DOMAIN_HERE",
  projectId: "PUT_YOUR_PROJECT_ID_HERE",
  storageBucket: "PUT_YOUR_BUCKET_HERE",
  messagingSenderId: "PUT_YOUR_SENDER_ID_HERE",
  appId: "PUT_YOUR_APP_ID_HERE"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// ✅ 2) สร้าง namespace ให้ไฟล์อื่นใช้
window.RMAPP = window.RMAPP || {};
window.RMAPP.cloud = window.RMAPP.cloud || {};

const Cloud = window.RMAPP.cloud;
Cloud.user = null;

function stateDocRef(uid) {
  // path: users/{uid}/apps/rm_rank_calc
  return doc(db, "users", uid, "apps", "rm_rank_calc");
}

Cloud.signInGoogle = async () => {
  await signInWithPopup(auth, provider);
};

Cloud.signOut = async () => {
  await signOut(auth);
};

Cloud.loadState = async () => {
  if (!Cloud.user) return null;
  const ref = stateDocRef(Cloud.user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return data?.state || null;
};

// กันเขียนถี่เกินไป
let saveTimer = null;

Cloud.saveStateDebounced = (state) => {
  if (!Cloud.user) return;
  if (saveTimer) clearTimeout(saveTimer);

  saveTimer = setTimeout(async () => {
    try {
      const ref = stateDocRef(Cloud.user.uid);
      await setDoc(ref, { state, updatedAt: serverTimestamp() }, { merge: true });
    } catch (e) {
      console.warn("Cloud save failed:", e);
    }
  }, 700);
};

Cloud.onAuthChanged = (cb) => {
  onAuthStateChanged(auth, (user) => {
    Cloud.user = user || null;
    cb && cb(user || null);
  });
};

// ✅ 3) ปุ่มลอย (เหมือนเดิม) — กดครั้งเดียว login / logout
const loginBtn = document.createElement("button");
loginBtn.textContent = "Sign in with Google";
loginBtn.style.position = "fixed";
loginBtn.style.top = "10px";
loginBtn.style.right = "10px";
loginBtn.style.padding = "8px 14px";
loginBtn.style.borderRadius = "10px";
loginBtn.style.border = "none";
loginBtn.style.fontWeight = "bold";
loginBtn.style.cursor = "pointer";
loginBtn.style.zIndex = "9999";
loginBtn.style.background = "#dfcd80";
loginBtn.style.color = "#000";
document.body.appendChild(loginBtn);

loginBtn.addEventListener("click", async () => {
  try {
    if (auth.currentUser) await Cloud.signOut();
    else await Cloud.signInGoogle();
  } catch (e) {
    console.error(e);
    alert("Login/Logout ไม่สำเร็จ ❌\nดู Console (F12) ได้ครับ");
  }
});

Cloud.onAuthChanged((user) => {
  if (user) loginBtn.textContent = `Logout (${user.displayName || "Google"})`;
  else loginBtn.textContent = "Sign in with Google";
});