const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  // 1) Contabilidad de stock automática en el usuario
  await L.casillaPorEtiqueta(page, 'Contabilidad de stock automática');
  await shot('usuario-administrador-contabilidad-de-stock-automatica-marcada');
  await L.guardar(page);
  // 2) Grupo «Mostrar características de contabilidad completas»
  await page.goto(BASE + '/web?debug=1#action=base.action_res_groups&model=res.groups&view_type=list&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page);
  await page.locator('.o_searchview_input').fill('contabilidad completas'); await page.keyboard.press('Enter'); await L.esperar(page);
  await shot('grupos-buscar-caracteristicas-de-contabilidad-completas');
  await page.locator('.o_data_row').first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await shot('grupo-contabilidad-completa-sin-usuarios');
  await page.locator('.o_field_x2many_list_row_add a').first().click(); await page.waitForSelector('.modal .o_list_view'); await L.esperar(page);
  await page.locator('.modal .o_data_row', { hasText: 'Administrator' }).locator('input[type=checkbox]').first().check(); await page.waitForTimeout(500);
  await shot('grupo-contabilidad-completa-anadir-administrator');
  await page.locator('.modal-footer button', { hasText: 'Seleccionar' }).click(); await page.waitForTimeout(1000);
  await L.guardar(page); await shot('grupo-contabilidad-completa-con-administrator');
  log(JSON.stringify(await call('res.groups', 'read', [[24, 48], ['users']])));
};
