const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'hr_holidays.hr_leave_allocation_action_all', '1', '.o_list_view, .o_kanban_view');
  await L.nuevo(page);
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_view .o_field_widget[name]')].map(e => e.getAttribute('name') + '=' + ((e.querySelector('input,select') || {}).value || '').slice(0, 30)))));
  log('HT=' + await page.locator('.o_field_widget[name=holiday_type]').innerText().catch(() => '?'));
  await page.screenshot({ path: __dirname + '/q28.png' });
};
