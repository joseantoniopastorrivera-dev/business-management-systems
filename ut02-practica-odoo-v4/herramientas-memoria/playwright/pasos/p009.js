const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.reload(); await L.esperar(page, 2500);
  const sw = page.locator('.o_switch_company_menu');
  log('switcher=' + await sw.count());
  await sw.locator('button, .dropdown-toggle').first().click(); await page.waitForTimeout(1000);
  await shot('selector-de-companias-en-la-barra');
  log(await page.locator('.o_switch_company_menu .dropdown-menu, .o_switch_company_item').first().innerText().catch(() => '?'));
  // cambiar a la taberna (clic en el nombre = cambiar la empresa activa)
  await page.locator('.o_switch_company_item, .dropdown-item', { hasText: 'La taberna de Moe' }).locator('span, div').filter({ hasText: 'La taberna de Moe' }).last().click();
  await L.esperarRecarga2(page);
  await shot('empresa-activa-la-taberna-de-moe');
  log('URL ' + page.url());
  await L.ir(page, BASE, 'action=account.action_account_config');
  const s = await L.ajuste(page, 'Paquete');
  await shot('taberna-ajustes-facturacion-sin-plan-contable');
  log((await page.locator('.o_setting_container, .settings').first().innerText()).slice(0, 1500));
};
