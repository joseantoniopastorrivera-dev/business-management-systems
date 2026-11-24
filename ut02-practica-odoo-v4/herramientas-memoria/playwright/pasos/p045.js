const L = require('./lib');
module.exports = async ({ page, shot, log, call }) => {
  const filas = page.locator('.o_notebook .tab-pane.active .o_data_row');
  for (let i = 0; i < await filas.count(); i++) { const c = filas.nth(i).locator('td[name=picked] input[type=checkbox]'); if (!(await c.isChecked())) { await filas.nth(i).locator('td[name=picked]').click(); await page.waitForTimeout(300); if (!(await c.isChecked())) await c.click({ force: true }); await page.waitForTimeout(500); } }
  await page.locator('.o_form_view .o_form_sheet h1, .oe_title').first().click(); await page.mouse.move(1350, 860); await page.waitForTimeout(500);
  await shot('of-trigo-de-shelbyville-componentes-consumidos-con-sus-lotes');
  await page.locator('.o_form_statusbar button:visible', { hasText: /Producir todo/ }).first().click(); await L.esperar(page, 3000);
  if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 500)); }
  await page.mouse.move(1350, 860); await shot('of-trigo-de-shelbyville-hecha');
  log(JSON.stringify(await call('mrp.production', 'search_read', [[['id', 'in', [5, 6, 7, 8]]]], { fields: ['name', 'state', 'lot_producing_id'] })));
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['location_id.usage', '=', 'internal'], ['product_id.categ_id.name', 'in', ['Cerveza en barril', 'Subproductos']]]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id', 'value'] })));
  log(JSON.stringify(await call('stock.lot', 'search_read', [[['name', 'like', '-261123-01']]], { fields: ['name', 'product_qty', 'expiration_date'] })));
};
