// Cap. 4 · Fábrica: factura rectificativa de INV/2026/00001 solo por los 2 barriles de Stout devueltos, y su reembolso.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  let [nc] = await call('account.move', 'search_read', [[['move_type', '=', 'out_refund'], ['reversed_entry_id.name', '=', 'INV/2026/00001']]], { fields: ['id', 'state', 'payment_state'] });
  if (!nc) {
    const [f] = await call('account.move', 'search_read', [[['name', '=', 'INV/2026/00001']]], { fields: ['id'] });
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + f.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Factura rectificativa' }).first().click();
    const modal = page.locator('.modal-content').first(); await modal.waitFor(); await L.esperar(page);
    const sel = L.widget(page, 'l10n_es_edi_facturae_reason_code', modal).locator('select');
    if (await sel.count()) {
      const ops = await sel.locator('option').allInnerTexts(); log('motivos', ops.join(' | '));
      const o = ops.find(t => /devoluci|descuento|bonific|anulaci/i.test(t)) || ops[1];
      await sel.selectOption({ label: o }); log('motivo elegido', o);
    }
    await shot('retirada-11-asistente-rectificativa', { zona: modal, borrador: 'Asistente de factura rectificativa (motivo FacturaE)' });
    await page.locator('.modal button:visible', { hasText: L.exacto('Revertir') }).first().click();
    await page.waitForSelector('.o_form_view .o_field_widget[name=invoice_line_ids]'); await L.esperar(page);
    for (const ref of ['PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30']) {
      const fila = page.locator('.o_field_widget[name=invoice_line_ids] .o_data_row', { hasText: ref }).first();
      if (await fila.count()) { await fila.locator('.o_list_record_remove').click(); await L.esperar(page, 400); }
    }
    await L.guardar(page);
    [nc] = await call('account.move', 'search_read', [[['move_type', '=', 'out_refund'], ['reversed_entry_id.name', '=', 'INV/2026/00001']]], { fields: ['id', 'state', 'payment_state'] });
  } else {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + nc.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
  }
  if (nc.state === 'draft') {
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Confirmar' }).first().click(); await L.esperar(page, 1200);
  }
  await shot('retirada-12-rectificativa-confirmada', { zona: '.o_form_sheet', borrador: 'Rectificativa de la fábrica: 2 Stout, 302,50 €' });
  const [d] = await call('account.move', 'search_read', [[['id', '=', nc.id]]], { fields: ['name', 'amount_total', 'payment_state', 'invoice_line_ids'] });
  log('rectificativa', JSON.stringify(d));
  log('líneas', JSON.stringify(await call('account.move.line', 'search_read', [[['move_id', '=', nc.id]]], { fields: ['account_id', 'debit', 'credit', 'analytic_distribution'] })));
  if (d.payment_state !== 'paid' && d.payment_state !== 'in_payment') await L.pagar(page, shot, 'retirada-13-reembolso');
};
