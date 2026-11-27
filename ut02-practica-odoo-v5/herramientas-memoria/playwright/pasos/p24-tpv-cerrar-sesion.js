// Cap. 5 · Cierre de caja de la barra: recuento de efectivo (150 + 13,20 + 9,39 = 172,59 €) y cierre de sesión.
module.exports = async ({ page, shot, BASE, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  if (!page.url().includes('/pos/ui')) await page.goto(BASE + '/pos/ui?config_id=2', { waitUntil: 'domcontentloaded' });
  await page.locator('.product').first().waitFor({ timeout: 120000 }); await page.waitForTimeout(1500);
  const modal = page.locator('.close-pos-popup').first();
  if (!(await modal.isVisible())) {
    await page.locator('.fa-bars').first().click(); await page.waitForTimeout(800);
    await page.locator('.dropdown-item:visible', { hasText: 'Cerrar sesión' }).first().click(); await page.waitForTimeout(2500);
  }
  await modal.waitFor();
  log('cierre', (await modal.innerText()).replace(/\s+/g, ' ').slice(0, 600));
  const inp = modal.locator('input').first(); await inp.click(); await inp.fill('172,59'); await page.waitForTimeout(800);
  await shot('tpv-23-cierre-de-caja', { zona: modal, borrador: 'Cierre: recuento de efectivo 172,59 €' });
  await modal.locator('footer button.btn-primary', { hasText: /Cerrar sesión/ }).first().click(); await page.waitForTimeout(6000);
  log('url tras cerrar', page.url());
  const m2 = page.locator('.modal-content:visible'); if (await m2.count()) log('diálogo', (await m2.first().innerText()).slice(0, 400));
  log(JSON.stringify(await call('pos.session', 'search_read', [[['config_id', '=', 2]]], { fields: ['name', 'state', 'cash_register_balance_start', 'cash_register_balance_end_real', 'cash_register_difference', 'move_id'], ...C })));
};
