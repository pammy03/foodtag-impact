// font-manager.js

// 1. Google Fonts เบื้องต้นที่ระบบเตรียมไว้ให้ (รวมฟอนต์ไทยและอังกฤษยอดฮิต)
const PRELOADED_GOOGLE_FONTS = [
  // Thai Fonts
  "Kanit", "Prompt", "Sarabun", "Mali", "Niramit", 
  "Thasadith", "Chakra Petch", "Charm", "Chonburi", "Fahkwang",
  "Itim", "K2D", "Kodchasan", "KoHo", "Krub", 
  "Mitrmitr", "Pattaya", "Pridi", "Srisakdi", "Taviraj", "Trirong",
  
  // English Fonts
  "Roboto", "Open Sans", "Lato", "Montserrat", "Poppins", 
  "Inter", "Oswald", "Raleway", "Nunito", "Ubuntu", 
  "Playfair Display", "Merriweather", "PT Sans", "Rubik", "Lora"
];

// 2. การเชื่อมต่อกับ Supabase สำหรับจัดการฟอนต์
const fontSupabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co"; 
const fontSupabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5leHZvbXBkZXVicHBia3Zud29yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUyMTcxMjYsImV4cCI6MjA5MDc5MzEyNn0.2XT5VxRjPy_8h_M-b_vcoI9JYk8-zjzJXxhUq9hPg8U"; 

let fontSupabaseClient = null;

function getSupabase() {
  if (!fontSupabaseClient) {
    if (window.supabase) {
      fontSupabaseClient = window.supabase.createClient(fontSupabaseUrl, fontSupabaseKey);
    } else {
      console.error("Supabase script not found!");
    }
  }
  return fontSupabaseClient;
}

// 3. ฟังก์ชันดึงฟอนต์ที่อัปโหลดทั้งหมด
async function getCustomFontsFromDB() {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase.from('fonts').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching fonts from Supabase:", error);
    return [];
  }
}

// 4. บันทึกฟอนต์ที่อัปโหลด
async function saveCustomFontToDB(fontData) {
  // fontData = { name: "MyFont", type: "ttf", url: "..." }
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not initialized");

  const { data, error } = await supabase.from('fonts').insert([fontData]);
  if (error) throw error;
  return data;
}

// 5. ลบฟอนต์ที่อัปโหลด
async function deleteCustomFontFromDB(fontName) {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase not initialized");

  // ขั้นแรก: ดึง url ของฟอนต์มาเพื่อลบไฟล์ออกจาก Storage
  const { data: fontData, error: fetchError } = await supabase
    .from('fonts')
    .select('*')
    .eq('name', fontName)
    .single();

  if (fetchError) throw fetchError;

  if (fontData && fontData.url) {
    // Extract filename from URL (assuming format: .../font-files/filename.ext)
    const urlParts = fontData.url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    const { error: storageError } = await supabase
      .storage
      .from('font-files')
      .remove([fileName]);
      
    if (storageError) console.error("Failed to delete font from storage:", storageError);
  }

  // ขั้นที่สอง: ลบ record ออกจาก Table
  const { error: deleteError } = await supabase
    .from('fonts')
    .delete()
    .eq('name', fontName);

  if (deleteError) throw deleteError;
}

// 6. การ Inject ฟอนต์เข้าสู่หน้าเว็บ (ทั้ง Google Fonts และ Custom)
async function applyAllFontsToDocument() {
  // 6.1 Inject Google Fonts
  let googleLinkId = 'core-google-fonts';
  let googleLink = document.getElementById(googleLinkId);
  
  if (!googleLink) {
    googleLink = document.createElement('link');
    googleLink.id = googleLinkId;
    googleLink.rel = 'stylesheet';
    document.head.appendChild(googleLink);
  }
  
  const familyQuery = PRELOADED_GOOGLE_FONTS.map(f => `family=${encodeURIComponent(f)}`).join('&');
  googleLink.href = `https://fonts.googleapis.com/css2?${familyQuery}&display=swap`;

  // 6.2 Inject Custom Fonts from Supabase
  const customFonts = await getCustomFontsFromDB();
  let customStyleId = 'custom-uploaded-fonts';
  let customStyle = document.getElementById(customStyleId);

  if (!customStyle) {
    customStyle = document.createElement('style');
    customStyle.id = customStyleId;
    document.head.appendChild(customStyle);
  }

  let cssContent = "";
  customFonts.forEach(font => {
    const format = font.type === "otf" ? "opentype" : "truetype";
    cssContent += `
      @font-face {
        font-family: '${font.name}';
        src: url('${font.url}') format('${format}');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;
  });

  customStyle.innerHTML = cssContent;
}

// 7. ระบบ Searchable Dropdown สำหรับหน้าเว็บ (แทนที่ Select เดิม)
function initSearchableFontDropdowns() {
  const selects = document.querySelectorAll('select[id*="Font"], select[id*="font"]');
  if (selects.length === 0) return;

  // รวบรวมฟอนต์ทั้งหมด (Google Fonts + Custom)
  getCustomFontsFromDB().then(customFonts => {
    const allFonts = [
      { type: 'header', name: 'Custom Uploaded Fonts' },
      ...customFonts.map(f => ({ name: f.name, value: `'${f.name}', sans-serif`, isCustom: true })),
      { type: 'header', name: 'Google Fonts' },
      ...PRELOADED_GOOGLE_FONTS.map(f => ({ name: f, value: `'${f}', sans-serif`, isCustom: false }))
    ];

    selects.forEach(select => {
      // ซ่อน select เดิม
      select.style.display = 'none';

      // สร้าง container ใหม่
      const container = document.createElement('div');
      container.className = 'relative w-full font-search-dropdown-container';
      container.id = `searchable_container_${select.id}`;

      // อ่านค่าปัจจุบัน (ถ้ามี)
      let currentValue = select.value || '';
      let currentName = 'Select Font';
      if (currentValue) {
        const found = allFonts.find(f => f.value === currentValue);
        if (found) currentName = found.name;
        else currentName = currentValue.replace(/'/g, '').split(',')[0];
      }

      // สร้าง UI หลัก
      container.innerHTML = `
        <button type="button" class="w-full pl-3 pr-8 py-1 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#006d4b] text-[12px] text-slate-600 cursor-pointer flex justify-between items-center h-[34px]" onclick="toggleFontDropdown('${select.id}')">
          <span id="selected_text_${select.id}" class="truncate" style="font-family: ${currentValue}">${currentName}</span>
          <span class="material-symbols-outlined text-[14px] absolute right-2 pointer-events-none text-slate-400">expand_more</span>
        </button>
        <div id="dropdown_${select.id}" class="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl hidden flex-col max-h-[250px] overflow-hidden" style="min-width: 220px; top: 100%; left: 0;">
          <div class="p-2 border-b border-slate-100 shrink-0 relative bg-slate-50">
            <span class="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-[14px] pointer-events-none">search</span>
            <input type="text" id="search_${select.id}" class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#006d4b]" placeholder="Search font..." onkeyup="filterDropdownFonts('${select.id}', this.value)" onclick="event.stopPropagation()">
          </div>
          <div id="list_${select.id}" class="flex-1 overflow-y-auto custom-scroll p-1">
            <!-- Options will be injected here -->
          </div>
        </div>
      `;

      // ใส่เข้าไปหลัง select เดิม
      select.parentNode.insertBefore(container, select.nextSibling);

      // สร้างรายการฟอนต์
      const listContainer = container.querySelector(`#list_${select.id}`);
      let listHTML = '';
      allFonts.forEach(font => {
        if (font.type === 'header') {
          listHTML += `<div class="px-3 py-1.5 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">${font.name}</div>`;
        } else {
          listHTML += `
            <div class="px-3 py-2 text-[13px] hover:bg-emerald-50 cursor-pointer rounded-lg flex items-center gap-2 font-option-item transition-colors" data-name="${font.name.toLowerCase()}" onclick="selectFontOption('${select.id}', '${font.value.replace(/'/g, "\\'")}', '${font.name.replace(/'/g, "\\'")}')">
              <span style="font-family: ${font.value}" class="truncate">${font.name}</span>
            </div>
          `;
        }
      });
      listContainer.innerHTML = listHTML;
    });
  });

  // ปิด dropdown เมื่อคลิกที่อื่น
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.font-search-dropdown-container')) {
      document.querySelectorAll('[id^="dropdown_"]').forEach(el => el.classList.add('hidden'));
    }
  });
}

window.toggleFontDropdown = function(selectId) {
  const dropdown = document.getElementById(`dropdown_${selectId}`);
  const isHidden = dropdown.classList.contains('hidden');
  
  // ปิดอันอื่นก่อน
  document.querySelectorAll('[id^="dropdown_"]').forEach(el => el.classList.add('hidden'));
  
  if (isHidden) {
    dropdown.classList.remove('hidden');
    dropdown.classList.add('flex');
    const searchInput = document.getElementById(`search_${selectId}`);
    if(searchInput) setTimeout(() => searchInput.focus(), 50);
  } else {
    dropdown.classList.add('hidden');
    dropdown.classList.remove('flex');
  }
};

window.filterDropdownFonts = function(selectId, query) {
  const listContainer = document.getElementById(`list_${selectId}`);
  const items = listContainer.querySelectorAll('.font-option-item');
  const headers = listContainer.querySelectorAll('.text-slate-400');
  
  const q = query.toLowerCase();
  items.forEach(item => {
    if (item.getAttribute('data-name').includes(q)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
  
  // ซ่อน header ถ้าไม่มีลูกเลย (ทำง่ายๆ โดยไม่สนใจ header ก็ได้ เพื่อความรวดเร็ว)
};

window.selectFontOption = function(selectId, fontValue, fontName) {
  // Update UI
  const textSpan = document.getElementById(`selected_text_${selectId}`);
  textSpan.textContent = fontName;
  textSpan.style.fontFamily = fontValue;
  
  // Close dropdown
  document.getElementById(`dropdown_${selectId}`).classList.add('hidden');
  document.getElementById(`dropdown_${selectId}`).classList.remove('flex');
  
  // Update original select & trigger change
  const originalSelect = document.getElementById(selectId);
  
  // Check if option exists in select, if not add it
  let optionExists = false;
  Array.from(originalSelect.options).forEach(opt => {
    if (opt.value === fontValue) optionExists = true;
  });
  if (!optionExists) {
    const newOpt = document.createElement('option');
    newOpt.value = fontValue;
    newOpt.textContent = fontName;
    originalSelect.appendChild(newOpt);
  }
  
  originalSelect.value = fontValue;
  originalSelect.dispatchEvent(new Event('change'));
};

window.initGenericSearchableDropdowns = function() {
  const selects = document.querySelectorAll('select:not([id*="Font"]):not([id*="font"])');
  if (selects.length === 0) return;

  selects.forEach(select => {
    if (select.dataset.customDropdown) return;
    select.dataset.customDropdown = "true";

    select.style.display = 'none';

    const container = document.createElement('div');
    container.className = 'relative w-full generic-search-dropdown-container';
    container.id = `generic_searchable_container_${select.id}`;

    // Read initial style classes from the original select to match styling if needed
    const selectClasses = select.className.replace(/hidden|appearance-none|bg-image-.*|style-.*|pl-\d+|pr-\d+/g, '').trim();

    container.innerHTML = `
      <button type="button" class="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#006d4b] text-[12px] font-semibold text-slate-600 cursor-pointer flex justify-between items-center min-h-[34px]" onclick="toggleGenericDropdown('${select.id}')">
        <span id="generic_selected_text_${select.id}" class="truncate text-left flex-1"></span>
        <span class="material-symbols-outlined text-[14px] absolute right-2 pointer-events-none text-slate-400">expand_more</span>
      </button>
      <div id="generic_dropdown_${select.id}" class="absolute z-[100] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl hidden flex-col max-h-[250px] overflow-hidden" style="min-width: 220px; top: 100%; left: 0;">
        <div class="p-2 border-b border-slate-100 shrink-0 relative bg-slate-50">
          <span class="material-symbols-outlined absolute left-4 top-3.5 text-slate-400 text-[14px] pointer-events-none">search</span>
          <input type="text" id="generic_search_${select.id}" class="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-[#006d4b]" placeholder="Search..." onkeyup="filterGenericDropdown('${select.id}', this.value)" onclick="event.stopPropagation()">
        </div>
        <div id="generic_list_${select.id}" class="flex-1 overflow-y-auto custom-scroll p-1"></div>
      </div>
    `;

    select.parentNode.insertBefore(container, select.nextSibling);

    const updateOptions = () => {
      const listContainer = container.querySelector(`#generic_list_${select.id}`);
      let listHTML = '';
      let currentValue = select.value;
      let currentText = 'Select option';
      
      Array.from(select.options).forEach(opt => {
        const text = opt.textContent;
        const val = opt.value;
        if (val === currentValue || (currentValue === "" && opt.selected)) {
            currentText = text;
            currentValue = val;
        }
        
        listHTML += `
          <div class="px-3 py-2 text-[13px] hover:bg-emerald-50 cursor-pointer rounded-lg flex items-center gap-2 generic-option-item transition-colors" data-name="${text.toLowerCase()}" onclick="selectGenericOption('${select.id}', '${val.replace(/'/g, "\\'")}', '${text.replace(/'/g, "\\'")}')">
            <span class="truncate">${text}</span>
          </div>
        `;
      });
      listContainer.innerHTML = listHTML;
      
      const textSpan = document.getElementById(`generic_selected_text_${select.id}`);
      if (textSpan) textSpan.textContent = currentText;
    };

    updateOptions();

    const observer = new MutationObserver(() => updateOptions());
    observer.observe(select, { childList: true });

    select.addEventListener('change', () => {
        const selectedOpt = select.options[select.selectedIndex];
        if (selectedOpt) {
            const textSpan = document.getElementById(`generic_selected_text_${select.id}`);
            if (textSpan) textSpan.textContent = selectedOpt.textContent;
        }
    });
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.generic-search-dropdown-container')) {
      document.querySelectorAll('[id^="generic_dropdown_"]').forEach(el => el.classList.add('hidden'));
    }
  });
};

window.toggleGenericDropdown = function(selectId) {
  const dropdown = document.getElementById(`generic_dropdown_${selectId}`);
  const isHidden = dropdown.classList.contains('hidden');
  
  document.querySelectorAll('[id^="generic_dropdown_"]').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('[id^="dropdown_"]').forEach(el => el.classList.add('hidden'));
  
  if (isHidden) {
    dropdown.classList.remove('hidden');
    dropdown.classList.add('flex');
    const searchInput = document.getElementById(`generic_search_${selectId}`);
    if(searchInput) {
        searchInput.value = '';
        filterGenericDropdown(selectId, '');
        setTimeout(() => searchInput.focus(), 50);
    }
  } else {
    dropdown.classList.add('hidden');
    dropdown.classList.remove('flex');
  }
};

window.filterGenericDropdown = function(selectId, query) {
  const listContainer = document.getElementById(`generic_list_${selectId}`);
  const items = listContainer.querySelectorAll('.generic-option-item');
  const q = query.toLowerCase();
  items.forEach(item => {
    if (item.getAttribute('data-name').includes(q)) {
      item.style.display = 'flex';
    } else {
      item.style.display = 'none';
    }
  });
};

window.selectGenericOption = function(selectId, val, text) {
  const textSpan = document.getElementById(`generic_selected_text_${selectId}`);
  if (textSpan) textSpan.textContent = text;
  
  const dropdown = document.getElementById(`generic_dropdown_${selectId}`);
  if (dropdown) {
      dropdown.classList.add('hidden');
      dropdown.classList.remove('flex');
  }
  
  const originalSelect = document.getElementById(selectId);
  if (originalSelect) {
      originalSelect.value = val;
      originalSelect.dispatchEvent(new Event('change'));
  }
};

window.syncGenericDropdowns = function() {
    document.querySelectorAll('select:not([id*="Font"]):not([id*="font"])').forEach(select => {
        const textSpan = document.getElementById(`generic_selected_text_${select.id}`);
        if (textSpan && select.options.length > 0) {
            const selectedOpt = select.options[select.selectedIndex];
            if (selectedOpt) textSpan.textContent = selectedOpt.textContent;
        }
    });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    applyAllFontsToDocument();
    initSearchableFontDropdowns();
    setTimeout(initGenericSearchableDropdowns, 500);
  });
} else {
  applyAllFontsToDocument();
  initSearchableFontDropdowns();
  setTimeout(initGenericSearchableDropdowns, 500);
}
