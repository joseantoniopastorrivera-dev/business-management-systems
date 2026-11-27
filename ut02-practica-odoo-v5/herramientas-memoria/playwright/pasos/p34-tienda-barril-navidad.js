// Cap. 6 · «Barril de Navidad 2026»: cerveza de temporada que solo se fabrica cuando alguien la compra (MTO).
//  A. Datos de apoyo (API): ruta «Reponer sobre pedido (MTO)» desarchivada, cuenta analítica «Barril de Navidad»
//     y la materia prima nueva «Especias de Navidad», que se compra a Lúpulos de León.
//  B. Producto (pantalla): se duplica la Lager (mismo IVA, categoría, lotes y caducidad) y se cambian nombre, código,
//     precio y rutas (Fabricar + MTO).
//  C. Lista de materiales (API, con las operaciones de la Lager) y captura del resultado.
//  D. Compra y recepción de las especias.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  const CA = { context: { allowed_company_ids: [1], active_test: false } };
  const uno = async (m, dom, f = ['id']) => (await call(m, 'search_read', [dom], { fields: f, limit: 1, ...CA }))[0];
  // A
  await call('stock.route', 'write', [[1], { active: true }], CA);
  let ana = await uno('account.analytic.account', [['name', '=', 'Barril de Navidad']]);
  if (!ana) ana = { id: await call('account.analytic.account', 'create', [{ name: 'Barril de Navidad', plan_id: 2, company_id: 1 }], C) };
  const kg = (await uno('product.product', [['default_code', '=', 'MP-MAL-PAL']], ['uom_id', 'uom_po_id']));
  let esp = await uno('product.product', [['default_code', '=', 'MP-ESP-NAV']]);
  if (!esp) {
    const t = await call('product.template', 'create', [{ name: 'Especias de Navidad (canela, piel de naranja y clavo)', default_code: 'MP-ESP-NAV', detailed_type: 'product', categ_id: 4,
      uom_id: kg.uom_id[0], uom_po_id: kg.uom_po_id[0], standard_price: 18, sale_ok: false, purchase_ok: true,
      seller_ids: [[0, 0, { partner_id: 10, price: 18, min_qty: 1 }]] }], C);
    esp = await uno('product.product', [['product_tmpl_id', '=', t]]);
  }
  log('ana', ana.id, 'esp', esp.id);
  // B
  let nav = await uno('product.template', [['default_code', '=', 'PT-NAV-30']]);
  if (!nav) {
    await L.ir(page, BASE, 'model=product.template&id=19&view_type=form&cids=1');
    await page.locator('.o_cp_action_menus button, .o_control_panel .fa-cog').first().click();
    await page.locator('.o-dropdown--menu .dropdown-item', { hasText: 'Duplicar' }).first().click();
    await L.esperar(page, 1500);
  } else {
    await L.ir(page, BASE, `model=product.template&id=${nav.id}&view_type=form&cids=1`);
  }
  await page.locator('.o_notebook .nav-link', { hasText: 'Información general' }).first().click(); await L.esperar(page, 300);
  await L.campo(page, 'name', 'Barril de Navidad 2026 (barril 30 L)');
  await L.campo(page, 'list_price', '145');
  await L.campo(page, 'default_code', 'PT-NAV-30');
  // Solo se fabrica: no se compra a nadie (si quedara «Comprar», la regla MTO podría generar una petición de compra).
  await L.check(page, 'purchase_ok', false);
  await shot('tienda-09-producto-barril-navidad', { zona: '.o_form_sheet', foco: [L.widget(page, 'name'), L.widget(page, 'list_price')], borrador: 'Producto Barril de Navidad (duplicado de la Lager)' });
  await page.locator('.o_notebook .nav-link', { hasText: 'Ventas' }).first().click(); await L.esperar(page, 300);
  await L.campo(page, 'description_sale', 'Cerveza de temporada: ale tostada de 6,5 % con canela, piel de naranja y clavo. Edición limitada; se elabora bajo pedido y se entrega en barril de 30 L.').catch(e => log('desc', e.message));
  await page.locator('.o_notebook .nav-link', { hasText: 'Inventario' }).first().click(); await L.esperar(page, 400);
  const rutas = L.widget(page, 'route_ids');
  const ruta = (t) => rutas.locator('.form-check', { hasText: t }).locator('input').first();
  if (!(await ruta(/Reposición bajo pedido/).isChecked())) await ruta(/Reposición bajo pedido/).check({ force: true });
  if (await ruta(/^\s*Comprar\s*$/).isChecked()) await ruta(/^\s*Comprar\s*$/).uncheck({ force: true });
  await L.esperar(page, 300);
  await shot('tienda-10-rutas-fabricar-y-mto', { zona: '.o_notebook', foco: [rutas], borrador: 'Rutas Fabricar + MTO' });
  if (await page.locator('.o_form_button_save:visible').count()) await L.guardar(page);
  nav = await uno('product.template', [['default_code', '=', 'PT-NAV-30']]);
  const navp = await uno('product.product', [['product_tmpl_id', '=', nav.id]]);
  log('nav', nav.id, navp.id, JSON.stringify(await call('product.template', 'read', [[nav.id], ['route_ids', 'tracking', 'use_expiration_date', 'taxes_id', 'list_price']], C)));
  // C
  let bom = await uno('mrp.bom', [['product_tmpl_id', '=', nav.id]]);
  if (!bom) {
    const p = async (c) => (await uno('product.product', [['default_code', '=', c]])).id;
    const lin = [['MP-MAL-PAL', 50], ['MP-MAL-CAR', 6], ['MP-MAL-TOS', 3], ['MP-LUP-FUG', 1.2], ['MP-LEV-S04', 0.5], ['MP-ESP-NAV', 2], ['MP-ENV-PET30', 10]];
    const lines = []; for (const [c, q] of lin) lines.push([0, 0, { product_id: await p(c), product_qty: q }]);
    const ops = await call('mrp.routing.workcenter', 'search_read', [[['bom_id', '=', 2]]], { fields: ['name', 'workcenter_id', 'time_cycle_manual', 'sequence'], ...C });
    const id = await call('mrp.bom', 'create', [{ product_tmpl_id: nav.id, product_qty: 10, code: 'LdM-NAV', company_id: 1, type: 'normal', consumption: 'warning',
      analytic_distribution: { [ana.id]: 100 }, bom_line_ids: lines,
      operation_ids: ops.map(o => [0, 0, { name: o.name, workcenter_id: o.workcenter_id[0], time_cycle_manual: o.time_cycle_manual, sequence: o.sequence }]) }], C);
    bom = { id };
  }
  await L.ir(page, BASE, `model=mrp.bom&id=${bom.id}&view_type=form&cids=1`);
  await shot('tienda-11-ldm-barril-navidad', { zona: '.o_form_sheet', borrador: 'LdM del Barril de Navidad (10 barriles) con especias' });
  // D
  let po = await uno('purchase.order', [['order_line.product_id', '=', esp.id]], ['id', 'name', 'state', 'picking_ids']);
  if (!po) {
    const id = await call('purchase.order', 'create', [{ partner_id: 10, company_id: 1, order_line: [[0, 0, { product_id: esp.id, product_qty: 4, price_unit: 18 }]] }], C);
    await call('purchase.order', 'button_confirm', [[id]], C);
    po = await uno('purchase.order', [['id', '=', id]], ['id', 'name', 'state', 'picking_ids']);
  }
  await L.ir(page, BASE, `model=purchase.order&id=${po.id}&view_type=form&cids=1`);
  await shot('tienda-12-compra-especias', { zona: '.o_form_sheet', borrador: 'Compra de 4 kg de especias a Lúpulos de León' });
  const [pk] = await call('stock.picking', 'read', [po.picking_ids, ['name', 'state']], C);
  if (pk.state !== 'done') {
    await L.ir(page, BASE, `model=stock.picking&id=${po.picking_ids[0]}&view_type=form&cids=1`);
    await page.locator('.o_form_statusbar button:visible', { hasText: 'Validar' }).first().click(); await L.esperar(page, 1500);
    const ok = page.locator('.modal-footer button.btn-primary:visible'); if (await ok.count()) { await ok.first().click(); await L.esperar(page, 1500); }
  }
  await shot('tienda-13-recepcion-especias', { zona: '.o_form_sheet', borrador: 'Recepción de las especias' });
  log(JSON.stringify(await call('stock.picking', 'read', [po.picking_ids, ['name', 'state']], C)), po.name);
};
