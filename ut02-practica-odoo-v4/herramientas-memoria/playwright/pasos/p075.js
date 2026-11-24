const L = require('./lib');
const fecha = async (page, name, v) => { const d = page.locator(`.o_field_widget[name=${name}] input`).first(); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(600); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  await shot('asignacion-de-ausencias-formulario-nuevo');
  await L.campo(page, 'private_name', 'Vacaciones anuales 2026 (22 días laborables, art. 38 ET)');
  await L.m2o(page, 'holiday_status_id', 'Ausencia pagada', null, 'Ausencia pagada');
  await page.locator('.o_field_widget[name=holiday_type] select').selectOption('"company"').catch(async () => page.locator('.o_field_widget[name=holiday_type] select').selectOption({ label: 'Por compañía' }));
  await page.waitForTimeout(800);
  await fecha(page, 'date_from', '01/01/2026'); await fecha(page, 'date_to', '31/12/2026');
  await L.campo(page, 'number_of_days_display', '22');
  await page.mouse.move(1350, 860); await shot('asignacion-vacaciones-2026-por-compania-22-dias');
  await L.guardar(page);
  log('SB=' + await page.locator('.o_form_statusbar .o_statusbar_buttons').innerText().catch(() => ''));
  const b = page.locator('.o_form_statusbar button:visible', { hasText: /Validar|Aprobar/ }); if (await b.count()) { await b.first().click(); await L.esperar(page, 2500); }
  await page.mouse.move(1350, 860); await shot('asignacion-vacaciones-2026-validada');
  log(JSON.stringify(await call('hr.leave.allocation', 'search_read', [[]], { fields: ['employee_id', 'number_of_days', 'state', 'holiday_type'] })));
};
