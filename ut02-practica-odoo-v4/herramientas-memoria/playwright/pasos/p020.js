const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web#action=stock.action_warehouse_form&cids=1-2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page, 2000);
  // mostrar la columna compañía si existe
  await shot('incidencia-bodega-creada-en-la-empresa-equivocada');
  await page.locator('.o_data_row', { hasText: 'Bodega de vinos' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_cp_action_menus button, .o_control_panel .o_cp_action_menus .dropdown-toggle').first().click(); await page.waitForTimeout(700);
  await shot('bodega-equivocada-menu-accion-archivar');
  await page.locator('.dropdown-item', { hasText: 'Archivar' }).first().click(); await page.waitForTimeout(800);
  await page.locator('.modal-footer button', { hasText: /Archivar|Aceptar|Ok/ }).first().click(); await L.esperar(page, 1500);
  await shot('bodega-equivocada-archivada');
  // crear con la taberna como única empresa activa
  await page.goto(BASE + '/web#action=stock.action_warehouse_form&cids=2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page, 2000);
  await shot('almacenes-con-la-taberna-como-empresa-activa');
  await L.nuevo(page);
  await L.campo(page, 'name', 'Bodega de vinos'); await L.campo(page, 'code', 'BOD');
  await shot('almacen-bodega-de-vinos-datos-en-la-taberna');
  await L.guardar(page);
  await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  await page.locator('.o_data_row', { hasText: 'Bar de la taberna' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_notebook .nav-link', { hasText: 'Configuración' }).first().click(); await page.waitForTimeout(800);
  const w = page.locator('.o_field_widget[name=resupply_wh_ids]');
  await w.locator('label', { hasText: 'Bodega de vinos' }).click(); await page.waitForTimeout(700);
  await shot('almacen-bar-reabastecer-desde-bodega-de-vinos');
  await L.guardar(page); await shot('almacen-bar-guardado-con-reabastecimiento');
  log(JSON.stringify(await call('stock.warehouse', 'search_read', [['|', ['active', '=', true], ['active', '=', false]]], { fields: ['name', 'code', 'company_id', 'active'] })));
  log(JSON.stringify(await call('stock.route', 'search_read', [[['name', 'ilike', 'Bodega']]], { fields: ['name', 'company_id'] })));
};
