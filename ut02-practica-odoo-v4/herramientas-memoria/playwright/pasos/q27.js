const L = require('./lib');
module.exports = async ({ page, log, BASE }) => {
  await L.abrir(page, BASE, 'hr_holidays.open_view_public_holiday', '1', '.o_list_view, .o_kanban_view, .o_calendar_view');
  log('COLS=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('thead th[data-name]')].map(e => e.getAttribute('data-name') + ':' + e.innerText))));
  await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForTimeout(900);
  log('ROW=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_selected_row td[name]')].map(e => e.getAttribute('name') + '=' + ((e.querySelector('input') || {}).value || e.innerText)))));
  log('FORM=' + await page.locator('.o_form_view').count());
};
