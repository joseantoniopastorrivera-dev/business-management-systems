const L = require('./lib');
const R = [
  ['Malta Pale Ale', 'Comprar', '100', '250'], ['Malta Pilsen', 'Comprar', '100', '250'], ['Malta Caramelo', 'Comprar', '10', '50'],
  ['Malta de trigo', 'Comprar', '50', '125'], ['Malta tostada', 'Comprar', '10', '50'],
  ['Lúpulo Cascade', 'Comprar', '5', '15'], ['Lúpulo Saaz', 'Comprar', '3', '10'], ['Lúpulo Fuggle', 'Comprar', '2', '6'],
  ['Levadura US-05', 'Comprar', '1', '3'], ['Levadura W-34/70', 'Comprar', '1', '3'], ['Levadura WB-06', 'Comprar', '0,5', '2'], ['Levadura S-04', 'Comprar', '0,5', '2'],
  ['Barril PET', 'Comprar', '20', '80'],
  ['Llamarada Moe IPA', 'Fabricar', '4', '10'], ['Springfield Lager', 'Fabricar', '4', '10'], ['Springfield Stout', 'Fabricar', '4', '10'], ['Trigo de Shelbyville', 'Fabricar', '4', '10'],
];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_orderpoint', '1');
  // mostrar la columna Activador
  await page.locator('.o_optional_columns_dropdown_toggle, .o_optional_columns_dropdown button').first().click(); await page.waitForTimeout(500);
  await page.locator('.o-dropdown--menu .dropdown-item, .o_optional_columns_dropdown .dropdown-item', { hasText: 'Activador' }).first().click(); await page.waitForTimeout(500);
  await page.keyboard.press('Escape');
  await shot('reglas-de-reabastecimiento-vacio');
  let i = 0;
  for (const [p, ruta, mn, mx] of R) {
    await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(900);
    const row = page.locator('.o_data_row.o_selected_row');
    const pi = row.locator('td[name=product_id] input'); await pi.type(p, { delay: 30 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: p }).first().click(); await page.waitForTimeout(700);
    const rc = row.locator('td[name=route_id]'); await rc.click(); const ri = rc.locator('input'); await ri.fill(''); await ri.type(ruta, { delay: 30 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: new RegExp('^\s*' + ruta + '\s*$') }).first().click(); await page.waitForTimeout(500);
    for (const [f, v] of [['product_min_qty', mn], ['product_max_qty', mx]]) { const c = row.locator(`td[name=${f}]`); await c.click(); await c.locator('input').fill(v); }
    await page.waitForTimeout(300);
    if (i === 0 || i === 13) { await page.mouse.move(1350, 860); await shot('regla-reabastecimiento-' + (i === 0 ? 'malta-pale-ale-comprar' : 'ipa-fabricar') + '-editando'); }
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page, 900);
    i++;
  }
  await page.mouse.move(1350, 860); await shot('reglas-de-reabastecimiento-de-la-fabrica');
  log(JSON.stringify(await call('stock.warehouse.orderpoint', 'search_read', [[]], { fields: ['product_id', 'route_id', 'product_min_qty', 'product_max_qty', 'trigger', 'qty_to_order', 'location_id'] })));
};
