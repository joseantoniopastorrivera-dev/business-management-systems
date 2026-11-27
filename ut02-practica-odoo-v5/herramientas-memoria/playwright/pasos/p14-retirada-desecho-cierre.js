// Cap. 4 · Destrucción de los 9 barriles en cuarentena (desecho), su asiento de valoración y el cierre de la retirada en el lote.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  let [sp] = await call('stock.scrap', 'search_read', [[['origin', '=', 'Retirada lote STO-261123-01']]], { fields: ['id', 'name', 'state'] });
  if (!sp) {
    await L.abrir(page, BASE, 'stock.action_stock_scrap', '1');
    await L.nuevo(page);
    await L.m2o(page, 'product_id', 'PT-STO-30');
    await L.campo(page, 'scrap_qty', '9');
    await L.m2o(page, 'location_id', 'Cuarentena', null, 'FAB/Cuarentena');
    await L.m2o(page, 'lot_id', 'STO-261123-01');
    await L.campo(page, 'origin', 'Retirada lote STO-261123-01');
    await shot('retirada-25-desecho-borrador', { zona: '.o_form_sheet', borrador: 'Orden de desecho: 9 barriles desde Cuarentena' });
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Validar' }).first().click(); await L.esperar(page, 1500);
    const m = page.locator('.modal-content'); if (await m.count()) log('diálogo', (await m.innerText()).slice(0, 300));
    [sp] = await call('stock.scrap', 'search_read', [[['origin', '=', 'Retirada lote STO-261123-01']]], { fields: ['id', 'name', 'state'] });
  }
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.scrap&id=' + sp.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await shot('retirada-26-desecho-hecho', { zona: ['.o_form_statusbar', '.o_form_sheet'], borrador: 'Desecho validado' });
  log('desecho', JSON.stringify(sp));
  // asiento de valoración del desecho
  const [as] = await call('account.move', 'search_read', [[['ref', 'ilike', sp.name]]], { fields: ['id', 'name', 'ref', 'amount_total'] });
  log('asiento', JSON.stringify(as));
  if (as) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.move&id=' + as.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await shot('retirada-27-asiento-del-desecho', { zona: ['.o_form_sheet .oe_title', '.o_field_widget[name=line_ids]'], borrador: 'Asiento de valoración del desecho' });
    log('apuntes', JSON.stringify(await call('account.move.line', 'search_read', [[['move_id', '=', as.id]]], { fields: ['account_id', 'debit', 'credit'] })));
  }
  // cierre en el lote y trazabilidad final
  const [lote] = await call('stock.lot', 'search_read', [[['name', '=', 'STO-261123-01'], ['company_id', '=', 1]]], { fields: ['id'] });
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.lot&id=' + lote.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  const ya = await call('mail.message', 'search_count', [[['model', '=', 'stock.lot'], ['res_id', '=', lote.id], ['body', 'ilike', 'Retirada cerrada']]]);
  const msg = ya ? page.locator('.o-mail-Message', { hasText: 'Retirada cerrada' }).first()
    : await L.nota(page, 'Retirada cerrada (24/11/2026): 10 barriles fabricados = 1 desechado por fuga (SP/00001) + 9 destruidos tras la retirada (' + sp.name + '): 7 que seguían en fábrica y 2 devueltos por la taberna (FAB/IN/00005). La taberna recibió la rectificativa RINV/2026/00002 y el reembolso de 302,50 €. No queda ningún barril del lote en circulación.');
  await shot('retirada-28-cierre-en-el-lote', { zona: ['.o_form_sheet .oe_title', msg], completa: true, borrador: 'Lote con la nota de cierre y cantidad 0' });
  await page.locator('.oe_stat_button', { hasText: 'Trazabilidad' }).first().click(); await L.esperar(page, 1200);
  await shot('retirada-29-trazabilidad-final', { zona: '.o_stock_reports_table', completa: true, borrador: 'Trazabilidad final del lote' });
};
