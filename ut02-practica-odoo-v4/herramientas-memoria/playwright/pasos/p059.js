const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=sale.order&id=1&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.reload(); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1500);
  await page.mouse.move(1350, 860); await shot('fabrica-s00001-entregado-pendiente-de-facturar');
  await page.locator('.o_form_statusbar button:visible', { hasText: 'Crear factura' }).first().click(); await page.waitForSelector('.modal'); await page.waitForTimeout(1000);
  await shot('fabrica-s00001-asistente-crear-factura-regular');
  await page.locator('.modal-footer button', { hasText: /Crear y ver factura|Crear borrador/ }).first().click(); await L.esperar(page, 3000);
  await page.waitForSelector('.o_form_view .o_field_widget[name=invoice_date]');
  await page.mouse.move(1350, 860); await shot('fabrica-factura-cliente-taberna-borrador');
  await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Confirmar\s*$/ }).first().click(); await L.esperar(page, 2500);
  await page.mouse.move(1350, 860); await shot('fabrica-factura-cliente-taberna-confirmada');
  await page.locator('.o_notebook .nav-link', { hasText: 'Apuntes contables' }).click(); await page.waitForTimeout(700);
  await page.mouse.move(1350, 860); await shot('fabrica-factura-cliente-taberna-apuntes-430-701-477');
  const fac = await call('account.move', 'search_read', [[['move_type', '=', 'out_invoice'], ['company_id', '=', 1]]], { fields: ['name', 'amount_total', 'invoice_origin', 'payment_state'] });
  log('FAC=' + JSON.stringify(fac));
};
