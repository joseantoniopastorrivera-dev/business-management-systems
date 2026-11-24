module.exports = async ({ call, log }) => {

  const e = await call('hr.employee', 'search_read', [[['name', 'like', 'Administrator'], ['id', 'in', [8, 9, 10, 11]]]], { fields: ['name'] });
  log(JSON.stringify(e));
  log('emp=' + JSON.stringify(await call('hr.employee', 'unlink', [e.map(x => x.id)])));
  log(JSON.stringify(await call('hr.employee', 'search_read', [[]], { fields: ['name'] })));
  log(JSON.stringify(await call('hr.leave.allocation', 'search_read', [[['employee_id', 'in', [8, 9, 10, 11]]]], { fields: ['id'] })));
};
