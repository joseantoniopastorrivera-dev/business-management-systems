// Cap. 6 · Un cliente compra 2 Barriles de Navidad en la tienda, como invitado (ventana de incógnito, sin la sesión
// del administrador). Se publican los barriles que se pueden vender: la Stout NO, porque su lote está retirado (cap. 4).
// 2 × 145 € + 21 % = 350,90 € > 300 €, así que la furgoneta refrigerada sale gratis. Pago con el proveedor Demo.
// Datos del cliente: ficticios (Ned Flanders, vecino de Alcalá), como el resto del caso práctico.
const CLIENTE = {
  name: 'Ned Flanders', email: 'ned.flanders@example.com', phone: '+34 600 000 777',
  street: 'Calle Mayor, 12', city: 'Alcalá de Henares', zip: '28801',
};
module.exports = async ({ page, BASE, L, call, log, otraVentana }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const pub = await call('product.template', 'search', [[['default_code', 'in', ['PT-NAV-30', 'PT-IPA-30', 'PT-LAG-30', 'PT-TRI-30']]]], C);
  await call('product.template', 'write', [pub, { is_published: true }], C);
  const { pagina: p, shot, cerrar } = await otraVentana();
  const esperar = async (ms = 800) => { await p.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {}); await p.waitForTimeout(ms); };
  try {
    // El servidor tiene varias BD y no hay dbfilter: el invitado elige la BD una vez (la URL pública real usaría un dominio propio).
    await p.goto(BASE + '/web/login?db=cerveceria-v5', { waitUntil: 'domcontentloaded' }); await esperar(500);
    await p.goto(BASE + '/shop', { waitUntil: 'domcontentloaded' }); await esperar(1500);
    await shot('tienda-22-catalogo', { borrador: 'Catálogo de la tienda (sin la Stout)' });
    await p.locator('a', { hasText: 'Barril de Navidad 2026' }).first().click(); await esperar(1500);
    const mas = p.locator('.css_quantity a.js_add_cart_json, .css_quantity button:has(.fa-plus), a[title*="Añadir"]').last();
    await mas.click(); await esperar(500);
    await shot('tienda-23-ficha-barril-navidad', { borrador: 'Ficha del Barril de Navidad con 2 unidades' });
    await p.locator('#add_to_cart, a#add_to_cart, button#add_to_cart').first().click(); await esperar(2000);
    await p.goto(BASE + '/shop/cart', { waitUntil: 'domcontentloaded' }); await esperar(1500);
    await shot('tienda-24-carrito', { borrador: 'Carrito: 2 barriles' });
    await p.locator('a', { hasText: /Finalizar compra|Proceder al pago|Pagar|Checkout/ }).first().click(); await esperar(2000);
    log('url tras carrito', p.url());
    if (/\/shop\/address/.test(p.url()) || await p.locator('form input[name=street]').count()) {
      for (const [k, v] of Object.entries(CLIENTE)) { const i = p.locator(`input[name=${k}]`).first(); if (await i.count()) await i.fill(v); }
      const pais = p.locator('select[name=country_id]'); if (await pais.count()) { await pais.selectOption({ label: 'España' }); await esperar(800); }
      const prov = p.locator('select[name=state_id]'); if (await prov.count()) await prov.selectOption({ label: 'Madrid' }).catch(async () => prov.selectOption({ label: 'Madrid (ES)' }));
      await shot('tienda-25-direccion-cliente', { completa: true, borrador: 'Dirección del cliente invitado' });
      log('botones', JSON.stringify(await p.locator('form a.btn, form button, a.a-submit, a[name=website_sale_main_button]').evaluateAll(es => es.map(e => e.className + '|' + e.innerText.trim()))));
      await p.locator('a.a-submit, button.a-submit, a[name=website_sale_main_button]').first().click(); await esperar(2500);
    }
    log('url tras direccion', p.url());
    // pantalla de confirmación de direcciones (si sale) → pago
    const seguir = p.locator('a', { hasText: /Confirmar|Continuar/ }).first();
    if (!/\/shop\/payment/.test(p.url()) && await seguir.count()) { await seguir.click(); await esperar(2500); }
    // método de envío: furgoneta
    const furg = p.locator('label, li', { hasText: 'Furgoneta refrigerada' }).locator('input[type=radio]').first();
    if (await furg.count()) { await furg.check({ force: true }); await esperar(2000); }
    // proveedor Demo
    const demo = p.locator('input[type=radio][name=o_payment_radio]').first();
    if (await demo.count()) { await demo.check({ force: true }); await esperar(800); }
    const det = p.locator('#customer_input'); if (await det.count()) await det.fill('Tarjeta de prueba');
    await shot('tienda-26-envio-y-pago', { completa: true, borrador: 'Envío gratis en furgoneta y pago Demo' });
    await p.locator('button[name=o_payment_submit_button], button:has-text("Pagar ahora")').first().click();
    await p.waitForURL(/payment\/status|shop\/confirmation/, { timeout: 60000 }).catch(() => {}); await esperar(4000);
    if (/payment\/status/.test(p.url())) { await p.waitForURL(/shop\/confirmation/, { timeout: 60000 }).catch(() => {}); await esperar(2000); }
    log('url final', p.url());
    await shot('tienda-27-pedido-confirmado', { completa: true, borrador: 'Confirmación del pedido pagado' });
  } finally {
    await cerrar();
  }
  const so = await call('sale.order', 'search_read', [[['website_id', '!=', false]]], { fields: ['name', 'state', 'amount_total', 'partner_id', 'carrier_id', 'mrp_production_count', 'transaction_ids'], order: 'id desc', limit: 1, ...C });
  log(JSON.stringify(so));
};
