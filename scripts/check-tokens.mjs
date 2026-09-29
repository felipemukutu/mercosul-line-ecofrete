/**
 * Fails if raw design values appear outside src/styles/tokens.css:
 * hex colors, rgb()/hsl(), px lengths and hand-written font-family.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'src';
const ALLOWED = new Set(['src/styles/tokens.css']);
const RULES = [
  { name: 'hex color', re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'rgb/hsl color', re: /\b(?:rgba?|hsla?)\(/g },
  { name: 'px value', re: /\b\d*\.?\d+px\b/g },
  { name: 'font-family', re: /font-family\s*:/g },
];

const files = [];
const walk = (dir) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(css|tsx?|svg)$/.test(p)) files.push(p);
  }
};
walk(ROOT);

let problems = 0;
for (const file of files) {
  const rel = relative('.', file);
  if (ALLOWED.has(rel)) continue;
  const lines = readFileSync(file, 'utf8').split('\n');
  lines.forEach((line, i) => {
    for (const { name, re } of RULES) {
      for (const m of line.matchAll(re)) {
        // `#` followed by an id selector-like word inside TS strings is not a color when non-hex; regex already restricts to hex chars
        problems++;
        console.log(`${rel}:${i + 1}  ${name}: ${m[0]}   ${line.trim().slice(0, 100)}`);
      }
    }
  });
}
console.log(problems ? `\n${problems} raw value(s) found` : `OK — ${files.length} files, no raw values outside tokens.css`);
process.exit(problems ? 1 : 0);
