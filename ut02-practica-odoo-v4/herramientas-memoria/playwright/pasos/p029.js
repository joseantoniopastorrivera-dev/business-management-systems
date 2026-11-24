// Corrige las fechas de las maltas (días ANTES de la caducidad) y rehace las capturas de Compra e Inventario
const L = require('./lib');
const path = require('path');
const CAP = 'C:/dev/Sistemas-Gestion-Empresarial/ut02-practica-odoo-v4/capturas/';
const fs = require('fs');
const archivo = (pre) => fs.readdirSync(CAP).find(f => f.startsWith(pre));
module.exports = async ({ page, log, call, BASE }) => {
  const M = [['Malta Pilsen', '120', '121'], ['Malta Pale Ale', '124', '125'], ['Malta Caramelo', '127', '128'], ['Malta de trigo', '130', '131'], ['Malta tostada', '133', '134']];
  await L.abrir(page, BASE, 'purchase.product_normal_action_puchased', '1');
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.fa-list-ul, .oi-view-list') }).first().click().catch(() => {}); await L.esperar(page);
  for (const [n, cCompra, cInv] of M) {
    await page.locator('.o_data_row, .o_kanban_record', { hasText: n }).first().click(); await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_notebook .nav-link', { hasText: 'Compra' }).click(); await page.mouse.move(1350, 860); await page.waitForTimeout(800);
    await page.screenshot({ path: CAP + archivo(cCompra + '-') });
    await page.locator('.o_notebook .nav-link', { hasText: 'Inventario' }).click(); await page.waitForTimeout(700);
    await L.campo(page, 'use_time', 30); await L.campo(page, 'removal_time', 15); await L.campo(page, 'alert_time', 45);
    await page.locator('.o_field_widget[name=alert_time]').scrollIntoViewIfNeeded(); await page.mouse.move(1350, 860); await page.waitForTimeout(600);
    await page.screenshot({ path: CAP + archivo(cInv + '-') });
    await L.guardar(page);
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  log(JSON.stringify(await call('product.template', 'search_read', [[['default_code', 'like', 'MP-MAL']]], { fields: ['name', 'expiration_time', 'use_time', 'removal_time', 'alert_time'] })));
};
