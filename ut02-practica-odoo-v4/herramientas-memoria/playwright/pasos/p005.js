const L = require('./lib');
module.exports = async ({ page, shot, log, call }) => {
  await L.esperarRecarga(page);
  log('brand=' + await page.locator('.o_menu_brand').innerText());
  await shot('facturacion-instalado');
  log('account=' + await L.ok(call, 'account') + ' l10n_es=' + await L.ok(call, 'l10n_es'));
  log(JSON.stringify(await call('ir.module.module', 'search_read', [[['state', '=', 'installed'], ['application', '=', true]]], { fields: ['name'] })));
};
