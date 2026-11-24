const L = require('./lib');
module.exports = async ({ page, log, call, BASE }) => {
  log('empresa=' + await L.abrir(page, BASE, 'hr_attendance.hr_attendance_action', '1', '.o_list_view, .o_kanban_view, .o_gantt_view, .o_calendar_view'));
  log('view=' + page.url());
  log('COLS=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('thead th[data-name]')].map(e => e.getAttribute('data-name')))));
  log('SW=' + JSON.stringify(await page.locator('.o_cp_switch_buttons button').evaluateAll(b => b.map(x => x.getAttribute('data-tooltip') || x.className))));
};
