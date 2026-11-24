const L = require('./lib');
const A = [['Marta Sanz', '23/11/2026 08:00:00', '23/11/2026 17:00:00'], ['Elena Cabrera', '23/11/2026 08:00:00', '23/11/2026 17:00:00'], ['Javier Navarro', '23/11/2026 08:00:00', '23/11/2026 18:30:00'], ['Daniel Ortega', '23/11/2026 08:00:00', '23/11/2026 17:00:00']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  if (0) { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  await L.abrir(page, BASE, 'hr_attendance.hr_attendance_action', '1', '.o_list_view');
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  for (const [e, ini, fin] of A) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(1000);
    const form = await page.locator('.o_form_view').count();
    const sc = form ? page : page.locator('.o_data_row.o_selected_row');
    const ie = sc.locator((form ? '.o_field_widget[name=employee_id]' : 'td[name=employee_id]') + ' input'); await ie.click(); await ie.fill(''); await ie.type(e, { delay: 40 }); await page.waitForTimeout(1200);
    await page.locator('.o-autocomplete--dropdown-item:not(.o_m2o_dropdown_option)', { hasText: e }).first().click(); await page.waitForTimeout(500);
    for (const [f, v] of [['check_in', ini], ['check_out', fin]]) { const c = sc.locator((form ? `.o_field_widget[name=${f}]` : `td[name=${f}]`) + ' input'); await c.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Tab'); await page.waitForTimeout(400); }
    if (form) { await L.guardar(page); await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); }
    else { await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900); }
  }
  await page.mouse.move(1350, 860); await shot('asistencias-del-23-11-con-horas-extra');
  log(JSON.stringify(await call('hr.attendance', 'search_read', [[]], { fields: ['employee_id', 'check_in', 'check_out', 'worked_hours', 'overtime_hours'] })));
};
