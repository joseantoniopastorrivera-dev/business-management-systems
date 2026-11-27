// Cap. 5 · Pinchar un barril de IPA, uno de Lager y uno de Trigo (BAR/PIN/00001). FEFO elige el lote.
const BARRILES = ['PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30'];
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  const [pt] = await call('stock.picking.type', 'search_read', [[['sequence_code', '=', 'PIN']]], { fields: ['id', 'use_create_lots'], ...C });
  if (pt.use_create_lots) {   // al pinchar solo se usan lotes que ya existen
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking.type&id=' + pt.id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await L.check(page, 'use_create_lots', false); await L.guardar(page);
    await shot('tpv-10-pinchar-solo-lotes-existentes', { zona: L.widget(page, 'use_create_lots').locator('xpath=ancestor::div[contains(@class,"o_group")][1]'), foco: L.widget(page, 'use_create_lots'), borrador: 'Crear nuevo desmarcado' });
  }
  let [pk] = await call('stock.picking', 'search_read', [[['picking_type_id', '=', pt.id]]], { fields: ['id', 'name', 'state'], ...C });
  if (!pk) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#action=stock.action_picking_tree_all&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await L.m2o(page, 'picking_type_id', 'Pinchar barril');
    await L.esperar(page, 500);
    for (const ref of BARRILES) {
      await page.locator('.o_field_widget[name=move_ids_without_package] .o_field_x2many_list_row_add a').first().click(); await L.esperar(page, 400);
      const fila = page.locator('.o_field_widget[name=move_ids_without_package] .o_selected_row');
      await L.m2o(page, 'product_id', ref, fila);
      await L.campo(page, 'product_uom_qty', '1', fila);
    }
    await page.locator('.o_form_sheet .oe_title, .o_form_sheet').first().click({ position: { x: 5, y: 5 } });
    await L.guardar(page);
    await shot('tpv-11-pinchado-borrador', { zona: ['.o_form_statusbar', '.o_form_sheet'], borrador: 'BAR/PIN/00001 en borrador con 3 barriles' });
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Marcar como por hacer' }).first().click().catch(() => {}); await L.esperar(page, 1000);
    [pk] = await call('stock.picking', 'search_read', [[['picking_type_id', '=', pt.id]]], { fields: ['id', 'name', 'state'], ...C });
  } else {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=' + pk.id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
  }
  log('albarán', JSON.stringify(pk));
  log('lotes reservados', JSON.stringify(await call('stock.move.line', 'search_read', [[['picking_id', '=', pk.id]]], { fields: ['product_id', 'lot_id', 'quantity'], ...C })));
  if (pk.state !== 'done') {
    // operaciones detalladas de la primera línea: el lote que ha elegido FEFO
    await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row').first().locator('button[name=action_show_details], .fa-list').first().click().catch(() => {}); await L.esperar(page, 800);
    if (await page.locator('.modal-content').count()) { await shot('tpv-12-pinchado-lote-elegido-fefo', { zona: '.modal-content', borrador: 'Lote reservado por FEFO' }); await page.locator('.modal button:visible', { hasText: /Guardar|Cerrar|Descartar/ }).first().click(); await L.esperar(page, 500); }
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Validar' }).first().click(); await L.esperar(page, 1500);
    const m = page.locator('.modal-content'); if (await m.count()) log('diálogo', (await m.innerText()).slice(0, 300));
  }
  await shot('tpv-13-pinchado-hecho', { zona: ['.o_form_statusbar', '.o_form_sheet'], borrador: 'BAR/PIN/00001 hecho' });
  log('final', JSON.stringify(await call('stock.picking', 'search_read', [[['id', '=', pk.id]]], { fields: ['name', 'state', 'date_done'], ...C })));
};
