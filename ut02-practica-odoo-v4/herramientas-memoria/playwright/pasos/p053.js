const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=10&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
  await page.mouse.move(1350, 860); await shot('fabrica-albaran-fab-out-00001-reservado');
  await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row', { hasText: 'Llamarada' }).first().locator('button[name="Open Move"]').click();
  await page.waitForSelector('.modal .o_data_row'); await page.waitForTimeout(1000);
  await shot('fabrica-albaran-ipa-lote-reservado-por-fefo-desde-camara-fria');
  await page.locator('.modal-footer button', { hasText: /Guardar|Descartar|Cerrar/ }).first().click(); await page.waitForTimeout(800);
  await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Validar\s*$/ }).first().click(); await L.esperar(page, 2500);
  if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 500)); await shot('fabrica-albaran-aviso'); }
  await page.mouse.move(1350, 860); await shot('fabrica-albaran-fab-out-00001-validado');
  // impresión del albarán con lotes
  log(JSON.stringify(await call('stock.move.line', 'search_read', [[['picking_id', '=', 10]]], { fields: ['product_id', 'lot_id', 'quantity', 'location_id', 'location_dest_id'] })));
  log(JSON.stringify(await call('stock.picking', 'read', [[10], ['name', 'state', 'date_done']])));
};
