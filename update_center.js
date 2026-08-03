const fs = require('fs');

function processCreate() {
    const file = '/Users/pammy/foodtag-frontend/create.html';
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(
        /<div class="flex items-start gap-3 p-2 bg-red-50\/50/g,
        '<div class="flex items-center gap-3 p-2 bg-red-50/50'
    );
    content = content.replace(
        /<div class="flex items-start gap-3 p-2 bg-emerald-50\/50/g,
        '<div class="flex items-center gap-3 p-2 bg-emerald-50/50'
    );
    content = content.replace(
        /<div class="flex items-start gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden pt-1">/g,
        '<div class="flex items-center gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden">'
    );
    
    fs.writeFileSync(file, content);
}

function processMenuDb() {
    const file = '/Users/pammy/foodtag-frontend/menu-database.html';
    let content = fs.readFileSync(file, 'utf8');
    
    content = content.replace(
        /<div class="flex items-start gap-3 bg-white shadow-sm border border-slate-200 px-3 py-2\.5 rounded-xl mb-2 w-full max-w-\[220px\] group transition-all hover:border-slate-300 overflow-hidden">/g,
        '<div class="flex items-center gap-3 bg-white shadow-sm border border-slate-200 px-3 py-2.5 rounded-xl mb-2 w-full max-w-[220px] group transition-all hover:border-slate-300 overflow-hidden">'
    );
    
    fs.writeFileSync(file, content);
}

processCreate();
processMenuDb();
console.log("Updated alignments to center");
