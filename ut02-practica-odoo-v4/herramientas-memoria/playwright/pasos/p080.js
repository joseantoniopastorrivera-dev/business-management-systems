const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=hr.leave&id=1&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.locator('.o_cp_action_menus button').first().click(); await page.waitForTimeout(600);
  await page.locator('.dropdown-item', { hasText: 'Eliminar' }).first().click(); await page.waitForTimeout(800);
  await page.locator('.modal-footer button:visible', { hasText: /Eliminar|Aceptar|Ok/ }).first().click(); await L.esperar(page, 1500);
  log('borrada=' + JSON.stringify(await call('hr.leave', 'search_read', [[['id', '=', 1]]], { fields: ['id'] })));
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=hr.leave&id=3&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.mouse.move(1350, 860); await shot('solicitud-vacaciones-marta-sanz-a-aprobar');
  await page.locator('.o_form_statusbar button:visible', { hasText: /Aprobar|Validar/ }).first().click(); await L.esperar(page, 2500);
  await page.mouse.move(1350, 860); await shot('solicitud-vacaciones-marta-sanz-aprobada');
  // Baja de Javier
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
  await page.locator('.o_kanban_record', { hasText: 'Javier Navarro' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_form_view button.oe_stat_button', { hasText: 'Ausencias' }).first().click(); await L.esperar(page, 2000);
  await L.nuevo(page).catch(() => {});
  await page.waitForSelector('.modal .o_field_widget[name=holiday_status_id]');
  const sc = page.locator('.modal');
  const h = sc.locator('.o_field_widget[name=holiday_status_id] input'); await h.click(); await h.fill(''); await page.keyboard.press('Backspace'); await page.waitForTimeout(1800);
  await page.locator('.o-autocomplete--dropdown-item', { hasText: /enfermedad/i }).first().click(); await page.waitForTimeout(800);
  for (const [n, v] of [[0, '25/11/2026'], [1, '25/11/2026']]) { const d = sc.locator('.o_field_widget[name=request_date_from] input').nth(n); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(900); }
  await sc.locator('.modal-title').click(); await page.waitForTimeout(500);
  await L.campo(page, 'name', 'Baja médica de un día (justificante del centro de salud)', sc);
  await page.mouse.move(1350, 860); await shot('solicitud-baja-javier-navarro');
  await page.locator('.modal-footer button:visible', { hasText: 'Guardar y cerrar' }).last().click(); await L.esperar(page, 2500);
  const j = await call('hr.leave', 'search_read', [[['employee_id.name', 'ilike', 'Javier']]], { fields: ['id', 'state'] });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=hr.leave&id=' + j[0].id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.locator('.o_form_statusbar button:visible', { hasText: /Aprobar|Validar/ }).first().click(); await L.esperar(page, 2500);
  await page.mouse.move(1350, 860); await shot('solicitud-baja-javier-navarro-aprobada');
  log(JSON.stringify(await call('hr.leave', 'search_read', [[]], { fields: ['employee_id', 'holiday_status_id', 'request_date_from', 'number_of_days', 'state'] })));
  await L.abrir(page, BASE, 'hr_holidays.action_hr_holidays_dashboard', '1', '.o_calendar_view, .o_gantt_view, .o_list_view');
  await page.waitForTimeout(2000); await shot('vista-general-de-ausencias');
};
