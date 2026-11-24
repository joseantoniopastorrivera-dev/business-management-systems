const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  // Desecho: barril de Stout con fuga
  await L.abrir(page, BASE, 'stock.action_stock_scrap', '1');
  await shot('desechos-vacio');
  await L.nuevo(page);
  await L.m2o(page, 'product_id', 'Springfield Stout', null, 'Springfield Stout');
  await page.waitForTimeout(800);
  await L.m2o(page, 'lot_id', 'STO-261123-01', null, 'STO-261123-01');
  const loc = page.locator('.o_field_widget[name=location_id] input'); if (await loc.count()) await L.m2o(page, 'location_id', 'Cámara fría', null, 'FAB/Stock/Cámara fría');
  await L.campo(page, 'origin', 'Barril con fuga por la válvula detectado en la cámara fría').catch(() => {});
  await page.mouse.move(1350, 860); await shot('desecho-barril-stout-con-fuga-datos');
  await page.locator('.o_form_statusbar button:visible, .o_form_view button:visible', { hasText: /^\s*Desechar\s*$/ }).first().click(); await L.esperar(page, 2500);
  if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await shot('desecho-aviso'); }
  await page.mouse.move(1350, 860); await shot('desecho-barril-stout-hecho');
  log(JSON.stringify(await call('stock.scrap', 'search_read', [[]], { fields: ['name', 'product_id', 'lot_id', 'scrap_qty', 'state', 'location_id', 'scrap_location_id'] })));
};
