const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'mrp.mrp_workcenter_action', '1');
  for (const [n, cap, slug] of [['Sala de cocción', '10', 'sala-de-coccion'], ['Fermentadores', '40', 'fermentadores'], ['Línea de embarrilado', '10', 'linea-de-embarrilado']]) {
    await page.locator('.o_data_row', { hasText: n }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await L.campo(page, 'default_capacity', cap);
    await page.mouse.move(1350, 860); await shot('centro-' + slug + '-capacidad-' + cap + '-barriles');
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('centros-de-trabajo-con-capacidad-en-barriles');
  log(JSON.stringify(await call('mrp.workcenter', 'search_read', [[]], { fields: ['name', 'default_capacity'] })));
};
