// Uso: node run.js pasos/pNN-algo.js
// Se conecta al Edge de la v5 (puerto CDP de config.json) y ejecuta el paso.
// El paso exporta: async ({ page, ctx, shot, log, call, BASE, L }) => {}
//
// shot(id, opts) guarda capturas/<id>.png y la anota en capturas.json (el manifiesto):
//   id      : nombre estable en kebab case («retirada-03-devolucion»). Rehacer la captura la sobrescribe.
//   opts.zona    : selector, Locator o lista de ellos; la captura se recorta a la caja que los engloba.
//   opts.foco    : selector(es) que se recuadran en rojo durante la captura.
//   opts.ocultar : selector(es) que se desenfocan (URL del quiosco, PIN...).
//   opts.completa: true = página entera (con scroll). opts.espera: ms antes de capturar.
//   opts.borrador: descripción provisional; el pie definitivo se escribe a mano en capturas.json.
// Los pasos que están en pasos/_sondas/ son de depuración: sus capturas no van al manifiesto.
const { chromium } = require('playwright-core');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const L = require('./pasos/lib');

const RAIZ = path.resolve(__dirname, '..', '..');                       // ut02-practica-odoo-v5
const CFG = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'config.json'), 'utf8'));
const BASE = CFG.odoo;
const OUT = path.join(RAIZ, CFG.capturas);
const MANIF = path.join(RAIZ, CFG.manifiesto);

const lista = (x) => (x == null ? [] : Array.isArray(x) ? x : [x]);
// Un selector en texto o un Locator de Playwright (para recortar a un bloque ya localizado).
const desc = (s) => (typeof s === 'string' ? s : String(s));

// Lee y reescribe el manifiesto entero: es pequeño y así nunca quedan dos entradas con el mismo id.
function anotar(id, datos) {
  const m = fs.existsSync(MANIF) ? JSON.parse(fs.readFileSync(MANIF, 'utf8')) : {};
  // Lo escrito a mano (pie, apartado, resumida, revisado) se conserva; lo técnico se actualiza.
  m[id] = { pie: '', apartado: '', resumida: false, revisado: '', ...m[id], ...datos };
  fs.writeFileSync(MANIF, JSON.stringify(m, null, 2) + '\n', 'utf8');
}

(async () => {
  const paso = path.resolve(process.argv[2]);
  const sonda = paso.split(path.sep).includes('_sondas');
  const destino = sonda ? path.dirname(paso) : OUT;
  fs.mkdirSync(destino, { recursive: true });

  const browser = await chromium.connectOverCDP('http://127.0.0.1:' + CFG.cdpPuerto);
  const ctx = browser.contexts()[0];
  const page = ctx.pages().find(p => p.url().startsWith(BASE)) || ctx.pages()[0];

  // Viewport fijo y escala 2: el texto sale nítido aunque la imagen se reduzca a 16 cm en la memoria.
  const vp = CFG.viewport;
  // Prepara la captura para una pestaña: escala 2 por CDP y las funciones marcar/caja/shot ligadas a ella.
  // Se usa para la pestaña del administrador y, con otraVentana(), para la del cliente de la tienda.
  const preparar = async (page) => {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.ancho, height: vp.alto, deviceScaleFactor: vp.escala, mobile: false });

    // Aplica un estilo en línea a los elementos indicados y devuelve una función que lo deshace.
    const marcar = async (sels, estilo) => {
      const handles = [];
      for (const s of lista(sels)) handles.push(...await (typeof s === 'string' ? page.locator(s) : s).elementHandles());
      const antes = [];
      for (const h of handles) antes.push(await h.evaluate((el, e) => { const v = el.getAttribute('style'); Object.assign(el.style, e); return v; }, estilo));
      return async () => {
        for (let i = 0; i < handles.length; i++)
          await handles[i].evaluate((el, v) => (v == null ? el.removeAttribute('style') : el.setAttribute('style', v)), antes[i]).catch(() => {});
      };
    };

    // Caja que engloba todos los selectores de la zona, con 8 px de margen y sin salirse del viewport.
    const caja = async (sels, sinLimite = false) => {
      const cajas = [];
      for (const s of lista(sels)) {
        const bs = await (typeof s === 'string' ? page.locator(s) : s).evaluateAll(els => els.map(e => { const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height }; }));
        cajas.push(...bs.filter(b => b.w && b.h));
      }
      if (!cajas.length) throw new Error('zona sin elementos visibles: ' + lista(sels).map(desc).join(', '));
      const x0 = Math.max(0, Math.min(...cajas.map(b => b.x)) - 8), y0 = Math.max(0, Math.min(...cajas.map(b => b.y)) - 8);
      // con opts.completa la zona puede seguir por debajo del borde de la ventana (tablas largas)
      const x1 = Math.min(vp.ancho, Math.max(...cajas.map(b => b.x + b.w)) + 8), y1 = Math.min(sinLimite ? 1e5 : vp.alto, Math.max(...cajas.map(b => b.y + b.h)) + 8);
      // CDP mide el recorte desde el principio del documento: se suma lo que la ventana haya bajado.
      const sc = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
      return { x: x0 + sc.x, y: y0 + sc.y, width: x1 - x0, height: y1 - y0 };
    };

    const shot = async (id, opts = {}) => {
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(id)) throw new Error('id no válido (kebab case): ' + id);
      // el ratón a una esquina para que no quede ningún tooltip ni resaltado (opts.raton = true lo deja donde está)
      if (!opts.raton) await page.mouse.move(vp.ancho - 3, vp.alto - 3);
      await L.esperar(page, opts.espera ?? 800);
      const deshacer = [await marcar(opts.foco, { outline: '3px solid #d00000', outlineOffset: '2px' }),
                        await marcar(opts.ocultar, { filter: 'blur(7px)' })];
      const archivo = id + '.png';
      const ruta = path.join(destino, archivo);
      try {
        // Captura directa por CDP: page.screenshot() de Playwright no ve la escala emulada y la sacaba
        // a la escala de la pantalla (1,5). Con clip.scale = 1 la imagen sale a devicePixelRatio = 2.
        let clip;
        if (opts.zona) clip = await caja(opts.zona, !!opts.completa);
        else if (opts.completa) clip = await page.evaluate(() => ({ x: 0, y: 0, width: document.documentElement.scrollWidth, height: document.documentElement.scrollHeight }));
        else clip = { x: 0, y: 0, width: vp.ancho, height: vp.alto };
        const r = await cdp.send('Page.captureScreenshot', { format: 'png', clip: { ...clip, scale: 1 }, captureBeyondViewport: !!opts.completa });
        fs.writeFileSync(ruta, Buffer.from(r.data, 'base64'));
      } finally { for (const d of deshacer) await d(); }
      if (!sonda) {
        const md5 = crypto.createHash('md5').update(fs.readFileSync(ruta)).digest('hex');
        anotar(id, { archivo, md5, capturada: new Date().toISOString(), url: page.url().replace(BASE, ''),
                     ...(opts.borrador ? { borrador: opts.borrador } : {}) });
      }
      console.log('SHOT ' + archivo);
      return archivo;
    };
    return shot;
  };
  const shot = await preparar(page);
  // Ventana de incógnito (contexto nuevo, sin la cookie del administrador) para comprar como cliente.
  // Devuelve { pagina, shot, cerrar }: las capturas de esa ventana van al mismo manifiesto.
  const otraVentana = async () => {
    const c2 = await browser.newContext({ viewport: null });
    const p2 = await c2.newPage();
    return { pagina: p2, shot: await preparar(p2), cerrar: () => c2.close() };
  };

  const log = (...a) => console.log(...a);
  // Llamada a la API de Odoo con la sesión del navegador (para comprobar datos sin capturas).
  const call = (model, method, args, kwargs = {}) => page.evaluate(async ([model, method, args, kwargs]) => {
    const r = await fetch('/web/dataset/call_kw', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', method: 'call', params: { model, method, args, kwargs } }) });
    const j = await r.json(); return j.error ? 'ERROR ' + j.error.data.message : j.result;
  }, [model, method, args, kwargs]);

  try {
    await require(paso)({ page, ctx, shot, log, call, BASE, L, otraVentana });
    console.log('URL=' + page.url());
    console.log('STEP_OK');
  } catch (e) {
    console.log('STEP_ERROR ' + e.message.split('\n')[0]);
    await page.screenshot({ path: path.join(path.dirname(paso), 'error.png') }).catch(() => {});
  }
  process.exit(0); // sin browser.close(), para no cerrar el Edge
})();
