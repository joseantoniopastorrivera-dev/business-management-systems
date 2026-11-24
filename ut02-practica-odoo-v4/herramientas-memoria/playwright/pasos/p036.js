const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'mrp.mrp_production_action', '1');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  for (let i = 1; i <= 4; i++) {
    await page.locator('.o_data_row', { hasText: 'WH/MO/0000' + i }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Cancelar\s*$/ }).first().click(); await L.esperar(page, 1500);
    if (await page.locator('.modal').count()) await page.locator('.modal-footer button').first().click();
    await L.esperar(page, 1000);
    if (i === 1) await shot('orden-wh-mo-00001-cancelada');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('ordenes-wh-canceladas');
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=stock.action_procurement_compute&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.modal'); await L.esperar(page, 1000);
  await page.locator('.modal-footer button', { hasText: /Ejecutar/ }).first().click();
  await page.waitForTimeout(25000);
  log('MOs=' + JSON.stringify(await call('mrp.production', 'search_read', [[]], { fields: ['name', 'product_qty', 'state'] })));
  log('POs=' + JSON.stringify(await call('purchase.order', 'search_read', [[]], { fields: ['name', 'partner_id', 'amount_untaxed', 'amount_total', 'state'] })));
};
