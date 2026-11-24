const L = require('./lib');
module.exports = async ({ page, log, call, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=mrp.production&id=5&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 2000);
  log('BTNS=' + await page.locator('.o_form_statusbar .o_statusbar_buttons').innerText());
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_sheet > .o_inner_group .o_field_widget[name], .o_form_sheet .o_group .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  for (const t of await page.locator('.o_notebook .nav-link').allInnerTexts()) log('TAB ' + t);
  log(JSON.stringify(await call('mrp.production', 'read', [[5], ['reservation_state', 'components_availability', 'state', 'workorder_ids', 'date_start', 'date_finished']])));
  await page.screenshot({ path: __dirname + '/q13.png' });
};
