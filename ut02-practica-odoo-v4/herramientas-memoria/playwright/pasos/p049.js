const L = require('./lib');
const R = [
  ['Llamarada Moe IPA', 'BAR/Stock', 'Comprar', '2', '6'], ['Springfield Lager', 'BAR/Stock', 'Comprar', '2', '4'], ['Springfield Stout', 'BAR/Stock', 'Comprar', '1', '2'], ['Trigo de Shelbyville', 'BAR/Stock', 'Comprar', '1', '2'],
  ['Valdecuevas Crianza', 'BOD/Stock', 'Comprar', '24', '60'], ['Valdecuevas Verdejo', 'BOD/Stock', 'Comprar', '24', '60'], ['Señorío del Oja Reserva', 'BOD/Stock', 'Comprar', '12', '36'],
  ['Valdecuevas Crianza', 'BAR/Stock', 'Bodega de vinos', '6', '12'], ['Valdecuevas Verdejo', 'BAR/Stock', 'Bodega de vinos', '6', '12'], ['Señorío del Oja Reserva', 'BAR/Stock', 'Bodega de vinos', '3', '6'],
];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_orderpoint', '2');
  await shot('taberna-reglas-de-reabastecimiento-vacio');
  let i = 0;
  for (const [p, loc, ruta, mn, mx] of R) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(900);
    const row = page.locator('.o_data_row.o_selected_row');
    const pi = row.locator('td[name=product_id] input'); await pi.type(p, { delay: 30 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: p }).first().click(); await page.waitForTimeout(700);
    const lc = row.locator('td[name=location_id]'); await lc.click(); const li = lc.locator('input'); await li.fill(''); await li.type(loc, { delay: 30 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: new RegExp('^\s*' + loc.replace('/', '\/') + '\s*$') }).first().click(); await page.waitForTimeout(500);
    const rc = row.locator('td[name=route_id]'); await rc.click(); const ri = rc.locator('input'); await ri.fill(''); await ri.type(ruta, { delay: 30 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: ruta === 'Comprar' ? /^\s*Comprar\s*$/ : ruta }).first().click(); await page.waitForTimeout(500);
    for (const [f, v] of [['product_min_qty', mn], ['product_max_qty', mx]]) { const c = row.locator(`td[name=${f}]`); await c.click(); await c.locator('input').fill(v); }
    if (i === 0 || i === 4 || i === 7) { await page.mouse.move(1350, 860); await shot('taberna-regla-' + ['barriles-comprar-a-la-cerveceria', '', '', '', 'bodega-comprar-vino', '', '', 'bar-reabastecer-desde-bodega'][i] + '-editando'); }
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900);
    i++;
  }
  await page.mouse.move(1350, 860); await shot('taberna-reglas-de-reabastecimiento');
  log(JSON.stringify(await call('stock.warehouse.orderpoint', 'search_read', [[['company_id', '=', 2]]], { fields: ['product_id', 'location_id', 'route_id', 'product_min_qty', 'product_max_qty', 'qty_to_order'] })));
};
