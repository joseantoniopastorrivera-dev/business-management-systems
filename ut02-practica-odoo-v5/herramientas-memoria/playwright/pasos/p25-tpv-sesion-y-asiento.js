// Cap. 5 · Sesión POS/00001 cerrada, sus pedidos y el asiento de cierre en la contabilidad de la taberna.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  const [s] = await call('pos.session', 'search_read', [[['name', '=', 'POS/00001']]], { fields: ['id', 'move_id'], ...C });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=pos.session&id=' + s.id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await shot('tpv-24-sesion-cerrada', { zona: ['.o_form_statusbar', '.o_form_sheet'], borrador: 'Sesión POS/00001 cerrada' });
  await page.locator('.oe_stat_button', { hasText: 'Pedidos' }).first().click(); await L.esperar(page);
  await shot('tpv-25-pedidos-de-la-sesion', { zona: '.o_list_renderer table', borrador: 'Los 4 pedidos de la sesión' });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + s.move_id[0] + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await shot('tpv-26-asiento-de-cierre', { zona: ['.o_form_sheet .oe_title', '.o_field_widget[name=line_ids]'], completa: true, borrador: 'Asiento POSS de cierre de la sesión' });
  log(JSON.stringify(await call('account.move.line', 'search_read', [[['move_id', '=', s.move_id[0]]]], { fields: ['account_id', 'name', 'debit', 'credit'], ...C })));
  log(JSON.stringify(await call('account.move', 'search_read', [[['ref', 'ilike', 'POS/00001'], ['id', '!=', s.move_id[0]]]], { fields: ['name', 'ref', 'amount_total'], ...C })));
};
