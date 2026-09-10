const fs = require('fs');
const path = require('path');

const dir = '/Users/pammy/foodtag-frontend';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Update font link
  content = content.replace(
    /href="https:\/\/fonts\.googleapis\.com\/css2\?family=Sarabun[^"]+"/g,
    'href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"'
  );
  content = content.replace(
    /href="https:\/\/fonts\.googleapis\.com\/css2\?family=Poppins[^"]+"/g,
    'href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"'
  );

  // Add the inline style for Poppins to body if it doesn't have it right before </head>
  if (!content.includes('font-family: "Poppins"')) {
    if (!content.includes("font-family: 'Poppins'")) {
        content = content.replace('</head>', `  <style>\n      body {\n        font-family: "Poppins", sans-serif !important;\n      }\n    </style>\n  </head>`);
    }
  }

  // 2. Table UI updates
  // Table Wrapper
  content = content.replace(
    /<div class="bg-white border border-slate-200 rounded-b-2xl flex-1 overflow-auto shadow-xl shadow-slate-200\/50 custom-scroll"/g,
    '<div class="bg-white border-x border-b border-slate-200 rounded-b-2xl flex-1 overflow-y-auto p-6 custom-scroll">\n          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm mb-4"'
  );
  
  // For users-management and others that might have slightly different wrappers
  content = content.replace(
    /<div class="bg-white border border-slate-200 rounded-b-2xl flex-1 overflow-auto p-4 sm:p-6 shadow-xl shadow-slate-200\/50 custom-scroll"/g,
    '<div class="bg-white border-x border-b border-slate-200 rounded-b-2xl flex-1 overflow-y-auto p-6 custom-scroll">\n          <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm mb-4"'
  );

  // Table tag
  content = content.replace(
    /<table class="w-full text-left border-collapse( min-w-\[600px\])?"/g,
    '<table class="w-full text-left text-sm"'
  );

  // Table thead
  content = content.replace(
    /<thead class="bg-slate-50 sticky top-0 shadow-sm z-10"/g,
    '<thead class="bg-slate-50 border-b border-slate-200 text-slate-700"'
  );

  // Table th
  content = content.replace(
    /<th\s+class="py-5 px-6 text-\[16px\] font-extrabold text-slate-600([^"]*)"/g,
    '<th class="px-6 py-4 font-bold$1"'
  );

  // Also catch variations with flex items
  content = content.replace(
    /<th\s+class="py-4 px-6 text-\[15px\] font-extrabold text-slate-600([^"]*)"/g,
    '<th class="px-6 py-4 font-bold$1"'
  );

  // Table tbody
  content = content.replace(
    /<tbody id="([^"]+)" class="divide-y divide-slate-100/g,
    '<tbody id="$1" class="divide-y divide-slate-100' // It's already this usually
  );

  // We need to fix the closing div for the table wrapper!
  // If we replaced the wrapper opening, we need to add a closing </div> before </main> or after </table>
  // Since we injected an extra <div>, let's just find </table> and add </div> right after it
  // WAIT: We only want to add </div> if we actually replaced the wrapper.
  if (content.includes('border-x border-b border-slate-200 rounded-b-2xl') && !content.includes('font-database.html')) {
     // This is tricky via simple string replacement.
     // Let's do it safely.
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
