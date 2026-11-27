// Cap. 5 · Solución de la I-06: impuesto «10% S IVA incluido» (copia del 10% S con «Incluido en el precio»)
// y PVP exactos en los seis productos de barra.
const PVP = { 'BAR-PIN-IPA': '5,50', 'BAR-CAN-IPA': '2,50', 'BAR-PIN-LAG': '5,00', 'BAR-CAN-LAG': '2,20', 'BAR-PIN-TRI': '5,50', 'BAR-CAN-TRI': '2,50' };
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [2] } };
  const NOMBRE = '10% S IVA incluido';
  let [t] = await call('account.tax', 'search_read', [[['name', '=', NOMBRE], ['company_id', '=', 2]]], { fields: ['id'], ...C });
  if (!t) {
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=account.tax&id=256&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    await page.locator('.o_cp_action_menus button, .o_control_panel .fa-cog').first().click(); await L.esperar(page, 300);
    await page.locator('.o-dropdown--menu .dropdown-item', { hasText: 'Duplicar' }).first().click(); await L.esperar(page, 1200);
    await L.campo(page, 'name', NOMBRE);
    await L.campo(page, 'description', 'IVA 10% (servicios, incluido en el precio)').catch(() => {});
    await page.locator('.o_notebook .nav-link', { hasText: 'Opciones avanzadas' }).click(); await L.esperar(page, 300);
    await L.check(page, 'price_include', true);
    await L.campo(page, 'invoice_label', '10% IVA incl.').catch(() => {});
    await shot('tpv-27-impuesto-iva-incluido', { zona: ['.o_form_sheet .oe_title', '.o_notebook'], foco: '.o_field_widget[name=price_include]', borrador: 'Impuesto 10% S IVA incluido' });
    await L.guardar(page);
    [t] = await call('account.tax', 'search_read', [[['name', '=', NOMBRE], ['company_id', '=', 2]]], { fields: ['id'], ...C });
  }
  for (const [i, [ref, pvp]] of Object.entries(PVP).entries()) {
    const [p] = await call('product.template', 'search_read', [[['default_code', '=', ref]]], { fields: ['id', 'taxes_id', 'list_price'], ...C });
    if (p.taxes_id.length === 1 && p.taxes_id[0] === t.id) continue;
    await page.goto(BASE + '/web?r=' + Date.now() + '#model=product.template&id=' + p.id + '&view_type=form&cids=2', { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.o_form_view'); await L.esperar(page);
    const imp = L.widget(page, 'taxes_id');
    while (await imp.locator('.o_delete').count()) { await imp.locator('.o_delete').first().click(); await L.esperar(page, 200); }
    await L.m2o(page, 'taxes_id', 'IVA incluido', null, NOMBRE);
    await L.campo(page, 'list_price', pvp); await L.esperar(page, 300);
    if (i === 1) await shot('tpv-28-cana-con-iva-incluido', { zona: [L.widget(page, 'list_price'), imp, '.o_form_sheet .oe_title'], foco: [L.widget(page, 'list_price'), imp], borrador: 'Caña IPA 2,50 € IVA incluido' });
    await L.guardar(page);
  }
  log(JSON.stringify(await call('product.template', 'search_read', [[['default_code', 'like', 'BAR-']]], { fields: ['default_code', 'list_price', 'taxes_id'], ...C })));
};
