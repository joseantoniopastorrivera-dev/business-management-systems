const L = require('./lib');
const F = [[5, 'INV/2026/00001', 'cerveceria-springfield-barriles'], [6, 'VDD-2026/0877', 'bodegas-valdecuevas'], [7, 'SDO-F-26/1543', 'bodegas-senorio-del-oja']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  let primero = true;
  for (const [id, ref, slug] of F) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=purchase.order&id=' + id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    if (primero) { await page.reload(); primero = false; }
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Crear factura' }).first().click(); await L.esperar(page, 2500);
    await page.waitForSelector('.o_form_view .o_field_widget[name=invoice_date]');
    await L.campo(page, 'ref', ref);
    const d = page.locator('.o_field_widget[name=invoice_date] input'); await d.click(); await d.fill('23/11/2026'); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.mouse.move(1350, 860); await shot('taberna-factura-proveedor-' + slug + '-borrador-con-referencia');
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Confirmar\s*$/ }).first().click(); await L.esperar(page, 2500);
    await page.mouse.move(1350, 860); await shot('taberna-factura-proveedor-' + slug + '-confirmada');
    if (id === 5) { await page.locator('.o_notebook .nav-link', { hasText: 'Apuntes contables' }).click(); await page.waitForTimeout(700); await page.mouse.move(1350, 860); await shot('taberna-factura-cerveceria-apuntes-600-472-400'); }
    await L.pagar(page, shot, 'taberna-factura-proveedor-' + slug);
  }
  log(JSON.stringify(await call('account.move', 'search_read', [[['move_type', '=', 'in_invoice'], ['company_id', '=', 2]]], { fields: ['name', 'ref', 'partner_id', 'amount_total', 'payment_state'] })));
  // la fábrica registra el cobro
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=54&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.reload(); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await L.pagar(page, shot, 'fabrica-factura-inv-2026-00001-cobro');
  log(JSON.stringify(await call('account.move', 'read', [[54], ['name', 'payment_state']])));
};
