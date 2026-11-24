module.exports = async ({ call, log }) => {
  const r = await call('account.account', 'search_read', [[['company_id', '=', 1], ['code', '=like', '3%']]], { fields: ['code', 'name'], context: { lang: 'es_ES' } });
  log(r.map(a => a.code + ' ' + a.name).join('\n'));
  const r2 = await call('account.account', 'search_read', [[['company_id', '=', 1], '|', '|', '|', ['code', '=like', '60%'], ['code', '=like', '61%'], ['code', '=like', '71%'], ['code', '=like', '70%']]], { fields: ['code', 'name'], context: { lang: 'es_ES' } });
  log(r2.map(a => a.code + ' ' + a.name).join('\n'));
};
