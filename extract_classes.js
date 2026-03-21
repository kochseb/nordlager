const fs = require('fs');
const content = fs.readFileSync('c:/webdev/nordlager/index.html', 'utf8');
const classRegex = /class="([^"]*)"/g;
let match;
const classes = new Set();
while ((match = classRegex.exec(content)) !== null) {
  match[1].split(/\s+/).forEach(c => {
    if (c) classes.add(c);
  });
}
console.log(Array.from(classes).sort().join('\n'));
