const L = require('./lib');
const F = [[1, 'MD-FV-2026/01187', 'maltas-del-duero'], [2, 'LL-26/0412', 'lupulos-de-leon'], [3, 'LI-A-26-3391', 'levaduras-ibericas'], [4, 'ETH/2026/00978', 'envases-del-henares']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const [id, ref, slug] of F) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=purchase.order&id=' + id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Crear factura' }).first().click(); await L.esperar(page, 2500);
    await page.waitForSelector('.o_form_view .o_field_widget[name=invoice_date]');
    await page.mouse.move(1350, 860); await shot('factura-proveedor-' + slug + '-borrador-desde-el-pedido');
    await L.campo(page, 'ref', ref);
    const d = page.locator('.o_field_widget[name=invoice_date] input'); await d.click(); await d.fill('23/11/2026'); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    await page.mouse.move(1350, 860); await shot('factura-proveedor-' + slug + '-referencia-y-fecha');
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Confirmar\s*$/ }).first().click(); await L.esperar(page, 2500);
    await page.mouse.move(1350, 860); await shot('factura-proveedor-' + slug + '-confirmada');
    await L.pagar(page, shot, 'factura-proveedor-' + slug);
  }
  log(JSON.stringify(await call('account.move', 'search_read', [[['move_type', '=', 'in_invoice'], ['company_id', '=', 1]]], { fields: ['name', 'ref', 'partner_id', 'amount_total', 'state', 'payment_state'] })));
};
