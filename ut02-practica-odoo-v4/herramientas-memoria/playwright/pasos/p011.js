const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web#action=stock.action_stock_config_settings&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_setting_container, .settings'); await L.esperar(page, 2500);
  log('empresa activa: ' + await page.locator('.o_switch_company_menu').innerText());
  const marcar = async (campo, texto, slug) => {
    const box = page.locator(`.o_field_widget[name="${campo}"]`).first();
    await box.scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
    await L.check(page, campo, true);
    await shot('ajustes-inventario-' + slug + '-marcado');
  };
  await L.ajuste(page, 'Unidades de medida'); await shot('ajustes-inventario-antes-de-activar');
  await marcar('group_uom', 'Unidades de medida', 'unidades-de-medida');
  await marcar('group_stock_production_lot', 'Lotes', 'lotes-y-numeros-de-serie');
  await marcar('module_product_expiry', 'caducidad', 'fechas-de-caducidad');
  await marcar('group_stock_multi_locations', 'Ubicaciones', 'ubicaciones-de-almacenamiento');
  await marcar('group_stock_adv_location', 'Rutas', 'rutas-multipaso');
  await L.guardarAjustes(page);
  await page.locator('.o_field_widget[name="group_stock_production_lot"]').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  await shot('ajustes-inventario-guardados-lotes-y-caducidad');
  log('product_expiry=' + await L.ok(call, 'product_expiry'));
};
