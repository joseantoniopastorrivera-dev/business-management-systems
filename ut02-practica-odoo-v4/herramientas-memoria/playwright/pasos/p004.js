const L = require('./lib');
module.exports = async (a) => {
  const { page, shot, log, call, BASE } = a;
  await L.ir(page, BASE, ''); await page.waitForTimeout(2000);
  await shot('cerveceria-menu-principal-inicial');
  log(JSON.stringify(await call('ir.module.module', 'search_read', [[['state', '=', 'installed'], ['application', '=', true]]], { fields: ['name'] })));
  log(JSON.stringify(await call('res.company', 'search_read', [[]], { fields: ['name', 'currency_id', 'country_id'] })));
  await L.instalar(a, 'Facturación', 'Facturación', 'facturacion');
  log('account=' + await L.ok(call, 'account') + ' l10n_es=' + await L.ok(call, 'l10n_es'));
};
