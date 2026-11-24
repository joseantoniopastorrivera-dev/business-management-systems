const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  for (const c of ['group_lot_on_delivery_slip', 'group_lot_on_invoice']) { await page.locator(`.o_field_widget[name="${c}"]`).first().scrollIntoViewIfNeeded(); await L.check(page, c, true); }
  await shot('ajustes-inventario-lotes-en-albaranes-y-facturas-marcado');
  await L.guardarAjustes(page);
  // Fabricación: órdenes de trabajo
  await page.goto(BASE + '/web#action=mrp.action_mrp_configuration&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_setting_container'); await L.esperar(page, 2000);
  await page.locator('.o_field_widget[name="group_mrp_routings"]').first().scrollIntoViewIfNeeded();
  await shot('ajustes-fabricacion-antes-de-activar');
  await L.check(page, 'group_mrp_routings', true); await shot('ajustes-fabricacion-ordenes-de-trabajo-marcado');
  await L.guardarAjustes(page);
  await page.locator('.o_field_widget[name="group_mrp_routings"]').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  await shot('ajustes-fabricacion-guardados');
  log(await page.locator('.o_setting_container').innerText().then(t => t.slice(0, 1200)));
};
