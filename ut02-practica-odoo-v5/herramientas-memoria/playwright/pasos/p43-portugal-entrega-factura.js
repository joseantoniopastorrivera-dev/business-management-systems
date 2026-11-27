// Cap. 7 · V-10: fabricar los 4 Barriles de Navidad del pedido portugués (lote NAV-261127-03), entregar los 8 barriles
// y emitir la factura intracomunitaria (base 900 €, IVA 0 %). Se marca hecha la actividad de la regla V-9.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  const [so] = await call('sale.order', 'search_read', [[['name', '=', 'S00008']]], { fields: ['id', 'mrp_production_ids', 'picking_ids', 'invoice_ids'], ...C });
  const mo = so.mrp_production_ids[0];
  const [m] = await call('mrp.production', 'read', [[mo], ['state', 'product_id', 'product_qty', 'lot_producing_id']], C);
  if (m.state !== 'done') {
    // actividad de la regla: hecha (la cocción ya está planificada)
    const acts = await call('mail.activity', 'search', [[['res_model', '=', 'mrp.production'], ['res_id', '=', mo]]], C);
    if (acts.length) await call('mail.activity', 'action_feedback', [acts], { feedback: 'Cocción planificada para el lote NAV-261127-03.', ...C });
    let [lot] = await call('stock.lot', 'search_read', [[['name', '=', 'NAV-261127-03']]], { fields: ['id'], ...C });
    if (!lot) lot = { id: await call('stock.lot', 'create', [{ name: 'NAV-261127-03', product_id: m.product_id[0], company_id: 1 }], C) };
    await call('mrp.production', 'write', [[mo], { lot_producing_id: lot.id, qty_producing: m.product_qty }], C);
    await ir(`model=mrp.production&id=${mo}&view_type=form`);
    await page.locator('.o_form_statusbar button[name=button_mark_done]:visible').first().click(); await L.esperar(page, 2500);
    const fijar = page.locator('.modal-content:visible button', { hasText: 'Establecer cantidades y validar' });
    await fijar.first().waitFor({ timeout: 20000 }).catch(() => {});   // el aviso tarda en salir
    if (await fijar.count()) { await fijar.first().click(); await L.esperar(page, 3000); }
    if ((await call('mrp.production', 'read', [[mo], ['state']], C))[0].state !== 'done') throw new Error('la OF no ha quedado hecha');
  }
  log('OF', JSON.stringify(await call('mrp.production', 'read', [[mo], ['name', 'state', 'lot_producing_id']], C)));
  const [pk] = await call('stock.picking', 'read', [so.picking_ids, ['state', 'name']], C);
  if (pk.state !== 'done') {
    if (pk.state !== 'assigned') throw new Error('la entrega no está lista (' + pk.state + '): no se valida para no crear una parcial');
    await ir(`model=stock.picking&id=${so.picking_ids[0]}&view_type=form`);
    await page.locator('.o_form_statusbar button[name=button_validate]:visible').first().click(); await L.esperar(page, 2500);
    await shot('portugal-07-entrega-oporto', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Entrega a Oporto' });
  }
  let [o] = await call('sale.order', 'read', [[so.id], ['invoice_ids']], C);
  if (!o.invoice_ids.length) {
    await ir(`model=sale.order&id=${so.id}&view_type=form`);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Crear factura' }).first().click(); await L.esperar(page, 1500);
    await page.locator('.modal-content:visible button.btn-primary', { hasText: /Crear borrador de factura/ }).first().click(); await L.esperar(page, 2500);
    await page.locator('.o_form_statusbar button[name=action_post]:visible').first().click(); await L.esperar(page, 2500);
    [o] = await call('sale.order', 'read', [[so.id], ['invoice_ids']], C);
  } else await ir(`model=account.move&id=${o.invoice_ids[0]}&view_type=form`);
  await shot('portugal-08-factura-intracomunitaria', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Factura intracomunitaria con IVA 0 %' });
  await page.locator('.o_notebook .nav-link', { hasText: 'Apuntes contables' }).first().click(); await L.esperar(page, 600);
  await shot('portugal-09-apuntes-intracomunitaria', { zona: '.o_notebook', borrador: 'Apuntes: 430 contra 700/701, sin 477' });
  const [f] = await call('account.move', 'read', [o.invoice_ids, ['name', 'state', 'amount_untaxed', 'amount_tax', 'amount_total', 'fiscal_position_id']], C);
  const lin = await call('account.move.line', 'search_read', [[['move_id', '=', f.id], ['display_type', '=', 'product']]], { fields: ['name', 'tax_ids', 'account_id'], ...C });
  log(JSON.stringify(f), JSON.stringify(lin.map(l => [l.account_id[1], l.tax_ids])));
};
