// Cap. 3 · Capturas que faltaban del paso a paso (sin cambiar datos): ventana analítica de las otras tres LdM
// y la ficha de las otras tres cuentas analíticas.
const LDM = [['LAG', 'lager'], ['STO', 'stout'], ['TRI', 'trigo']];
module.exports = async ({ page, shot, BASE, L, call }) => {
  for (const [cod, slug] of LDM) {
    await L.abrir(page, BASE, 'mrp.mrp_bom_form_action', '1');
    await page.locator('.o_data_row', { hasText: 'PT-' + cod }).first().click(); await L.esperar(page);
    await page.locator('.o_notebook .nav-link', { hasText: 'Varios' }).click(); await L.esperar(page, 300);
    const w = L.widget(page, 'analytic_distribution'); await w.click();
    const pop = page.locator('.analytic_distribution_popup').first(); await pop.waitFor(); await L.esperar(page, 300);
    await shot('analitica-05' + { lager: 'b', stout: 'c', trigo: 'd' }[slug] + '-ldm-' + slug + '-distribucion', { zona: [pop, w], borrador: 'Distribución de la LdM ' + slug });
    await page.keyboard.press('Escape'); await L.esperar(page, 300);
    if (await page.locator('.o_form_status_indicator .o_form_button_save:visible').count()) await page.locator('.o_form_button_cancel:visible').first().click();
  }
  for (const [cod, slug] of LDM) {
    const [c] = await call('account.analytic.account', 'search_read', [[['code', '=', cod]]], { fields: ['id'] });
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.analytic.account&id=' + c.id + '&view_type=form&cids=1', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await shot('analitica-03' + { lager: 'b', stout: 'c', trigo: 'd' }[slug] + '-cuenta-' + slug, { zona: '.o_form_sheet', borrador: 'Cuenta analítica ' + slug });
  }
};
