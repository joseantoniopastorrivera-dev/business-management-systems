const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.o_list_button_discard:visible, .o_control_panel button:has-text("Descartar")').first().click().catch(() => {}); await page.waitForTimeout(800);
  const fila = async (n) => { const c = page.locator('.o_data_row.o_selected_row td[name=name] input'); await c.fill(n); await page.waitForTimeout(300); };
  await page.locator('.o_data_row').first().locator('td[name=name]').click(); await page.waitForTimeout(700);
  await fila('Administración y ventas'); await page.mouse.move(1350, 860); await shot('departamento-administracion-renombrado-en-la-lista');
  await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900);
  for (const n of ['Dirección', 'Producción', 'Logística']) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(900);
    await fila(n); await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900);
  }
  await page.mouse.move(1350, 860); await shot('departamentos-de-la-fabrica');
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
