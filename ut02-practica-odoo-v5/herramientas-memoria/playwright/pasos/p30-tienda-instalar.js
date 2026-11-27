// Cap. 6 · Tienda online de la fábrica: instalar Comercio electrónico (website_sale). Arrastra Sitio web, Pagos y Facturación.
// Se instala con la fábrica como compañía activa: el sitio web que se crea queda a su nombre.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  await L.abrir(page, BASE, 'base.open_module_tree', '1', '.o_kanban_view');
  if ((await L.ok(call, 'website_sale')) !== 'installed') {
    const sv = page.locator('.o_searchview_input');
    await sv.fill('Comercio electrónico'); await sv.press('Enter'); await L.esperar(page);
    const card = page.locator('.o_kanban_record').filter({ hasText: 'website_sale' }).first();
    const card2 = (await card.count()) ? card : page.locator('.o_kanban_record').filter({ has: page.locator('h4, .card-title, .o_kanban_record_title', { hasText: /^\s*Comercio electrónico\s*$/ }) }).first();
    await card2.scrollIntoViewIfNeeded();
    const boton = card2.locator('button', { hasText: 'Activar' });
    await shot('tienda-01-instalar-comercio-electronico', { zona: '.o_kanban_renderer', foco: [boton], borrador: 'Aplicaciones: Comercio electrónico' });
    await boton.click();
    // al terminar, Odoo 17 abre el asistente de configuración del sitio web (o vuelve al backend)
    const t0 = Date.now();
    while (Date.now() - t0 < 900000) {
      await page.waitForTimeout(5000);
      const u = page.url();
      if (/configurator|website\/configurator/.test(u)) break;
      if ((await L.ok(call, 'website_sale').catch(() => '')) === 'installed' && !(await page.locator('.o_blockUI').count())) break;
    }
    await L.esperar(page, 3000);
  }
  log('website_sale', await L.ok(call, 'website_sale'), 'URL', page.url());
  if (/configurator/.test(page.url())) await shot('tienda-02-asistente-sitio-web', { borrador: 'Asistente de configuración del sitio web' });
};
