// Cap. 7 · Incidencia I-10: las reglas de reabastecimiento de producto terminado de la v4 (OP/…, stock mínimo de barriles)
// han generado solas FAB/MO/00009 (10 Stout), 00012 (10 IPA) y 00014 (10 Lager) al bajar el stock, y entre la 00009 y
// la 00012 tienen reservados 112 de los 123 kg de malta Pale Ale. La OF del pedido de Oporto (00013) se queda corta.
// Solución:
//  - Stout: no se fabrica hasta cerrar la investigación de la fuga del lote retirado (cap. 4) → se cancela la 00009 y
//    se archiva su regla de reabastecimiento.
//  - IPA: la 00012 se queda planificada, pero se le anula la reserva para dar prioridad al pedido de un cliente.
//  - Se vuelve a comprobar la disponibilidad de la 00013.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  await L.abrir(page, BASE, 'mrp.mrp_production_action', '1', '.o_list_view, .o_kanban_view');
  const x = page.locator('.o_searchview_facet .o_facet_remove').first(); if (await x.count()) { await x.click(); await L.esperar(page); }
  await shot('reab-01-of-automaticas', { zona: '.o_list_renderer', borrador: 'OF creadas por las reglas OP/… junto a la del pedido' });
  // Stout
  const [mo9] = await call('mrp.production', 'read', [[9], ['state', 'orderpoint_id']], C);
  if (mo9.state !== 'cancel') {
    await ir('model=mrp.production&id=9&view_type=form');
    await L.nota(page, 'Se cancela: no se fabrica Springfield Stout hasta cerrar la investigación de la fuga del lote STO-261123-01 (retirada, cap. 4). La regla de reabastecimiento OP/00016 se archiva.');
    await page.locator('.o_form_statusbar button[name=action_cancel]:visible').first().click(); await L.esperar(page, 2000);
    await shot('reab-02-of-stout-cancelada', { zona: '.o_form_view', borrador: 'OF de Stout cancelada con nota' });
  }
  const [regla] = await call('stock.warehouse.orderpoint', 'search_read', [[['product_id.default_code', '=', 'PT-STO-30']]], { fields: ['id', 'name', 'product_min_qty', 'product_max_qty', 'active'], ...C });
  if (regla) { await call('stock.warehouse.orderpoint', 'write', [[regla.id], { active: false }], C); log('regla Stout archivada', JSON.stringify(regla)); }
  // IPA: anular reserva
  const [mo12] = await call('mrp.production', 'read', [[12], ['reservation_state', 'state']], C);
  await ir('model=mrp.production&id=12&view_type=form');
  const anular = page.locator('.o_form_statusbar button[name=do_unreserve]:visible').first();
  if (await anular.count()) { await anular.click(); await L.esperar(page, 2000); }
  await L.nota(page, 'Reserva anulada para dar prioridad a la OF FAB/MO/00013 del pedido S00008 (Oporto). Esta OF se cocinará cuando llegue la malta pedida (P00009).');
  // la del pedido
  await ir('model=mrp.production&id=13&view_type=form');
  const comp = page.locator('.o_form_statusbar button[name=action_assign]:visible').first();
  if (await comp.count()) { await comp.click(); await L.esperar(page, 2000); }
  await shot('reab-03-of-pedido-disponible', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'La OF del pedido ya tiene todo reservado' });
  const mv = await call('stock.move', 'search_read', [[['raw_material_production_id', '=', 13]]], { fields: ['product_id', 'product_uom_qty', 'quantity'], ...C });
  log(JSON.stringify(mv.map(m => [m.product_id[1], m.product_uom_qty, m.quantity])));
};
