// Cap. 6 · Asistente del sitio web: se salta («Saltar y empezar desde cero»). El asistente pide tema y textos a los
// servidores de Odoo (IAP) y la VM está en red «Solo anfitrión», sin Internet; además la tienda solo necesita la plantilla base.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  if (!/configurator/.test(page.url())) await page.goto(BASE + '/website/configurator', { waitUntil: 'domcontentloaded' });
  const saltar = page.locator('a, button', { hasText: 'Saltar y empezar desde cero' }).first();
  await saltar.waitFor({ timeout: 60000 });
  await shot('tienda-02-asistente-sitio-web', { foco: [saltar], borrador: 'Asistente del sitio web: se salta' });
  await saltar.click();
  await page.waitForURL(u => !/configurator/.test(String(u)), { timeout: 120000 });
  await L.esperar(page, 3000);
  log('URL', page.url());
  log(JSON.stringify(await call('website', 'search_read', [[]], { fields: ['name', 'company_id', 'configurator_done'] })));
};
