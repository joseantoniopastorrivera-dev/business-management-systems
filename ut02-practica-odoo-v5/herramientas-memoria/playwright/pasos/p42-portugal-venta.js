// Cap. 7 · V-10 Distribuidor en Portugal: entrega intracomunitaria (IVA 0 %, art. 25 LIVA) con tarifa de distribuidor.
//  1. Ventas → Ajustes: activar «Listas de precios»; tarifa «Distribuidores UE (−10 %)».
//  2. Cliente «Distribuidora Cervejeira do Porto, Lda.» con NIF PT512345678 (ficticio, con dígito de control válido).
//     La posición fiscal «Intracomunitario» se aplica sola: país de la UE distinto de España y NIF informado.
//  3. Pedido de 4 Barriles de Navidad y 4 Lager. Los de Navidad generan OF (MTO) y la regla V-9 le pone la actividad.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  // 1
  let [tar] = await call('product.pricelist', 'search_read', [[['name', '=', 'Distribuidores UE (−10 %)']]], { fields: ['id'], ...C });
  if (!tar) {
    await L.abrir(page, BASE, 'sale.action_sale_config_settings', '1', '.o_setting_container');
    const b = await L.ajuste(page, 'Listas de precios');
    const cas = b.locator('input[type=checkbox]').first(); if (!(await cas.isChecked())) await cas.check({ force: true });
    await L.esperar(page, 400);
    await shot('portugal-01-activar-tarifas', { zona: b, borrador: 'Activar listas de precios' });
    await L.guardarAjustes(page);
    tar = { id: await call('product.pricelist', 'create', [{ name: 'Distribuidores UE (−10 %)', company_id: 1,
      item_ids: [[0, 0, { applied_on: '3_global', compute_price: 'percentage', percent_price: 10 }]] }], C) };
  }
  await ir(`model=product.pricelist&id=${tar.id}&view_type=form`);
  await shot('portugal-02-tarifa-distribuidores', { zona: '.o_form_sheet', borrador: 'Tarifa −10 % para distribuidores' });
  // 2
  let [cli] = await call('res.partner', 'search_read', [[['vat', '=', 'PT512345678']]], { fields: ['id'], ...C });
  if (!cli) {
    const [pt] = await call('res.country', 'search_read', [[['code', '=', 'PT']]], { fields: ['id'] });
    cli = { id: await call('res.partner', 'create', [{ name: 'Distribuidora Cervejeira do Porto, Lda.', is_company: true, vat: 'PT512345678',
      street: 'Rua de Santa Catarina, 120', city: 'Porto', zip: '4000-447', country_id: pt.id, email: 'encomendas@cervejeiradoporto.example.pt',
      phone: '+351 220 000 120', lang: 'es_ES', property_product_pricelist: tar.id }], C) };
  }
  await ir(`model=res.partner&id=${cli.id}&view_type=form`);
  const ventas = page.locator('.o_notebook .nav-link', { hasText: /Ventas y compras/ }).first(); if (await ventas.count()) { await ventas.click(); await L.esperar(page, 400); }
  await shot('portugal-03-cliente-oporto', { zona: '.o_form_sheet', borrador: 'Cliente de Oporto con NIF PT y tarifa' });
  // 3
  // borradores vacíos de un intento anterior (Odoo guarda solo al salir del formulario)
  const vacios = await call('sale.order', 'search', [[['partner_id', '=', cli.id], ['order_line', '=', false], ['state', '=', 'draft']]], C);
  if (vacios.length) await call('sale.order', 'unlink', [vacios], C);
  let [so] = await call('sale.order', 'search_read', [[['partner_id', '=', cli.id]]], { fields: ['id', 'name', 'state'], ...C });
  if (!so) {
    await L.abrir(page, BASE, 'sale.action_quotations_with_onboarding', '1');
    await L.nuevo(page);
    await L.m2o(page, 'partner_id', 'Distribuidora Cervejeira', null, 'Distribuidora Cervejeira');
    await L.esperar(page, 1000);
    for (const [cod, q] of [['PT-NAV-30', 4], ['PT-LAG-30', 4]]) {
      await page.locator('.o_field_x2many_list_row_add a').first().click(); await L.esperar(page, 400);
      const fila = page.locator('.o_data_row').last();
      await L.m2o(page, 'product_template_id', cod, fila, '[' + cod + ']');  // en la línea de venta el campo visible es la plantilla
      await L.campo(page, 'product_uom_qty', String(q), fila); await L.esperar(page, 800);
    }
    await L.guardar(page);
    const otra = page.locator('.o_notebook .nav-link', { hasText: 'Otra información' }).first();
    await shot('portugal-04-presupuesto-iva-0', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Presupuesto: tarifa −10 % e IVA 0 % intracomunitario' });
    if (await otra.count()) { await otra.click(); await L.esperar(page, 400); await shot('portugal-05-posicion-fiscal', { zona: '.o_notebook', foco: [L.widget(page, 'fiscal_position_id')], borrador: 'Posición fiscal Intracomunitario aplicada sola' }); }
    await page.locator('.o_form_statusbar button[name=action_confirm]:visible').first().click(); await L.esperar(page, 3000);
    [so] = await call('sale.order', 'search_read', [[['partner_id', '=', cli.id]]], { fields: ['id', 'name', 'state'], ...C });
  }
  const [o] = await call('sale.order', 'read', [[so.id], ['name', 'state', 'amount_untaxed', 'amount_tax', 'amount_total', 'fiscal_position_id', 'pricelist_id', 'mrp_production_ids', 'picking_ids']], C);
  log(JSON.stringify(o));
  // la OF creada por MTO, con la actividad de la regla V-9
  const mo = o.mrp_production_ids[0];
  await ir(`model=mrp.production&id=${mo}&view_type=form`);
  await shot('portugal-06-of-con-actividad', { completa: false, borrador: 'OF del pedido portugués con la actividad de la regla V-9' });
  log(JSON.stringify(await call('mail.activity', 'search_read', [[['res_model', '=', 'mrp.production'], ['res_id', '=', mo]]], { fields: ['summary', 'user_id', 'date_deadline'], ...C })));
};
