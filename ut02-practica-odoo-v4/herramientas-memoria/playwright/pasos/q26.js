const L = require('./lib');
module.exports = async ({ page, call, log, BASE }) => {
  log(JSON.stringify(await call('ir.model.data', 'search_read', [[['model', '=', 'ir.actions.act_window'], ['module', '=', 'hr_holidays']]], { fields: ['name'] })));
  log(JSON.stringify(await call('hr.leave.type', 'search_read', [[]], { fields: ['name'], context: { lang: 'es_ES' } })));
};
