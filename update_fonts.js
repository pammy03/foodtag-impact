const fs = require('fs');
const createHtml = fs.readFileSync('create.html', 'utf8');
const dashboardHtml = fs.readFileSync('dashboard.html', 'utf8');

const styleStart = createHtml.indexOf('<style>');
const bodyStart = createHtml.indexOf('body {', styleStart);
const fontFaces = createHtml.substring(styleStart + 7, bodyStart);

const dashStyleStart = dashboardHtml.indexOf('<style>');
const dashBodyStart = dashboardHtml.indexOf('body {', dashStyleStart);
// if font faces are already there (partially?), let's just replace everything between <style> and body {
const newDashboard = dashboardHtml.substring(0, dashStyleStart + 7) + fontFaces + dashboardHtml.substring(dashBodyStart);

fs.writeFileSync('dashboard.html', newDashboard);
console.log('Fonts updated successfully');
