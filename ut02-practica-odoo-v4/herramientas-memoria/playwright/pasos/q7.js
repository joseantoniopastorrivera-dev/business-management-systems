const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'purchase.product_normal_action_puchased', '1');
  await L.nuevo(page);
  log('TIPO=' + await page.locator('.o_field_widget[name=detailed_type]').innerHTML().then(h => h.slice(0, 500)));
  for (const t of await page.locator('.o_notebook .nav-link').allInnerTexts()) log('TAB ' + t);
  await page.locator('.o_field_widget[name=detailed_type] select').selectOption({ label: 'Producto almacenable' }).catch(e => log('sel ' + e.message));
  await page.waitForTimeout(800);
  await page.locator('.o_notebook .nav-link', { hasText: 'Inventario' }).click(); await page.waitForTimeout(800);
  log('INV=' + (await page.locator('.o_notebook .tab-pane.active').innerText()));
  log('NAMES=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_notebook .tab-pane.active .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  log('GEN=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_sheet .o_field_widget[name]')].map(e => e.getAttribute('name')))));
};
