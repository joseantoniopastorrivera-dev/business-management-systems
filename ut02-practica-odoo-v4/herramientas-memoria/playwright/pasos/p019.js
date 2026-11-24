const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  log(JSON.stringify(await call('stock.warehouse', 'search_read', [[]], { fields: ['name', 'code', 'company_id'] })));
  const w = page.locator('.o_field_widget[name=resupply_wh_ids]');
  log('html=' + (await w.innerHTML()).slice(0, 600));
  await w.locator('label', { hasText: 'Bodega de vinos' }).click(); await page.waitForTimeout(700);
  await shot('almacen-bar-reabastecer-desde-bodega-de-vinos');
  await L.guardar(page); await shot('almacen-bar-guardado-con-reabastecimiento');
  log(JSON.stringify(await call('stock.route', 'search_read', [[['name', 'ilike', 'Bodega']]], { fields: ['name', 'company_id', 'rule_ids'] })));
};
