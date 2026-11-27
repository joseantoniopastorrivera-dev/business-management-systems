// Cap. 4 · Incidencia: RINV/2026/00001 salió con el motivo FacturaE 82 (envases) y sin analítica.
// El motivo solo se elige en el asistente → se cancela (no se había enviado) y se emite otra con el 84 (art. 80.Dos LIVA),
// la analítica STO y el reembolso ya pagado casado con ella.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const ir = async (id) => { await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.o_form_view'); await L.esperar(page); };
  const leer = async (id) => (await call('account.move', 'search_read', [[['id', '=', id]]], { fields: ['name', 'state', 'payment_state', 'l10n_es_edi_facturae_reason_code', 'amount_residual'] }))[0];
  const MAL = (await call('account.move', 'search_read', [[['name', '=', 'RINV/2026/00001']]], { fields: ['id'] }))[0].id;
  // 1) cancelar la errónea (ya está en borrador) con su explicación
  if ((await leer(MAL)).state === 'draft') {
    await ir(MAL);
    const msg = await L.nota(page, 'Anulada antes de enviarla: el asistente puso el motivo FacturaE 82 (devolución de envases) y la línea no llevaba la cuenta analítica de la Stout. Se sustituye por una nueva rectificativa con el motivo 84 (art. 80.Dos LIVA: la venta queda sin efecto en parte por la devolución de la mercancía defectuosa).');
    await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Cancelar/ }).first().click(); await L.esperar(page, 1200);
    await shot('retirada-15-rectificativa-erronea-cancelada', { zona: ['.o_form_statusbar', '.o_form_sheet .oe_title', msg], completa: true, borrador: 'RINV/2026/00001 cancelada con su nota' });
  }
  // 2) nueva rectificativa con el motivo 84
  let [nc] = await call('account.move', 'search_read', [[['move_type', '=', 'out_refund'], ['reversed_entry_id.name', '=', 'INV/2026/00001'], ['state', '!=', 'cancel']]], { fields: ['id'] });
  if (!nc) {
    const [f] = await call('account.move', 'search_read', [[['name', '=', 'INV/2026/00001']]], { fields: ['id'] });
    await ir(f.id);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Factura rectificativa' }).first().click();
    const modal = page.locator('.modal-content').first(); await modal.waitFor(); await L.esperar(page);
    await L.widget(page, 'l10n_es_edi_facturae_reason_code', modal).locator('select').selectOption('"84"');
    await shot('retirada-16-asistente-motivo-84', { zona: modal, foco: L.widget(page, 'l10n_es_edi_facturae_reason_code', modal), borrador: 'Asistente con el motivo 84' });
    await page.locator('.modal button:visible', { hasText: L.exacto('Revertir') }).first().click();
    await page.waitForSelector('.o_form_view .o_field_widget[name=invoice_line_ids]'); await L.esperar(page);
    for (const ref of ['PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30']) {
      const fila = page.locator('.o_field_widget[name=invoice_line_ids] .o_data_row', { hasText: ref }).first();
      if (await fila.count()) { await fila.locator('.o_list_record_remove').click(); await L.esperar(page, 400); }
    }
    await page.locator('.o_field_widget[name=invoice_line_ids] .o_data_row').first().locator('td[name=analytic_distribution]').click(); await L.esperar(page, 400);
    await page.locator('.o_selected_row .o_field_widget[name=analytic_distribution]').click();
    const pop = page.locator('.analytic_distribution_popup').first(); await pop.waitFor();
    const inp = pop.locator('input.o-autocomplete--input').first(); await inp.click(); await inp.pressSequentially('STO', { delay: 40 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: 'Springfield Stout' }).first().click(); await L.esperar(page, 300);
    await shot('retirada-17-borrador-con-analitica-sto', { zona: [pop, '.o_selected_row'], borrador: 'Borrador: solo la Stout y su analítica' });
    await page.keyboard.press('Escape'); await L.esperar(page, 300);
    await L.guardar(page);
    await shot('retirada-18-borrador-nueva-rectificativa', { zona: ['.o_form_statusbar', '.o_form_sheet'], borrador: 'Nueva rectificativa en borrador' });
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Confirmar' }).first().click(); await L.esperar(page, 1500);
    [nc] = await call('account.move', 'search_read', [[['move_type', '=', 'out_refund'], ['reversed_entry_id.name', '=', 'INV/2026/00001'], ['state', '!=', 'cancel']]], { fields: ['id'] });
  }
  // 3) casar el reembolso pendiente
  await ir(nc.id);
  if ((await leer(nc.id)).payment_state === 'not_paid') {
    const pend = page.locator('.o_field_widget[name=invoice_outstanding_credits_debits_widget]');
    await pend.scrollIntoViewIfNeeded(); await L.esperar(page, 300);
    await shot('retirada-19-reembolso-pendiente-de-casar', { zona: ['.o_field_widget[name=tax_totals]', pend], borrador: 'Saldo pendiente: el reembolso ya hecho' });
    await pend.locator('a, button', { hasText: 'Añadir' }).first().click(); await L.esperar(page, 1500);
    await ir(nc.id);
  }
  await shot('retirada-20-rectificativa-definitiva-pagada', { zona: ['.o_form_statusbar', '.o_form_sheet'], borrador: 'Rectificativa definitiva pagada' });
  log('errónea', JSON.stringify(await leer(MAL)), 'nueva', JSON.stringify(await leer(nc.id)));
  log('analítica', JSON.stringify(await call('account.move.line', 'search_read', [[['move_id', '=', nc.id], ['account_id.code', '=like', '701%']]], { fields: ['analytic_distribution', 'debit'] })));
};
