const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'purchase.purchase_rfq', '2');
  await shot('taberna-peticiones-de-presupuesto-generadas');
  for (const [po, slug] of [['P00005', 'cerveceria-springfield-barriles'], ['P00006', 'bodegas-valdecuevas'], ['P00007', 'bodegas-senorio-del-oja']]) {
    await page.locator('.o_data_row', { hasText: po }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.mouse.move(1350, 860); await shot('taberna-sdp-' + po.toLowerCase() + '-' + slug);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Confirmar pedido' }).first().click(); await L.esperar(page, 2000);
    await page.mouse.move(1350, 860); await shot('taberna-pedido-' + po.toLowerCase() + '-' + slug + '-confirmado');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  log(JSON.stringify(await call('stock.picking', 'search_read', [[['company_id', '=', 2]]], { fields: ['name', 'origin', 'state', 'partner_id'] })));
};
