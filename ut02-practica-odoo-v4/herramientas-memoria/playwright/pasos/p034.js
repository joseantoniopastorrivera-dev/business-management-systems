const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=stock.action_procurement_compute&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.modal, .o_form_view', { timeout: 60000 }); await L.esperar(page, 1500);
  await shot('ejecutar-planificador-asistente');
  await page.locator('.modal-footer button, .o_form_buttons_edit button, footer button', { hasText: /Ejecutar planificador|Ejecutar/ }).first().click();
  await page.waitForTimeout(25000); await L.esperar(page, 3000);
  log('POs=' + JSON.stringify(await call('purchase.order', 'search_read', [[]], { fields: ['name', 'partner_id', 'amount_total', 'state', 'origin'] })));
  log('MOs=' + JSON.stringify(await call('mrp.production', 'search_read', [[]], { fields: ['name', 'product_id', 'product_qty', 'state', 'origin'] })));
};
