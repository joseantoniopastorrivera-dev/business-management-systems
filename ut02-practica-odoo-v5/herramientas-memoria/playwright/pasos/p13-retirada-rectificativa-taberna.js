// Cap. 4 · Taberna (cids=2): factura rectificativa de proveedor de FACTU/2026/11/0001 por los 2 barriles de Stout,
// con la referencia de la rectificativa que emite la fábrica (RINV/2026/00002), y el cobro del reembolso.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const CTX = { context: { allowed_company_ids: [2] } };
  const ir = async (id) => { await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.o_form_view'); await L.esperar(page); };
  const buscar = async () => (await call('account.move', 'search_read', [[['move_type', '=', 'in_refund'], ['reversed_entry_id.name', '=', 'FACTU/2026/11/0001'], ['company_id', '=', 2], ['state', '!=', 'cancel']]], { fields: ['id', 'name', 'state', 'payment_state'], ...CTX }))[0];
  let nc = await buscar();
  if (!nc) {
    const [f] = await call('account.move', 'search_read', [[['name', '=', 'FACTU/2026/11/0001'], ['company_id', '=', 2]]], { fields: ['id'], ...CTX });
    await ir(f.id);
    await shot('retirada-21-taberna-factura-proveedor', { zona: ['.o_form_statusbar', '.o_form_sheet'], foco: '.o_form_statusbar button:visible:has-text("Factura rectificativa")', borrador: 'Factura de la taberna a rectificar' });
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Factura rectificativa' }).first().click();
    const modal = page.locator('.modal-content').first(); await modal.waitFor(); await L.esperar(page);
    const sel = L.widget(page, 'l10n_es_edi_facturae_reason_code', modal).locator('select');
    if (await sel.count()) await sel.selectOption('"84"');
    await shot('retirada-22-taberna-asistente-rectificativa', { zona: modal, borrador: 'Asistente en la taberna, motivo 84' });
    await page.locator('.modal button:visible', { hasText: L.exacto('Revertir') }).first().click();
    await page.waitForSelector('.o_form_view .o_field_widget[name=invoice_line_ids]'); await L.esperar(page);
    for (const ref of ['PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30']) {
      const fila = page.locator('.o_field_widget[name=invoice_line_ids] .o_data_row', { hasText: ref }).first();
      if (await fila.count()) { await fila.locator('.o_list_record_remove').click(); await L.esperar(page, 400); }
    }
    await L.campo(page, 'ref', 'RINV/2026/00002');
    await L.guardar(page);
    await shot('retirada-23-taberna-borrador-rectificativa', { zona: ['.o_form_statusbar', '.o_form_sheet'], foco: '.o_field_widget[name=ref]', borrador: 'Borrador con la referencia RINV/2026/00002' });
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Confirmar' }).first().click(); await L.esperar(page, 1500);
    nc = await buscar();
  }
  await ir(nc.id);
  log('rectificativa taberna', JSON.stringify(nc));
  if (nc.payment_state === 'not_paid') await L.pagar(page, shot, 'retirada-24-taberna-cobro');
  log('final', JSON.stringify(await buscar()));
  log('apuntes', JSON.stringify(await call('account.move.line', 'search_read', [[['move_id', '=', nc.id]]], { fields: ['account_id', 'debit', 'credit'], ...CTX })));
};
