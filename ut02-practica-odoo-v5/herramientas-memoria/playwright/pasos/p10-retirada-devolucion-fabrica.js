// Cap. 4 · Fábrica (cids=1): recibe los 2 barriles devueltos, directamente en FAB/Cuarentena (ubicación de devolución).
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const [rec] = await call('stock.picking', 'search_read', [[['name', '=', 'FAB/OUT/00001']]], { fields: ['id', 'return_ids'], context: { allowed_company_ids: [1] } });
  let devId = rec.return_ids[0];
  if (!devId) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=' + rec.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Devolver' }).click();
    const modal = page.locator('.modal-content').first(); await modal.waitFor(); await L.esperar(page);
    // solo se devuelve la Stout: se quitan las otras tres líneas con su papelera
    for (const ref of ['PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30']) {
      await modal.locator('.o_data_row', { hasText: ref }).locator('.o_list_record_remove, button[name=delete], .fa-trash-o').first().click(); await L.esperar(page, 300);
    }
    await L.m2o(page, 'location_id', 'Cuarentena', modal, 'FAB/Cuarentena');
    await shot('retirada-09-fabrica-asistente-devolucion', { zona: modal, borrador: 'Fábrica: recibe la devolución en Cuarentena' });
    await page.locator('.modal button:visible', { hasText: L.exacto('Devolver') }).first().click();
    await page.waitForSelector('.o_form_view .o_field_widget[name=name]'); await L.esperar(page);
    const r = await call('stock.picking', 'search_read', [[['id', '=', rec.id]]], { fields: ['return_ids'], context: { allowed_company_ids: [1] } });
    devId = r[0].return_ids[0];
  } else {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=' + devId + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
  }
  const [dev] = await call('stock.picking', 'search_read', [[['id', '=', devId]]], { fields: ['name', 'state', 'move_line_ids'], context: { allowed_company_ids: [1] } });
  log('devolución', dev.name, dev.state);
  log('líneas', JSON.stringify(await call('stock.move.line', 'search_read', [[['picking_id', '=', devId]]], { fields: ['product_id', 'lot_id', 'quantity', 'location_id', 'location_dest_id'], context: { allowed_company_ids: [1] } })));
  if (dev.state !== 'done') {
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Validar' }).first().click(); await L.esperar(page, 1500);
    const m = page.locator('.modal-content'); if (await m.count()) { log('diálogo:', (await m.innerText()).slice(0, 300)); }
  }
  await shot('retirada-10-fabrica-devolucion-en-cuarentena', { zona: '.o_form_sheet', borrador: 'Devolución de cliente validada en FAB/Cuarentena' });
};
