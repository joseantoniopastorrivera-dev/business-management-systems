const L = require('./lib');
module.exports = async ({ page, shot, log, call }) => {
  await page.locator('.modal-footer button', { hasText: 'Deshabilitar SMS' }).click(); await L.esperar(page, 3000);
  if (await page.locator('.modal').count()) { log('MODAL2 ' + (await page.locator('.modal').innerText()).slice(0, 400)); await shot('fabrica-albaran-aviso-2'); }
  await page.mouse.move(1350, 860); await shot('fabrica-albaran-fab-out-00001-validado');
  log(JSON.stringify(await call('stock.picking', 'read', [[10], ['name', 'state', 'date_done']])));
};
