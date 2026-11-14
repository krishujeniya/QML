import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve, sep } from 'node:path';

const root = resolve('dist');
const pages = ['index.html', 'learn.html', 'library.html'];
const issues = [];

for (const page of pages) {
  const path = resolve(root, page);
  if (!existsSync(path) || statSync(path).size === 0) {
    issues.push(`Missing static entry: ${page}`);
    continue;
  }
  const html = readFileSync(path, 'utf8');
  if (!html.includes('id="root"')) issues.push(`${page} has no React mount point`);
  if (!html.includes('<title>')) issues.push(`${page} has no title`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const target = match[1];
    if (/^(?:https?:|mailto:|tel:|data:|#|\/\/)/i.test(target)) continue;
    const rooted = target.startsWith('/QML/') ? target.slice('/QML/'.length) : target.replace(/^\//, '');
    const local = resolve(root, decodeURIComponent(rooted.split('#')[0].split('?')[0]));
    if (local === root) continue;
    if (!local.startsWith(`${root}${sep}`) || !existsSync(local)) issues.push(`${page} points to missing or out-of-root asset: ${target}`);
  }
}

for (const required of ['assets/images/qml-mark.svg', 'assets/reference-media/QRAM.png', 'googlea76a740b003523ce.html']) {
  if (!existsSync(resolve(root, required))) issues.push(`Missing deployed public asset: ${required}`);
}

if (issues.length) throw new Error(issues.join('\n'));
console.log(`Verified ${pages.length} static entries and required public assets under /QML/.`);
