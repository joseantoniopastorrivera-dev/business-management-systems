// Cap. 5 · Taberna: ubicación virtual «Barriles pinchados» y tipo de operación «Pinchar barril» (BAR/PIN/…).
// Al pinchar un barril sale del stock con su lote: ahí acaba la trazabilidad del lote en la taberna.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  let [u] = await call('stock.location', 'search_read', [[['name', '=', 'Barriles pinchados']]], { fields: ['id'], ...C });
  if (!u) {
    await L.abrir(page, BASE, 'stock.action_location_form', '2');
    await L.nuevo(page);
    await L.campo(page, 'name', 'Barriles pinchados');
    await L.m2o(page, 'location_id', 'Virtual Locations', null, 'Virtual Locations');
    const sel = L.widget(page, 'usage').locator('select');
    log('tipos', (await sel.locator('option').allInnerTexts()).join('|'));
    await sel.selectOption('"inventory"'); await L.esperar(page, 300);
    const cia = await L.widget(page, 'company_id').locator('input').inputValue().catch(() => '');
    if (!cia.includes('taberna')) await L.m2o(page, 'company_id', 'La taberna');
    await L.campo(page, 'comment', 'Barriles conectados a los grifos de la barra. Desde aquí se sirven pintas y cañas, que el TPV vende como servicio. Su contenido ya no es existencia vendible.').catch(() => {});
    await L.guardar(page);
    await shot('tpv-08-ubicacion-barriles-pinchados', { zona: '.o_form_sheet', foco: ['.o_field_widget[name=location_id]', '.o_field_widget[name=usage]'], borrador: 'Ubicación virtual de barriles pinchados' });
    [u] = await call('stock.location', 'search_read', [[['name', '=', 'Barriles pinchados']]], { fields: ['id'], ...C });
  }
  if (!(await call('stock.picking.type', 'search_count', [[['sequence_code', '=', 'PIN']]], C))) {
    await L.abrir(page, BASE, 'stock.action_picking_type_list', '2');
    await L.nuevo(page);
    await L.campo(page, 'name', 'Pinchar barril');
    await L.widget(page, 'code').locator('select').selectOption('"internal"').catch(async () => { await L.widget(page, 'code').locator('input[value=internal], label:has-text("Traslado interno")').first().click(); });
    await L.esperar(page, 300);
    await L.campo(page, 'sequence_code', 'PIN');
    await L.m2o(page, 'warehouse_id', 'Bar de la taberna');
    await L.m2o(page, 'default_location_src_id', 'BAR/Stock');
    await L.m2o(page, 'default_location_dest_id', 'Barriles pinchados', null, 'Barriles pinchados');
    await L.check(page, 'use_existing_lots', true).catch(() => {});
    await shot('tpv-09-tipo-operacion-pinchar-barril', { zona: '.o_form_sheet', foco: ['.o_field_widget[name=sequence_code]', '.o_field_widget[name=default_location_src_id]', '.o_field_widget[name=default_location_dest_id]'], borrador: 'Tipo de operación Pinchar barril' });
    await L.guardar(page);
  }
  log(JSON.stringify(await call('stock.picking.type', 'search_read', [[['sequence_code', '=', 'PIN']]], { fields: ['name', 'code', 'warehouse_id', 'default_location_src_id', 'default_location_dest_id', 'sequence_id'], ...C })));
};
