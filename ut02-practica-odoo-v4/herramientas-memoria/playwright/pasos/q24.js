const L = require('./lib');
module.exports = async ({ page, call, log, BASE }) => {
  log(JSON.stringify(await call('hr.department', 'search_read', [[]], { fields: ['name', 'company_id'] })));
  log(JSON.stringify(await call('hr.employee', 'search_read', [[]], { fields: ['name', 'company_id', 'department_id'] })));
  log(JSON.stringify(await call('hr.job', 'search_read', [[]], { fields: ['name', 'company_id'] })));
  log(JSON.stringify(await call('hr.contract.type', 'search_read', [[]], { fields: ['name'] })));
  log(JSON.stringify(await call('hr.leave.type', 'search_read', [[]], { fields: ['name', 'company_id', 'requires_allocation'] })));
  await L.abrir(page, BASE, 'hr.open_view_employee_list_my', '1', '.o_kanban_view, .o_list_view');
  await L.nuevo(page);
  for (const t of await page.locator('.o_notebook .nav-link').allInnerTexts()) log('TAB ' + t);
  log('F=' + JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('.o_form_sheet .o_field_widget[name]')].map(e => e.getAttribute('name')))));
};
