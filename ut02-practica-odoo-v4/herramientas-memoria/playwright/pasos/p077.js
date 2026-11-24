const L = require('./lib');
const fecha = async (page, name, v) => { const d = page.locator(`.o_field_widget[name=${name}] input`).first(); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(800); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_holidays.hr_leave_action_action_approve_department', '1', '.o_list_view, .o_kanban_view');
  for (const [emp, tipo, ini, fin, desc, slug] of [['Marta Sanz', 'Ausencia pagada', '21/12/2026', '23/12/2026', 'Vacaciones de Navidad', 'vacaciones-marta-sanz'], ['Javier Navarro', 'enfermedad', '25/11/2026', '25/11/2026', 'Baja médica de un día (justificante del centro de salud)', 'baja-javier-navarro']]) {
    await L.nuevo(page);
    const i = page.locator('.o_field_widget[name=employee_ids] input').first(); await i.click(); await i.type(emp, { delay: 40 });
    await page.waitForTimeout(1500); log('items=' + JSON.stringify(await page.locator('.o-autocomplete--dropdown-item').allInnerTexts()));
    await page.locator('.o-autocomplete--dropdown-item', { hasText: emp }).first().click(); await page.waitForTimeout(800);
    if (tipo !== 'Ausencia pagada') {
    const h = page.locator('.o_field_widget[name=holiday_status_id] input'); await h.click(); await h.fill(''); await page.keyboard.press('Backspace'); await page.waitForTimeout(1800);
    log('tipos=' + JSON.stringify(await page.locator('.o-autocomplete--dropdown-item').allInnerTexts()));
    await page.locator('.o-autocomplete--dropdown-item', { hasText: new RegExp(tipo, 'i') }).first().click(); await page.waitForTimeout(800);
    } else log('tipo por defecto=' + await page.locator('.o_field_widget[name=holiday_status_id] input').inputValue());
    await fecha(page, 'request_date_from', ini); await fecha(page, 'request_date_to', fin);
    await L.campo(page, 'name', desc);
    await page.mouse.move(1350, 860); await shot('solicitud-' + slug);
    await L.guardar(page);
    if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); }
    log('SB=' + await page.locator('.o_form_statusbar .o_statusbar_buttons').innerText().catch(() => ''));
    const b = page.locator('.o_form_statusbar button:visible', { hasText: /Aprobar|Validar/ }); if (await b.count()) { await b.first().click(); await L.esperar(page, 2500); }
    await page.mouse.move(1350, 860); await shot('solicitud-' + slug + '-aprobada');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  log(JSON.stringify(await call('hr.leave', 'search_read', [[]], { fields: ['employee_id', 'holiday_status_id', 'request_date_from', 'request_date_to', 'number_of_days', 'state'] })));
  await L.abrir(page, BASE, 'hr_holidays.action_hr_holidays_dashboard', '1', '.o_calendar_view, .o_gantt_view, .o_list_view');
  await page.waitForTimeout(2000); await shot('vista-general-de-ausencias');
};
