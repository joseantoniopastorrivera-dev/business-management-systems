const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  // Reglas de almacenamiento
  await L.abrir(page, BASE, 'stock.action_putaway_tree', '1');
  await shot('reglas-de-almacenamiento-vacio');
  for (const [cat, dest, slug] of [['All / Materias primas', 'FAB/Stock/Materias primas', 'materias-primas'], ['All / Cerveza en barril', 'FAB/Stock/Cámara fría', 'cerveza-en-barril']]) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(1000);
    const row = page.locator('.o_data_row.o_selected_row');
    const m2o = async (f, txt, item) => { const c = row.locator(`td[name=${f}]`); await c.click(); const i = c.locator('input'); await i.fill(''); await i.type(txt, { delay: 40 }); await page.locator('.o-autocomplete--dropdown-item', { hasText: item }).first().click(); await page.waitForTimeout(500); };
    await m2o('category_id', cat.split(' / ').pop(), new RegExp('^\s*' + cat + '\s*$'));
    await m2o('location_in_id', 'FAB/Stock', /^\s*FAB\/Stock\s*$/);
    await m2o('location_out_id', dest.split('/').pop(), dest);
    await page.mouse.move(1350, 860); await shot('regla-almacenamiento-' + slug + '-datos');
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 1200);
  }
  await shot('reglas-de-almacenamiento-de-la-fabrica');
  log(JSON.stringify(await call('stock.putaway.rule', 'search_read', [[]], { fields: ['category_id', 'location_in_id', 'location_out_id'] })));
  // Centros de trabajo
  await L.abrir(page, BASE, 'mrp.mrp_workcenter_action', '1');
  await shot('centros-de-trabajo-vacio');
  for (const [n, cod, cap, coste, ini, fin, slug] of [['Sala de cocción', 'COC', 1, 45, 15, 30, 'sala-de-coccion'], ['Fermentadores', 'FER', 4, 1.5, 0, 0, 'fermentadores'], ['Línea de embarrilado', 'EMB', 1, 30, 10, 15, 'linea-de-embarrilado']]) {
    await L.nuevo(page);
    await L.campo(page, 'name', n); await L.campo(page, 'code', cod);
    await L.campo(page, 'default_capacity', cap); await L.campo(page, 'costs_hour', String(coste).replace('.', ','));
    await L.campo(page, 'time_start', ini); await L.campo(page, 'time_stop', fin);
    await page.mouse.move(1350, 860); await shot('centro-de-trabajo-' + slug + '-datos');
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('centros-de-trabajo-de-la-fabrica');
  log(JSON.stringify(await call('mrp.workcenter', 'search_read', [[]], { fields: ['name', 'code', 'default_capacity', 'costs_hour', 'time_start', 'time_stop'] })));
};
