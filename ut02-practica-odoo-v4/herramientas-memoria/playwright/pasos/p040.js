const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  log('nombre=' + await page.locator('.o_field_widget[name=name] input').inputValue());
  await page.locator('.o_field_widget[name=tz] select').selectOption('"Europe/Madrid"').catch(async () => { await page.locator('.o_field_widget[name=tz] select').selectOption({ label: 'Europe/Madrid' }); });
  await page.waitForTimeout(500);
  await page.mouse.move(1350, 860); await shot('horario-fermentacion-continua-24-7-siete-dias-europe-madrid');
  await L.guardar(page); await shot('horario-fermentacion-continua-guardado');
  await L.abrir(page, BASE, 'mrp.mrp_workcenter_action', '1');
  await page.locator('.o_data_row', { hasText: 'Fermentadores' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await L.m2o(page, 'resource_calendar_id', 'Fermentación', null, 'Fermentación continua 24/7');
  await page.mouse.move(1350, 860); await shot('centro-fermentadores-con-horario-24-7');
  await L.guardar(page);
  log(JSON.stringify(await call('mrp.workcenter', 'search_read', [[]], { fields: ['name', 'resource_calendar_id'] })));
  log(JSON.stringify(await call('res.users', 'read', [[2], ['tz']])));
  log(JSON.stringify(await call('resource.calendar', 'search_read', [[]], { fields: ['name', 'tz', 'company_id'] })));
};
