const fs = require('fs');

const css = `
<style>
.hover-scroll {
    overflow-x: auto;
}
.hover-scroll::-webkit-scrollbar {
    height: 4px;
}
.hover-scroll::-webkit-scrollbar-track {
    background: transparent;
}
.hover-scroll::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
}
.hover-scroll:hover::-webkit-scrollbar-thumb {
    background: #cbd5e1;
}
</style>
`;

function processFile(file, isMenuDb) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Add CSS if not present
    if (!content.includes('.hover-scroll::-webkit-scrollbar')) {
        content = content.replace('</head>', css + '</head>');
    }
    
    if (isMenuDb) {
        // Revert my previous change in menu-database.html
        content = content.replace(
            /<div class="flex-1 overflow-x-auto custom-scroll pb-0\.5">\s*<span class="text-\[14px\] font-bold text-slate-700 tracking-wide whitespace-nowrap block pr-2" title="([^"]+)">([^<]+)<\/span>\s*<\/div>/g,
            '<div class="flex-1 hover-scroll pb-1">\n                  <span class="text-[14px] font-bold text-slate-700 tracking-wide leading-snug pt-0.5" title="$1">$2</span>\n                </div>'
        );
        // Ensure flex items start so 2 lines align to top
        content = content.replace(
            /<div class="flex items-center gap-3 bg-white shadow-sm border border-slate-200 px-3 py-2\.5 rounded-xl mb-2 w-full max-w-\[220px\] group transition-all hover:border-slate-300 overflow-hidden">/g,
            '<div class="flex items-start gap-3 bg-white shadow-sm border border-slate-200 px-3 py-2.5 rounded-xl mb-2 w-full max-w-[220px] group transition-all hover:border-slate-300 overflow-hidden">'
        );
    } else {
        // Revert in create.html
        // Red version
        content = content.replace(
            /<div class="flex-1 overflow-x-auto custom-scroll pb-0\.5">\s*<span class="text-xs font-bold text-red-700 uppercase tracking-widest whitespace-nowrap block pr-2">([^<]+)<\/span>\s*<\/div>/g,
            '<div class="flex-1 hover-scroll pb-1">\n                  <span class="text-xs font-bold text-red-700 uppercase tracking-widest leading-snug block">$1</span>\n                </div>'
        );
        content = content.replace(
            /<div class="flex-1 overflow-x-auto custom-scroll pb-0\.5">\s*<span class="text-\[12px\] font-bold text-red-600 whitespace-nowrap block pr-2">([^<]+)<\/span>\s*<\/div>/g,
            '<div class="flex-1 hover-scroll pb-1">\n                           <span class="text-[12px] font-bold text-red-600 leading-tight block">$1</span>\n                         </div>'
        );
        // Emerald version
        content = content.replace(
            /<div class="flex-1 overflow-x-auto custom-scroll pb-0\.5">\s*<span class="text-xs font-bold text-emerald-700 uppercase tracking-widest whitespace-nowrap block pr-2">([^<]+)<\/span>\s*<\/div>/g,
            '<div class="flex-1 hover-scroll pb-1">\n                  <span class="text-xs font-bold text-emerald-700 uppercase tracking-widest leading-snug block">$1</span>\n                </div>'
        );
        content = content.replace(
            /<div class="flex-1 overflow-x-auto custom-scroll pb-0\.5">\s*<span class="text-\[12px\] font-bold text-emerald-600 whitespace-nowrap block pr-2">([^<]+)<\/span>\s*<\/div>/g,
            '<div class="flex-1 hover-scroll pb-1">\n                           <span class="text-[12px] font-bold text-emerald-600 leading-tight block">$1</span>\n                         </div>'
        );
        
        // Also ensure flex items start
        content = content.replace(
            /<div class="flex items-center gap-3 p-2 bg-red-50\/50 border border-red-100 rounded-lg shadow-sm mb-2 overflow-hidden">/g,
            '<div class="flex items-start gap-3 p-2 bg-red-50/50 border border-red-100 rounded-lg shadow-sm mb-2 overflow-hidden">'
        );
        content = content.replace(
            /<div class="flex items-center gap-3 p-2 bg-emerald-50\/50 border border-emerald-100 rounded-lg shadow-sm mb-2 overflow-hidden">/g,
            '<div class="flex items-start gap-3 p-2 bg-emerald-50/50 border border-emerald-100 rounded-lg shadow-sm mb-2 overflow-hidden">'
        );
        content = content.replace(
            /<div class="flex items-center gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden">/g,
            '<div class="flex items-start gap-3 w-full border-b border-slate-100 pb-2 last:border-0 last:pb-0 overflow-hidden pt-1">'
        );
    }
    
    fs.writeFileSync(file, content);
}

processFile('/Users/pammy/foodtag-frontend/menu-database.html', true);
processFile('/Users/pammy/foodtag-frontend/create.html', false);

console.log("Done");
