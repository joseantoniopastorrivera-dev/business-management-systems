const L = require('./lib');
const LOT = [['Llamarada', 'IPA-261123-01'], ['Springfield Lager', 'LAG-261123-01'], ['Springfield Stout', 'STO-261123-01'], ['Trigo de Shelbyville', 'TRI-261123-01']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=7&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
  await page.reload(); await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
  log('empresa=' + await page.locator('.o_switch_company_menu').innerText());
  await page.mouse.move(1350, 860); await shot('taberna-recepcion-bar-in-00002-barriles-de-la-cerveceria');
  let k = 0;
  for (const [p, lote] of LOT) {
    await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row', { hasText: p }).first().locator('button[name="Open Move"]').click();
    await page.waitForSelector('.modal .o_data_row'); await page.waitForTimeout(800);
    const c = page.locator('.modal .o_data_row').first().locator('td[name=lot_name]'); await c.click(); await c.locator('input').fill(lote);
    await page.locator('.modal-header').click(); await page.waitForTimeout(500);
    if (k === 0) await shot('taberna-recepcion-lote-de-la-fabrica-ipa-261123-01');
    await page.locator('.modal-footer button', { hasText: 'Guardar' }).click(); await page.waitForTimeout(1000); k++;
  }
  await page.mouse.move(1350, 860); await shot('taberna-recepcion-barriles-con-lotes');
  await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Validar\s*$/ }).first().click(); await L.esperar(page, 2500);
  if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 400)); await shot('taberna-recepcion-aviso'); }
  await page.mouse.move(1350, 860); await shot('taberna-recepcion-barriles-validada');
  log(JSON.stringify(await call('stock.quant', 'search_read', [[['company_id', '=', 2], ['location_id.usage', '=', 'internal']]], { fields: ['product_id', 'location_id', 'quantity', 'lot_id'] })));
  log(JSON.stringify(await call('stock.lot', 'search_read', [[['company_id', '=', 2]]], { fields: ['name', 'expiration_date'] })));
};
