// Recaptura sin cambiar datos: operaciones detalladas de BAR/PIN/00001 con el lote de cada barril pinchado.
module.exports = async ({ page, shot, BASE, L }) => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#model=stock.picking&id=13&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_form_view'); await L.esperar(page);
  const tab = page.locator('.o_notebook .nav-link', { hasText: 'Operaciones detalladas' });
  if (await tab.count()) { await tab.click(); await L.esperar(page, 500); await shot('tpv-12-pinchado-lotes', { zona: '.o_notebook', borrador: 'Lotes pinchados' }); return; }
  await page.locator('.o_field_widget[name=move_ids_without_package] .o_data_row').first().locator('button[name=action_show_details], .fa-list, .fa-list-ul').first().click(); await L.esperar(page, 800);
  await shot('tpv-12-pinchado-lotes', { zona: '.modal-content', borrador: 'Lote del barril de IPA pinchado' });
  await page.keyboard.press('Escape');
};
