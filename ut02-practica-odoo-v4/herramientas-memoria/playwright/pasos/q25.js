const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'hr_contract.action_hr_contract', '1', '.o_kanban_view, .o_list_view');
  await L.nuevo(page);
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_view .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  for (const t of await page.locator('.o_notebook .nav-link').allInnerTexts()) log('TAB ' + t);
  log('SB=' + await page.locator('.o_form_statusbar').innerText());
};
