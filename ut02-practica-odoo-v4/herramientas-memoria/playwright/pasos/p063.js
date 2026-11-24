const L = require('./lib');
const unfold = async (page) => { for (let r = 0; r < 8; r++) { const c = page.locator('span.o_stock_reports_caret_icon:has(i.fa-caret-right)'); if (!(await c.count())) break; await c.first().click(); await page.waitForTimeout(1000); } };
module.exports = async ({ page, shot, log }) => {
  await page.mouse.move(1350, 860); await shot('trazabilidad-lote-ipa-plegada-entrega-y-fabricacion');
  await unfold(page);
  await page.mouse.move(1350, 860); await shot('trazabilidad-lote-ipa-desplegada-hasta-los-lotes-de-proveedor');
  log((await page.locator('.o_action_manager table').innerText()).slice(0, 2500));
};
