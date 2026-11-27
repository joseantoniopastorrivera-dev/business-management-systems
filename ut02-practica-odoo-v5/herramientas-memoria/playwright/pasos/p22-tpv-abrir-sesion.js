// Cap. 5 · Abrir la sesión de la barra con 150 € de cambio en caja.
module.exports = async ({ page, shot, BASE, L, log }) => {
  await page.goto(BASE + '/pos/ui?config_id=2', { waitUntil: 'domcontentloaded' });
  await page.locator('.product').first().waitFor({ timeout: 120000 }); await page.waitForTimeout(2000);
  const abrir = page.locator('button', { hasText: 'Abrir sesión' });
  if (await abrir.count()) {
    const inp = page.locator('input:visible').filter({ hasNot: page.locator('.search-bar') });
    log('inputs visibles', JSON.stringify(await page.locator('input:visible, textarea:visible').evaluateAll(es => es.map(e => e.className + '|' + e.placeholder))));
    const caja = page.locator('.opening-cash-control input, .popup input, .modal-dialog input').first();
    await caja.click(); await caja.fill('150'); await page.waitForTimeout(300);
    const nota = page.locator('.opening-cash-control textarea, .popup textarea, .modal-dialog textarea').first();
    if (await nota.count()) await nota.fill('Cambio para la barra: 150 € (billetes de 5 y 10 y monedas).');
    await shot('tpv-18-apertura-de-caja', { zona: abrir.locator('xpath=ancestor::div[contains(@class,"modal-content") or contains(@class,"popup")][1]'), borrador: 'Control de apertura de caja: 150 €' });
    await abrir.click(); await page.waitForTimeout(2000);
  }
  await shot('tpv-19-pantalla-de-la-barra', { borrador: 'Pantalla del TPV con los 6 productos' });
};
