// Cap. 6 · Incidencia I-08: la materia prima «Especias de Navidad» se creó copiando la UdM de compra de la malta
// (Saco de 25 kg). El pedido P00010 de «4» eran 4 sacos = 100 kg a 18 €/saco, y la recepción entró 100 kg.
// Arreglo: UdM de compra = kg; devolver los 100 kg al proveedor; P00010 bloqueado (no se puede cancelar); pedido nuevo de 4 kg a 18 €/kg.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const esp = (await call('product.product', 'search_read', [[['default_code', '=', 'MP-ESP-NAV']]], { fields: ['id', 'product_tmpl_id', 'uom_id', 'uom_po_id'], ...C }))[0];
  const po = (await call('purchase.order', 'search_read', [[['name', '=', 'P00010']]], { fields: ['id', 'state', 'picking_ids'], ...C }))[0];
  // 1. UdM de compra
  if (esp.uom_po_id[0] !== esp.uom_id[0]) {
    await L.ir(page, BASE, `model=product.template&id=${esp.product_tmpl_id[0]}&view_type=form&cids=1`);
    await shot('tienda-14-incidencia-udm-saco', { zona: '.o_form_sheet', foco: [L.widget(page, 'uom_po_id')], borrador: 'UdM de compra Saco de 25 kg heredada' });
    await L.m2o(page, 'uom_po_id', 'kg', null, 'kg');
    await L.guardar(page);
    await shot('tienda-15-udm-compra-kg', { zona: '.o_form_sheet', foco: [L.widget(page, 'uom_po_id')], borrador: 'UdM de compra corregida a kg' });
  }
  // 2. Devolución completa de la recepción
  await page.reload({ waitUntil: 'domcontentloaded' }); await L.esperar(page, 1500);
  const devs = await call('stock.picking', 'search_read', [[['origin', 'ilike', 'FAB/IN/00006']]], { fields: ['id', 'name', 'state'], ...C });
  if (!devs.length) {
    await L.ir(page, BASE, `model=stock.picking&id=${po.picking_ids[0]}&view_type=form&cids=1`);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Devolver' }).first().click();
    const m = page.locator('.modal-content:visible').last(); await m.locator('.o_list_renderer, table').first().waitFor(); await L.esperar(page);
    await shot('tienda-16-devolver-100-kg', { zona: m, borrador: 'Devolución de los 100 kg' });
    await m.locator('button.btn-primary', { hasText: 'Devolver' }).first().click(); await L.esperar(page, 1500);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Validar' }).first().click(); await L.esperar(page, 1500);
    const ok = page.locator('.modal button.btn-primary:visible'); if (await ok.count()) { await ok.first().click(); await L.esperar(page, 1500); }
    await L.nota(page, 'Devolución a Lúpulos de León: el pedido P00010 se hizo en sacos de 25 kg por error (UdM de compra copiada de la malta). Se devuelven los 100 kg y se pide de nuevo en kg (incidencia I-08).');
    await shot('tienda-17-devolucion-hecha', { zona: '.o_form_view', borrador: 'Devolución validada con nota' });
  }
  // 3. P00010 no se puede cancelar: Odoo lo impide si alguna recepción se completó, aunque luego se devolviera entera.
  //    Se deja constancia del error, se anota el motivo y se bloquea (recibido 0, nada que facturar).
  if ((await call('purchase.order', 'read', [[po.id], ['state']], C))[0].state === 'purchase') {
    await page.goto(BASE + '/web?r=' + Date.now() + `#model=purchase.order&id=${po.id}&view_type=form&cids=1`); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1000);
    await page.locator('.o_form_statusbar button[name=button_cancel]').click(); await L.esperar(page, 1500);
    const err = page.locator('.modal-content:visible').last();
    await shot('tienda-18-no-se-puede-cancelar', { zona: err, borrador: 'Odoo no deja cancelar P00010' });
    await err.locator('button', { hasText: /Cerrar|Aceptar|Ok/i }).first().click(); await L.esperar(page, 500);
    await L.nota(page, 'Pedido erróneo (UdM de compra en sacos de 25 kg, incidencia I-08). Recepción FAB/IN/00006 devuelta entera. Odoo no permite cancelarlo porque tuvo una recepción hecha: se bloquea. Recibido 0 y nada que facturar. El pedido bueno es el siguiente.');
    await page.locator('.o_form_statusbar button[name=button_done]').click(); await L.esperar(page, 1500);
    await shot('tienda-19-p00010-bloqueado', { zona: '.o_form_view', borrador: 'P00010 bloqueado con nota' });
  }
  log('po', JSON.stringify(await call('purchase.order', 'read', [[po.id], ['state']], C)));
  // 4. Pedido nuevo en kg (pantalla)
  let nuevo = (await call('purchase.order', 'search_read', [[['order_line.product_id', '=', esp.id], ['state', '=', 'purchase'], ['id', '!=', po.id]]], { fields: ['id', 'name', 'state', 'picking_ids'], ...C }))[0];
  if (!nuevo) {
    await L.abrir(page, BASE, 'purchase.purchase_rfq', '1');   // L.abrir recarga la página
    await L.nuevo(page);
    await L.m2o(page, 'partner_id', 'Lúpulos de León');
    await page.locator('.o_field_x2many_list_row_add a').first().click(); await L.esperar(page, 400);
    const fila = page.locator('.o_data_row').last();
    await L.m2o(page, 'product_id', 'MP-ESP-NAV', fila, 'Especias');
    await L.campo(page, 'product_qty', '4', fila);
    await L.esperar(page, 600);
    await L.guardar(page);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Confirmar pedido' }).first().click(); await L.esperar(page, 1500);
    nuevo = (await call('purchase.order', 'search_read', [[['order_line.product_id', '=', esp.id], ['state', '=', 'purchase'], ['id', '!=', po.id]]], { fields: ['id', 'name', 'state', 'picking_ids'], ...C }))[0];
    await shot('tienda-20-compra-especias-kg', { zona: '.o_form_sheet', borrador: 'Pedido nuevo: 4 kg a 18 €/kg' });
  }
  const pk = (await call('stock.picking', 'read', [nuevo.picking_ids, ['state']], C))[0];
  if (pk.state !== 'done') {
    await L.ir(page, BASE, `model=stock.picking&id=${nuevo.picking_ids[0]}&view_type=form&cids=1`);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Validar' }).first().click(); await L.esperar(page, 1500);
    const ok = page.locator('.modal button.btn-primary:visible'); if (await ok.count()) { await ok.first().click(); await L.esperar(page, 1500); }
    await shot('tienda-21-recepcion-4-kg', { zona: '.o_form_sheet', borrador: 'Recepción de 4 kg' });
  }
  log(nuevo.name, JSON.stringify(await call('product.product', 'read', [[esp.id], ['qty_available', 'standard_price']], C)));
};
