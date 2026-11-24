const L = require('./lib');
const A = [['Marta Sanz', '23/11/2026 08:00:00', '23/11/2026 17:00:00'], ['Elena Cabrera', '23/11/2026 08:00:00', '23/11/2026 17:00:00'], ['Javier Navarro', '23/11/2026 08:00:00', '23/11/2026 18:30:00'], ['Daniel Ortega', '23/11/2026 08:00:00', '23/11/2026 17:00:00']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  // salida de Daniel tras el control nocturno
  await page.locator('.o_data_row', { hasText: 'Daniel Ortega' }).first().click(); await page.waitForTimeout(1200);
  if (await page.locator('.o_form_view').count()) { const c = page.locator('.o_field_widget[name=check_out] input'); await c.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('24/11/2026 03:30:00'); await page.keyboard.press('Enter'); await page.waitForTimeout(500); await L.guardar(page); await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); }
  else { const c = page.locator('.o_data_row.o_selected_row td[name=check_out] input'); await c.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('24/11/2026 03:30:00'); await page.keyboard.press('Tab'); await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900); }
  for (const [e, ini, fin] of A) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(1000);
    const form = await page.locator('.o_form_view').count();
    const sc = form ? page : page.locator('.o_data_row.o_selected_row');
    const ie = sc.locator((form ? '.o_field_widget[name=employee_id]' : 'td[name=employee_id]') + ' input'); await ie.click(); await ie.type(e, { delay: 40 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: e }).first().click(); await page.waitForTimeout(500);
    for (const [f, v] of [['check_in', ini], ['check_out', fin]]) { const c = sc.locator((form ? `.o_field_widget[name=${f}]` : `td[name=${f}]`) + ' input'); await c.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Tab'); await page.waitForTimeout(400); }
    if (form) { await L.guardar(page); await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); }
    else { await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900); }
  }
  await page.mouse.move(1350, 860); await shot('asistencias-del-23-11-con-horas-extra');
  log(JSON.stringify(await call('hr.attendance', 'search_read', [[]], { fields: ['employee_id', 'check_in', 'check_out', 'worked_hours', 'overtime_hours'] })));
};
