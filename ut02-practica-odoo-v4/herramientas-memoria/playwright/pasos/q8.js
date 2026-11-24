const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'mrp.mrp_bom_form_action', '1');
  await L.nuevo(page);
  log('GEN=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_sheet .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  for (const t of await page.locator('.o_notebook .nav-link').allInnerTexts()) log('TAB ' + t);
  await page.locator('.o_notebook .nav-link', { hasText: 'Operaciones' }).click(); await page.waitForTimeout(600);
  await page.locator('.o_notebook .tab-pane.active .o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(1500);
  log('MODAL=' + await page.locator('.modal').count());
  if (await page.locator('.modal').count()) log('MF=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.modal .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  else log('ROW=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_selected_row td[name]')].map(e => e.getAttribute('name')))));
  await page.screenshot({ path: __dirname + '/q8.png' });
  await page.keyboard.press('Escape');
};
