// ===== Firebase Setup =====
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 🔴 เอา config จาก Firebase console มาใส่ตรงนี้
const firebaseConfig = {
  apiKey: "AIzaSyBsfan9ZXraevVDpTe8q1GL7DkfUER0wc0",
  authDomain: "cal-ranking-rm.firebaseapp.com",
  projectId: "cal-ranking-rm",
  storageBucket: "cal-ranking-rm.firebasestorage.app",
  messagingSenderId: "937306488262",
  appId: "1:937306488262:web:4428898ff1903d6ffd46c7",
  measurementId: "G-13CK76G4Q7"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// ===== สร้างปุ่ม Login UI =====
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
  if (auth.currentUser) {
    await signOut(auth);
  } else {
    await signInWithPopup(auth, provider);
  }
});

// ===== ตรวจสอบสถานะ Login =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginBtn.textContent = "Logout (" + user.displayName + ")";
  } else {
    loginBtn.textContent = "Sign in with Google";
  }
});