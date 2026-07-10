import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, '..', 'src/components');
const OUT = path.join(__dirname, '..', 'plugin/hooks');
const VERSION = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')).version;

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

function toKebab(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

for (const comp of fs.readdirSync(SRC)) {
  const hooksPath = path.join(SRC, comp, 'hooks.json');
  if (!fs.existsSync(hooksPath)) continue;
  const hooks = JSON.parse(fs.readFileSync(hooksPath, 'utf-8'));
  for (const h of hooks) {
    const fileName = `${toKebab(h.event)}-${comp}.json`;
    const command = `node "\${PLUGIN_ROOT}/components/${comp}/dist/cli.mjs" hook ${toKebab(h.event)}`;
    const entry = {
      ...h,
      command,
      statusMessage: `(OmO ${VERSION}) ${h.statusMessage ?? comp}`,
    };
    fs.writeFileSync(path.join(OUT, fileName), JSON.stringify(entry, null, 2));
  }
}

console.log('Hooks synced to', OUT);
