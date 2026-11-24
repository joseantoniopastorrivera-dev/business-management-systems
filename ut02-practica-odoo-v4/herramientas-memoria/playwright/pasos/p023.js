const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_location_form', '2');
  await shot('incidencia-ubicacion-materias-primas-sobrante-en-la-taberna');
  await page.locator('.o_data_row', { hasText: /^\s*Materias primas/ }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_cp_action_menus button').first().click(); await page.waitForTimeout(600);
  await page.locator('.dropdown-item', { hasText: 'Archivar' }).first().click(); await page.waitForTimeout(800);
  await page.locator('.modal-footer button', { hasText: /Archivar|Aceptar|Ok/ }).first().click(); await L.esperar(page, 1500);
  await shot('ubicacion-sobrante-archivada');
  log(JSON.stringify(await call('stock.location', 'read', [[47], ['active']])));
};
