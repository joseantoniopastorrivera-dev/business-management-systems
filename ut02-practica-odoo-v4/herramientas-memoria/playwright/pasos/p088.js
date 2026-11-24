const L = require('./lib');
const f = async (page, n, v) => { const d = page.locator(`.o_field_widget[name=${n}] input`).first(); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type(v); await page.keyboard.press('Enter'); await page.waitForTimeout(500); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_contract.action_hr_contract', '1', '.o_kanban_view, .o_list_view');
  await L.nuevo(page);
  await L.campo(page, 'name', 'Temporal (6 meses) · Operaria de producción · Sara Vidal Romero');
  await L.m2o(page, 'employee_id', 'Sara Vidal', null, 'Sara Vidal');
  await f(page, 'date_start', '01/12/2026'); await f(page, 'date_end', '31/05/2027');
  await L.m2o(page, 'contract_type_id', 'Tempor', null, /Tempor/);
  await L.campo(page, 'wage', '1650');
  await page.locator('.o_form_view h1, .oe_title').first().click().catch(() => {});
  await page.mouse.move(1350, 860); await shot('contrato-temporal-sara-vidal-datos');
  await L.guardar(page); await page.mouse.move(1350, 860); await shot('contrato-temporal-sara-vidal-guardado-empieza-el-1-12');
  await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  { const x = page.locator('.o_searchview_facet .o_facet_remove'); while (await x.count()) { await x.first().click(); await L.esperar(page); } }
  await shot('contratos-con-la-nueva-incorporacion');
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
  await shot('plantilla-final-de-la-fabrica');
  log(JSON.stringify(await call('hr.contract', 'search_read', [[['employee_id.name', 'ilike', 'Sara']]], { fields: ['name', 'state', 'date_start', 'date_end', 'wage', 'contract_type_id'] })));
};
