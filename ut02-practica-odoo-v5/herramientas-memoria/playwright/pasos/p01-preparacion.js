// Cap. 2 · Preparación: la BD copiada en el gestor y el punto de partida en Inventario.
module.exports = async ({ page, shot, BASE, L }) => {
  await page.goto(BASE + '/web/database/manager', { waitUntil: 'domcontentloaded' });
  await page.locator('.list-group').first().waitFor();
  await shot('preparacion-01-gestor-bd-copia', { zona: ['.list-group', '.o_database_list .btn'], foco: '.list-group-item:has-text("cerveceria-v5")',
    borrador: 'Gestor de BD con cerveceria-v5 junto a la original' });
  // menú principal de la copia
  // menú de aplicaciones de la copia (en Community no hay pantalla de inicio: se abre el desplegable)
  await L.abrir(page, BASE, 'stock.action_picking_tree_all', '1');
  await L.menuApps(page);
  await shot('preparacion-02-aplicaciones-de-partida', { zona: '.o_navbar_apps_menu .dropdown-menu, .o-dropdown--menu',
    borrador: 'Aplicaciones instaladas al empezar la v5 (las de la v4)' });
  await page.keyboard.press('Escape');
};
