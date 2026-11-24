const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.modal-footer button', { hasText: 'Descartar' }).click().catch(() => {}); await page.waitForTimeout(800);
  // el empleado del admin pasa a Administración como perfil técnico
  await L.campo(page, 'job_title', 'Administrador del sistema (perfil técnico)'); await L.guardar(page);
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
  await shot('plantilla-de-la-fabrica-kanban');
  await L.abrir(page, BASE, 'hr.hr_department_kanban_action', '1', '.o_kanban_view, .o_list_view');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  for (const [d, m] of [['Dirección', 'Lucía'], ['Producción', 'Daniel'], ['Logística', 'Javier'], ['Administración y ventas', 'Elena']]) {
    await page.locator('.o_data_row', { hasText: d }).first().locator('td[name=manager_id]').click(); await page.waitForTimeout(600);
    const i = page.locator('.o_data_row.o_selected_row td[name=manager_id] input'); await i.fill(''); await i.type(m, { delay: 40 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: m }).first().click(); await page.waitForTimeout(500);
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900);
  }
  await page.mouse.move(1350, 860); await shot('departamentos-con-responsable');
  await page.locator('.o_cp_switch_buttons button').last().click().catch(() => {}); await L.esperar(page, 2000);
  await shot('organigrama-de-departamentos');
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
  await page.locator('.o_kanban_record', { hasText: 'Marta Sanz' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.mouse.move(1350, 860); await shot('empleada-marta-sanz-con-organigrama');
  log(JSON.stringify(await call('hr.department', 'search_read', [[]], { fields: ['name', 'manager_id', 'total_employee'] })));
};
