const fs = require('fs');

const fontsToInject = [
  { name: '2006_iannnnnbkk', path: './public/fonts/2006_iannnnnBKK.ttf', weight: 'normal', style: 'normal' },
  { name: 'Aptos', path: './public/fonts/aptos.ttf', weight: 'normal', style: 'normal' },
  { name: 'Aptos', path: './public/fonts/aptos-bold.ttf', weight: 'bold', style: 'normal' },
  { name: 'Segoe UI', path: './public/fonts/Segoe UI.ttf', weight: 'normal', style: 'normal' },
  { name: 'Segoe UI', path: './public/fonts/Segoe UI Bold.ttf', weight: 'bold', style: 'normal' }
];

let css = '';
for (const font of fontsToInject) {
  try {
    const base64 = fs.readFileSync(font.path).toString('base64');
    css += `
      @font-face {
        font-family: '${font.name}';
        src: url(data:font/ttf;charset=utf-8;base64,${base64}) format('truetype');
        font-weight: ${font.weight};
        font-style: ${font.style};
      }
`;
    console.log(`Successfully encoded ${font.name}`);
  } catch (err) {
    console.error(`Failed to encode ${font.name}: ${err.message}`);
  }
}

let html = fs.readFileSync('create.html', 'utf-8');

// First, remove the URL-based @font-face blocks that were added
html = html.replace(/@font-face\s*\{\s*font-family:\s*'[^']+';\s*src:\s*url\('\.\/public\/fonts\/[^']+'\)\s*format\('truetype'\);\s*font-weight:\s*[^;]+;\s*font-style:\s*[^;]+;\s*\}/g, '');

// Then inject the Base64 ones right after the <style> tag
html = html.replace('<style>', `<style>\n${css}`);

fs.writeFileSync('create.html', html);
console.log('Fonts injected as base64 into create.html!');
