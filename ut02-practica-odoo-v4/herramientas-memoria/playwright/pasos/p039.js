const L = require('./lib');
const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=resource.action_resource_calendar_form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page);
  await shot('horarios-de-trabajo-solo-el-estandar-de-40-horas');
  await L.nuevo(page);
  await L.campo(page, 'name', 'Fermentación continua 24/7');
  await shot('horario-nuevo-con-plantilla-de-40-horas');
  const tabla = page.locator('.o_field_widget[name=attendance_ids]');
  while (await tabla.locator('.o_data_row').count()) { await tabla.locator('.o_data_row').first().locator('.o_list_record_remove button').click(); await page.waitForTimeout(250); }
  for (const d of DIAS) {
    await tabla.locator('.o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(600);
    const r = tabla.locator('.o_data_row.o_selected_row');
    await r.locator('td[name=name] input').fill(d + ' (turno continuo)');
    await r.locator('td[name=dayofweek] select').selectOption({ label: d });
    const hf = r.locator('td[name=hour_from]'); await hf.click(); await hf.locator('input').fill('00:00');
    const ht = r.locator('td[name=hour_to]'); await ht.click(); await ht.locator('input').fill('24:00');
    await page.waitForTimeout(300);
  }
  await page.locator('.o_form_sheet').click({ position: { x: 5, y: 5 } });
  await L.campo(page, 'hours_per_day', '24');
  await page.mouse.move(1350, 860); await shot('horario-fermentacion-continua-24-7-siete-dias');
  await L.guardar(page); await shot('horario-fermentacion-continua-guardado');
  // asignarlo al centro Fermentadores
  await L.abrir(page, BASE, 'mrp.mrp_workcenter_action', '1');
  await page.locator('.o_data_row', { hasText: 'Fermentadores' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await L.m2o(page, 'resource_calendar_id', 'Fermentación', null, 'Fermentación continua 24/7');
  await page.mouse.move(1350, 860); await shot('centro-fermentadores-con-horario-24-7');
  await L.guardar(page);
  log(JSON.stringify(await call('mrp.workcenter', 'search_read', [[]], { fields: ['name', 'resource_calendar_id'] })));
};
