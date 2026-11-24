const L = require('./lib');
const E = [
  ['Lucía Herrero Campos', 'Gerente', 'Gerente', 'Dirección', '', '+34 600 112 301', 'lucia.herrero', '2601', 'lucia-herrero'],
  ['Daniel Ortega Ruiz', 'Maestro cervecero', 'Maestro/a cervecero/a', 'Producción', 'Lucía Herrero', '+34 600 112 302', 'daniel.ortega', '2602', 'daniel-ortega'],
  ['Marta Sanz Delgado', 'Operaria de producción', 'Operario/a de producción', 'Producción', 'Daniel Ortega', '+34 600 112 303', 'marta.sanz', '2603', 'marta-sanz'],
  ['Javier Navarro Gil', 'Responsable de logística y reparto', 'Responsable de logística', 'Logística', 'Lucía Herrero', '+34 600 112 304', 'javier.navarro', '2604', 'javier-navarro'],
  ['Elena Cabrera Ramos', 'Administrativa contable', 'Administrativo/a contable', 'Administración y ventas', 'Lucía Herrero', '+34 600 112 305', 'elena.cabrera', '2605', 'elena-cabrera'],
  ['Pablo Fuentes Serrano', 'Comercial', 'Comercial', 'Administración y ventas', 'Lucía Herrero', '+34 600 112 306', 'pablo.fuentes', '2606', 'pablo-fuentes'],
];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
  await shot('empleados-iniciales-solo-administrator');
  let k = 0;
  for (const [n, titulo, job, dep, jefe, movil, mail, pin, slug] of E) {
    await L.nuevo(page);
    if (k === 0) await shot('empleado-formulario-nuevo');
    await L.campo(page, 'name', n); await L.campo(page, 'job_title', titulo);
    await L.campo(page, 'mobile_phone', movil); await L.campo(page, 'work_email', mail + '@cerveceriaspringfield.es');
    await L.m2o(page, 'department_id', dep.split(' ')[0], null, dep);
    await L.m2o(page, 'job_id', job.split('/')[0], null, job);
    if (jefe) { await L.m2o(page, 'parent_id', jefe, null, jefe); }
    await page.mouse.move(1350, 860); await shot('empleado-' + slug + '-datos');
    await page.locator('.o_notebook .nav-link', { hasText: 'Información de trabajo' }).click(); await page.waitForTimeout(600);
    if (k === 0) { await page.mouse.move(1350, 860); await shot('empleado-' + slug + '-informacion-de-trabajo-horario'); }
    await page.locator('.o_notebook .nav-link', { hasText: 'Ajustes de RR. HH.' }).click(); await page.waitForTimeout(600);
    await L.campo(page, 'pin', pin);
    if (k === 0) { await page.mouse.move(1350, 860); await shot('empleado-' + slug + '-ajustes-rrhh-pin-del-quiosco'); }
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); k++;
  }
  // archivar el empleado técnico del administrador
  await page.locator('.o_kanban_record, .o_data_row', { hasText: 'Administrator' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_cp_action_menus button').first().click(); await page.waitForTimeout(600);
  await page.locator('.dropdown-item', { hasText: 'Archivar' }).first().click(); await page.waitForTimeout(1200);
  if (await page.locator('.modal').count()) { await shot('empleado-administrator-archivar-motivo'); await page.locator('.modal-footer button').first().click(); await L.esperar(page, 1500); }
  await page.locator('.o_breadcrumb a').first().click().catch(() => {}); await L.esperar(page);
  await shot('plantilla-de-la-fabrica-kanban');
  log(JSON.stringify(await call('hr.employee', 'search_read', [[]], { fields: ['name', 'job_id', 'department_id', 'parent_id', 'resource_calendar_id'] })));
};
