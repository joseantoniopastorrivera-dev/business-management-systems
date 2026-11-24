const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=stock.action_procurement_compute&cids=2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.modal'); await L.esperar(page, 1000);
  log('empresa=' + await page.locator('.o_switch_company_menu').innerText());
  await shot('taberna-ejecutar-planificador');
  await page.locator('.modal-footer button', { hasText: /Ejecutar/ }).first().click();
  await page.waitForTimeout(25000);
  log('POs=' + JSON.stringify(await call('purchase.order', 'search_read', [[['company_id', '=', 2]]], { fields: ['name', 'partner_id', 'amount_untaxed', 'amount_total', 'state'] })));
  log('INT=' + JSON.stringify(await call('stock.picking', 'search_read', [[['company_id', '=', 2]]], { fields: ['name', 'picking_type_id', 'state', 'location_id', 'location_dest_id'] })));
};
