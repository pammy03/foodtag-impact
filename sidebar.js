// sidebar.js
function injectSidebar() {
  const sidebarHTML = `
    <aside class="w-64 bg-white border-r border-slate-200 flex flex-col p-6 shrink-0 z-10 h-full">
      <div class="mb-10 px-2">
        <img src="Impact_Logo.png" alt="IMPACT Logo" class="h-10 w-auto object-contain" onerror="this.style.display = 'none'" />
      </div>

      <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl mb-8 flex items-center gap-3">
        <div class="w-10 h-10 bg-[#003B71] rounded-full flex items-center justify-center text-white font-bold shrink-0">
          <span class="material-symbols-outlined text-lg">person</span>
        </div>
        <div class="overflow-hidden">
          <p id="sidebarProfileName" class="font-bold text-sm text-slate-800 truncate text-left">Admin_Siriprapa</p>
          <p id="sidebarProfileRole" class="text-[11px] font-medium text-slate-500 uppercase tracking-wider text-left">ADMIN</p>
        </div>
      </div>

      <nav class="space-y-2 flex-1">
        <a href="dashboard.html" id="nav-dashboard" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium transition-all">
          <span class="material-symbols-outlined">dashboard</span> Dashboard
        </a>
        <a href="menu-database.html" id="nav-menu-db" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium transition-all">
          <span class="material-symbols-outlined">database</span> Menus
        </a>
        <a href="ing-database.html" id="nav-ing-db" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium transition-all">
          <span class="material-symbols-outlined">category</span> Ingredients
        </a>
        <a href="bg-database.html" id="nav-bg-db" class="flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-lg font-medium transition-all">
          <span class="material-symbols-outlined">wallpaper</span> Backgrounds
        </a>
      </nav>
      
      <button onclick="handleLogout()" class="flex items-center gap-3 text-red-500 font-medium px-4 py-3 hover:bg-red-50 rounded-lg transition-all mt-auto border border-transparent hover:border-red-100">
        <span class="material-symbols-outlined">logout</span> Logout
      </button>
    </aside>
    `;

  const container = document.getElementById("sidebar-container");
  if (container) {
    container.innerHTML = sidebarHTML;

    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData) {
      document.getElementById("sidebarProfileName").innerText = userData.name;
      document.getElementById("sidebarProfileRole").innerText = userData.role;
    }

    const currentPage = window.location.pathname.split("/").pop();

    // 🎯 เพิ่ม nav-ing-db เข้ามาในลิสต์ที่จะต้องล้างสีด้วย
    const allLinks = [
      "nav-dashboard",
      "nav-menu-db",
      "nav-ing-db",
      "nav-bg-db",
    ];

    allLinks.forEach((id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.remove(
          "bg-[#006d4b]/10",
          "text-[#006d4b]",
          "font-semibold",
        );
        el.classList.add("text-slate-500", "font-medium");
      }
    });

    if (currentPage === "dashboard.html" || currentPage === "") {
      const el = document.getElementById("nav-dashboard");
      if (el) {
        el.classList.add("bg-[#006d4b]/10", "text-[#006d4b]", "font-semibold");
        el.classList.remove("text-slate-500");
      }
    } else if (currentPage === "menu-database.html") {
      const el = document.getElementById("nav-menu-db");
      if (el) {
        el.classList.add("bg-[#006d4b]/10", "text-[#006d4b]", "font-semibold");
        el.classList.remove("text-slate-500");
      }
    } else if (currentPage === "ing-database.html") {
      // 🎯 เพิ่มเงื่อนไขสำหรับหน้า Ingredients
      const el = document.getElementById("nav-ing-db");
      if (el) {
        el.classList.add("bg-[#006d4b]/10", "text-[#006d4b]", "font-semibold");
        el.classList.remove("text-slate-500");
      }
    } else if (currentPage === "bg-database.html") {
      const el = document.getElementById("nav-bg-db");
      if (el) {
        el.classList.add("bg-[#006d4b]/10", "text-[#006d4b]", "font-semibold");
        el.classList.remove("text-slate-500");
      }
    }
  }
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("userData");
    window.location.href = "index.html";
  }
}

document.addEventListener("DOMContentLoaded", injectSidebar);
