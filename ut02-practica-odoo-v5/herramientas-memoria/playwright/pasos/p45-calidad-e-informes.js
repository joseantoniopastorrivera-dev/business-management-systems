// Cap. 7 · V-12 Calidad «a mano» y V-7 Informes de Community.
//  Calidad: la app Calidad es de Enterprise. En Community el control se hace con (1) una operación «Control de calidad»
//  en la LdM, con sus instrucciones, que sale como orden de trabajo en cada OF, y (2) el resultado anotado en el lote,
//  que queda en su historial y en la trazabilidad.
//  Informes: Ventas → Informes → Ventas (tabla dinámica por producto) y el tablero «Ventas» de la app Tableros.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view, .o_pivot_view, .o_action_manager .o_view_controller, .o_spreadsheet_dashboard_action', { timeout: 120000 }); await L.esperar(page, 1500); };
  const [bom] = await call('mrp.bom', 'search_read', [[['code', '=', 'LdM-NAV']]], { fields: ['id'], ...C });
  let [op] = await call('mrp.routing.workcenter', 'search_read', [[['bom_id', '=', bom.id], ['name', 'ilike', 'Control de calidad']]], { fields: ['id'], ...C });
  if (!op) op = { id: await call('mrp.routing.workcenter', 'create', [{ bom_id: bom.id, name: 'Control de calidad (densidad, pH y cata)', workcenter_id: 3, time_cycle_manual: 15, sequence: 55,
    note: '<p>Antes de embarrilar: densidad final (DF ≤ 1,016), pH entre 4,1 y 4,5, grado alcohólico (6,5 % ± 0,3) y cata (aroma de canela y naranja, sin defectos). Anotar los valores en el lote. Si algo no cumple, no se embarrila y se avisa al responsable.</p>' }], C) };
  // Orden de las operaciones: el control va entre la fermentación y el embarrilado (todas venían con secuencia 100).
  const orden = ['Macerado', 'Cocción y lupulado', 'Enfriado y trasiego al fermentador', 'Fermentación y maduración', 'Control de calidad (densidad, pH y cata)', 'Embarrilado'];
  for (const o of await call('mrp.routing.workcenter', 'search_read', [[['bom_id', '=', bom.id]]], { fields: ['id', 'name'], ...C }))
    await call('mrp.routing.workcenter', 'write', [[o.id], { sequence: 10 * (orden.indexOf(o.name) + 1) }], C);
  await ir(`model=mrp.bom&id=${bom.id}&view_type=form`);
  await page.locator('.o_notebook .nav-link', { hasText: 'Operaciones' }).first().click(); await L.esperar(page, 600);
  await shot('calidad-01-operacion-en-ldm', { zona: ['.o_form_sheet'], borrador: 'Operación Control de calidad en la LdM del Barril de Navidad' });
  await ir(`model=mrp.routing.workcenter&id=${op.id}&view_type=form`);
  await shot('calidad-02-instrucciones', { zona: '.o_form_sheet', borrador: 'Instrucciones del control de calidad' });
  const [lot] = await call('stock.lot', 'search_read', [[['name', '=', 'NAV-261127-03']]], { fields: ['id'], ...C });
  await ir(`model=stock.lot&id=${lot.id}&view_type=form`);
  const ya = await page.locator('.o-mail-Message', { hasText: 'Control de calidad del lote' }).count();
  const msg = ya ? page.locator('.o-mail-Message', { hasText: 'Control de calidad del lote' }).first()
    : await L.nota(page, 'Control de calidad del lote NAV-261127-03 (antes de embarrilar): DO 1,064 · DF 1,014 · 6,6 % vol. · pH 4,3 · cata correcta (canela y naranja, sin defectos). APTO. Muestra de retención guardada en la cámara fría.');
  await shot('calidad-03-resultado-en-lote', { zona: ['.o_form_sheet', msg], borrador: 'Resultado del control anotado en el lote' });
  // Informes
  await L.abrir(page, BASE, 'sale.action_order_report_all', '1', '.o_pivot_view, .o_graph_view, .o_list_view');
  const piv = page.locator('.o_switch_view.o_pivot'); if (await piv.count()) { await piv.click(); await page.waitForSelector('.o_pivot table'); await L.esperar(page); }
  const t = page.locator('.o_pivot table').first();
  if (!(await t.innerText()).includes('PT-NAV-30')) {
    const tot = t.locator('tbody tr').first().locator('th').first();
    await tot.click(); await L.esperar(page, 400); await tot.click(); await L.esperar(page, 400);
    await page.locator('.dropdown-item:visible', { hasText: /^\s*Producto\s*$/ }).first().click(); await L.esperar(page);
  }
  log(await t.innerText());
  await shot('informes-01-ventas-por-producto', { zona: t, borrador: 'Análisis de ventas por producto' });
  await L.abrir(page, BASE, 'spreadsheet_dashboard.ir_actions_dashboard_action', '1', '.o_spreadsheet_dashboard_action, .o_action_manager .o_view_controller, .o-spreadsheet');
  await page.waitForTimeout(4000);
  const ventas = page.locator('.o_search_panel li, .o_spreadsheet_dashboard_action li', { hasText: /^\s*Ventas\s*$/ }).first();
  if (await ventas.count()) { await ventas.click(); await page.waitForTimeout(4000); }
  await shot('informes-02-tablero-ventas', { borrador: 'Tablero de Ventas (app Tableros)' });
};
