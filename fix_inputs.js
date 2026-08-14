const fs = require('fs');

function fixFile(filename) {
    let content = fs.readFileSync(filename, 'utf8');

    // In create.html, fix the text-slate-600 font-bold -> text-slate-600
    // But ONLY for the input/select classes (which have focus:ring)
    content = content.replace(/text-slate-600 font-bold/g, 'text-slate-600');
    
    // In create.html, there's bg-slate-50 for Font Style inputs.
    // Replace "bg-slate-50 border border-slate-200" with "bg-white border border-slate-200"
    content = content.replace(/bg-slate-50 border border-slate-200/g, 'bg-white border border-slate-200');

    fs.writeFileSync(filename, content);
}

fixFile('create.html');
fixFile('sidebar.js');
console.log('Fixed inputs in create.html and sidebar.js');
