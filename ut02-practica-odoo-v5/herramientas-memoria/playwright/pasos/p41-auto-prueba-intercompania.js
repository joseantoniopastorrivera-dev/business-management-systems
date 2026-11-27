// Cap. 7 · Prueba de la regla V-6. La taberna (compañía 2) pide 2 barriles de IPA a la fábrica para Navidad.
// Al confirmar la compra, la regla crea el pedido de venta en la fábrica; la fábrica lo confirma y entrega, y la
// taberna recibe con el mismo lote (en Odoo 17 los lotes son por compañía: la taberna ya tiene el suyo, IPA-261123-01).
// Las facturas de esta operación se hacen en el cierre de mes (cap. 8), después de corregir la cuenta 410 → 400.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C2 = { context: { allowed_company_ids: [2] } }, C1 = { context: { allowed_company_ids: [1] } };
  const ir = async (h, cids) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=' + cids); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  const [ipa] = await call('product.product', 'search_read', [[['default_code', '=', 'PT-IPA-30']]], { fields: ['id'], ...C2 });
  let [po] = await call('purchase.order', 'search_read', [[['company_id', '=', 2], ['partner_id', '=', 1], ['order_line.product_id', '=', ipa.id], ['create_date', '>=', '2026-11-27']]], { fields: ['id', 'name', 'state', 'partner_ref', 'picking_ids'], ...C2 });
  if (!po) {
    await L.abrir(page, BASE, 'purchase.purchase_rfq', '2');
    await L.nuevo(page);
    await L.m2o(page, 'partner_id', 'Cervecería artesana', null, 'Cervecería artesana Springfield');
    await page.locator('.o_field_x2many_list_row_add a').first().click(); await L.esperar(page, 400);
    const fila = page.locator('.o_data_row').last();
    await L.m2o(page, 'product_id', 'PT-IPA-30', fila, '[PT-IPA-30]');
    await L.campo(page, 'product_qty', '2', fila); await L.esperar(page, 600);
    await L.guardar(page);
    await shot('auto-05-compra-taberna-borrador', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Compra de la taberna a la fábrica, en borrador' });
    await page.locator('.o_form_statusbar button[name=button_confirm]:visible').first().click(); await L.esperar(page, 2500);
    [po] = await call('purchase.order', 'search_read', [[['company_id', '=', 2], ['partner_id', '=', 1], ['order_line.product_id', '=', ipa.id], ['create_date', '>=', '2026-11-27']]], { fields: ['id', 'name', 'state', 'partner_ref', 'picking_ids'], ...C2 });
    await ir(`model=purchase.order&id=${po.id}&view_type=form`, '2');
    await shot('auto-06-compra-confirmada-con-venta', { zona: '.o_form_view', borrador: 'Compra confirmada: la regla anota la venta creada' });
  }
  log('PO', JSON.stringify(po));
  const [so] = await call('sale.order', 'search_read', [[['client_order_ref', '=', po.name]]], { fields: ['id', 'name', 'state', 'amount_total', 'picking_ids'], ...C1 });
  log('SO', JSON.stringify(so));
  if (so.state === 'draft') {
    await ir(`model=sale.order&id=${so.id}&view_type=form`, '1');
    await shot('auto-07-venta-creada-en-fabrica', { zona: '.o_form_view', borrador: 'Pedido de venta creado solo en la fábrica' });
    await page.locator('.o_form_statusbar button[name=action_confirm]:visible').first().click(); await L.esperar(page, 2500);
  }
  const [s2] = await call('sale.order', 'read', [[so.id], ['picking_ids', 'name']], C1);
  const [sal] = await call('stock.picking', 'read', [s2.picking_ids, ['state', 'name']], C1);
  if (sal.state !== 'done') {
    await ir(`model=stock.picking&id=${s2.picking_ids[0]}&view_type=form`, '1');
    await page.locator('.o_form_statusbar button[name=button_validate]:visible').first().click(); await L.esperar(page, 2500);
    const ok = page.locator('.modal-content:visible button.btn-primary'); if (await ok.count()) { await ok.first().click(); await L.esperar(page, 2000); }
  }
  const ml = await call('stock.move.line', 'search_read', [[['picking_id', '=', s2.picking_ids[0]]]], { fields: ['lot_id', 'quantity'], ...C1 });
  log('salida', sal.name, JSON.stringify(ml));
  // recepción en la taberna con su lote del mismo nombre
  const [p2] = await call('purchase.order', 'read', [[po.id], ['picking_ids']], C2);
  const [rec] = await call('stock.picking', 'read', [p2.picking_ids, ['state', 'name', 'move_ids']], C2);
  if (rec.state !== 'done') {
    const [lot] = await call('stock.lot', 'search_read', [[['name', '=', ml[0].lot_id[1]], ['company_id', '=', 2]]], { fields: ['id'], ...C2 });
    const lineas = await call('stock.move.line', 'search', [[['picking_id', '=', rec.id]]], C2);
    if (lineas.length) await call('stock.move.line', 'write', [lineas, { lot_id: lot.id, quantity: 2 }], C2);
    else await call('stock.move.line', 'create', [{ move_id: rec.move_ids[0], picking_id: rec.id, product_id: ipa.id, lot_id: lot.id, quantity: 2, location_id: 4, location_dest_id: (await call('stock.picking', 'read', [[rec.id], ['location_dest_id']], C2))[0].location_dest_id[0] }], C2);
    await ir(`model=stock.picking&id=${rec.id}&view_type=form`, '2');
    await page.locator('.o_form_statusbar button[name=button_validate]:visible').first().click(); await L.esperar(page, 2500);
    const ok = page.locator('.modal-content:visible button.btn-primary'); if (await ok.count()) { await ok.first().click(); await L.esperar(page, 2000); }
    await shot('auto-08-recepcion-taberna-lote', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'La taberna recibe los 2 barriles con su lote' });
  }
  log('recepcion', JSON.stringify(await call('stock.picking', 'read', [p2.picking_ids, ['state', 'name']], C2)));
};
