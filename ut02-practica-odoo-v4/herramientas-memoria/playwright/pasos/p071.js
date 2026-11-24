const L = require('./lib');
const C = [
  ['Lucía Herrero', 'Indefinido · Gerente · Lucía Herrero Campos', '01/02/2026', '', 'Perman', '3200', 'lucia-herrero'],
  ['Daniel Ortega', 'Indefinido · Maestro cervecero · Daniel Ortega Ruiz', '01/03/2026', '', 'Perman', '2600', 'daniel-ortega'],
  ['Marta Sanz', 'Indefinido · Operaria de producción · Marta Sanz Delgado', '01/04/2026', '', 'Perman', '1650', 'marta-sanz'],
  ['Javier Navarro', 'Indefinido · Logística y reparto · Javier Navarro Gil', '01/04/2026', '', 'Perman', '1800', 'javier-navarro'],
  ['Elena Cabrera', 'Indefinido · Administrativa contable · Elena Cabrera Ramos', '01/03/2026', '', 'Perman', '1750', 'elena-cabrera'],
  ['Pablo Fuentes', 'Indefinido · Comercial · Pablo Fuentes Serrano', '01/06/2026', '', 'Perman', '1900', 'pablo-fuentes'],
];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_contract.action_hr_contract', '1', '.o_kanban_view, .o_list_view');
  await shot('contratos-vacio');
  let k = 0;
  for (const [emp, nombre, ini, fin, tipo, sal, slug] of C) {
    await L.nuevo(page);
    await L.campo(page, 'name', nombre);
    await L.m2o(page, 'employee_id', emp, null, emp);
    const d = page.locator('.o_field_widget[name=date_start] input'); await d.click(); await d.fill(ini); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    await L.m2o(page, 'contract_type_id', tipo, null, new RegExp(tipo));
    await L.campo(page, 'wage', sal);
    await page.locator('.o_form_view .oe_title, .o_form_view h1').first().click().catch(() => {});
    await page.mouse.move(1350, 860); await shot('contrato-' + slug + '-datos');
    if (k === 0) { await page.locator('.o_notebook .nav-link', { hasText: 'Detalles del contrato' }).click(); await page.waitForTimeout(600); await page.mouse.move(1350, 860); await shot('contrato-' + slug + '-detalles'); }
    await L.guardar(page);
    await page.locator('.o_form_statusbar .o_arrow_button, .o_statusbar_status button', { hasText: 'En proceso' }).first().click(); await L.esperar(page, 1500);
    if (k === 0) { await page.mouse.move(1350, 860); await shot('contrato-' + slug + '-en-proceso'); }
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page); k++;
  }
  await shot('contratos-de-la-plantilla');
  log(JSON.stringify(await call('hr.contract', 'search_read', [[]], { fields: ['name', 'employee_id', 'wage', 'state', 'date_start', 'contract_type_id', 'resource_calendar_id'] })));
};
