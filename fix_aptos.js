const fs = require('fs');

const htmlPath = '/Users/pammy/foodtag-frontend/create.html';
let html = fs.readFileSync(htmlPath, 'utf8');

// The original code has:
// @font-face {
//   font-family: '2006_iannnnnbkk';
//   src: url(data:font/ttf;charset=utf-8;base64,...);
//   font-family: 'Aptos';
//   font-weight: normal;
//   font-style: normal;
// }

// Find the @font-face block for 2006_iannnnnbkk
const fontFaceStart = html.indexOf("@font-face {");
if (fontFaceStart !== -1) {
    const fontFaceEnd = html.indexOf("}", fontFaceStart);
    if (fontFaceEnd !== -1) {
        let fontFaceBlock = html.substring(fontFaceStart, fontFaceEnd + 1);
        
        // Remove the incorrect font-family: 'Aptos'; line from within this block
        if (fontFaceBlock.includes("font-family: '2006_iannnnnbkk'") && fontFaceBlock.includes("font-family: 'Aptos'")) {
            const newFontFaceBlock = fontFaceBlock.replace(/font-family:\s*'Aptos';/, '');
            html = html.substring(0, fontFaceStart) + newFontFaceBlock + html.substring(fontFaceEnd + 1);
            fs.writeFileSync(htmlPath, html, 'utf8');
            console.log("Successfully removed 'Aptos' from 2006_iannnnnbkk @font-face");
        } else {
            console.log("Could not find the expected font-family declarations");
        }
    }
}
