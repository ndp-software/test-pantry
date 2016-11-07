const fs   = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, 'README.md');
const outputPath = path.join(__dirname, 'README-filtered.md');

function subs(s) {
  return s
    .replace(/\s*\.\..*/g, '')
    .replace(/.*npm install\s\-D.*/, '')
    .replace(/import pantry from 'my-pantry'/, '')
    .replace(/^(.*)\/\/\s-->(.*)$/gm,
             '; (function(actual) {chaiassert.deepEqual(actual, $2 ); console.log("OK: ", actual)})($1)\n')
    .replace(/import.*/,
             'const TestPantry = require(\"./lib/test-pantry.js\"); const chaiassert = require("chai").assert')
}

const data = fs.readFileSync(inputPath, {encoding: 'utf-8'})

fs.writeFileSync(outputPath, subs('' + data))

