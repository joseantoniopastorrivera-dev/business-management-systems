module.exports = async ({ call, log }) => {
  log(JSON.stringify(await call('hr.leave.type', 'search_read', [[]], { fields: ['name', 'has_valid_allocation', 'requires_allocation', 'virtual_remaining_leaves', 'max_leaves'], context: { employee_id: 4, default_date_from: '2026-12-21', lang: 'es_ES' } })));
  log(JSON.stringify(await call('hr.leave.allocation', 'read', [[7], ['employee_id', 'date_from', 'date_to', 'number_of_days', 'state', 'holiday_status_id', 'employee_company_id']])));
};
