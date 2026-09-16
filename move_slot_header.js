const fs = require('fs');

let content = fs.readFileSync('create.html', 'utf8');

// Find the start and end of Slot Header
const startMarker = '<div class="relative border border-slate-200 rounded-xl bg-white p-4 pt-10 flex flex-col mb-4">\n            <div class="bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 absolute top-0 left-0 rounded-br-lg rounded-tl-xl uppercase shadow-sm">\n              Slot Header\n            </div>';
const startIndex = content.indexOf(startMarker);

if (startIndex === -1) {
    console.log("Could not find start marker.");
    process.exit(1);
}

// Find the end of Slot Header by looking for the next panel "Slot Badge"
const nextPanelMarker = '<div class="relative border border-slate-200 rounded-xl bg-white p-4 pt-10 flex flex-col mb-4">\n            <div class="bg-indigo-600 text-white text-[11px] font-bold px-3 py-1 absolute top-0 left-0 rounded-br-lg rounded-tl-xl uppercase shadow-sm">\n              Slot Badge\n            </div>';
const endIndex = content.indexOf(nextPanelMarker);

if (endIndex === -1) {
    console.log("Could not find next panel marker.");
    process.exit(1);
}

// Extract the Slot Header block
let slotHeaderBlock = content.substring(startIndex, endIndex);

// Remove the block from its original position
content = content.substring(0, startIndex) + content.substring(endIndex);

// Find the insertion point: just before "Menu Search"
const insertMarker = '<div class="relative mt-2">\n            <label class="block text-[18px] font-bold text-slate-700 mb-2"\n              >Menu Search</label\n            >';
const insertIndex = content.indexOf(insertMarker);

if (insertIndex === -1) {
    console.log("Could not find insert marker.");
    process.exit(1);
}

// Insert the block
content = content.substring(0, insertIndex) + slotHeaderBlock + content.substring(insertIndex);

fs.writeFileSync('create.html', content);
console.log("Successfully moved Slot Header.");
