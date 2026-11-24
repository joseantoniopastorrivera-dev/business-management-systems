const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view'); await L.menuApps(page); await shot('menu-de-aplicaciones-con-recursos-humanos'); await page.keyboard.press('Escape');
  await L.abrir(page, BASE, 'hr.hr_department_kanban_action', '1', '.o_kanban_view, .o_list_view');
  await shot('departamentos-iniciales-solo-administracion');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  await page.locator('.o_data_row').first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await L.campo(page, 'name', 'Administración y ventas'); await page.mouse.move(1350, 860); await shot('departamento-administracion-renombrado');
  await L.guardar(page); await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  for (const [n, slug] of [['Dirección', 'direccion'], ['Producción', 'produccion'], ['Logística', 'logistica']]) {
    await L.nuevo(page); await L.campo(page, 'name', n); await page.mouse.move(1350, 860); await shot('departamento-' + slug + '-nuevo');
    await L.guardar(page); await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('departamentos-de-la-fabrica');
  // Puestos de trabajo
  await L.abrir(page, BASE, 'hr.action_hr_job', '1', '.o_kanban_view, .o_list_view');
  await shot('puestos-de-trabajo-vacio');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  const J = [['Gerente', 'Dirección'], ['Maestro/a cervecero/a', 'Producción'], ['Operario/a de producción', 'Producción'], ['Responsable de logística y reparto', 'Logística'], ['Administrativo/a contable', 'Administración y ventas'], ['Comercial', 'Administración y ventas']];
  let k = 0;
  for (const [n, d] of J) {
    await L.nuevo(page);
    await L.campo(page, 'name', n);
    await L.m2o(page, 'department_id', d.split(' ')[0], null, d);
    if (k === 0 || k === 2) { await page.mouse.move(1350, 860); await shot('puesto-' + n.split('/')[0].toLowerCase().replace(/\W+/g, '-') + '-datos'); }
    await L.guardar(page); await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); k++;
  }
  await shot('puestos-de-trabajo-de-la-fabrica');
  log(JSON.stringify(await call('hr.job', 'search_read', [[]], { fields: ['name', 'department_id'] })));
};
