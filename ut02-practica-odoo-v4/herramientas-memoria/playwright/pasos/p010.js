const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  const sel = page.locator('.o_field_widget[name="chart_template"] select');
  await sel.selectOption({ label: '🇪🇸 España - PyMEs (2008)' }).catch(async () => { const o = await sel.locator('option', { hasText: 'PyMEs (2008)' }).first().getAttribute('value'); await sel.selectOption(o); });
  await page.waitForTimeout(1500);
  await shot('taberna-paquete-espana-pymes-2008-elegido');
  await L.guardarAjustes(page);
  await L.ajuste(page, 'Paquete');
  await shot('taberna-plan-contable-instalado-iva-21');
  log(JSON.stringify(await call('res.company', 'read', [[2], ['chart_template', 'account_sale_tax_id', 'account_purchase_tax_id']])));
  log('cuentas taberna=' + await call('account.account', 'search_count', [[['company_id', '=', 2]]]) + ' diarios=' + JSON.stringify(await call('account.journal', 'search_read', [[['company_id', '=', 2]]], { fields: ['name', 'type'] })));
};
