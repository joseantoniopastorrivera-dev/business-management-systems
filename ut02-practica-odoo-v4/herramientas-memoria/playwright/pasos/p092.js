const L = require('./lib');
module.exports = async ({ page, shot, log, call }) => {
  const d = page.locator('.o_field_widget[name=overtime_start_date] input'); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('01/11/2026'); await page.keyboard.press('Enter'); await page.waitForTimeout(700);
  await L.check(page, 'hr_attendance_display_overtime', true);
  await page.evaluate(() => { const e = document.querySelector('.o_field_widget[name=attendance_kiosk_url]'); if (e) e.style.filter = 'blur(7px)'; });
  await page.locator('.o_field_widget[name=overtime_start_date]').scrollIntoViewIfNeeded(); await page.mouse.move(1350, 860); await page.waitForTimeout(500);
  await shot('ajustes-horas-extra-empezar-desde-01-11-2026');
  await page.locator('.o_control_panel button', { hasText: 'Guardar' }).first().click(); await L.esperarRecarga2(page);
  await page.locator('.o_field_widget[name=overtime_start_date]').scrollIntoViewIfNeeded().catch(() => {}); await page.waitForTimeout(800);
  await page.evaluate(() => { const e = document.querySelector('.o_field_widget[name=attendance_kiosk_url]'); if (e) e.style.filter = 'blur(7px)'; });
  await page.mouse.move(1350, 860); await shot('ajustes-asistencias-guardados-seleccion-manual-y-horas-extra');
  log(JSON.stringify(await call('res.company', 'read', [[1], ['attendance_kiosk_mode', 'hr_attendance_overtime', 'overtime_start_date']])));
  log(JSON.stringify(await call('hr.attendance', 'search_read', [[]], { fields: ['employee_id', 'check_in', 'worked_hours', 'overtime_hours'] })));
};
