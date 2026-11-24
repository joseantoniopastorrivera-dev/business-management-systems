const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'stock.action_orderpoint', '1');
  log('COLS=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_list_view thead th[data-name]')].map(e => e.getAttribute('data-name') + ':' + e.innerText))));
  await page.locator('.o_optional_columns_dropdown_toggle, .o_optional_columns_dropdown button').first().click().catch(() => {}); await page.waitForTimeout(600);
  log('OPT=' + await page.locator('.o_optional_columns_dropdown .dropdown-menu, .o-dropdown--menu').first().innerText().catch(() => '?'));
  await page.keyboard.press('Escape');
  log('MENU=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_main_navbar .dropdown-item, .o_menu_sections a')].map(a => a.innerText.trim()).filter(Boolean))));
};
