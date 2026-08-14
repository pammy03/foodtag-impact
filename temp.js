






      const checkUser = JSON.parse(localStorage.getItem("userData"));
      if (!checkUser) {
        window.location.href = "dashboard.html";
      }

      const supabaseUrl = "https://nexvompdeubppbkvnwor.supabase.co";
      const supabaseKey = "sb_publishable_cMshOGrGdX829-KmtIxOWw_HeC04-aI";
      const dbClient = supabase.createClient(supabaseUrl, supabaseKey);

      let activeSlot = 1;
      let slotsData = {};
      let isInitialLoading = false;
      let selectedPaperSize = "A4";
      let isDraftStatus = true;
      let currentPage = 1;
      let totalPages = 1;

      const TEMPLATE_CONFIGS = {
        plate: {
          name: "Plate / Food Stall",
          orientation: "landscape",
          slots_count: 2,
          grid_class: "grid-plate",
          hide_allergies: false,
        },
        western: {
          name: "Western Set",
          orientation: "portrait",
          slots_count: 4,
          grid_class: "grid-western",
          hide_allergies: false,
        },
        buffet: {
          name: "Buffet / Coffee Break",
          orientation: "landscape",
          slots_count: 4,
          grid_class: "grid-buffet",
          hide_allergies: false,
        },
        mini: {
          name: "Mini Tag",
          orientation: "landscape",
          slots_count: 6,
          grid_class: "grid-mini",
          hide_allergies: false,
        },
      };

      const TEMPLATE_NAME_TO_KEY = {
        "Plate / Food Stall": "plate",
        "Western Set": "western",
        "Buffet / Coffee Break": "buffet",
        "Mini Tag": "mini",
      };

      function handleTemplateSelect(value) {
        if (!value) return;
        setActiveRadioCard(value);
        applyTemplate(TEMPLATE_CONFIGS[value], null);
      }

      function syncTemplateDropdown(templateName) {
        const key = TEMPLATE_NAME_TO_KEY[templateName];
        if (!key) return;
        setActiveRadioCard(key);
      }

      function setActiveRadioCard(key) {
        document.querySelectorAll(".radio-card").forEach((el) => {
          el.classList.remove("border-2", "border-[#006d4b]", "bg-[#f0fdf4]");
          el.classList.add("border", "border-slate-200", "bg-white");
        });
        const active = document.getElementById(`radio-card-${key}`);
        if (active) {
          active.classList.remove("border", "border-slate-200", "bg-white");
          active.classList.add("border-2", "border-[#006d4b]", "bg-[#f0fdf4]");
          const radio = active.querySelector("input[type=radio]");
          if (radio) radio.checked = true;
        }
      }

      function toggleStatus() {
        isDraftStatus = !isDraftStatus;
        updateStatusUI();
      }

      function updateStatusUI() {
        const label = document.getElementById("statusLabel");
        const bg = document.getElementById("statusToggleBg");
        const knob = document.getElementById("statusToggleKnob");

        if (!isDraftStatus) {
          label.innerHTML = `Status: <span class="text-[#006d4b]">Ready</span>`;
          bg.classList.remove("bg-amber-400");
          bg.classList.add("bg-[#006d4b]");
          knob.classList.remove("translate-x-1");
          knob.classList.add("translate-x-7");
        } else {
          label.innerHTML = `Status: <span class="text-amber-500">Draft</span>`;
          bg.classList.remove("bg-[#006d4b]");
          bg.classList.add("bg-amber-400");
          knob.classList.remove("translate-x-7");
          knob.classList.add("translate-x-1");
        }
      }

      function setPaperSize(size) {
        selectedPaperSize = size;
        const btnA4 = document.getElementById("btn-A4");
        const btnA3 = document.getElementById("btn-A3");

        if (size === "A4") {
          btnA4.className =
            "flex-1 py-2.5 border-2 border-[#006d4b] bg-[#f0fdf4] text-[#006d4b] font-bold rounded-lg transition-all shadow-sm";
          btnA3.className =
            "flex-1 py-2.5 border-2 border-slate-200 bg-white text-slate-500 font-bold rounded-lg hover:border-slate-300 transition-all shadow-sm";
        } else {
          btnA3.className =
            "flex-1 py-2.5 border-2 border-[#006d4b] bg-[#f0fdf4] text-[#006d4b] font-bold rounded-lg transition-all shadow-sm";
          btnA4.className =
            "flex-1 py-2.5 border-2 border-slate-200 bg-white text-slate-500 font-bold rounded-lg hover:border-slate-300 transition-all shadow-sm";
        }

        document.getElementById("previewPaperText").innerText = size + " Paper";
        resizePaper();
      }

      window.onload = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        let editId = urlParams.get("edit");
        
        if (!editId) {
          editId = localStorage.getItem("currentEditId");
        }

        if (editId) {
          isInitialLoading = true;
          document.getElementById("pageTitle").innerText = "Edit Profile";
          document.getElementById("saveButtonText").innerText = "Save Profile";

          let tagToEdit = null;
          try {
            const { data, error } = await dbClient.from('saved_tags').select('*').eq('id', editId).single();
            if (!error && data) {
              tagToEdit = {
                id: data.id,
                title: data.title,
                templateName: data.template_name,
                paperSize: data.paper_size,
                createdAt: data.created_at,
                createdBy: data.created_by,
                status: data.status,
                slotsData: data.slots_data || {}
              };
            }
          } catch (err) {
            console.error("Error fetching tag:", err);
          }

          if (tagToEdit) {
            document.getElementById("profileName").value = tagToEdit.title;
            slotsData = tagToEdit.slotsData || {};
            
            if (slotsData.__pageConfigs) {
               for (const p in slotsData.__pageConfigs) {
                  const tName = slotsData.__pageConfigs[p];
                  pageConfigs[p] = TEMPLATE_CONFIGS[TEMPLATE_NAME_TO_KEY[tName]];
               }
               delete slotsData.__pageConfigs;
            } else {
               pageConfigs[1] = TEMPLATE_CONFIGS[TEMPLATE_NAME_TO_KEY[tagToEdit.templateName]];
            }

            if (tagToEdit.status === "Ready") {
              isDraftStatus = false;
            } else {
              isDraftStatus = true;
            }
            updateStatusUI();

            if (tagToEdit.paperSize) {
              setPaperSize(tagToEdit.paperSize);
            } else {
              setPaperSize("A4");
            }

            const config = pageConfigs[1] || TEMPLATE_CONFIGS[TEMPLATE_NAME_TO_KEY[tagToEdit.templateName]];
            console.log("Loading edit config:", config, tagToEdit);
            if (config) {
              await applyTemplate(config, null);
              syncTemplateDropdown(config.name);

              console.log("Slots data after applyTemplate:", slotsData);

              const slotsKeys = Object.keys(slotsData).map(Number).filter(k => !isNaN(k));
              const maxSlot = slotsKeys.length > 0 ? Math.max(...slotsKeys) : 0;
              
              for (let i = 1; i <= maxSlot; i++) {
                const slotDiv = document.getElementById(`slot-${i}`);
                if (slotDiv) {
                  const wrapper = slotDiv.querySelector("div:last-child");
                  const menu = slotsData[i] || {};
                  renderSlotContent(wrapper, menu, i);
                }
              }
              if (slotsData[1]) {
                 console.log("Updating inputs with slotsData[1]:", slotsData[1]);
                 updateInputs(slotsData[1]);
              } else {
                 console.log("No slotsData[1] found!");
              }
              resizePaper();
            }
          }
          isInitialLoading = false;
        } else {
          setPaperSize("A4");
          updateStatusUI();
          applyTemplate(TEMPLATE_CONFIGS["buffet"], null);
          syncTemplateDropdown("Buffet / Coffee Break");
        }
      };

      function resizePaper() {
        const container = document.getElementById("paperContainer");
        const papers = document.querySelectorAll(".a4-paper");
        if (!container || papers.length === 0 || !currentTemplateConfig.orientation) return;
        const cWidth = container.clientWidth - 40;
        const cHeight = container.clientHeight - 40;

        let pWidth, pHeight;
        if (selectedPaperSize === "A3") {
          pWidth =
            currentTemplateConfig.orientation === "landscape" ? 1587 : 1123;
          pHeight =
            currentTemplateConfig.orientation === "landscape" ? 1123 : 1587;
        } else {
          pWidth =
            currentTemplateConfig.orientation === "landscape" ? 1123 : 794;
          pHeight =
            currentTemplateConfig.orientation === "landscape" ? 794 : 1123;
        }

        let style = document.getElementById("dynamicPrintStyle");
        if (!style) {
          style = document.createElement("style");
          style.id = "dynamicPrintStyle";
          document.head.appendChild(style);
        }
        style.innerHTML = `@media print { @page { size: ${selectedPaperSize} ${currentTemplateConfig.orientation}; margin: 0; } }`;

        const scale = Math.min(cWidth / pWidth, cHeight / pHeight);
        
        papers.forEach(paper => {
          paper.style.width = `${pWidth}px`;
          paper.style.height = `${pHeight}px`;
          paper.style.transform = `scale(${scale})`;

          if (currentTemplateConfig.orientation === "landscape") {
            paper.classList.add("landscape");
            paper.classList.remove("portrait");
          } else {
            paper.classList.add("portrait");
            paper.classList.remove("landscape");
          }
        });
      }

      let currentTemplateConfig = {};
      let pageConfigs = {};

      window.addEventListener("resize", resizePaper);

      function applyTemplate(temp, btnElement) {
        if (!pageConfigs[currentPage]) {
          pageConfigs[currentPage] = temp;
        }
        
        // If clicking a template button on the left panel
        if (btnElement || temp !== pageConfigs[currentPage]) {
          pageConfigs[currentPage] = temp;
        }
        
        currentTemplateConfig = pageConfigs[currentPage];
        let startSlot = 1;
        for (let p = 1; p < currentPage; p++) {
           startSlot += pageConfigs[p].slots_count;
        }
        activeSlot = startSlot;

        return loadBackgrounds(temp.name).then(() => {
          setupGridStructure();
          renderSlotControls(temp.slots_count);
          setTimeout(resizePaper, 50);
        });
      }

      function setupGridStructure() {
        const container = document.getElementById("paperContainer");
        if (!container) return;

        // Ensure pageConfigs is populated up to totalPages
        if (Object.keys(pageConfigs).length === 0) {
           pageConfigs[1] = currentTemplateConfig || TEMPLATE_CONFIGS["buffet"];
        }

        // If loading from DB, calculate totalPages based on maxSlot and pageConfigs
        if (isInitialLoading) {
          const slotsKeys = Object.keys(slotsData).map(Number).filter(k => !isNaN(k));
          const maxSlot = slotsKeys.length > 0 ? Math.max(...slotsKeys) : 0;
          
          let p = 1;
          let currentMax = 0;
          while (currentMax < maxSlot || p === 1) {
            if (!pageConfigs[p]) pageConfigs[p] = pageConfigs[p-1] || TEMPLATE_CONFIGS["buffet"];
            currentMax += pageConfigs[p].slots_count;
            p++;
          }
          totalPages = Math.max(1, p - 1);
        }

        if (currentPage > totalPages) currentPage = totalPages;
        
        currentTemplateConfig = pageConfigs[currentPage] || TEMPLATE_CONFIGS["buffet"];
        document.getElementById("allergenSection").style.display =
          currentTemplateConfig.hide_allergies ? "none" : "block";
        
        container.innerHTML = "";

        let globalStartSlot = 1;
        
        for (let p = 1; p <= totalPages; p++) {
          if (!pageConfigs[p]) {
             pageConfigs[p] = pageConfigs[p-1] || TEMPLATE_CONFIGS["buffet"];
          }
          const config = pageConfigs[p];

          const paper = document.createElement("div");
          paper.className = `a4-paper print-page ${p === currentPage ? 'active-page' : 'hidden-page'}`;
          paper.id = `paper-page-${p}`;

          const innerGrid = document.createElement("div");
          innerGrid.className = `inner-grid ${config.grid_class}`;
          innerGrid.id = `innerGrid-page-${p}`;

          const startSlot = globalStartSlot;
          const endSlot = globalStartSlot + config.slots_count - 1;

          for (let i = startSlot; i <= endSlot; i++) {
            const div = document.createElement("div");
            div.id = `slot-${i}`;
            div.className = `slot cursor-pointer ${i === activeSlot ? "active" : ""}`;
            div.onclick = () => selectSlot(i);
            
            const indicator = document.createElement("div");
            indicator.className = `absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded print:hidden z-20 transition-colors hidden-on-export ${i === activeSlot ? "bg-[#006d4b] text-white shadow-sm" : "bg-slate-100 text-slate-400"}`;
            
            const relativeSlot = i - startSlot + 1;
            indicator.innerText = i === activeSlot ? `Slot ${relativeSlot} (Editing...)` : `Slot ${relativeSlot}`;
            div.appendChild(indicator);

            const contentWrapper = document.createElement("div");
            contentWrapper.className =
              "w-full h-full flex flex-col items-center justify-center relative z-10 p-4";
            div.appendChild(contentWrapper);
            innerGrid.appendChild(div);

            if (!slotsData[i]) {
              slotsData[i] = { bgUrl: "" };
            } else if (!slotsData[i].bgUrl) {
              slotsData[i].bgUrl = "";
            }

            renderSlotContent(contentWrapper, slotsData[i], i);
          }

          globalStartSlot = endSlot + 1;
          
          paper.appendChild(innerGrid);
          container.appendChild(paper);
        }

        syncBgSelectWithCurrentSlot();
        if (typeof updatePaginationUI === 'function') updatePaginationUI();
      }

      function getBaseIconSize() {
        const icon = document.querySelector(
          `#slot-${activeSlot} .allergen-icon`,
        );
        if (icon && icon.clientWidth > 0) {
          return Math.round(icon.clientWidth);
        }
        return 61;
      }

      function changeAllergenIconSize(type, delta) {
        const baseSize = getBaseIconSize();

        let currentSize;
        if (type === "main") {
          currentSize = slotsData[activeSlot]?.allergenIconSizeMain;
        } else {
          currentSize = slotsData[activeSlot]?.allergenIconSizeContain;
        }
        if (!currentSize) currentSize = baseSize;

        currentSize += delta;
        if (currentSize < 15) currentSize = 15;
        if (currentSize > 200) currentSize = 200;

        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        if (type === "main") {
          slotsData[activeSlot].allergenIconSizeMain = currentSize;
        } else {
          slotsData[activeSlot].allergenIconSizeContain = currentSize;
        }
        
        renderActiveSlotOnly();

        updateInputs(slotsData[activeSlot] || {});
      }

      function resetAllergenIconSize(type) {
        if (slotsData[activeSlot]) {
          if (type === "main") {
            slotsData[activeSlot].allergenIconSizeMain = null;
          } else {
            slotsData[activeSlot].allergenIconSizeContain = null;
          }
          renderActiveSlotOnly();
        }

        updateInputs(slotsData[activeSlot] || {});
      }

      function sortMeatsFirst(arr) {
        if (!arr || !Array.isArray(arr)) return [];
        const meatKeywords = ["หมู", "ไก่", "เนื้อ", "ปลา", "กุ้ง", "หอย", "ปู", "เป็ด", "pork", "chicken", "beef", "duck", "fish", "shrimp", "crab", "squid", "seafood", "meat", "salmon", "tuna"];
        return [...arr].sort((a, b) => {
          const aName = ((a.name_th || "") + (a.name_en || "")).toLowerCase();
          const bName = ((b.name_th || "") + (b.name_en || "")).toLowerCase();
          const aIsMeat = meatKeywords.some(kw => aName.includes(kw));
          const bIsMeat = meatKeywords.some(kw => bName.includes(kw));
          if (aIsMeat && !bIsMeat) return -1;
          if (!aIsMeat && bIsMeat) return 1;
          return 0;
        });
      }

      function renderSlotContent(element, menu, index) {
        const showAllergies = !currentTemplateConfig.hide_allergies;
        let slotBgUrl = menu.bgUrl || "";
        if (!slotBgUrl && currentTemplateConfig && currentTemplateConfig.id) {
          slotBgUrl = localStorage.getItem("defaultBg_" + currentTemplateConfig.id) || "";
        }
        const bgHtml = slotBgUrl
          ? `<img src="${slotBgUrl}" class="slot-bg">`
          : "";

        const globalSettings = typeof getGlobalSettings === "function" ? getGlobalSettings() : {
          fontTh: "'2006_iannnnnbkk', sans-serif", fontSizeTh: "22px",
          fontEn: "'Aptos', sans-serif", fontSizeEn: "22px",
          iconSizeMain: typeof getBaseIconSize === "function" ? getBaseIconSize() + "px" : "61px",
          iconSizeContain: typeof getBaseIconSize === "function" ? getBaseIconSize() + "px" : "61px"
        };

        if (!menu.name_th && !menu.name_en) {
          element.innerHTML = bgHtml + `<div class="slot-content"></div>`;
          return;
        }

        const fTh = menu.fontTh || globalSettings.fontTh;
        const sTh = menu.fontSizeTh || globalSettings.fontSizeTh;
        const cTh = menu.fontColorTh || globalSettings.fontColorTh || "#1e293b";
        const fEn = menu.fontEn || globalSettings.fontEn;
        const sEn = menu.fontSizeEn || globalSettings.fontSizeEn;
        const cEn = menu.fontColorEn || globalSettings.fontColorEn || "#64748b";

        const sizeMainStyle = menu.allergenIconSizeMain
          ? `width: ${menu.allergenIconSizeMain}px !important; height: ${menu.allergenIconSizeMain}px !important;`
          : `width: ${globalSettings.iconSizeMain} !important; height: ${globalSettings.iconSizeMain} !important;`;
        const sizeContainStyle = menu.allergenIconSizeContain
          ? `width: ${menu.allergenIconSizeContain}px !important; height: ${menu.allergenIconSizeContain}px !important;`
          : `width: ${globalSettings.iconSizeContain} !important; height: ${globalSettings.iconSizeContain} !important;`;

        let fullAllergensHtml = "";

        if (showAllergies) {
          let mainHtml = "";
          if (
            menu.main_allergens &&
            Array.isArray(menu.main_allergens) &&
            menu.main_allergens.length > 0
          ) {
            const sortedMainAllergens = sortMeatsFirst(menu.main_allergens);
            const icons = sortedMainAllergens
              .map((a) => {
                const imgUrl = a.icon_url || a.image_url || "";
                const nameText = a.name_th || a.name_en || "";
                if (!imgUrl || imgUrl.trim() === "") {
                  return `<div class="allergen-icon flex flex-col items-center justify-center text-center overflow-hidden bg-red-50 border border-dashed border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.3)]" style="${sizeMainStyle}; display: flex !important; border-radius: 50%; padding: 2px;" title="${nameText}">
                            <span style="font-size: 8px; font-weight: bold; color: #ef4444; line-height: 1.1;">NO IMG</span>
                            <span style="font-size: 7px; color: #ef4444; line-height: 1; margin-top: 2px; word-break: break-word;">${nameText.substring(0, 12)}</span>
                          </div>`;
                }
                return `<img src="${imgUrl}" class="allergen-icon" style="${sizeMainStyle}" title="${nameText}" crossorigin="anonymous" onerror="this.outerHTML='<div class=\\'allergen-icon flex flex-col items-center justify-center text-center overflow-hidden bg-red-50 border border-dashed border-red-400\\' style=\\'${sizeMainStyle}; display: flex !important; border-radius: 50%; padding: 2px;\\'><span style=\\'font-size: 8px; font-weight: bold; color: #ef4444; line-height: 1.1;\\'>NO IMG</span></div>'">`;
              })
              .join("");

            const labelText = menu.labelContainText !== undefined ? menu.labelContainText : "CONTAIN";
            const labelColor = menu.labelContainColor || "#d32f2f";
            mainHtml = `
              <div class="w-full mt-2">
                <div class="text-[9px] sm:text-[10px] font-black tracking-widest text-center mb-1 w-full uppercase" style="font-family: 'Aptos', sans-serif; color: ${labelColor};">${labelText}</div>
                <div class="allergen-container">${icons}</div>
              </div>`;
          }

          let containHtml = "";
          if (
            menu.allergens &&
            Array.isArray(menu.allergens) &&
            menu.allergens.length > 0
          ) {
            const sortedAllergens = sortMeatsFirst(menu.allergens);
            const icons = sortedAllergens
              .map((a) => {
                const imgUrl = a.icon_url || a.image_url || "";
                const nameText = a.name_th || a.name_en || "";
                if (!imgUrl || imgUrl.trim() === "") {
                  return `<div class="allergen-icon flex flex-col items-center justify-center text-center overflow-hidden bg-emerald-50 border border-dashed border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]" style="${sizeContainStyle}; display: flex !important; border-radius: 50%; padding: 2px;" title="${nameText}">
                            <span style="font-size: 8px; font-weight: bold; color: #10b981; line-height: 1.1;">NO IMG</span>
                            <span style="font-size: 7px; color: #10b981; line-height: 1; margin-top: 2px; word-break: break-word;">${nameText.substring(0, 12)}</span>
                          </div>`;
                }
                return `<img src="${imgUrl}" class="allergen-icon" style="${sizeContainStyle}" title="${nameText}" crossorigin="anonymous" onerror="this.outerHTML='<div class=\\'allergen-icon flex flex-col items-center justify-center text-center overflow-hidden bg-emerald-50 border border-dashed border-emerald-400\\' style=\\'${sizeContainStyle}; display: flex !important; border-radius: 50%; padding: 2px;\\'><span style=\\'font-size: 8px; font-weight: bold; color: #10b981; line-height: 1.1;\\'>NO IMG</span></div>'">`;
              })
              .join("");

            const labelText = menu.labelMayContainText !== undefined ? menu.labelMayContainText : "MAY CONTAIN";
            const labelColor = menu.labelMayContainColor || "#d32f2f";
            containHtml = `
              <div class="w-full mt-2">
                <div class="text-[9px] sm:text-[10px] font-black tracking-widest text-center mb-1 w-full uppercase" style="font-family: 'Aptos', sans-serif; color: ${labelColor};">${labelText}</div>
                <div class="allergen-container">${icons}</div>
              </div>`;
          }

          if (mainHtml || containHtml) {
            const allergensTitleHtml = `
              <div class="w-[85%] mx-auto flex items-center justify-center mb-0.5 mt-1">
                <div class="flex-grow border-t border-[#d4d4d4]"></div>
                <div class="mx-3 text-[11px] sm:text-[12px] font-bold text-[#d32f2f]" style="font-family: 'Aptos', sans-serif;">Allergens</div>
                <div class="flex-grow border-t border-[#d4d4d4]"></div>
              </div>`;
            fullAllergensHtml = `<div class="w-full flex flex-col items-center mt-1 space-y-1.5">${allergensTitleHtml}${mainHtml}${containHtml}</div>`;
          }
        }

        element.innerHTML = `
            ${bgHtml}
            <div class="slot-content">
              <div class="slot-text-th font-black mb-1 leading-tight text-center whitespace-pre-line" style="font-family: ${fTh}; font-size: ${sTh}; color: ${cTh};">${menu.name_th || ""}</div>
              <div class="slot-text-en font-medium mb-1 leading-tight text-center whitespace-pre-line ${menu.uppercaseEn ? 'uppercase' : ''}" style="font-family: ${fEn}; font-size: ${sEn}; color: ${cEn};">${menu.name_en || ""}</div>
              ${fullAllergensHtml}
            </div>
        `;
      }

      function selectSlot(slotIndex) {
        activeSlot = slotIndex;
        const count = currentTemplateConfig.slots_count;
        renderSlotControls(count);
        document
          .querySelectorAll(".slot")
          .forEach((s) => s.classList.remove("active"));

        const currentSlot = document.getElementById(`slot-${slotIndex}`);
        if (currentSlot) currentSlot.classList.add("active");

        let startSlot = 1;
        for (let p = 1; p < currentPage; p++) {
           startSlot += pageConfigs[p].slots_count;
        }

        // Update all slot indicators in the DOM
        document
          .querySelectorAll(".slot")
          .forEach((slotEl) => {
            const slotIdParts = slotEl.id.split('-');
            if(slotIdParts.length > 1) {
              const sIndex = parseInt(slotIdParts[1], 10);
              const relIndex = sIndex - startSlot + 1;
              const indicator = slotEl.querySelector("div:first-child");
              if (indicator) {
                indicator.innerText = sIndex === activeSlot ? `Slot ${relIndex} (Editing...)` : `Slot ${relIndex}`;
                indicator.className = `absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded print:hidden z-20 transition-colors hidden-on-export ${sIndex === activeSlot ? "bg-[#006d4b] text-white shadow-sm" : "bg-slate-100 text-slate-400"}`;
              }
            }
          });

        if (slotsData[slotIndex]) {
          updateInputs(slotsData[slotIndex]);
        } else {
          clearInputs();
        }

        syncBgSelectWithCurrentSlot();
      }

      function renderSlotControls(count) {
        const container = document.getElementById("slotControls");
        container.innerHTML = "";

        if (count === 6) {
          container.className = "grid grid-cols-3 gap-2 mb-4";
        } else {
          container.className = "grid grid-cols-2 gap-2 mb-4";
        }

        let startSlot = 1;
        for (let p = 1; p < currentPage; p++) {
           startSlot += pageConfigs[p].slots_count;
        }
        const endSlot = startSlot + count - 1;

        for (let i = startSlot; i <= endSlot; i++) {
          const relativeSlot = i - startSlot + 1;
          const btn = document.createElement("button");
          btn.className = `py-2 rounded-lg border font-bold text-xs transition-all ${i === activeSlot ? "bg-[#006d4b] border-[#006d4b] text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-50"}`;
          btn.innerText = `Slot ${relativeSlot}`;
          btn.onclick = () => selectSlot(i);
          container.appendChild(btn);
        }
      }

      function updatePaginationUI() {
        const indicator = document.getElementById('pageIndicator');
        if (indicator) indicator.innerText = `Page ${currentPage}/${totalPages}`;
        
        const prevBtn = document.getElementById('prevPageBtn');
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        
        const nextBtn = document.getElementById('nextPageBtn');
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;

        const delBtn = document.getElementById('deletePageBtn');
        if (delBtn) delBtn.disabled = totalPages <= 1;
      }

      function changePage(newPage) {
        if (newPage < 1 || newPage > totalPages) return;
        currentPage = newPage;
        
        currentTemplateConfig = pageConfigs[currentPage] || TEMPLATE_CONFIGS["buffet"];
        
        let startSlot = 1;
        for (let p = 1; p < currentPage; p++) {
           startSlot += pageConfigs[p].slots_count;
        }
        activeSlot = startSlot;
        
        if (slotsData[activeSlot]) {
          updateInputs(slotsData[activeSlot]);
        } else {
          clearInputs();
        }
        
        syncTemplateDropdown(currentTemplateConfig.name);
        
        if (document.querySelectorAll('.a4-paper').length !== totalPages) {
          setupGridStructure();
          setTimeout(resizePaper, 50);
        } else {
          // Fast DOM update for navigation (no flicker)
          document.querySelectorAll('.a4-paper').forEach(paper => {
            const p = parseInt(paper.id.split('-').pop(), 10);
            if (p === currentPage) {
              paper.classList.remove('hidden-page');
              paper.classList.add('active-page');
            } else {
              paper.classList.remove('active-page');
              paper.classList.add('hidden-page');
            }
          });
          
          document.querySelectorAll(".slot").forEach((s) => s.classList.remove("active"));
          const currentSlot = document.getElementById(`slot-${activeSlot}`);
          if (currentSlot) currentSlot.classList.add("active");

          const endSlot = startSlot + currentTemplateConfig.slots_count - 1;
          
          document.querySelectorAll(".slot").forEach((slotEl) => {
            const slotIdParts = slotEl.id.split('-');
            if(slotIdParts.length > 1) {
              const slotIndex = parseInt(slotIdParts[1], 10);
              const relIndex = slotIndex - startSlot + 1;
              const indicator = slotEl.querySelector("div:first-child");
              if (indicator && slotIndex >= startSlot && slotIndex <= endSlot) {
                indicator.innerText = slotIndex === activeSlot ? `Slot ${relIndex} (Editing...)` : `Slot ${relIndex}`;
                indicator.className = `absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded print:hidden z-20 transition-colors hidden-on-export ${slotIndex === activeSlot ? "bg-[#006d4b] text-white shadow-sm" : "bg-slate-100 text-slate-400"}`;
              }
            }
          });

          updatePaginationUI();
        }
        
        renderSlotControls(currentTemplateConfig.slots_count);
      }

      function prevPage() {
        changePage(currentPage - 1);
      }

      function nextPage() {
        changePage(currentPage + 1);
      }

      function addNewPage() {
        const nextTotal = totalPages + 1;
        
        // Inherit config from current page
        pageConfigs[nextTotal] = pageConfigs[currentPage] || TEMPLATE_CONFIGS["buffet"];
        
        // Calculate where the new page starts
        let newPageStartSlot = 1;
        for (let p = 1; p < nextTotal; p++) {
           newPageStartSlot += pageConfigs[p].slots_count;
        }
        
        const defaultBgUrl = slotsData[1]?.bgUrl || "";
        for (let i = 0; i < pageConfigs[nextTotal].slots_count; i++) {
          slotsData[newPageStartSlot + i] = { bgUrl: defaultBgUrl }; 
        }
        
        totalPages = nextTotal;
        changePage(totalPages);
      }

      function showDeletePageConfirmModal() {
        if (totalPages <= 1) return;
        const modal = document.getElementById("deletePageConfirmModal");
        modal.classList.remove("hidden");
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.remove("opacity-0");
        modal.querySelector("div").classList.remove("scale-95");
      }

      function closeDeletePageConfirmModal() {
        const modal = document.getElementById("deletePageConfirmModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
      }

      function executeDeleteCurrentPage() {
        if (totalPages <= 1) return;
        
        closeDeletePageConfirmModal();
        
        let deleteStartSlot = 1;
        for (let p = 1; p < currentPage; p++) {
           deleteStartSlot += pageConfigs[p].slots_count;
        }
        const count = pageConfigs[currentPage].slots_count;
        
        // Find total slots across all pages
        let totalSlots = 0;
        for (let p = 1; p <= totalPages; p++) {
           totalSlots += pageConfigs[p].slots_count;
        }
        
        // Shift data down
        for (let i = deleteStartSlot; i <= totalSlots - count; i++) {
           slotsData[i] = slotsData[i + count];
        }
        
        // Remove the last page's data
        for (let i = totalSlots - count + 1; i <= totalSlots; i++) {
           delete slotsData[i];
        }
        
        // Shift page configs down
        for (let p = currentPage; p < totalPages; p++) {
           pageConfigs[p] = pageConfigs[p + 1];
        }
        delete pageConfigs[totalPages];
        
        totalPages--;
        if (currentPage > totalPages) {
           currentPage = totalPages;
        }
        
        setupGridStructure();
        changePage(currentPage);
        setTimeout(resizePaper, 50);
      }


      function syncBgSelectWithCurrentSlot() {
        const select = document.getElementById("bgSelect");
        let currentBg = slotsData[activeSlot]?.bgUrl || "";
        if (!currentBg && currentTemplateConfig && currentTemplateConfig.id) {
           currentBg = localStorage.getItem("defaultBg_" + currentTemplateConfig.id) || "";
        }
        select.value = currentBg;
      }

      function updateInputs(menu) {
        const globalSettings = typeof getGlobalSettings === "function" ? getGlobalSettings() : {
          fontTh: "'2006_iannnnnbkk', sans-serif", fontSizeTh: "22px",
          fontEn: "'Aptos', sans-serif", fontSizeEn: "22px",
          iconSizeMain: typeof getBaseIconSize === "function" ? getBaseIconSize() + "px" : "61px",
          iconSizeContain: typeof getBaseIconSize === "function" ? getBaseIconSize() + "px" : "61px"
        };

        document.getElementById("nameTh").innerText = menu.name_th || "";
        document.getElementById("nameEn").innerText = menu.name_en || "";
        document.getElementById("menuSearch").value = menu.name_th
          ? menu.name_th.split("\n")[0]
          : "";

        document.getElementById("fontSelectTh").value =
          menu.fontTh || globalSettings.fontTh;
        document.getElementById("fontSizeTh").value = parseInt(
          menu.fontSizeTh || globalSettings.fontSizeTh,
        );

        document.getElementById("fontSelectEn").value =
          menu.fontEn || globalSettings.fontEn;
        document.getElementById("fontSizeEn").value = parseInt(
          menu.fontSizeEn || globalSettings.fontSizeEn,
        );
        document.getElementById("uppercaseEn").checked = !!menu.uppercaseEn;
        
        const cTh = menu.fontColorTh || globalSettings.fontColorTh || "#1e293b";
        updateFontColorUI('th', cTh);
        
        const cEn = menu.fontColorEn || globalSettings.fontColorEn || "#64748b";
        updateFontColorUI('en', cEn);
        
        const labelContainText = menu.labelContainText !== undefined ? menu.labelContainText : "CONTAIN";
        const labelContainInput = document.getElementById("labelContainText");
        if (labelContainInput) labelContainInput.value = labelContainText;
        updateAllergenLabelColorUI('contain', menu.labelContainColor || '#d32f2f');
        
        const labelMayContainText = menu.labelMayContainText !== undefined ? menu.labelMayContainText : "MAY CONTAIN";
        const labelMayContainInput = document.getElementById("labelMayContainText");
        if (labelMayContainInput) labelMayContainInput.value = labelMayContainText;
        updateAllergenLabelColorUI('maycontain', menu.labelMayContainColor || '#d32f2f');

        const sizeMainDisplay = document.getElementById("sizeMainDisplay");
        if (sizeMainDisplay) {
          sizeMainDisplay.innerText = menu.allergenIconSizeMain
            ? menu.allergenIconSizeMain + "px"
            : globalSettings.iconSizeMain;
        }

        const sizeContainDisplay =
          document.getElementById("sizeContainDisplay");
        if (sizeContainDisplay) {
          sizeContainDisplay.innerText = menu.allergenIconSizeContain
            ? menu.allergenIconSizeContain + "px"
            : globalSettings.iconSizeContain;
        }

        const list = document.getElementById("allergenList");
        let listHtml = "";

        if (menu.main_allergens && menu.main_allergens.length > 0) {
          listHtml += `<div class="mb-2"><span class="text-[11px] font-black text-red-600 uppercase tracking-widest bg-red-50 px-2 py-1 rounded">Contain</span></div>`;
          listHtml += menu.main_allergens
            .map((a) => {
              const imgUrl = a.icon_url || a.image_url || "";
              const displayName = a.name_th || a.name_en || "Unknown";
              return `<div class="flex items-center gap-3 p-2 bg-red-50/50 border border-red-100 rounded-lg shadow-sm mb-2 overflow-hidden">
                ${imgUrl ? `<img src="${imgUrl}" class="w-8 h-8 flex-shrink-0 object-contain rounded border border-red-200 bg-white p-0.5" onerror="this.src='https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image'">` : `<div class="w-8 h-8 flex-shrink-0 rounded border border-dashed border-red-300 bg-red-50 p-0.5 flex flex-col items-center justify-center overflow-hidden" title="ไม่มีรูปภาพ">
                       <span class="text-[8px] font-bold text-red-500 leading-tight">NO</span>
                       <span class="text-[8px] font-bold text-red-500 leading-tight">IMG</span>
                     </div>`}
                <div class="flex-1 hover-scroll pb-1">
                  <span class="text-xs font-bold text-red-700 uppercase tracking-widest leading-snug block">${displayName}</span>
                </div>
             </div>`;
            })
            .join("");
        }

        if (menu.allergens && menu.allergens.length > 0) {
          listHtml += `<div class="mb-2 mt-3"><span class="text-[11px] font-black text-emerald-700 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">May Contain</span></div>`;
          listHtml += menu.allergens
            .map((a) => {
              const imgUrl = a.icon_url || a.image_url || "";
              const displayName = a.name_th || a.name_en || "Unknown";
              return `<div class="flex items-center gap-3 p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg shadow-sm mb-2 overflow-hidden">
                ${imgUrl ? `<img src="${imgUrl}" class="w-8 h-8 flex-shrink-0 object-contain rounded border border-emerald-200 bg-white p-0.5" onerror="this.src='https://placehold.co/100x100/e2e8f0/94a3b8?text=No+Image'">` : `<div class="w-8 h-8 flex-shrink-0 rounded border border-dashed border-emerald-300 bg-emerald-50 p-0.5 flex flex-col items-center justify-center overflow-hidden" title="ไม่มีรูปภาพ">
                       <span class="text-[8px] font-bold text-emerald-500 leading-tight">NO</span>
                       <span class="text-[8px] font-bold text-emerald-500 leading-tight">IMG</span>
                     </div>`}
                <div class="flex-1 hover-scroll pb-1">
                  <span class="text-xs font-bold text-emerald-700 uppercase tracking-widest leading-snug block">${displayName}</span>
                </div>
             </div>`;
            })
            .join("");
        }

        if (!listHtml) {
          list.innerHTML = `<div class="text-xs text-slate-400 italic">No images assigned</div>`;
        } else {
          list.innerHTML = listHtml;
        }
      }

      function clearInputs() {
        const globalSettings = typeof getGlobalSettings === "function" ? getGlobalSettings() : {
          fontTh: "'2006_iannnnnbkk', sans-serif", fontSizeTh: "22px",
          fontEn: "'Aptos', sans-serif", fontSizeEn: "22px",
          iconSizeMain: typeof getBaseIconSize === "function" ? getBaseIconSize() + "px" : "61px",
          iconSizeContain: typeof getBaseIconSize === "function" ? getBaseIconSize() + "px" : "61px"
        };

        document.getElementById("nameTh").innerText = "";
        document.getElementById("nameEn").innerText = "";
        document.getElementById("menuSearch").value = "";
        document.getElementById("allergenList").innerHTML = "";

        document.getElementById("fontSelectTh").value = globalSettings.fontTh;
        document.getElementById("fontSizeTh").value = parseInt(globalSettings.fontSizeTh);
        document.getElementById("fontSelectEn").value = globalSettings.fontEn;
        document.getElementById("fontSizeEn").value = parseInt(globalSettings.fontSizeEn);
        document.getElementById("uppercaseEn").checked = false;

        const sizeMainDisplay = document.getElementById("sizeMainDisplay");
        if (sizeMainDisplay) sizeMainDisplay.innerText = globalSettings.iconSizeMain;

        const sizeContainDisplay =
          document.getElementById("sizeContainDisplay");
        if (sizeContainDisplay) sizeContainDisplay.innerText = globalSettings.iconSizeContain;
      }

      function showBgConfirmModal() {
        const modal = document.getElementById("bgConfirmModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
        }, 10);
      }
      function closeBgConfirmModal() {
        const modal = document.getElementById("bgConfirmModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
      }
      function executeApplyBackground() {
        closeBgConfirmModal();
        const select = document.getElementById("bgSelect");
        const bgUrl = select.value;
        let count = 0;
        for (let p = 1; p <= totalPages; p++) {
          count += pageConfigs[p].slots_count;
        }
        for (let i = 1; i <= count; i++) {
          if (!slotsData[i]) slotsData[i] = {};
          slotsData[i].bgUrl = bgUrl;
          const slotDiv = document.getElementById(`slot-${i}`);
          if (slotDiv) {
            const wrapper = slotDiv.querySelector("div:last-child");
            renderSlotContent(wrapper, slotsData[i], i);
          }
        }
      }

      function showClearSlotConfirmModal() {
        document.getElementById("clearSlotNumber").innerText =
          "Slot " + activeSlot;
        const modal = document.getElementById("clearSlotConfirmModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
        }, 10);
      }
      function closeClearSlotConfirmModal() {
        const modal = document.getElementById("clearSlotConfirmModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
      }
      function executeClearCurrentSlot() {
        closeClearSlotConfirmModal();
        slotsData[activeSlot] = { bgUrl: "" };
        clearInputs();
        syncBgSelectWithCurrentSlot();
        renderActiveSlotOnly();
      }

      function showMenuConfirmModal() {
        const currentMenu = slotsData[activeSlot];
        if (!currentMenu || (!currentMenu.name_th && !currentMenu.bgUrl)) {
          alert("⚠️ ไม่มีข้อมูลในช่องนี้ให้คัดลอก");
          return;
        }
        document.getElementById("copySlotNumber").innerText =
          "Slot " + activeSlot;
        const modal = document.getElementById("menuConfirmModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
        }, 10);
      }
      function closeMenuConfirmModal() {
        const modal = document.getElementById("menuConfirmModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
      }

      let genericConfirmCallback = null;

      function showGenericConfirmModal(title, text, type, callback) {
        document.getElementById("genericConfirmTitle").innerText = title;
        document.getElementById("genericConfirmText").innerText = text;
        genericConfirmCallback = callback;
        
        const iconContainer = document.getElementById("genericConfirmIconContainer");
        const icon = document.getElementById("genericConfirmIcon");
        const btn = document.getElementById("genericConfirmBtn");

        if (type === 'delete') {
          iconContainer.className = "w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-100";
          icon.innerText = "delete";
          btn.className = "flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md transition-colors";
        } else if (type === 'add') {
          iconContainer.className = "w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100";
          icon.innerText = "add_circle";
          btn.className = "flex-1 py-2.5 bg-[#006d4b] text-white font-bold rounded-xl hover:bg-[#005a3d] shadow-md transition-colors";
        } else {
          iconContainer.className = "w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-100";
          icon.innerText = "help";
          btn.className = "flex-1 py-2.5 bg-[#006d4b] text-white font-bold rounded-xl hover:bg-[#005a3d] shadow-md transition-colors";
        }

        const modal = document.getElementById("genericConfirmModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
        }, 10);
      }

      function closeGenericConfirmModal() {
        const modal = document.getElementById("genericConfirmModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => {
          modal.classList.add("hidden");
          genericConfirmCallback = null;
        }, 300);
      }
      function executeApplyToAllSlots() {
        closeMenuConfirmModal();
        const currentMenu = slotsData[activeSlot];
        
        let startSlot = 1;
        for (let p = 1; p < currentPage; p++) {
           startSlot += pageConfigs[p].slots_count;
        }
        const endSlot = startSlot + currentTemplateConfig.slots_count - 1;

        for (let i = startSlot; i <= endSlot; i++) {
          slotsData[i] = JSON.parse(JSON.stringify(currentMenu));
          const slotDiv = document.getElementById(`slot-${i}`);
          if (slotDiv) {
            const wrapper = slotDiv.querySelector("div:last-child");
            renderSlotContent(wrapper, slotsData[i], i);
          }
        }
      }

      function renderActiveSlotOnly() {
        const slotDiv = document.getElementById(`slot-${activeSlot}`);
        if (slotDiv) {
          const wrapper = slotDiv.querySelector("div:last-child");
          renderSlotContent(wrapper, slotsData[activeSlot] || {}, activeSlot);
        }
      }

      async function searchMenu(query) {
        const results = document.getElementById("searchResults");
        if (query.length < 1) {
          results.classList.add("hidden");
          return;
        }
        try {
          const { data: menus, error } = await dbClient
            .from("menus")
            .select("*")
            .or(`name_th.ilike.%${query}%,name_en.ilike.%${query}%`)
            .limit(10);
          if (error) throw error;

          if (menus && menus.length > 0) {
            let filtered = menus;
            filtered.sort((a, b) => {
              const nameATh = (a.name_th || "").toLowerCase();
              const nameAEn = (a.name_en || "").toLowerCase();
              const nameBTh = (b.name_th || "").toLowerCase();
              const nameBEn = (b.name_en || "").toLowerCase();
              const q = query.toLowerCase();
              
              const aStarts = nameATh.startsWith(q) || nameAEn.startsWith(q);
              const bStarts = nameBTh.startsWith(q) || nameBEn.startsWith(q);
              if (aStarts && !bStarts) return -1;
              if (!aStarts && bStarts) return 1;
              return 0;
            });

            if (filtered.length === 0) {
              results.classList.add("hidden");
              return;
            }

            const { data: allIngs } = await dbClient
              .from("ingredients")
              .select("*");

            results.innerHTML = filtered
              .map((m) => {
                const resolveIngs = (ids, names) => {
                   if (names && names.length > 0) {
                       return names.map(n => allIngs.find(i => (i.name_en || i.name_th || '') === n)).filter(Boolean);
                   }
                   return (ids || []).map(id => allIngs.find(i => String(i.id) === String(id))).filter(Boolean);
                };

                const allergens = resolveIngs(m.ingredient_ids, m.ingredient_names);
                const mainAllergens = resolveIngs(m.main_ingredient_ids, m.main_ingredient_names);

                const completeMenu = {
                  ...m,
                  allergens: allergens,
                  main_allergens: mainAllergens,
                };
                return `<div onclick='selectMenu(${JSON.stringify(completeMenu).replace(/'/g, "&#39;")})' class="p-3 hover:bg-emerald-50 cursor-pointer border-b last:border-0 transition-colors"><div class="font-bold text-sm text-slate-800">${m.name_th}</div><div class="text-xs text-slate-500">${m.name_en || ""}</div></div>`;
              })
              .join("");
            results.classList.remove("hidden");
          } else {
            results.innerHTML =
              '<div class="p-3 text-xs text-slate-400">ไม่พบข้อมูลเมนู</div>';
            results.classList.remove("hidden");
          }
        } catch (err) {
          console.error("Search Error:", err);
        }
      }

      function selectMenu(menu) {
        const currentSlotData = slotsData[activeSlot] || {};
        const globalSettings = typeof getGlobalSettings === "function" ? getGlobalSettings() : {
          fontTh: "'2006_iannnnnbkk', sans-serif", fontSizeTh: "22px",
          fontEn: "'Aptos', sans-serif", fontSizeEn: "22px",
          iconSizeMain: "61px",
          iconSizeContain: "61px"
        };

        slotsData[activeSlot] = {
          ...menu,
          bgUrl: currentSlotData.bgUrl || "",
          fontTh: currentSlotData.fontTh || globalSettings.fontTh,
          fontSizeTh: currentSlotData.fontSizeTh || globalSettings.fontSizeTh,
          fontEn: currentSlotData.fontEn || globalSettings.fontEn,
          fontSizeEn: currentSlotData.fontSizeEn || globalSettings.fontSizeEn,
          allergenIconSizeMain: currentSlotData.allergenIconSizeMain || null,
          allergenIconSizeContain:
            currentSlotData.allergenIconSizeContain || null,
        };

        updateInputs(slotsData[activeSlot]);
        document.getElementById("searchResults").classList.add("hidden");
        renderActiveSlotOnly();
      }

      function changeBackgroundForCurrentSlot(bgUrl) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].bgUrl = bgUrl;
        renderActiveSlotOnly();
      }

      async function loadBackgrounds(sizeName) {
        const select = document.getElementById("bgSelect");
        select.innerHTML = '';

        let dbSizeName = sizeName;

        try {
          const { data: bgs, error } = await dbClient
            .from("backgrounds")
            .select("*")
            .eq("template_size", dbSizeName);
          if (error) throw error;

          let firstBgUrl = null;

          const storedDefaults = localStorage.getItem("defaultBackgrounds");
          let userDefaultBg = null;
          if (storedDefaults) {
             try {
                const parsed = JSON.parse(storedDefaults);
                userDefaultBg = parsed[dbSizeName] || null;
             } catch(e) {}
          }

          if (bgs && bgs.length > 0) {
            const seenNames = new Set();
            bgs.forEach((bg) => {
              if (!seenNames.has(bg.name)) {
                seenNames.add(bg.name);
                select.innerHTML += `<option value="${bg.image_url}">${bg.name}</option>`;
                if (!firstBgUrl) firstBgUrl = bg.image_url;
              }
            });
            if (userDefaultBg) {
               const exists = bgs.find(b => b.image_url === userDefaultBg);
               if (exists) firstBgUrl = userDefaultBg;
            }
          }

          if (firstBgUrl && typeof isInitialLoading !== "undefined" && !isInitialLoading) {
            let startSlot = 1;
            for (let p = 1; p < currentPage; p++) {
              startSlot += pageConfigs[p].slots_count;
            }
            const count = currentTemplateConfig.slots_count;
            const endSlot = startSlot + count - 1;
            for (let i = startSlot; i <= endSlot; i++) {
              if (!slotsData[i]) {
                slotsData[i] = { bgUrl: firstBgUrl };
              } else if (!slotsData[i].bgUrl) {
                slotsData[i].bgUrl = firstBgUrl;
              }
            }
          }

          syncBgSelectWithCurrentSlot();
        } catch (err) {
          console.error("Error loading backgrounds:", err);
        }
      }

      function showSaveModal() {
        const profileNameInput = document
          .getElementById("profileName")
          .value.trim();
        if (!profileNameInput) {
          alert("⚠️ กรุณากรอกช่อง Title (ชื่อโปรไฟล์) ก่อนทำการบันทึก");
          document.getElementById("profileName").focus();
          return;
        }
        const modal = document.getElementById("saveModal");
        const content = document.getElementById("saveModalContent");

        const statusText = isDraftStatus
          ? `<span class="text-amber-500 bg-amber-50 px-2 py-0.5 rounded">Draft</span>`
          : `<span class="text-[#006d4b] bg-emerald-50 px-2 py-0.5 rounded">Ready to Print</span>`;

        const urlParams = new URLSearchParams(window.location.search);
        const isEditing = urlParams.get("edit") !== null;
        
        const modalTitle = isEditing ? "ยืนยันการอัปเดตโปรไฟล์" : "ยืนยันการบันทึกโปรไฟล์";
        const modalDesc = isEditing ? "คุณต้องการอัปเดตโปรไฟล์นี้" : "คุณต้องการบันทึกโปรไฟล์นี้";

        content.innerHTML = `<div class="text-center"><div class="w-16 h-16 bg-emerald-50 text-[#006d4b] rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-100"><span class="material-symbols-outlined text-3xl">save</span></div><h3 class="text-xl font-bold text-slate-800 mb-2">${modalTitle}</h3><p class="text-sm text-slate-500 mb-4 leading-relaxed">${modalDesc}<br>ในชื่อ <span class="font-black text-[#006d4b] text-base">"${profileNameInput}"</span> ใช่หรือไม่?</p><p class="text-xs text-slate-400 mb-6 border-t border-slate-100 pt-3">สถานะ: ${statusText}</p><div class="flex gap-3 w-full"><button onclick="closeSaveModal()" class="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">ยกเลิก</button><button onclick="confirmSave()" class="flex-1 py-2.5 bg-[#006d4b] text-white font-bold rounded-xl hover:bg-[#005a3d] shadow-md transition-colors flex justify-center items-center gap-2"><span class="material-symbols-outlined text-[18px]">check</span> ยืนยัน</button></div></div>`;
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          content.classList.remove("scale-95");
        }, 10);
      }

      function closeSaveModal() {
        const modal = document.getElementById("saveModal");
        const content = document.getElementById("saveModalContent");
        modal.classList.add("opacity-0");
        content.classList.add("scale-95");
        setTimeout(() => {
          modal.classList.add("hidden");
        }, 300);
      }

      function confirmSave() {
        const content = document.getElementById("saveModalContent");
        content.innerHTML = `<div class="text-center py-6"><span class="material-symbols-outlined text-5xl text-[#006d4b] animate-spin mb-4">progress_activity</span><h3 class="text-lg font-bold text-slate-800">กำลังบันทึกข้อมูล...</h3><p class="text-xs text-slate-400 mt-2">กรุณารอสักครู่</p></div>`;

        const profileName = document.getElementById("profileName").value.trim();

        setTimeout(async () => {
          try {
            const urlParams = new URLSearchParams(window.location.search);
            let editId = urlParams.get("edit");
            if (!editId) {
              editId = localStorage.getItem("currentEditId");
            }
            const userData = JSON.parse(localStorage.getItem("userData"));
            const creatorName = userData
              ? userData.name || userData.role || "UNKNOWN"
              : "UNKNOWN";

            const statusToSave = isDraftStatus ? "Draft" : "Ready";

            let logAction = "CREATE";
            const tagId = editId || Date.now().toString();

            // Build pageConfigs string mapping for DB
            const pageConfigsStr = {};
            for (const p in pageConfigs) {
              if (pageConfigs[p]) {
                pageConfigsStr[p] = pageConfigs[p].name || pageConfigs[p].templateName || "Buffet / Coffee Break";
              }
            }
            slotsData.__pageConfigs = pageConfigsStr;

            const newTag = {
              id: tagId,
              title: profileName,
              template_name: currentTemplateConfig.name,
              paper_size: selectedPaperSize,
              created_by: creatorName,
              status: statusToSave,
              slots_data: slotsData,
            };

            if (editId) {
              logAction = "EDIT";
              const { error } = await dbClient.from('saved_tags').update(newTag).eq('id', editId);
              if (error) throw error;
              localStorage.removeItem("currentEditId");
            } else {
              const { error } = await dbClient.from('saved_tags').insert([newTag]);
              if (error) throw error;
            }

            await logSystemActivity(
              logAction,
              `บันทึกโปรไฟล์ป้ายชื่อ: ${profileName} (${currentTemplateConfig.name}) ขนาด ${selectedPaperSize} สถานะ [${statusToSave}]`,
              { menu_name: profileName, paper_size: selectedPaperSize, template: currentTemplateConfig.name }
            );
          } catch (error) {
            console.error("Error saving:", error);
          }

          content.innerHTML = `<div class="text-center py-4"><div class="w-16 h-16 bg-[#e6f4ea] text-[#006d4b] rounded-full flex items-center justify-center mx-auto mb-4"><span class="material-symbols-outlined text-4xl">check_circle</span></div><h3 class="text-xl font-bold text-[#1e293b] mb-3">บันทึกเสร็จสิ้น!</h3><p class="text-sm text-[#475569] mb-6">ข้อมูลโปรไฟล์ถูกบันทึกเรียบร้อยแล้ว</p><button onclick="window.location.href='dashboard.html'" class="w-full py-2.5 bg-[#006d4b] text-white font-bold rounded-xl hover:bg-[#005a3d] shadow-sm transition-colors">ตกลง</button></div>`;
        }, 1500);
      }

      async function capturePaper() {
        document.body.style.cursor = "wait";
        const paper = document.querySelector(".a4-paper.active-page");
        if (!paper) {
          document.body.style.cursor = "default";
          return null;
        }
        document
          .querySelectorAll(".hidden-on-export")
          .forEach((el) => (el.style.display = "none"));

        const activeSlotEl = document.querySelector(".slot.active");
        if (activeSlotEl) {
          activeSlotEl.classList.remove("active");
          activeSlotEl.dataset.wasActive = "true";
        }

        const originalTransform = paper.style.transform;
        paper.style.transform = "none";

        const images = paper.querySelectorAll("img");
        const imagePromises = Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        });

        await Promise.all(imagePromises);
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Use html-to-image for perfect text rendering (fixes Thai font spacing and wrapping)
        const canvas = await htmlToImage.toCanvas(paper, {
          pixelRatio: 3,
          backgroundColor: "#ffffff",
        });

        paper.style.transform = originalTransform;

        document
          .querySelectorAll(".hidden-on-export")
          .forEach((el) => (el.style.display = ""));

        const wasActiveEl = document.querySelector(
          ".slot[data-was-active='true']",
        );
        if (wasActiveEl) {
          wasActiveEl.classList.add("active");
          delete wasActiveEl.dataset.wasActive;
        }

        document.body.style.cursor = "default";
        return canvas;
      }

      async function exportFile(type) {
        const fileName = `Food-Tag_${document.getElementById("profileName").value || "Export"}`;

        await logSystemActivity(
          "PRINT",
          `ดาวน์โหลดไฟล์ป้ายชื่อเป็นนามสกุล .${type.toUpperCase()} (ชื่อไฟล์: ${fileName}) (Size: ${selectedPaperSize})`,
          { menu_name: document.getElementById("profileName").value || "Export", paper_size: selectedPaperSize }
        );

        const canvas = await capturePaper();

        if (type === "pdf") {
          const { jsPDF } = window.jspdf;
          const orientation =
            currentTemplateConfig.orientation === "landscape" ? "l" : "p";
          const pdfFormat = selectedPaperSize.toLowerCase();

          const pdf = new jsPDF({
            orientation: orientation,
            unit: "mm",
            format: pdfFormat,
          });
          const imgData = canvas.toDataURL("image/jpeg", 1.0);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`${fileName}.pdf`);
        } else {
          const link = document.createElement("a");
          link.download = `${fileName}.${type}`;
          link.href = canvas.toDataURL(
            `image/${type === "jpg" ? "jpeg" : "png"}`,
          );
          link.click();
        }
      }

      async function shareDirectly() {
        const fileName = `Food-Tag_${document.getElementById("profileName").value || "Export"}.png`;

        await logSystemActivity(
          "PRINT",
          `แชร์ไฟล์ป้ายชื่อ (ชื่อไฟล์: ${fileName}) (Size: ${selectedPaperSize})`,
          { menu_name: document.getElementById("profileName").value || "Export", paper_size: selectedPaperSize }
        );

        const canvas = await capturePaper();

        canvas.toBlob(async (blob) => {
          const file = new File([blob], fileName, { type: "image/png" });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                title: "IMPACT Food Tag",
                text: `Tag ป้ายอาหาร: ${document.getElementById("profileName").value || "ไม่ระบุชื่อ"}`,
                files: [file],
              });
            } catch (error) {
              console.log("Share failed:", error);
            }
          } else {
            alert("⚠️ Browser ไม่รองรับการแชร์ไฟล์ภาพโดยตรง");
          }
        }, "image/png");
      }

      function showPrintWarningModal() {
        const modal = document.getElementById("printWarningModal");
        const warningMsg = document.getElementById("printWarningMsg");

        if (isDraftStatus) {
          warningMsg.innerHTML =
            `<div class="bg-amber-50 text-amber-600 border border-amber-200 p-3 rounded-lg mb-4 text-xs">⚠️ ไฟล์นี้ยังถูกตั้งสถานะเป็น <strong>Draft</strong> อยู่นะครับ แน่ใจหรือไม่ว่าต้องการพิมพ์?</div>` +
            ` กรุณาตั้งค่า <strong>Paper Size</strong> ตอนพิมพ์ให้เป็น <span class="font-black text-[#006d4b] text-base">${selectedPaperSize}</span><br /> เพื่อให้สัดส่วนบนกระดาษไม่ผิดเพี้ยน`;
        } else {
          warningMsg.innerHTML = `กรุณาตั้งค่า <strong>Paper Size</strong> ตอนพิมพ์ให้เป็น <span class="font-black text-[#006d4b] text-base">${selectedPaperSize}</span><br /> เพื่อให้สัดส่วนบนกระดาษไม่ผิดเพี้ยน`;
        }

        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
        }, 10);
      }

      function closePrintWarningModal() {
        const modal = document.getElementById("printWarningModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => {
          modal.classList.add("hidden");
        }, 300);
      }

      async function proceedToPrint() {
        closePrintWarningModal();

        try {
          const profileTitle =
            document.getElementById("profileName").value.trim() ||
            "ไม่ระบุชื่อ";
          const templateSize = currentTemplateConfig.name || "Custom Template";

          await logSystemActivity(
            "PRINT",
            `สั่งพิมพ์ป้ายอาหาร (คลิกยืนยัน) Profile: ${profileTitle} (${templateSize}) (Size: ${selectedPaperSize})`,
            { menu_name: profileTitle, paper_size: selectedPaperSize, template: templateSize }
          );
        } catch (err) {
          console.error("Audit log dispatch failed:", err);
        }

        setTimeout(() => {
          window.print();
        }, 300);
      }

      let tempMainAllergens = [];
      let tempContainAllergens = [];
      let addingToSection = null;
      let editingImageSection = null;
      let editingImageIndex = null;

      function showAdjustIngredientsModal() {
        const menu = slotsData[activeSlot] || {};
        tempMainAllergens = JSON.parse(
          JSON.stringify(menu.main_allergens || []),
        );
        tempContainAllergens = JSON.parse(JSON.stringify(menu.allergens || []));

        document.getElementById("adjustModalSlotLabel").innerText =
          `เฉพาะ Slot ${activeSlot} · ไม่กระทบข้อมูลเมนูต้นฉบับ`;

        renderAdjustLists();

        const modal = document.getElementById("adjustIngredientsModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
        }, 10);
      }

      function closeAdjustIngredientsModal() {
        const modal = document.getElementById("adjustIngredientsModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
      }

      function renderAdjustLists() {
        renderAdjustSection("adjustMainList", tempMainAllergens, "main");
        renderAdjustSection(
          "adjustContainList",
          tempContainAllergens,
          "contain",
        );
      }

      function renderAdjustSection(containerId, list, section) {
        const container = document.getElementById(containerId);
        if (list.length === 0) {
          container.innerHTML = `<p class="text-xs text-slate-400 italic py-2 text-center">ยังไม่มีรายการ</p>`;
          return;
        }
        container.innerHTML = list
          .map((item, idx) => {
            const imgUrl = item.icon_url || item.image_url || "";
            const name = item.name_th || item.name_en || "ไม่ระบุชื่อ";
            const imgHtml = imgUrl
              ? `<img src="${imgUrl}" class="w-8 h-8 object-contain rounded border border-slate-200 bg-white p-0.5">`
              : `<div class="w-8 h-8 flex items-center justify-center rounded border border-slate-200 bg-slate-100"><span class="material-symbols-outlined text-[16px] text-slate-400">image</span></div>`;

            return `
            <div class="flex items-center gap-2 px-2 py-2 rounded-lg border border-slate-100 bg-white hover:bg-slate-50 transition-colors">
              <button onclick="triggerAllergenImagePicker('${section}', ${idx})" class="flex-shrink-0 relative group" title="คลิกเพื่อเปลี่ยนรูป">
                ${imgHtml}
                <div class="absolute inset-0 bg-black/30 rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span class="material-symbols-outlined text-white text-[14px]">edit</span>
                </div>
              </button>
              <input
                type="text"
                value="${name}"
                onchange="updateAllergenName('${section}', ${idx}, this.value)"
                class="flex-1 text-xs font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-200 focus:border-[#006d4b] outline-none py-0.5 transition-colors min-w-0"
              />
              <button onclick="removeAllergenItem('${section}', ${idx})" class="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors" title="ลบ">
                <span class="material-symbols-outlined text-[16px]">delete</span>
              </button>
            </div>`;
          })
          .join("");
      }

      function updateAllergenName(section, idx, value) {
        if (section === "main") {
          tempMainAllergens[idx].name_th = value;
        } else {
          tempContainAllergens[idx].name_th = value;
        }
      }

      function removeAllergenItem(section, idx) {
        const list = section === "main" ? tempMainAllergens : tempContainAllergens;
        const item = list[idx];
        const name = item.name_th || item.name_en || "ไม่ระบุชื่อ";
        const sectionName = section === "main" ? "Contain" : "May Contain";

        showGenericConfirmModal(
          "ยืนยันการลบวัตถุดิบ",
          `คุณต้องการลบ "${name}" ออกจาก ${sectionName} ใช่หรือไม่?`,
          "delete",
          () => {
            if (section === "main") {
              tempMainAllergens.splice(idx, 1);
            } else {
              tempContainAllergens.splice(idx, 1);
            }
            renderAdjustLists();
          }
        );
      }

      function triggerAllergenImagePicker(section, idx) {
        editingImageSection = section;
        editingImageIndex = idx;
        document.getElementById("allergenImageInput").click();
      }

      function handleAllergenImageChange(event) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          if (editingImageSection === "main") {
            tempMainAllergens[editingImageIndex].icon_url = dataUrl;
            tempMainAllergens[editingImageIndex].image_url = dataUrl;
          } else {
            tempContainAllergens[editingImageIndex].icon_url = dataUrl;
            tempContainAllergens[editingImageIndex].image_url = dataUrl;
          }
          renderAdjustLists();
          event.target.value = "";
        };
        reader.readAsDataURL(file);
      }

      function confirmAdjustIngredients() {
        showGenericConfirmModal(
          "ยืนยันการใช้งาน",
          "คุณต้องการบันทึกและใช้งาน Ingredients ที่ปรับแต่งแล้วกับ Slot นี้ใช่หรือไม่?",
          "info",
          () => {
            if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
            slotsData[activeSlot].main_allergens = JSON.parse(
              JSON.stringify(tempMainAllergens),
            );
            slotsData[activeSlot].allergens = JSON.parse(
              JSON.stringify(tempContainAllergens),
            );

            closeAdjustIngredientsModal();
            updateInputs(slotsData[activeSlot]);
            renderActiveSlotOnly();
          }
        );
      }

      function openAddIngredientPicker(section) {
        addingToSection = section;
        const title =
          section === "main" ? "เพิ่มใน Contain" : "เพิ่มใน May Contain";
        document.getElementById("addIngredientModalTitle").innerText = title;
        document.getElementById("ingredientSearchInput").value = "";
        document.getElementById("ingredientSearchResults").innerHTML =
          `<p class="text-xs text-slate-400 text-center py-4">Type to search ingredients</p>`;

        const modal = document.getElementById("addIngredientModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          modal.querySelector("div").classList.remove("scale-95");
          document.getElementById("ingredientSearchInput").focus();
        }, 10);
      }

      function closeAddIngredientModal() {
        const modal = document.getElementById("addIngredientModal");
        modal.classList.add("opacity-0");
        modal.querySelector("div").classList.add("scale-95");
        setTimeout(() => modal.classList.add("hidden"), 300);
      }

      async function searchIngredients(query) {
        const container = document.getElementById("ingredientSearchResults");
        if (query.length < 1) {
          container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Type to search ingredients</p>`;
          return;
        }
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">Searching...</p>`;

        try {
          const { data, error } = await dbClient
            .from("ingredients")
            .select("*")
            .or(`name_th.ilike.${query}%,name_en.ilike.${query}%`)
            .limit(20);
          if (error) throw error;

          if (!data || data.length === 0) {
            container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No ingredients found</p>`;
            return;
          }

          container.innerHTML = data
            .map((ing) => {
              const imgUrl = ing.icon_url || ing.image_url || "";
              const name = ing.name_th || ing.name_en || "ไม่ระบุ";
              const imgHtml = imgUrl
                ? `<img src="${imgUrl}" class="w-8 h-8 object-contain rounded border border-slate-200 bg-white p-0.5 flex-shrink-0">`
                : `<div class="w-8 h-8 flex-shrink-0 rounded border border-dashed border-red-300 bg-red-50 p-0.5 flex flex-col items-center justify-center overflow-hidden" title="ไม่มีรูปภาพ">
                       <span class="text-[8px] font-bold text-red-500 leading-tight">NO</span>
                       <span class="text-[8px] font-bold text-red-500 leading-tight">IMG</span>
                     </div>`;

              return `
              <button onclick='addIngredientToTemp(${JSON.stringify(ing).replace(/'/g, "&#39;")})' class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-emerald-50 transition-colors text-left">
                ${imgHtml}
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-bold text-slate-700 truncate">${name}</div>
                  <div class="text-xs text-slate-400 truncate">${ing.name_en || ""}</div>
                </div>
                <span class="material-symbols-outlined text-[18px] text-[#006d4b] flex-shrink-0">add_circle</span>
              </button>`;
            })
            .join("");
        } catch (err) {
          container.innerHTML = `<p class="text-xs text-red-400 text-center py-4">เกิดข้อผิดพลาด</p>`;
        }
      }

      function addIngredientToTemp(ingredient) {
        const targetList =
          addingToSection === "main" ? tempMainAllergens : tempContainAllergens;
        const alreadyExists = targetList.some(
          (i) => String(i.id) === String(ingredient.id),
        );
        if (alreadyExists) {
          closeAddIngredientModal();
          return;
        }

        const name = ingredient.name_th || ingredient.name_en || "ไม่ระบุชื่อ";
        const sectionName = addingToSection === "main" ? "Contain" : "May Contain";

        showGenericConfirmModal(
          "ยืนยันการเพิ่มวัตถุดิบ",
          `คุณต้องการเพิ่ม "${name}" ลงใน ${sectionName} ใช่หรือไม่?`,
          "add",
          () => {
            if (addingToSection === "main") {
              tempMainAllergens.push({ ...ingredient });
            } else {
              tempContainAllergens.push({ ...ingredient });
            }

            closeAddIngredientModal();
            renderAdjustLists();
          }
        );
      }

      const _originalUpdateInputs = updateInputs;

      function refreshAllergenSummary() {
        const menu = slotsData[activeSlot] || {};
        const mainCount = (menu.main_allergens || []).length;
        const containCount = (menu.allergens || []).length;
        const total = mainCount + containCount;

        const badge = document.getElementById("allergenCountBadge");
        if (badge) badge.innerText = total > 0 ? `${total} รายการ` : "ยังไม่มี";

        const list = document.getElementById("allergenList");
        if (!list) return;

        if (total === 0) {
          list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-6 text-slate-300 gap-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <span class="material-symbols-outlined text-[36px]">no_food</span>
              <span class="text-sm font-bold">ยังไม่มี Ingredients</span>
            </div>`;
          return;
        }

        let html = "";

        if (mainCount > 0) {
          html += `
            <div class="rounded-xl border border-slate-200 overflow-hidden mb-3">
              <div class="bg-red-50 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
                <span class="material-symbols-outlined text-[16px] text-red-500">error</span>
                <span class="text-[12px] font-black text-red-600 uppercase tracking-widest">Contain</span>
                <span class="ml-auto text-[11px] font-bold text-red-400">${mainCount} รายการ</span>
              </div>
              <div class="flex flex-col gap-2 p-3 bg-white">
                ${(menu.main_allergens || [])
                  .map((a) => {
                    const img = a.icon_url || a.image_url || "";
                    const name = a.name_th || a.name_en || "?";
                    return img
                      ? `<div class="flex items-center gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden">
                         <img src="${img}" class="w-8 h-8 object-contain rounded border border-slate-200 bg-white p-0.5 flex-shrink-0" title="${name}">
                         <div class="flex-1 hover-scroll pb-1">
                           <span class="text-[12px] font-bold text-red-600 leading-tight block">${name}</span>
                         </div>
                       </div>`
                      : `<div class="flex items-center gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden">
                         <div class="w-8 h-8 flex items-center justify-center rounded bg-red-50 border border-slate-200 text-[14px] font-black text-red-400 flex-shrink-0">${name[0]}</div>
                         <div class="flex-1 hover-scroll pb-1">
                           <span class="text-[12px] font-bold text-red-600 leading-tight block">${name}</span>
                         </div>
                       </div>`;
                  })
                  .join("")}
              </div>
            </div>`;
        }

        if (containCount > 0) {
          html += `
            <div class="rounded-xl border border-slate-200 overflow-hidden">
              <div class="bg-emerald-50 px-4 py-2 flex items-center gap-2 border-b border-slate-200">
                <span class="material-symbols-outlined text-[16px] text-emerald-600">eco</span>
                <span class="text-[12px] font-black text-emerald-700 uppercase tracking-widest">May Contain</span>
                <span class="ml-auto text-[11px] font-bold text-emerald-500">${containCount} รายการ</span>
              </div>
              <div class="flex flex-col gap-2 p-3 bg-white">
                ${(menu.allergens || [])
                  .map((a) => {
                    const img = a.icon_url || a.image_url || "";
                    const name = a.name_th || a.name_en || "?";
                    return img
                      ? `<div class="flex items-center gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden">
                         <img src="${img}" class="w-8 h-8 object-contain rounded border border-slate-200 bg-white p-0.5 flex-shrink-0" title="${name}">
                         <div class="flex-1 hover-scroll pb-1">
                           <span class="text-[12px] font-bold text-emerald-600 leading-tight block">${name}</span>
                         </div>
                       </div>`
                      : `<div class="flex items-center gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden">
                         <div class="w-8 h-8 flex items-center justify-center rounded bg-emerald-50 border border-slate-200 text-[14px] font-black text-emerald-500 flex-shrink-0">${name[0]}</div>
                         <div class="flex-1 hover-scroll pb-1">
                           <span class="text-[12px] font-bold text-emerald-600 leading-tight block">${name}</span>
                         </div>
                       </div>`;
                  })
                  .join("")}
              </div>
            </div>`;
        }

        list.innerHTML = html;
      }

      const __origUpdateInputs = updateInputs;
      updateInputs = function (menu) {
        __origUpdateInputs(menu);
        refreshAllergenSummary();
      };
      const __origClearInputs = clearInputs;
      clearInputs = function () {
        __origClearInputs();
        refreshAllergenSummary();
      };

      function changeFontTh(font) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].fontTh = font;
        renderActiveSlotOnly();
      }

      function changeFontSizeTh(size) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].fontSizeTh = size + "px";
        renderActiveSlotOnly();
      }

      function changeFontEn(font) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].fontEn = font;
        renderActiveSlotOnly();
      }

      function changeFontSizeEn(size) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].fontSizeEn = size + "px";
        renderActiveSlotOnly();
      }

      function changeFontColorTh(color) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].fontColorTh = color;
        updateFontColorUI('th', color);
        renderActiveSlotOnly();
      }

      function changeFontColorEn(color) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].fontColorEn = color;
        updateFontColorUI('en', color);
        renderActiveSlotOnly();
      }

      function updateFontColorUI(lang, color) {
        if (!color) return;
        
        // Add # prefix if missing for HEX codes
        if (color && !color.startsWith('#') && color.length <= 6) {
          color = '#' + color;
        }

        const btns = document.querySelectorAll(`.fc-${lang}-btn`);
        let found = false;
        btns.forEach(btn => {
          if (btn.dataset.color.toLowerCase() === color.toLowerCase()) {
            btn.classList.add('ring-2');
            btn.classList.remove('ring-0');
            found = true;
          } else {
            btn.classList.remove('ring-2');
            btn.classList.add('ring-0');
          }
        });
        const picker = document.getElementById(`fontColorPicker${lang.charAt(0).toUpperCase() + lang.slice(1)}`);
        if (picker && isValidHex(color)) {
          picker.value = color;
          if (!found) {
            picker.nextElementSibling.classList.add('ring-2', 'ring-offset-2', 'ring-slate-400');
          } else {
            picker.nextElementSibling.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-400');
          }
        }
        
        const hexInput = document.getElementById(`hexInput${lang.charAt(0).toUpperCase() + lang.slice(1)}`);
        if (hexInput) {
          hexInput.value = color.toUpperCase();
        }
      }
      
      function isValidHex(hex) {
        return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
      }

      function changeAllergenLabel(type, text) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        if (type === 'contain') {
          slotsData[activeSlot].labelContainText = text;
        } else {
          slotsData[activeSlot].labelMayContainText = text;
        }
        renderActiveSlotOnly();
      }

      function changeAllergenLabelColor(type, color) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        
        if (color && !color.startsWith('#') && color.length <= 6) {
          color = '#' + color;
        }
        
        if (type === 'contain') {
          slotsData[activeSlot].labelContainColor = color;
        } else {
          slotsData[activeSlot].labelMayContainColor = color;
        }
        updateAllergenLabelColorUI(type, color);
        renderActiveSlotOnly();
      }

      function updateAllergenLabelColorUI(type, color) {
        if (!color) color = type === 'contain' ? '#d32f2f' : '#d32f2f';
        
        const btns = document.querySelectorAll(`.lbl-${type}-btn`);
        let found = false;
        btns.forEach(btn => {
          if (btn.dataset.color.toLowerCase() === color.toLowerCase()) {
            btn.classList.add('ring-2');
            btn.classList.remove('ring-0');
            found = true;
          } else {
            btn.classList.remove('ring-2');
            btn.classList.add('ring-0');
          }
        });
        const picker = document.getElementById(`lblColorPicker${type.charAt(0).toUpperCase() + type.slice(1)}`);
        if (picker && isValidHex(color)) {
          picker.value = color;
          if (!found) {
            picker.nextElementSibling.classList.add('ring-2', 'ring-offset-2', 'ring-slate-400');
          } else {
            picker.nextElementSibling.classList.remove('ring-2', 'ring-offset-2', 'ring-slate-400');
          }
        }
      }

      function handleGoBack() {
        const modal = document.getElementById("leaveConfirmModal");
        modal.classList.remove("hidden");
        setTimeout(() => {
          modal.classList.remove("opacity-0");
          document.getElementById("leaveConfirmModalContent").classList.remove("scale-95");
        }, 10);
      }

      function closeLeaveModal() {
        const modal = document.getElementById("leaveConfirmModal");
        const content = document.getElementById("leaveConfirmModalContent");
        modal.classList.add("opacity-0");
        content.classList.add("scale-95");
        setTimeout(() => {
          modal.classList.add("hidden");
        }, 300);
      }

      function changeUppercaseEn(isUppercase) {
        if (!slotsData[activeSlot]) slotsData[activeSlot] = {};
        slotsData[activeSlot].uppercaseEn = isUppercase;
        renderActiveSlotOnly();
      }

      window.addEventListener('beforeunload', function (e) {
          const urlParams = new URLSearchParams(window.location.search);
          const editId = urlParams.get("edit");
          if (editId) {
              const checkUser = JSON.parse(localStorage.getItem("userData"));
              const empId = checkUser ? checkUser.emp_id : "UNKNOWN";
              const lockedTags = JSON.parse(localStorage.getItem('lockedTags')) || {};
              if (lockedTags[editId] && lockedTags[editId].lockedBy === empId) {
                  delete lockedTags[editId];
                  localStorage.setItem('lockedTags', JSON.stringify(lockedTags));
              }
          }
      });
      


      window.addEventListener('globalSettingsUpdated', () => {
        const count = currentTemplateConfig ? currentTemplateConfig.slots_count : 0;
        if (count > 0) {
           updateInputs(slotsData[activeSlot] || {});
           renderSlotControls(count);
           changePage(currentPage);
        }
      });

      function setTemplateDefaultBackground() {
        if (!currentTemplateConfig || !currentTemplateConfig.id) {
          alert("ไม่พบข้อมูลเทมเพลต");
          return;
        }
        const select = document.getElementById("bgSelect");
        const selectedBg = select.value;
        if (!selectedBg) {
          alert("กรุณาเลือกพื้นหลังที่ต้องการตั้งเป็นค่าเริ่มต้น");
          return;
        }
        localStorage.setItem("defaultBg_" + currentTemplateConfig.id, selectedBg);
        alert("ตั้งเป็นค่าเริ่มต้นสำหรับเทมเพลต " + currentTemplateConfig.name + " แล้ว\\nในครั้งถัดไปที่คุณใช้งานเทมเพลตนี้ จะแสดงพื้นหลังนี้เป็นค่าเริ่มต้น");
      }

      window.addEventListener('load', function() {
          const urlParams = new URLSearchParams(window.location.search);
          const editId = urlParams.get("edit");
          if (editId) {
              const checkUser = JSON.parse(localStorage.getItem("userData"));
              const empId = checkUser ? checkUser.emp_id : "UNKNOWN";
              const empName = checkUser ? checkUser.name : "UNKNOWN";
              const lockedTags = JSON.parse(localStorage.getItem('lockedTags')) || {};
              
              lockedTags[editId] = {
                  lockedBy: empId,
                  lockedByName: empName,
                  timestamp: new Date().toISOString()
              };
              localStorage.setItem('lockedTags', JSON.stringify(lockedTags));
          }
      });
    