const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.o_field_widget[name="group_mrp_byproducts"]').first().scrollIntoViewIfNeeded();
  await L.check(page, 'group_mrp_byproducts', true); await shot('ajustes-fabricacion-subproductos-marcado');
  await L.guardarAjustes(page);
  // Modo desarrollador y usuario admin
  await page.goto(BASE + '/web?debug=1#model=res.users&id=2&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page, 2500);
  await shot('usuario-administrador-modo-desarrollador');
  await page.locator('.o_notebook .nav-link', { hasText: 'Permisos de acceso' }).first().click().catch(() => {}); await page.waitForTimeout(1000);
  log((await page.locator('.o_notebook .tab-pane.active').innerText()).slice(0, 2500));
  await shot('usuario-administrador-permisos-de-acceso');
};
