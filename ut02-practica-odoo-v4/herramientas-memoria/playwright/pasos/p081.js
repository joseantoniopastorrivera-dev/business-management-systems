const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=hr.leave&id=3&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.mouse.move(1350, 860); await shot('vacaciones-marta-segunda-aprobacion-pendiente');
  await page.locator('.o_form_statusbar button:visible', { hasText: /Validar/ }).first().click(); await L.esperar(page, 2500);
  await page.mouse.move(1350, 860); await shot('vacaciones-marta-validadas-por-rrhh');
  log(JSON.stringify(await call('hr.leave', 'read', [[3], ['state']])));
  // Asistencias: ajustes
  await L.abrir(page, BASE, 'hr_attendance.action_hr_attendance_settings', '1', '.o_setting_container');
  await shot('ajustes-asistencias');
  log((await page.locator('.o_setting_container').innerText()).slice(0, 1500));
};
