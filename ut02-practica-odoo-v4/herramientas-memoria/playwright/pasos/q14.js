const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await page.goto(BASE + '/web?debug=1&r=' + Date.now() + '#action=resource.action_resource_calendar_form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_list_view'); await L.esperar(page);
  await L.nuevo(page);
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_sheet .o_field_widget[name]')].map(e => e.getAttribute('name')))));
  log('COLS=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_field_widget[name=attendance_ids] thead th')].map(e => (e.getAttribute('data-name') || '') + ':' + e.innerText))));
  log('ROWS=' + await page.locator('.o_field_widget[name=attendance_ids] .o_data_row').count());
  await page.screenshot({ path: __dirname + '/q14.png' });
};
