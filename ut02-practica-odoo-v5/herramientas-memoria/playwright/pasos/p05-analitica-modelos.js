// Cap. 3 · Modelos de distribución: toda línea de la 701 (ventas de cerveza) con un barril se reparte a su cuenta.
const M = [['PT-IPA-30', 'IPA', 'Llamarada Moe IPA'], ['PT-LAG-30', 'LAG', 'Springfield Lager'],
           ['PT-STO-30', 'STO', 'Springfield Stout'], ['PT-TRI-30', 'TRI', 'Trigo de Shelbyville']];
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  await L.abrir(page, BASE, 'analytic.action_analytic_distribution_model', '1');
  for (const [i, [ref, cod, cuenta]] of M.entries()) {
    const hecho = await call('account.analytic.distribution.model', 'search_count', [[['product_id.default_code', '=', ref]]]);
    if (hecho) continue;
    await page.locator('.o_control_panel button:visible', { hasText: L.exacto('Nuevo') }).first().click(); await L.esperar(page, 300);
    const fila = page.locator('.o_selected_row');
    await L.campo(page, 'account_prefix', '701', fila);
    await L.m2o(page, 'product_id', ref, fila);
    const cia = await L.widget(page, 'company_id', fila).locator('input').inputValue().catch(() => '');
    if (!cia.includes('Springfield')) await L.m2o(page, 'company_id', 'Cervecería artesana', fila);
    await L.widget(page, 'analytic_distribution', fila).click();
    const pop = page.locator('.analytic_distribution_popup').first(); await pop.waitFor();
    const inp = pop.locator('input.o-autocomplete--input').first();
    await inp.click(); await inp.pressSequentially(cod, { delay: 40 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: cuenta }).first().click(); await L.esperar(page, 300);
    await page.keyboard.press('Escape'); await L.esperar(page, 300);
    await page.locator('.o_list_button_save:visible').first().click(); await L.esperar(page);
  }
  await L.abrir(page, BASE, 'analytic.action_analytic_distribution_model', '1');
  await shot('analitica-06-modelos-distribucion', { zona: '.o_list_renderer table', borrador: 'Cuatro modelos: prefijo 701 + producto → cuenta' });
  log(JSON.stringify(await call('account.analytic.distribution.model', 'search_read', [[]], { fields: ['account_prefix', 'product_id', 'company_id', 'analytic_distribution'] })));
};
