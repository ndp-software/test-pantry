const fs   = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'README.md');
const outputPath = path.join(__dirname, 'README-filtered.md');

function subs(s) {
  return s
    .replace(/.*npm install\s\-D.*/, '')
    .replace(/import pantry from 'my-pantry'/, '')
    .replace(/import.*/,
             'const TestPantry = require(\"./lib/test-pantry.js\")')
}

const data = fs.readFileSync(inputPath, {encoding: 'utf-8'})

fs.writeFileSync(outputPath, subs('' + data))

