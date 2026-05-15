// sidebar.js
function injectSidebar() {
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  // 1. เมนูพื้นฐาน (เปลี่ยนชื่อเป็น Saved Tags ตามที่ต้องการ)
  let navItems = `
    <a href="dashboard.html" id="nav-dashboard" class="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-semibold text-base transition-all">
      <span class="material-symbols-outlined text-[24px]">dashboard</span> Saved Tags
    </a>
  `;

  // 2. เมนูสำหรับ Admin และ Super Admin
  if (userData.role === "Admin" || userData.role === "Super Admin") {
    navItems += `
      <a href="menu-database.html" id="nav-menu-db" class="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-semibold text-base transition-all">
        <span class="material-symbols-outlined text-[24px]">database</span> Menus
      </a>
      <a href="ing-database.html" id="nav-ing-db" class="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-semibold text-base transition-all">
        <span class="material-symbols-outlined text-[24px]">category</span> Ingredients
      </a>
      <a href="bg-database.html" id="nav-bg-db" class="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-semibold text-base transition-all">
        <span class="material-symbols-outlined text-[24px]">wallpaper</span> Backgrounds
      </a>
    `;
  }

  // 3. เมนูพิเศษ สำหรับ Super Admin
  if (userData.role === "Super Admin") {
    navItems += `
      <hr class="my-3 border-slate-200">
      <a href="logs.html" id="nav-logs" class="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-semibold text-base transition-all">
        <span class="material-symbols-outlined text-[24px]">history</span> Activity Logs
      </a>
      <a href="users-management.html" id="nav-users" class="flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-semibold text-base transition-all">
        <span class="material-symbols-outlined text-[24px]">manage_accounts</span> Manage Users
      </a>
    `;
  }

  const sidebarHTML = `
    <aside class="w-72 bg-white border-r border-slate-200 flex flex-col p-6 shrink-0 z-10 h-full shadow-sm overflow-y-auto overflow-x-hidden">
      <div class="text-center shrink-0 mb-8 mt-2">
        <img src="images/Impact_Logo.png" alt="IMPACT Logo" class="h-10 mx-auto object-contain" onerror="this.parentNode.style.display = 'none'" />
      </div>

      <div class="bg-slate-50 border border-slate-100 p-5 rounded-2xl mb-8 flex items-center gap-4">
        <div class="w-12 h-12 bg-[#003B71] rounded-full flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
          <span class="material-symbols-outlined text-2xl">person</span>
        </div>
        <div class="overflow-hidden">
          <p id="sidebarProfileName" class="font-bold text-base text-slate-800 truncate text-left">${userData.name}</p>
          <p id="sidebarProfileRole" class="text-[12px] font-bold text-[#006d4b] uppercase tracking-widest text-left bg-emerald-50 inline-block px-3 py-1 rounded-full mt-1 border border-emerald-100">${userData.role}</p>
        </div>
      </div>

      <nav class="space-y-1.5 flex-1" id="nav-wrapper">
        ${navItems}
      </nav>
      
      <div class="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-6">
        <button onclick="showMyProfileModal()" class="flex items-center gap-3 text-slate-700 font-bold px-4 py-4 hover:bg-slate-50 rounded-xl transition-all w-full text-left text-base">
          <span class="material-symbols-outlined text-[#006d4b] text-[24px]">manage_accounts</span> บัญชีของฉัน
        </button>

        <button onclick="showLogoutModal()" class="flex items-center gap-3 text-red-500 font-bold px-4 py-4 hover:bg-red-50 rounded-xl transition-all w-full text-left text-base">
          <span class="material-symbols-outlined text-[24px]">logout</span> ออกจากระบบ
        </button>
      </div>
    </aside>
  `;

  const container = document.getElementById("sidebar-container");
  if (container) {
    container.innerHTML = sidebarHTML;

    // --- 🎯 Logic สำหรับปุ่มเขียว (Active Menu) ---
    const currentPage = window.location.pathname.split("/").pop();
    const menuMapping = {
      "dashboard.html": "nav-dashboard",
      "menu-database.html": "nav-menu-db",
      "ing-database.html": "nav-ing-db",
      "bg-database.html": "nav-bg-db",
      "logs.html": "nav-logs",
      "users-management.html": "nav-users",
    };

    const activeId =
      menuMapping[currentPage] || (currentPage === "" ? "nav-dashboard" : null);

    if (activeId) {
      const activeEl = document.getElementById(activeId);
      if (activeEl) {
        activeEl.classList.remove("text-slate-500");
        activeEl.classList.add("bg-emerald-50", "text-[#006d4b]");
      }
    }
  }

  // --- 🎯 สร้าง Modal บัญชีของฉัน (My Profile) ---
  if (!document.getElementById("myProfileModal")) {
    const profileModalHTML = `
      <div id="myProfileModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
        <div class="bg-white rounded-[40px] shadow-2xl w-[380px] p-8 transform scale-95 transition-transform duration-300 flex flex-col relative" id="myProfileModalContent">
          <button onclick="closeMyProfileModal()" class="absolute top-5 right-5 w-10 h-10 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-all">
            <span class="material-symbols-outlined text-2xl">close</span>
          </button>
          
          <div class="flex items-center gap-5 mb-6 pb-6 border-b border-slate-100">
            <div class="w-16 h-16 bg-[#003B71] rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-[#003B71]/20">
              <span class="material-symbols-outlined text-4xl">person</span>
            </div>
            <div>
              <h3 class="text-xl font-black text-slate-800 tracking-tight leading-tight">${userData.name}</h3>
              <p class="text-[12px] font-bold text-slate-400 mt-0.5">Employee ID: ${userData.emp_id}</p>
            </div>
          </div>

          <form id="profileForm" onsubmit="saveMyProfile(event)" class="space-y-6">
            <div class="bg-[#f8fafc] p-5 rounded-3xl border-2 border-slate-200 transition-all" id="currentPassWrapper">
              <label class="block text-[16px] font-black text-slate-800 mb-3 ml-1">ยืนยันรหัสผ่านปัจจุบันเพื่อแก้ไข</label>
              <div class="flex flex-col gap-3">
                <div class="relative flex-1">
                  <input id="prof_current_password" 
                    class="w-full px-5 py-3.5 bg-white border border-slate-300 rounded-2xl focus:ring-4 focus:ring-[#003B71]/10 outline-none text-base font-bold shadow-sm placeholder:font-medium placeholder:text-slate-300 pr-14" 
                    placeholder="Current Password..." type="password" />
                  <button type="button" onclick="togglePasswordVisibility('prof_current_password', 'eye_icon_curr')" class="absolute right-4 top-3 text-slate-400">
                    <span id="eye_icon_curr" class="material-symbols-outlined text-2xl">visibility_off</span>
                  </button>
                </div>
                <button type="button" id="btnVerifyPass" onclick="manualVerifyPassword()" class="w-full py-3.5 bg-[#003B71] text-white rounded-2xl font-black hover:bg-slate-800 transition-all text-sm shadow-md">
                  Verify Now
                </button>
              </div>
            </div>

            <div id="lockedSection" class="opacity-30 pointer-events-none transition-all duration-500 space-y-5">
                <div>
                  <label class="block text-[16px] font-black text-slate-800 mb-2 ml-1">เปลี่ยนรหัสผ่านใหม่</label>
                  <div class="relative">
                    <input id="prof_password" class="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none text-sm font-semibold pr-14" placeholder="เว้นว่างไว้ถ้าไม่เปลี่ยน" type="password" />
                    <button type="button" onclick="togglePasswordVisibility('prof_password', 'eye_icon_new')" class="absolute right-4 top-3 text-slate-400">
                      <span id="eye_icon_new" class="material-symbols-outlined text-2xl">visibility_off</span>
                    </button>
                  </div>
                </div>
                
                <div>
                  <label class="block text-[16px] font-black text-[#006d4b] mb-2 ml-1">ตั้งรหัส PIN 4 หลัก (กู้รหัสผ่าน)</label>
                  <input id="prof_pin" class="w-full px-5 py-3.5 bg-[#f0fdf4] border border-[#006d4b]/30 rounded-2xl outline-none text-xl tracking-[0.5em] font-black text-center shadow-inner" placeholder="0000" type="password" maxlength="4" />
                </div>
            </div>
            
            <p id="profMessage" class="text-sm text-center font-black hidden py-3 rounded-2xl mt-2"></p>
            
            <div class="pt-2">
              <button type="submit" id="profSaveBtn" disabled class="w-full bg-slate-300 text-white font-black py-4 rounded-2xl transition-all flex items-center justify-center space-x-2 cursor-not-allowed text-base">
                <span id="profBtnText" class="text-[16px] font-black">บันทึกข้อมูลส่วนตัว</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", profileModalHTML);
  }

  // --- 🎯 สร้าง Modal Logout ---
  if (!document.getElementById("customLogoutModal")) {
    const logoutModalHTML = `
      <div id="customLogoutModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[99999] hidden flex items-center justify-center opacity-0 transition-opacity duration-300">
        <div class="bg-white rounded-[40px] shadow-2xl w-[420px] p-10 transform scale-95 transition-transform duration-300 flex flex-col items-center text-center" id="logoutModalContent">
          <div class="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6 border-4 border-white shadow-inner">
            <span class="material-symbols-outlined text-4xl font-bold">logout</span>
          </div>
          <h3 class="text-2xl font-black text-slate-800 mb-3">ออกจากระบบ?</h3>
          <p class="text-base text-slate-500 mb-10 font-medium px-4">คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบในขณะนี้?</p>
          <div class="flex gap-4 w-full">
            <button onclick="closeLogoutModal()" class="flex-1 py-4 border-2 border-slate-100 text-slate-500 font-black rounded-2xl hover:bg-slate-50 transition-colors text-base">ยกเลิก</button>
            <button onclick="confirmLogout()" class="flex-1 py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-600 shadow-xl shadow-red-200 transition-all text-base">ยืนยัน</button>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML("beforeend", logoutModalHTML);
  }
}

/* ===== 🎯 ฟังก์ชันช่วยเหลือต่างๆ ===== */
function togglePasswordVisibility(inputId, iconId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(iconId);
  if (input.type === "password") {
    input.type = "text";
    icon.innerText = "visibility";
    icon.classList.replace("text-slate-400", "text-[#003B71]");
  } else {
    input.type = "password";
    icon.innerText = "visibility_off";
    icon.classList.replace("text-[#003B71]", "text-slate-400");
  }
}

function manualVerifyPassword() {
  const userData = JSON.parse(localStorage.getItem("userData"));
  const inputVal = document.getElementById("prof_current_password").value;
  const wrapper = document.getElementById("currentPassWrapper");
  const btnVerify = document.getElementById("btnVerifyPass");
  const lockedSection = document.getElementById("lockedSection");
  const saveBtn = document.getElementById("profSaveBtn");
  const msg = document.getElementById("profMessage");

  if (inputVal === userData.password) {
    wrapper.classList.replace("border-slate-200", "border-emerald-400");
    wrapper.classList.replace("bg-[#f8fafc]", "bg-emerald-50");
    btnVerify.innerText = "Verified ✅";
    btnVerify.classList.replace("bg-[#003B71]", "bg-emerald-500");
    btnVerify.disabled = true;
    document.getElementById("prof_current_password").disabled = true;
    lockedSection.classList.remove("opacity-30", "pointer-events-none");
    saveBtn.disabled = false;
    saveBtn.classList.replace("bg-slate-300", "bg-[#006d4b]");
    saveBtn.classList.add("shadow-lg", "hover:bg-[#005a3d]");
    saveBtn.classList.remove("cursor-not-allowed");
    msg.classList.add("hidden");
  } else {
    msg.innerText = "❌ รหัสผ่านปัจจุบันไม่ถูกต้อง!";
    msg.className =
      "text-sm text-center font-black py-3 rounded-2xl mt-2 bg-red-50 text-red-500";
    msg.classList.remove("hidden");
    wrapper.classList.add("animate-pulse");
    setTimeout(() => wrapper.classList.remove("animate-pulse"), 500);
  }
}

function showLogoutModal() {
  const modal = document.getElementById("customLogoutModal");
  const content = document.getElementById("logoutModalContent");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    content.classList.remove("scale-95");
  }, 10);
}

function closeLogoutModal() {
  const modal = document.getElementById("customLogoutModal");
  const content = document.getElementById("logoutModalContent");
  modal.classList.add("opacity-0");
  content.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

function confirmLogout() {
  localStorage.removeItem("userData");
  window.location.href = "index.html";
}

function showMyProfileModal() {
  document.getElementById("profileForm").reset();
  const btnVerify = document.getElementById("btnVerifyPass");
  btnVerify.innerText = "Verify Now";
  btnVerify.classList.replace("bg-emerald-500", "bg-[#003B71]");
  btnVerify.disabled = false;
  const currentPassField = document.getElementById("prof_current_password");
  currentPassField.disabled = false;
  currentPassField.type = "password";
  document.getElementById("eye_icon_curr").innerText = "visibility_off";

  const wrapper = document.getElementById("currentPassWrapper");
  wrapper.classList.add("border-slate-200", "bg-[#f8fafc]");
  wrapper.classList.remove("border-emerald-400", "bg-emerald-50");

  const lockedSection = document.getElementById("lockedSection");
  lockedSection.classList.add("opacity-30", "pointer-events-none");

  const saveBtn = document.getElementById("profSaveBtn");
  saveBtn.disabled = true;
  saveBtn.classList.replace("bg-[#006d4b]", "bg-slate-300");
  saveBtn.classList.add("cursor-not-allowed");

  document.getElementById("profMessage").classList.add("hidden");

  const modal = document.getElementById("myProfileModal");
  const content = document.getElementById("myProfileModalContent");
  modal.classList.remove("hidden");
  setTimeout(() => {
    modal.classList.remove("opacity-0");
    content.classList.remove("scale-95");
  }, 10);
}

function closeMyProfileModal() {
  const modal = document.getElementById("myProfileModal");
  const content = document.getElementById("myProfileModalContent");
  modal.classList.add("opacity-0");
  content.classList.add("scale-95");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300);
}

async function saveMyProfile(e) {
  e.preventDefault();
  const userData = JSON.parse(localStorage.getItem("userData"));
  const newPassword = document.getElementById("prof_password").value;
  const newPin = document.getElementById("prof_pin").value.trim();
  const msg = document.getElementById("profMessage");
  const btnText = document.getElementById("profBtnText");
  msg.classList.add("hidden");
  btnText.innerText = "กำลังบันทึก...";

  try {
    if (newPin && newPin.length !== 4) throw new Error("PIN ต้องมี 4 หลัก");
    let updates = {};
    if (newPassword) updates.password = newPassword;
    if (newPin) updates.recovery_pin = newPin;

    if (Object.keys(updates).length === 0)
      throw new Error("ไม่มีการเปลี่ยนแปลงข้อมูล");

    const supabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co";
    const supabaseKey = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI";
    const dbClient = window.supabase
      ? window.supabase.createClient(supabaseUrl, supabaseKey)
      : null;

    const { error } = await dbClient
      .from("users")
      .update(updates)
      .eq("id", userData.id);
    if (error) throw new Error("เกิดข้อผิดพลาดในการบันทึก");

    const updatedUser = { ...userData, ...updates };
    localStorage.setItem("userData", JSON.stringify(updatedUser));
    msg.innerText = "✅ บันทึกข้อมูลสำเร็จ!";
    msg.className =
      "text-sm text-center font-black py-3 rounded-2xl mt-2 bg-emerald-50 text-[#006d4b]";
    msg.classList.remove("hidden");
    setTimeout(() => {
      closeMyProfileModal();
    }, 1500);
  } catch (err) {
    msg.innerText = "❌ " + err.message;
    msg.className =
      "text-sm text-center font-black py-3 rounded-2xl mt-2 bg-red-50 text-red-500";
    msg.classList.remove("hidden");
  } finally {
    btnText.innerText = "บันทึกข้อมูลส่วนตัว";
  }
}

// เริ่มต้นการทำงาน
if (document.getElementById("sidebar-container")) {
  injectSidebar();
} else {
  document.addEventListener("DOMContentLoaded", injectSidebar);
}
