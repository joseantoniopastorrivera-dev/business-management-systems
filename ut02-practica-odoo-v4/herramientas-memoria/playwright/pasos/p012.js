const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.esperarRecarga2(page);
  await page.locator('.o_field_widget[name="group_stock_production_lot"]').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(1000);
  await shot('ajustes-inventario-guardados-lotes-y-caducidad');
  await page.locator('.o_field_widget[name="group_stock_adv_location"]').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(800);
  await shot('ajustes-inventario-guardados-ubicaciones-y-rutas');
  log(JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_setting_box, .o_setting_container .o_setting_box')].filter(b => /caducidad|Lotes|Ubicaciones|Rutas|Unidades/.test(b.innerText)).map(b => b.innerText.split('\n')[0] + '=' + (b.querySelector('input[type=checkbox]') || {}).checked))));
};
