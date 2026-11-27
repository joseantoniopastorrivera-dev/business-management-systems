// Cap. 7 · Automatizaciones (V-6 y V-9): instalar «Reglas de automatización» (base_automation). No es una aplicación,
// así que en Aplicaciones hay que quitar el filtro «Aplicaciones» para encontrarlo.
// (Además, al instalarlo Odoo recarga el registro en todos sus procesos: así la tienda deja de servir la cabecera y el
// pie de ejemplo que tenía guardados en caché; ver p37b.)
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  if ((await L.ok(call, 'base_automation')) !== 'installed') {
    await L.abrir(page, BASE, 'base.open_module_tree', '1', '.o_kanban_view');
    const x = page.locator('.o_searchview_facet .o_facet_remove').first(); if (await x.count()) { await x.click(); await L.esperar(page); }
    const sv = page.locator('.o_searchview_input');
    await sv.fill('Reglas de automatización'); await sv.press('Enter'); await L.esperar(page);
    const card = page.locator('.o_kanban_record').filter({ hasText: 'Reglas de automatización' }).first();
    const boton = card.locator('button', { hasText: 'Activar' });
    await shot('auto-01-instalar-reglas', { zona: card, foco: [boton], borrador: 'Módulo Reglas de automatización' });
    await boton.click(); await L.esperarRecarga(page);
  }
  log('base_automation', await L.ok(call, 'base_automation'));
};
