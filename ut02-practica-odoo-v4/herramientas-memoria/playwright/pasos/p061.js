const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  // Trazabilidad hacia delante del lote de lúpulo (simulación de retirada)
  await L.abrir(page, BASE, 'stock.action_production_lot_form', '1');
  await L.listaLotes(page);
  await shot('fabrica-lotes-de-materias-primas-y-producto');
  for (const [lote, slug] of [['LL-2026-CAS-041', 'lupulo-cascade'], ['IPA-261123-01', 'barril-ipa']]) {
    await page.locator('.o_data_row', { hasText: lote }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.mouse.move(1350, 860); await shot('lote-' + slug + '-ficha');
    await page.locator('.oe_stat_button, button', { hasText: 'Trazabilidad' }).first().click(); await L.esperar(page, 2500);
    // desplegar todas las líneas
    for (let i = 0; i < 4; i++) { const c = page.locator('.o_stock_reports_unfoldable, .o_stock_reports_foldable.fa-caret-right, span.fa-caret-right'); const n = await c.count(); if (!n) break; for (let k = 0; k < n; k++) await c.nth(0).click().catch(() => {}), await page.waitForTimeout(700); }
    await page.mouse.move(1350, 860); await shot('trazabilidad-' + slug + (slug === 'lupulo-cascade' ? '-simulacion-de-retirada' : '-de-componentes-a-cliente'));
    log((await page.locator('.o_action_manager').innerText()).slice(0, 1200));
    await L.abrir(page, BASE, 'stock.action_production_lot_form', '1'); await L.listaLotes(page);
  }
};
