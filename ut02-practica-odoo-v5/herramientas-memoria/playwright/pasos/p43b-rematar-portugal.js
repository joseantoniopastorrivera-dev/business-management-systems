// Cap. 7 · Rematar V-10 e I-10:
//  - Aceptar la cancelación de FAB/MO/00009 (Stout): el paso p43a dejó abierto el «¿Está seguro?».
//  - La entrega FAB/OUT/00006 no tenía reservado el Barril de Navidad recién fabricado (se creó antes de la OF):
//    «Comprobar disponibilidad» no la reservaba (movimiento MTO «En espera» aunque la OF ya estaba hecha), así que el lote
//    NAV-261127-03 se asigna a mano (equivale a escribirlo en Operaciones detalladas) y se valida entera (nunca una entrega parcial).
//  - Tarifa: modo «Reglas de precio avanzadas» para que la regla del −10 % se vea como descuento y no como precio 0.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  // MO 9
  if ((await call('mrp.production', 'read', [[9], ['state']], C))[0].state !== 'cancel') {
    await ir('model=mrp.production&id=9&view_type=form');
    await page.locator('.o_form_statusbar button[name=action_cancel]:visible').first().click(); await L.esperar(page, 1200);
    await page.locator('.modal-content:visible button', { hasText: 'Aceptar' }).first().click(); await L.esperar(page, 2000);
    await shot('reab-02-of-stout-cancelada', { zona: '.o_form_view', borrador: 'OF de Stout cancelada con nota' });
  }
  log('MO9', JSON.stringify(await call('mrp.production', 'read', [[9], ['state']], C)));
  // Entrega
  const [pk] = await call('stock.picking', 'search_read', [[['name', '=', 'FAB/OUT/00006']]], { fields: ['id', 'state'], ...C });
  if (pk.state !== 'done') {
    await ir(`model=stock.picking&id=${pk.id}&view_type=form`);
    const comp = page.locator('.o_form_statusbar button[name=action_assign]:visible').first(); if (await comp.count()) { await comp.click(); await L.esperar(page, 2000); }
    let mv = await call('stock.move', 'search_read', [[['picking_id', '=', pk.id]]], { fields: ['id', 'product_id', 'product_uom_qty', 'quantity'], ...C });
    for (const m of mv.filter(m => m.quantity < m.product_uom_qty && m.product_id[1].includes('PT-NAV-30'))) {
      const [lot] = await call('stock.lot', 'search_read', [[['name', '=', 'NAV-261127-03']]], { fields: ['id'], ...C });
      const [q] = await call('stock.quant', 'search_read', [[['lot_id', '=', lot.id], ['location_id.usage', '=', 'internal'], ['quantity', '>', 0]]], { fields: ['location_id'], ...C });
      await call('stock.move.line', 'create', [{ move_id: m.id, picking_id: pk.id, product_id: m.product_id[0], lot_id: lot.id, quantity: m.product_uom_qty - m.quantity, location_id: q.location_id[0], location_dest_id: 5, company_id: 1 }], C);
    }
    mv = await call('stock.move', 'search_read', [[['picking_id', '=', pk.id]]], { fields: ['id', 'product_id', 'product_uom_qty', 'quantity'], ...C });
    log(JSON.stringify(mv.map(m => [m.product_id[1], m.product_uom_qty, m.quantity])));
    if (mv.some(m => m.quantity < m.product_uom_qty)) throw new Error('sigue sin estar todo reservado');
    await page.locator('.o_form_statusbar button[name=button_validate]:visible').first().click(); await L.esperar(page, 2500);
    await shot('portugal-07-entrega-oporto', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Entrega a Oporto hecha' });
  }
  log('entrega', JSON.stringify(await call('stock.picking', 'read', [[pk.id], ['state']], C)));
  // Tarifa en modo avanzado
  await L.abrir(page, BASE, 'sale.action_sale_config_settings', '1', '.o_setting_container');
  const b = await L.ajuste(page, 'Listas de precios');
  await b.locator('label', { hasText: 'Reglas de precio avanzadas' }).first().click(); await L.esperar(page, 400);
  await shot('portugal-01-activar-tarifas', { zona: b, borrador: 'Activar listas de precios (reglas avanzadas)' });
  await L.guardarAjustes(page);
  const [tar] = await call('product.pricelist', 'search_read', [[['name', '=', 'Distribuidores UE (−10 %)']]], { fields: ['id'], ...C });
  await ir(`model=product.pricelist&id=${tar.id}&view_type=form`);
  await shot('portugal-02-tarifa-distribuidores', { zona: '.o_form_sheet', borrador: 'Tarifa −10 % para distribuidores' });
};
