// Uso: node run.js paso.js  — se conecta al Edge con --remote-debugging-port=9222 y ejecuta el paso.
// El paso exporta: async ({ page, ctx, shot, log, call, BASE }) => {}
// shot(desc, { num }) rehace la captura con ese número (borra la anterior) en vez de ponerla al final;
// shot(desc, { clip: {x, y, width, height} }) captura solo esa zona de la pantalla.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

// Rutas y direcciones en ../config.json (las relativas, desde la carpeta de config.json)
const CFG_FILE = process.env.MEMORIA_CONFIG || path.join(__dirname, '..', 'config.json');
const CFG = JSON.parse(fs.readFileSync(CFG_FILE, 'utf8'));
const OUT = path.resolve(path.dirname(CFG_FILE), CFG.capturas);
const BASE = CFG.odoo_url;

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.connectOverCDP(CFG.cdp_url);
  const ctx = browser.contexts()[0];
  let page = ctx.pages().find(p => p.url().startsWith(BASE)) || ctx.pages()[0];
  await page.setViewportSize(CFG.viewport).catch(() => {});
  const next = () => {
    const nums = fs.readdirSync(OUT).map(f => parseInt(f, 10)).filter(n => !isNaN(n));
    return (nums.length ? Math.max(...nums) : 0) + 1;
  };
  const shot = async (desc, opts = {}) => {
    const pg = opts.page || page;
    await pg.waitForTimeout(opts.wait ?? 800);
    const num = opts.num ?? next();
    const prefijo = String(num).padStart(3, '0') + '-';
    // al rehacer una captura se borra la anterior con el mismo número (aunque cambie la descripción)
    if (opts.num) fs.readdirSync(OUT).filter(f => f.startsWith(prefijo)).forEach(f => fs.unlinkSync(path.join(OUT, f)));
    const name = `${prefijo}${desc}.png`;
    await pg.screenshot({ path: path.join(OUT, name), fullPage: !!opts.full, clip: opts.clip });
    console.log('SHOT ' + name);
    return name;
  };
  const log = (...a) => console.log(...a);
  // llamada a la API de Odoo con la sesión del navegador (para comprobar datos)
  const call = (model, method, args, kwargs = {}) => page.evaluate(async ([model, method, args, kwargs]) => {
    const r = await fetch('/web/dataset/call_kw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { model, method, args, kwargs } }) });
    const j = await r.json(); return j.error ? 'ERROR ' + j.error.data.message : j.result;
  }, [model, method, args, kwargs]);
  const step = require(path.resolve(process.argv[2]));
  try {
    await step({ page, ctx, shot, log, call, BASE });
    console.log('URL=' + page.url());
    console.log('STEP_OK');
  } catch (e) {
    console.log('STEP_ERROR ' + e.message.split('\n')[0]);
    await page.screenshot({ path: path.join(path.dirname(path.resolve(process.argv[2])), 'error.png') }).catch(() => {});
  }
  process.exit(0); // sin browser.close(), para no cerrar el Edge
})();
