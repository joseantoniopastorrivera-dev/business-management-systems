// Cap. 8 · Hallazgo de la auditoría de la v4: las dos compañías tienen como cuenta a pagar por defecto la 410000
// «Acreedores por prestaciones de servicios», así que las facturas de mercaderías (malta, barriles, vino) se han
// contabilizado en la 410 y no en la 400 «Proveedores». Saldo de la 410 a 30/11: 0 € en las dos (todo pagado), así que no
// hay nada que reclasificar: se corrige la cuenta por defecto (propiedad de empresa «property_account_payable_id») en las
// dos compañías y la 410 queda solo para los acreedores de servicios (luz, gestoría…), que la llevarán en su ficha.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1, 2] } };
  const saldo = async (cia, cod) => (await call('account.move.line', 'read_group', [[['company_id', '=', cia], ['account_id.code', '=', cod], ['parent_state', '=', 'posted']], ['balance:sum'], []], { lazy: false, ...C }))[0];
  log('saldos 410', JSON.stringify(await saldo(1, '410000')), JSON.stringify(await saldo(2, '410000')));
  // apuntes de la 410 de la taberna, agrupados por empresa (prueba de que todo está casado)
  await page.goto(BASE + '/web?r=' + Date.now() + '#action=account.action_account_moves_all&cids=2'); await page.waitForSelector('.o_list_view'); await L.esperar(page, 1200);
  const sv = page.locator('.o_searchview_input');
  await sv.fill('410000'); await L.esperar(page, 600);
  const cta = page.locator('.o_searchview_autocomplete .dropdown-item, .o_searchview_autocomplete li', { hasText: /Cuenta/ }).first();
  if (await cta.count()) await cta.click(); else await sv.press('Enter');
  await L.esperar(page, 1200);
  await shot('cierre-01-taberna-410-saldo-cero', { zona: '.o_list_renderer', borrador: 'Apuntes de la 410 en la taberna: facturas de mercaderías casadas, saldo 0' });
  // propiedades de empresa
  const props = await call('ir.property', 'search_read', [[['name', '=', 'property_account_payable_id'], ['res_id', '=', false]]], { fields: ['id', 'company_id', 'value_reference'], ...C });
  for (const p of props) {
    const [c400] = await call('account.account', 'search_read', [[['company_id', '=', p.company_id[0]], ['code', '=', '400000']]], { fields: ['id'], ...C });
    if (p.value_reference !== 'account.account,' + c400.id) {
      if (p.company_id[0] === 2) {
        await page.goto(BASE + '/web?debug=1&r=' + Date.now() + `#model=ir.property&id=${p.id}&view_type=form&cids=1-2`); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1200);
        await shot('cierre-02-propiedad-antes', { zona: '.o_form_sheet', borrador: 'Propiedad de empresa: cuenta a pagar por defecto 410000 (taberna)' });
      }
      await call('ir.property', 'write', [[p.id], { value_reference: 'account.account,' + c400.id }], C);
    }
  }
  const [p2] = await call('ir.property', 'search_read', [[['name', '=', 'property_account_payable_id'], ['res_id', '=', false], ['company_id', '=', 2]]], { fields: ['id'], ...C });
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + `#model=ir.property&id=${p2.id}&view_type=form&cids=1-2`); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1200);
  await shot('cierre-03-propiedad-400', { zona: '.o_form_sheet', borrador: 'Propiedad corregida a 400000' });
  // comprobación: la cuenta a pagar que ve ahora la taberna para la fábrica como proveedor
  log('cuenta a pagar de la fábrica vista desde la taberna', JSON.stringify(await call('res.partner', 'read', [[1], ['property_account_payable_id']], { context: { allowed_company_ids: [2] } })));
  log('y desde la fábrica para Lúpulos de León', JSON.stringify(await call('res.partner', 'read', [[10], ['property_account_payable_id']], { context: { allowed_company_ids: [1] } })));
};
