// Cap. 3 · Distribución analítica 100 % en cada lista de materiales: las OF heredan la cuenta de su cerveza.
const LDM = [['IPA', 'Llamarada Moe IPA'], ['LAG', 'Springfield Lager'], ['STO', 'Springfield Stout'], ['TRI', 'Trigo de Shelbyville']];
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  for (const [i, [cod, cuenta]] of LDM.entries()) {
    await L.abrir(page, BASE, 'mrp.mrp_bom_form_action', '1');
    await page.locator('.o_data_row', { hasText: 'PT-' + cod }).first().click(); await L.esperar(page);
    await page.locator('.o_notebook .nav-link', { hasText: 'Varios' }).click(); await L.esperar(page, 300);
    const w = L.widget(page, 'analytic_distribution');
    if ((await w.innerText()).includes(cuenta)) continue;
    await w.click();
    const pop = page.locator('.analytic_distribution_popup').first(); await pop.waitFor();
    const inp = pop.locator('input.o-autocomplete--input').first();
    await inp.click(); await inp.pressSequentially(cod, { delay: 40 });
    const it = page.locator('.o-autocomplete--dropdown-item', { hasText: cuenta }).first(); await it.waitFor(); await it.click();
    await L.esperar(page, 400);
    if (i === 0) await shot('analitica-05-ldm-ipa-distribucion', { zona: [pop, w], borrador: 'Distribución analítica de la LdM de la IPA: 100 % a su cuenta' });
    await page.keyboard.press('Escape'); await L.esperar(page, 300);
    await page.locator('.o_form_sheet .oe_title, .o_form_sheet h1, .o_form_sheet').first().click({ position: { x: 5, y: 5 } }).catch(() => {});
    await L.guardar(page);
  }
  log(JSON.stringify(await call('mrp.bom', 'search_read', [[]], { fields: ['product_tmpl_id', 'analytic_distribution'] })));
};
