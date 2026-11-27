// Cap. 6 · Trastienda de los pedidos web S00003 (Ned, 2 barriles de Navidad, furgoneta) y S00004 (Edna, 1 de Navidad
// + 1 Lager, recogida). La regla MTO creó una OF por pedido: FAB/MO/00010 (2) y FAB/MO/00011 (1).
//  1. Modelo de distribución analítica del Barril de Navidad (701 + producto → cuenta «Barril de Navidad»), antes de facturar.
//  2. Fabricar cada OF con su propio lote: NAV-261127-01 (S00003) y NAV-261127-02 (S00004).
//  3. Validar las entregas.
//  4. Facturar desde el pedido y casar el cobro que hizo Demo (ya está en Banco como pago sin conciliar).
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const leer = (m, ids, f) => call(m, 'read', [ids, f], C);
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1000); };
  const boton = async (re) => { await page.locator('.o_form_statusbar button:visible, .o_control_panel button:visible', { hasText: re }).first().click(); await L.esperar(page, 1500); };
  // 1
  const [nav] = await call('product.product', 'search_read', [[['default_code', '=', 'PT-NAV-30']]], { fields: ['id'], ...C });
  const [ana] = await call('account.analytic.account', 'search_read', [[['name', '=', 'Barril de Navidad']]], { fields: ['id'], ...C });
  const modelos = await call('account.analytic.distribution.model', 'search_read', [[['product_id', '=', nav.id]]], { fields: ['id'], ...C });
  if (!modelos.length) {
    const [cta] = await call('account.account', 'search_read', [[['code', '=like', '701%'], ['company_id', '=', 1]]], { fields: ['id', 'code'], limit: 1, ...C });
    await call('account.analytic.distribution.model', 'create', [{ product_id: nav.id, account_prefix: cta.code.slice(0, 3), analytic_distribution: { [ana.id]: 100 }, company_id: 1 }], C);
  }
  await L.abrir(page, BASE, 'analytic.action_analytic_distribution_model', '1', '.o_list_view');
  await shot('tienda-28-modelo-analitico-navidad', { zona: '.o_list_renderer', borrador: 'Modelos de distribución con el Barril de Navidad' });
  // 2
  const so4 = (await leer('sale.order', [4], ['mrp_production_ids', 'picking_ids', 'name']))[0];
  await ir('model=sale.order&id=4&view_type=form');
  await shot('tienda-29-pedido-web-s00004', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'S00004 en el backend: OF, entrega y transacción' });
  const lotes = { 10: 'NAV-261127-01', 11: 'NAV-261127-02' };
  for (const mo of [10, 11]) {
    const [m] = await leer('mrp.production', [mo], ['state', 'lot_producing_id', 'product_qty']);
    if (m.state === 'done') continue;
    if (!m.lot_producing_id) {
      let [lot] = await call('stock.lot', 'search_read', [[['name', '=', lotes[mo]]]], { fields: ['id'], ...C });
      if (!lot) lot = { id: await call('stock.lot', 'create', [{ name: lotes[mo], product_id: nav.id, company_id: 1 }], C) };
      await call('mrp.production', 'write', [[mo], { lot_producing_id: lot.id, qty_producing: m.product_qty }], C);
    }
    await ir(`model=mrp.production&id=${mo}&view_type=form`);
    if (mo === 11) await shot('tienda-30-of-navidad-con-lote', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'OF del pedido S00004 con su lote' });
    await page.locator('.o_form_statusbar button[name=button_mark_done]:visible').first().click(); await L.esperar(page, 2500);
    // El lote y la cantidad se pusieron por la API, sin el onchange que rellena lo consumido: Odoo avisa de que se
    // consume 0. «Establecer cantidades y validar» consume justo lo de la LdM (NO «Confirmar», que dejaría 0).
    const fijar = page.locator('.modal-content:visible button', { hasText: 'Establecer cantidades y validar' });
    if (await fijar.count()) { if (mo === 11) await shot('tienda-31a-aviso-consumo', { zona: page.locator('.modal-content:visible').last(), borrador: 'Advertencia de consumo' }); await fijar.first().click(); await L.esperar(page, 3000); }
    if (mo === 11) await shot('tienda-31-of-navidad-hecha', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'OF hecha' });
  }
  log('OF', JSON.stringify(await leer('mrp.production', [10, 11], ['name', 'state', 'lot_producing_id'])));
  // 3
  for (const pk of [17, 18]) {
    const [p] = await leer('stock.picking', [pk], ['state']);
    if (p.state === 'done') continue;
    await ir(`model=stock.picking&id=${pk}&view_type=form`);
    await page.locator('.o_form_statusbar button[name=button_validate]:visible').first().click(); await L.esperar(page, 2500);
    const conf = page.locator('.modal-content:visible button.btn-primary'); if (await conf.count()) { await conf.first().click(); await L.esperar(page, 2500); }
    if (pk === 18) await shot('tienda-32-entrega-s00004', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Entrega de S00004 hecha (lotes)' });
  }
  log('entregas', JSON.stringify(await leer('stock.picking', [17, 18], ['name', 'state'])));
  // 4
  for (const so of [3, 4]) {
    let [o] = await leer('sale.order', [so], ['invoice_ids', 'name']);
    if (!o.invoice_ids.length) {
      await ir(`model=sale.order&id=${so}&view_type=form`);
      await page.locator('.o_form_statusbar button[name="%(sale.action_view_sale_advance_payment_inv)d"]:visible, .o_form_statusbar button:visible:has-text("Crear factura")').first().click(); await L.esperar(page, 1500);
      const m = page.locator('.modal-content:visible').last();
      if (so === 4) await shot('tienda-33-asistente-factura', { zona: m, borrador: 'Crear factura regular' });
      await m.locator('button.btn-primary', { hasText: /Crear borrador de factura|Crear y ver factura|Crear factura/ }).first().click(); await L.esperar(page, 2500);
      await page.locator('.o_form_statusbar button[name=action_post]:visible').first().click(); await L.esperar(page, 2500);
    } else await ir(`model=account.move&id=${o.invoice_ids[0]}&view_type=form`);
    // casar el cobro de Demo, que aparece como crédito pendiente
    const add = page.locator('.o_field_widget[name=invoice_outstanding_credits_debits_widget] a, .o_field_widget[name=invoice_outstanding_credits_debits_widget] button', { hasText: 'Añadir' }).first();
    if (await add.count()) {
      if (so === 4) await shot('tienda-34-factura-cobro-pendiente', { zona: ['.o_form_sheet', '.o_control_panel'], foco: [add], borrador: 'Factura publicada con el cobro de Demo pendiente de casar' });
      await add.click(); await L.esperar(page, 2000);
    }
    if (so === 4) {
      await page.locator('.o_notebook .nav-link', { hasText: 'Líneas de factura' }).first().click().catch(() => {});
      await shot('tienda-35-factura-pagada', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Factura pagada con analítica' });
    }
    [o] = await leer('sale.order', [so], ['invoice_ids', 'name']);
    log(o.name, JSON.stringify(await leer('account.move', o.invoice_ids, ['name', 'state', 'payment_state', 'amount_total'])));
  }
};
