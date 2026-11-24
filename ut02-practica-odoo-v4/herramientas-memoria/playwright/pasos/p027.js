const L = require('./lib');
const P = [
  ['Maltas del Duero, S.L.', 'Calle Cobalto, 18', 'Polígono Industrial San Cristóbal', '47012', 'Valladolid', 'Valladolid', 'ESB47123583', '+34 983 000 118', 'pedidos@maltasdelduero.es', 'maltas-del-duero'],
  ['Lúpulos de León, S. Coop.', 'Carretera de Astorga, km 12', '', '24270', 'Carrizo de la Ribera', 'León', 'ESF24319873', '+34 987 000 357', 'ventas@lupulosdeleon.es', 'lupulos-de-leon'],
  ['Levaduras Ibéricas, S.L.', 'Calle de la Ciència, 40', '', '08840', 'Viladecans', 'Barcelona', 'ESB08612343', '+34 936 000 440', 'pedidos@levadurasibericas.es', 'levaduras-ibericas'],
  ['Envases Técnicos del Henares, S.L.', 'Avenida de la Industria, 7', '', '28850', 'Torrejón de Ardoz', 'Madrid', 'ESB82974619', '+34 916 000 270', 'comercial@envasesdelhenares.es', 'envases-del-henares'],
  ['Bodegas Valdecuevas del Duero, S.L.', 'Carretera de Valladolid a Soria, km 312', '', '47300', 'Peñafiel', 'Valladolid', 'ESB47236195', '+34 983 000 312', 'pedidos@valdecuevas.es', 'bodegas-valdecuevas'],
  ['Bodegas Señorío del Oja, S.L.', 'Avenida de la Costa del Vino, 12', '', '26200', 'Haro', 'Rioja', 'ESB26148759', '+34 941 000 126', 'pedidos@senoriodeloja.es', 'bodegas-senorio-del-oja'],
];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'account.res_partner_action_supplier', '1');
  await shot('proveedores-vacio');
  let primero = true;
  for (const [n, st, st2, zip, city, prov, vat, tel, mail, slug] of P) {
    await L.nuevo(page);
    if (primero) await shot('proveedor-formulario-nuevo');
    const comp = page.locator('.o_field_widget[name=company_type] input[value=company], .o_field_widget[name=company_type] label:has-text("Compañía")').first();
    await comp.click().catch(() => {});
    await L.campo(page, 'name', n);
    await L.campo(page, 'street', st); if (st2) await L.campo(page, 'street2', st2);
    await L.campo(page, 'zip', zip); await L.campo(page, 'city', city);
    if (!(await page.locator('.o_field_widget[name=country_id] input').inputValue())) await L.m2o(page, 'country_id', 'España', null, 'España');
    await L.m2o(page, 'state_id', prov, null, prov);
    await L.campo(page, 'vat', vat); await L.campo(page, 'phone', tel); await L.campo(page, 'email', mail);
    await page.locator('.o_notebook .nav-link', { hasText: 'Ventas y compras' }).click(); await page.waitForTimeout(600);
    await L.m2o(page, 'property_supplier_payment_term_id', '30', null, '30 días');
    await shot('proveedor-' + slug + '-datos');
    await L.guardar(page); if (primero) await shot('proveedor-' + slug + '-guardado');
    primero = false;
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await page.locator('.o_switch_view.o_list, .o_cp_switch_buttons button[data-tooltip=Lista]').first().click().catch(() => {}); await L.esperar(page);
  await shot('lista-de-proveedores-de-la-fabrica-y-la-bodega');
  log(JSON.stringify(await call('res.partner', 'search_read', [[['vat', '!=', false]]], { fields: ['name', 'vat', 'state_id', 'company_id'] })));
};
