const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_production_lot_form', '1'); await L.listaLotes(page);
  await page.locator('.o_data_row', { hasText: 'IPA-261123-01' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  await page.locator('.o_form_view button.oe_stat_button', { hasText: 'Trazabilidad' }).first().click(); await L.esperar(page, 2500);
  log('HTML=' + (await page.locator('.o_action_manager table tbody').innerHTML()).slice(0, 3000));
};
