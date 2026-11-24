const L = require('./lib');
const unfold = async (page) => { for (let r = 0; r < 6; r++) { const c = page.locator('.o_stock_reports_unfoldable'); const n = await c.count(); if (!n) break; await c.first().click(); await page.waitForTimeout(900); } };
module.exports = async ({ page, shot, log, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_production_lot_form', '1'); await L.listaLotes(page);
  await page.locator('.o_data_row', { hasText: 'IPA-261123-01' }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
  log('BTNS=' + JSON.stringify(await page.locator('.o_form_view button.oe_stat_button, .o_control_panel button').allInnerTexts()));
  await page.mouse.move(1350, 860); await shot('lote-barril-ipa-ficha');
  await page.locator('.o_form_view button.oe_stat_button, .o_control_panel button', { hasText: 'Trazabilidad' }).first().click(); await L.esperar(page, 2500);
  await unfold(page);
  await page.mouse.move(1350, 860); await shot('trazabilidad-lote-ipa-de-la-fabricacion-a-la-taberna');
  log((await page.locator('.o_action_manager').innerText()).slice(0, 1500));
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=5&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.locator('.o_form_view button.oe_stat_button, .o_control_panel button', { hasText: 'Trazabilidad' }).first().click(); await L.esperar(page, 2500);
  await unfold(page);
  await page.mouse.move(1350, 860); await shot('trazabilidad-of-ipa-lotes-de-componentes-consumidos');
  log((await page.locator('.o_action_manager').innerText()).slice(0, 1500));
};
