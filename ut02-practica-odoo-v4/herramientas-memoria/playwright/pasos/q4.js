module.exports = async ({ call, log }) => {
  const d = await call('ir.model.data', 'search_read', [[['model', '=', 'res.groups'], ['module', '=', 'account'], ['name', 'in', ['group_account_user', 'group_account_readonly', 'group_account_manager', 'group_account_invoice']]]], { fields: ['name', 'res_id'] });
  for (const x of d) { const g = await call('res.groups', 'read', [[x.res_id], ['full_name', 'users']], { context: { lang: 'es_ES' } }); log(x.name + ' -> ' + JSON.stringify(g)); }
  const s = await call('ir.model.data', 'search_read', [[['model', '=', 'res.groups'], ['name', '=', 'group_stock_accounting_automatic']]], { fields: ['module', 'res_id'] });
  log(JSON.stringify(s));
};
