const L = require('./lib');
const P = [['Lucía Herrero', '20'], ['Daniel Ortega', '18'], ['Elena Cabrera', '18'], ['Marta Sanz', '17'], ['Javier Navarro', '17'], ['Pablo Fuentes', '13']];
const fecha = async (page, name, v) => { const d = page.locator(`.o_field_widget[name=${name}] input`).first(); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(600); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_holidays.hr_leave_allocation_action_all', '1', '.o_list_view, .o_kanban_view');
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  await shot('asignaciones-por-empleado-22-dias');
  let k = 0;
  for (const [n, d] of P) {
    await page.locator('.o_data_row', { hasText: n }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await L.campo(page, 'number_of_days_display', d);
    await L.campo(page, 'notes', 'Prorrata por fecha de alta (art. 38 ET): 22 días × meses trabajados / 12.').catch(() => {});
    if (k === 0 || n === 'Pablo Fuentes') { await page.mouse.move(1350, 860); await shot('asignacion-' + n.toLowerCase().replace(/\W+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '') + '-prorrata-' + d + '-dias'); }
    await L.guardar(page);
    if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await shot('asignacion-aviso'); break; }
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); k++;
  }
  await shot('asignaciones-prorrateadas');
  log(JSON.stringify(await call('hr.leave.allocation', 'search_read', [[['holiday_type', '=', 'employee']]], { fields: ['employee_id', 'number_of_days', 'state'] })));
  // Solicitudes de ausencia
  await L.abrir(page, BASE, 'hr_holidays.hr_leave_action_action_approve_department', '1', '.o_list_view, .o_kanban_view');
  for (const [emp, tipo, ini, fin, desc, slug] of [['Marta Sanz', 'Ausencia pagada', '21/12/2026', '23/12/2026', 'Vacaciones de Navidad', 'vacaciones-marta-sanz'], ['Javier Navarro', 'Ausencias por enfermedad', '25/11/2026', '25/11/2026', 'Baja médica de un día (justificante del centro de salud)', 'baja-javier-navarro']]) {
    await L.nuevo(page);
    await L.m2o(page, 'employee_id', emp, null, emp).catch(async () => L.m2o(page, 'employee_ids', emp, null, emp));
    await L.m2o(page, 'holiday_status_id', tipo.split(' ')[0] + ' ' + tipo.split(' ')[1], null, tipo);
    await fecha(page, 'request_date_from', ini); await fecha(page, 'request_date_to', fin);
    await L.campo(page, 'name', desc).catch(() => {});
    await page.mouse.move(1350, 860); await shot('solicitud-' + slug);
    await L.guardar(page);
    const b = page.locator('.o_form_statusbar button:visible', { hasText: /Aprobar|Validar/ }); if (await b.count()) { await b.first().click(); await L.esperar(page, 2500); }
    await page.mouse.move(1350, 860); await shot('solicitud-' + slug + '-aprobada');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  log(JSON.stringify(await call('hr.leave', 'search_read', [[]], { fields: ['employee_id', 'holiday_status_id', 'request_date_from', 'request_date_to', 'number_of_days', 'state'] })));
  await L.abrir(page, BASE, 'hr_holidays.action_hr_holidays_dashboard', '1', '.o_calendar_view, .o_gantt_view, .o_list_view');
  await page.waitForTimeout(2000); await shot('vista-general-de-ausencias');
};
