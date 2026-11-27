// Cap. 6 · Pago y envío de la tienda.
//  - Proveedor de pago «Demo» (módulo payment_demo) en modo de prueba: simula el cobro con tarjeta sin pasarela real.
//  - Métodos de envío: recogida gratis en la fábrica y furgoneta refrigerada (precio fijo) para la Comunidad de Madrid.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  // 1. Demo
  if ((await L.ok(call, 'payment_demo')) !== 'installed') {
    await L.abrir(page, BASE, 'payment.action_payment_provider', '1', '.o_kanban_view');
    const card = page.locator('.o_kanban_record', { hasText: 'Demo' }).first();
    const inst = card.locator('button', { hasText: /Instalar|Activar/ }).first();
    await shot('tienda-06-proveedores-de-pago', { foco: [card], borrador: 'Proveedores de pago: Demo' });
    await inst.click(); await L.esperarRecarga(page);
  }
  const [demo] = await call('payment.provider', 'search_read', [[['code', '=', 'demo']]], { fields: ['id'], ...C });
  await L.ir(page, BASE, `model=payment.provider&id=${demo.id}&view_type=form&cids=1`);
  const est = L.widget(page, 'state');
  await est.locator('input[data-value="test"]').first().check({ force: true });
  await L.esperar(page, 300);
  // Al instalarse, Demo ya queda publicado (botón «Publicado» arriba): solo se guarda si hay cambios.
  if (await page.locator('.o_form_button_save:visible').count()) await L.guardar(page);
  await shot('tienda-07-proveedor-demo', { zona: ['.o_form_sheet', '.o_control_panel'], foco: [L.widget(page, 'state'), page.locator('.o_form_view button', { hasText: 'Publicado' }).first()], borrador: 'Proveedor Demo en modo de prueba y publicado' });
  log('demo', JSON.stringify(await call('payment.provider', 'search_read', [[['id', '=', demo.id]]], { fields: ['state', 'is_published', 'company_id'], ...C })));
  // 2. Envíos
  await call('delivery.carrier', 'write', [[1], { name: 'Recogida en la fábrica (Alcalá de Henares)', fixed_price: 0 }], C);
  await call('product.product', 'write', [[34], { name: 'Recogida en la fábrica', default_code: 'ENV-REC' }], C);
  let [f] = await call('delivery.carrier', 'search_read', [[['name', 'ilike', 'Furgoneta refrigerada']]], { fields: ['id'], ...C });
  if (!f) {
    await L.abrir(page, BASE, 'delivery.action_delivery_carrier_form', '1', '.o_list_view, .o_kanban_view');
    await L.nuevo(page);
    await L.campo(page, 'name', 'Furgoneta refrigerada (Comunidad de Madrid)');
    const tipo = L.widget(page, 'delivery_type'); if (await tipo.locator('select').count()) await tipo.locator('select').selectOption('"fixed"');
    await L.campo(page, 'fixed_price', '12,00');
    const prod = L.widget(page, 'product_id').locator('input').first();
    await prod.click(); await prod.fill(''); await prod.pressSequentially('Envío en furgoneta refrigerada', { delay: 20 });
    await page.locator('.o-autocomplete--dropdown-item', { hasText: /Crear/ }).first().click(); await L.esperar(page);
    // solo a la Comunidad de Madrid (pestaña Destino)
    const dest = page.locator('.o_notebook .nav-link', { hasText: /Disponibilidad|Destino/ }).first();
    if (await dest.count()) { await dest.click(); await L.esperar(page, 300); }
    const st = L.widget(page, 'state_ids').locator('input').first();
    if (await st.count()) { await st.click(); await st.pressSequentially('Madrid', { delay: 30 }); await page.locator('.o-autocomplete--dropdown-item', { hasText: 'Madrid' }).first().click(); await L.esperar(page, 300); }
    await L.guardar(page);
    await shot('tienda-08-envio-furgoneta', { zona: '.o_form_sheet', borrador: 'Método de envío Furgoneta refrigerada 12 €' });
  }
  log(JSON.stringify(await call('delivery.carrier', 'search_read', [[]], { fields: ['name', 'fixed_price', 'product_id', 'state_ids', 'is_published'], ...C })));
};
