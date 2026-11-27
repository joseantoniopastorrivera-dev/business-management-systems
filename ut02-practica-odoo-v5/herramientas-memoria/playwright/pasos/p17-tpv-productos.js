// Cap. 5 · Categoría de TPV «Cervezas de barril» y 6 productos de servicio de la taberna (pinta 0,5 L y caña 0,2 L
// de IPA, Lager y Trigo; la Stout no se pincha porque su lote está retirado). IVA 10 % (servicio de restauración).
const P = [
  ['Pinta Llamarada Moe IPA (0,5 L)', 'BAR-PIN-IPA', 5.00], ['Caña Llamarada Moe IPA (0,2 L)', 'BAR-CAN-IPA', 2.27],
  ['Pinta Springfield Lager (0,5 L)', 'BAR-PIN-LAG', 4.55], ['Caña Springfield Lager (0,2 L)', 'BAR-CAN-LAG', 2.00],
  ['Pinta Trigo de Shelbyville (0,5 L)', 'BAR-PIN-TRI', 5.00], ['Caña Trigo de Shelbyville (0,2 L)', 'BAR-CAN-TRI', 2.27],
];
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  if (!(await call('pos.category', 'search_count', [[['name', '=', 'Cervezas de barril']]]))) {
    await L.abrir(page, BASE, 'point_of_sale.product_pos_category_action', '2');
    await L.nuevo(page).catch(async () => { await page.locator('.o_control_panel button:visible', { hasText: L.exacto('Nuevo') }).first().click(); await L.esperar(page); });
    await L.campo(page, 'name', 'Cervezas de barril', page.locator('.o_selected_row, .o_form_view').first());
    await page.locator('.o_list_button_save:visible, .o_form_button_save:visible').first().click(); await L.esperar(page);
    await shot('tpv-04-categoria-cervezas-de-barril', { zona: '.o_content', borrador: 'Categoría de TPV' });
  }
  for (const [i, [nombre, ref, precio]] of P.entries()) {
    if (await call('product.template', 'search_count', [[['default_code', '=', ref]]], C)) continue;
    await L.abrir(page, BASE, 'point_of_sale.product_template_action_pos_product', '2');
    await L.nuevo(page);
    await L.campo(page, 'name', nombre);
    await L.widget(page, 'detailed_type').locator('select').selectOption('"service"'); await L.esperar(page, 300);
    await L.campo(page, 'list_price', String(precio).replace('.', ','));
    const imp = L.widget(page, 'taxes_id');
    while (await imp.locator('.o_delete, .o_tag .fa-times, a.o_delete').count()) { await imp.locator('.o_delete, .o_tag .fa-times, a.o_delete').first().click(); await L.esperar(page, 200); }
    await L.m2o(page, 'taxes_id', '10% S', null, '10% S');
    await L.campo(page, 'default_code', ref);
    await L.m2o(page, 'company_id', 'La taberna');
    if (i === 0) await shot('tpv-05-producto-pinta-general', { zona: '.o_form_sheet', foco: ['.o_field_widget[name=detailed_type]', '.o_field_widget[name=taxes_id]'], borrador: 'Pinta IPA: servicio, 5 € + IVA 10 %' });
    await page.locator('.o_notebook .nav-link', { hasText: 'Ventas' }).click(); await L.esperar(page, 300);
    await L.check(page, 'available_in_pos', true);
    await L.m2o(page, 'pos_categ_ids', 'Cervezas de barril');
    if (i === 0) await shot('tpv-06-producto-pinta-pestana-ventas', { zona: '.o_notebook', foco: ['.o_field_widget[name=available_in_pos]', '.o_field_widget[name=pos_categ_ids]'], borrador: 'Pestaña Ventas: disponible en TPV y categoría' });
    await L.guardar(page);
  }
  await L.abrir(page, BASE, 'point_of_sale.product_template_action_pos_product', '2');
  const vl = page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first();
  if (await vl.count()) { await vl.click(); await L.esperar(page); }
  const sv = page.locator('.o_searchview_input'); await sv.fill('BAR-'); await sv.press('Enter'); await L.esperar(page);
  await shot('tpv-07-productos-de-barra', { zona: '.o_list_renderer table', borrador: 'Los 6 productos de barra' });
  log(JSON.stringify(await call('product.template', 'search_read', [[['default_code', 'like', 'BAR-']]], { fields: ['name', 'list_price', 'taxes_id', 'detailed_type', 'available_in_pos', 'company_id'], ...C })));
};
