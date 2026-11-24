const L = require('./lib');
const crear = require('./productos');
const B = [['Llamarada Moe IPA', '135', 'llamarada-moe-ipa'], ['Springfield Lager', '105', 'springfield-lager'], ['Springfield Stout', '125', 'springfield-stout'], ['Trigo de Shelbyville', '115', 'trigo-de-shelbyville']];
module.exports = async (a) => {
  const { page, shot, log, call, BASE } = a;
  log('empresa=' + await L.abrir(page, BASE, 'purchase.product_normal_action_puchased', '2'));
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  await shot('taberna-productos-visibles-barriles-compartidos');
  for (const [n, precio, slug] of B) {
    await page.locator('.o_data_row', { hasText: n }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_notebook .nav-link', { hasText: 'Compra' }).click(); await page.waitForTimeout(600);
    await page.locator('.o_notebook .tab-pane.active .o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(800);
    const row = page.locator('.o_notebook .tab-pane.active .o_data_row.o_selected_row');
    const ac = row.locator('td[name=partner_id] input'); await ac.type('Cervecería artesana', { delay: 40 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: 'Cervecería artesana Springfield' }).first().click(); await page.waitForTimeout(600);
    for (const [f, v] of [['price', precio], ['delay', '2']]) { const c = row.locator(`td[name=${f}]`); await c.click(); await c.locator('input').fill(v); }
    await page.locator('.o_notebook .tab-pane.active').click({ position: { x: 5, y: 5 } }); await page.mouse.move(1350, 860); await page.waitForTimeout(600);
    await shot('taberna-barril-' + slug + '-proveedor-la-cerveceria');
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  const T = 'La taberna de Moe';
  const vino = (n, ref, coste, venta, prov, slug, g) => ({ n, ref, cat: 'All / Vinos', venta, coste, vende: 1, compra: 1, empresa: T, prov: [prov, coste, 4], rutas: ['Comprar'], lote: 1, slug, guardado: g });
  await crear(a, [
    vino('Valdecuevas Crianza Ribera del Duero (75 cl)', 'VIN-RDD-CRI', 7.8, 22, 'Bodegas Valdecuevas del Duero, S.L.', 'vino-crianza-ribera-del-duero', 1),
    vino('Valdecuevas Verdejo Rueda (75 cl)', 'VIN-RUE-VER', 4.9, 16, 'Bodegas Valdecuevas del Duero, S.L.', 'vino-verdejo-rueda', 0),
    vino('Señorío del Oja Reserva Rioja (75 cl)', 'VIN-RIO-RES', 9.5, 26, 'Bodegas Señorío del Oja, S.L.', 'vino-reserva-rioja', 0),
  ], 'purchase.product_normal_action_puchased', '2');
  log(JSON.stringify(await call('product.supplierinfo', 'search_read', [[]], { fields: ['partner_id', 'product_tmpl_id', 'price', 'company_id'] })));
};
