// Cap. 5 · Dos TPV creados solos (uno por compañía, el de la fábrica en inglés). La fábrica no tiene barra:
// se archiva su «Shop» y el de la taberna se renombra «Barra de la taberna».
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  await L.abrir(page, BASE, 'point_of_sale.action_pos_config_kanban', '1-2');
  await shot('tpv-02-tableros-tras-instalar', { zona: '.o_kanban_renderer .o_kanban_record:not(.o_kanban_ghost)', borrador: 'Dos TPV: Shop (fábrica) y Tienda (taberna)' });
  const C = { context: { allowed_company_ids: [1, 2] } };
  const [shop] = await call('pos.config', 'search_read', [[['name', '=', 'Shop']]], { fields: ['id'], ...C });
  if (shop) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#action=point_of_sale.action_pos_config_tree&cids=1-2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_list_view'); await L.esperar(page);
    await page.locator('.o_data_row', { hasText: 'Shop' }).locator('.o_list_record_selector input').check({ force: true }); await L.esperar(page, 300);
    await page.locator('.o_control_panel button', { hasText: 'Acciones' }).click(); await L.esperar(page, 300);
    await shot('tpv-03-archivar-tpv-fabrica', { zona: ['.o_control_panel', '.o-dropdown--menu', '.o_list_renderer table'], borrador: 'Archivar el TPV Shop de la fábrica' });
    await page.locator('.o-dropdown--menu .dropdown-item', { hasText: L.exacto('Archivar') }).first().click(); await L.esperar(page, 500);
    const ok = page.locator('.modal button.btn-primary:visible'); if (await ok.count()) { await ok.first().click(); await L.esperar(page); }
  }
  const [t] = await call('pos.config', 'search_read', [[['company_id', '=', 2]]], { fields: ['id', 'name'], ...C });
  if (t.name !== 'Barra de la taberna') {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=pos.config&id=' + t.id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await L.campo(page, 'name', 'Barra de la taberna');
    await L.guardar(page);
  }
  log(JSON.stringify(await call('pos.config', 'search_read', [['|', ['active', '=', true], ['active', '=', false]]], { fields: ['name', 'active', 'company_id'], ...C })));
};
