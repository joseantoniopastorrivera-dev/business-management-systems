// Cap. 8 · Facturas y cobros pendientes antes de cerrar noviembre (ya con la 400 como cuenta a pagar):
//  a) Venta intercompañía de la regla V-6: factura de la fábrica a la taberna (S00006) y factura de proveedor de la
//     taberna (P00013) con la referencia de la de la fábrica; la taberna paga y la fábrica cobra (Banco).
//  b) Cobro de la factura de Oporto INV/2026/00004 (transferencia, 900 €).
//  c) Factura del proveedor de las especias (P00011, 4 kg × 18 €) y su pago.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C1 = { context: { allowed_company_ids: [1] } }, C2 = { context: { allowed_company_ids: [2] } };
  const ir = async (h, cids) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=' + cids); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  const pagar = async (slug, capturar) => {
    const pend = await page.locator('.o_form_statusbar button[name=action_register_payment]:visible').count();
    if (!pend) return;
    if (capturar) await L.pagar(page, shot, slug);
    else {
      await page.locator('.o_form_statusbar button[name=action_register_payment]:visible').first().click();
      const m = page.locator('.modal-content:visible').last(); await m.locator('.o_field_widget[name=journal_id]').waitFor(); await L.esperar(page);
      await m.locator('button', { hasText: /Crear pago/ }).first().click(); await L.esperar(page, 1500);
    }
  };
  const facturarVenta = async (soId) => {
    let [o] = await call('sale.order', 'read', [[soId], ['invoice_ids']], C1);
    if (!o.invoice_ids.length) {
      await ir(`model=sale.order&id=${soId}&view_type=form`, '1');
      await page.locator('.o_form_statusbar button:visible', { hasText: 'Crear factura' }).first().click(); await L.esperar(page, 1500);
      await page.locator('.modal-content:visible button.btn-primary', { hasText: /Crear borrador de factura/ }).first().click(); await L.esperar(page, 2500);
      await page.locator('.o_form_statusbar button[name=action_post]:visible').first().click(); await L.esperar(page, 2500);
      [o] = await call('sale.order', 'read', [[soId], ['invoice_ids']], C1);
    }
    return o.invoice_ids[0];
  };
  const facturarCompra = async (poId, cids, C, ref) => {
    let [p] = await call('purchase.order', 'read', [[poId], ['invoice_ids']], C);
    if (!p.invoice_ids.length) {
      await ir(`model=purchase.order&id=${poId}&view_type=form`, cids);
      await page.locator('.o_form_statusbar button[name=action_create_invoice]:visible').first().click(); await L.esperar(page, 2500);
      const hoy = '27/11/2026';
      await L.campo(page, 'ref', ref);
      const fecha = L.widget(page, 'invoice_date').locator('input').first(); await fecha.click(); await fecha.fill(hoy); await fecha.press('Escape'); await L.esperar(page, 400);
      await page.locator('.o_form_statusbar button[name=action_post]:visible').first().click(); await L.esperar(page, 2500);
      [p] = await call('purchase.order', 'read', [[poId], ['invoice_ids']], C);
    }
    return p.invoice_ids[0];
  };
  // a) intercompañía
  const [so6] = await call('sale.order', 'search_read', [[['name', '=', 'S00006']]], { fields: ['id'], ...C1 });
  const inv6 = await facturarVenta(so6.id);
  const [f6] = await call('account.move', 'read', [[inv6], ['name', 'amount_total', 'payment_state']], C1);
  await ir(`model=account.move&id=${inv6}&view_type=form`, '1');
  await shot('cierre-04-factura-fabrica-a-taberna', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Factura de la fábrica a la taberna (venta V-6)' });
  const [po13] = await call('purchase.order', 'search_read', [[['name', '=', 'P00013']]], { fields: ['id'], ...C2 });
  const bill = await facturarCompra(po13.id, '2', C2, f6.name);
  await ir(`model=account.move&id=${bill}&view_type=form`, '2');
  await page.locator('.o_notebook .nav-link', { hasText: 'Apuntes contables' }).first().click(); await L.esperar(page, 600);
  await shot('cierre-05-factura-taberna-en-400', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Factura de proveedor de la taberna: ahora a la 400' });
  await pagar('cierre-06-taberna-paga', true);
  await ir(`model=account.move&id=${inv6}&view_type=form`, '1'); await pagar('cierre-07-fabrica-cobra', false);
  // b) Oporto
  const [inv4] = await call('account.move', 'search_read', [[['name', '=', 'INV/2026/00004']]], { fields: ['id'], ...C1 });
  await ir(`model=account.move&id=${inv4.id}&view_type=form`, '1'); await pagar('cierre-08-cobro-oporto', true);
  // c) especias
  const [po11] = await call('purchase.order', 'search_read', [[['name', '=', 'P00011']]], { fields: ['id'], ...C1 });
  const b11 = await facturarCompra(po11.id, '1', C1, 'LL-F-2026-1127');
  await ir(`model=account.move&id=${b11}&view_type=form`, '1'); await pagar('cierre-09-pago-especias', false);
  for (const [id, C] of [[inv6, C1], [bill, C2], [inv4.id, C1], [b11, C1]]) log(JSON.stringify(await call('account.move', 'read', [[id], ['name', 'amount_total', 'payment_state', 'ref']], C)));
  const ap = await call('account.move.line', 'search_read', [[['move_id', '=', bill], ['account_id.account_type', '=', 'liability_payable']]], { fields: ['account_id'], ...C2 });
  log('cuenta a pagar de la factura de la taberna', JSON.stringify(ap.map(a => a.account_id[1])));
};
