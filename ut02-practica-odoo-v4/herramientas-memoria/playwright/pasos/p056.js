const L = require('./lib');
const FIX = [['IPA-261123-01', '23/03/2027 21:28:01', 'ipa'], ['LAG-261123-01', '22/05/2027 22:28:28', 'lager'], ['STO-261123-01', '22/05/2027 22:28:49', 'stout'], ['TRI-261123-01', '23/03/2027 21:29:10', 'trigo']];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_production_lot_form', '1');
  await L.listaLotes(page);
  await shot('fabrica-lotes-con-caducidad');
  await L.abrir(page, BASE, 'stock.action_production_lot_form', '2');
  await L.listaLotes(page);
  await shot('incidencia-taberna-lotes-con-caducidad-recalculada');
  for (const [lote, fecha, slug] of FIX) {
    await page.locator('.o_data_row', { hasText: lote }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    const f = page.locator('.o_field_widget[name=expiration_date] input'); await f.click(); await f.fill(fecha); await page.keyboard.press('Enter'); await page.waitForTimeout(800);
    if (slug === 'ipa') { await page.mouse.move(1350, 860); await shot('taberna-lote-ipa-caducidad-del-fabricante'); }
    await L.guardar(page);
    if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await shot('taberna-lote-' + slug + '-aviso-fechas'); await page.locator('.modal-footer button').first().click(); await L.esperar(page, 1000); }
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('taberna-lotes-con-la-caducidad-del-fabricante');
  log(JSON.stringify(await call('stock.lot', 'search_read', [[['name', 'like', '-261123-01']]], { fields: ['name', 'company_id', 'expiration_date', 'use_date', 'removal_date', 'alert_date'] })));
};
