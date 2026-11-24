// Alta de productos con captura de cada pestaña. spec: {n, ref, cat, uom, uompo, venta, coste, vende, compra, empresa, prov:[partner, precio, plazo], rutas:[...], lote, cad:[exp,use,removal,alert], slug}
const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }, specs, accion, cids) => {
  await L.abrir(page, BASE, accion, cids);
  for (const s of specs) {
    await L.nuevo(page);
    await L.campo(page, 'name', s.n);
    await L.check(page, 'sale_ok', !!s.vende); await L.check(page, 'purchase_ok', !!s.compra);
    await page.locator('.o_field_widget[name=detailed_type] select').selectOption({ label: 'Producto almacenable' }); await page.waitForTimeout(700);
    if (s.ref) await L.campo(page, 'default_code', s.ref);
    await L.m2o(page, 'categ_id', s.cat.split(' / ').pop(), null, new RegExp('^\s*' + s.cat + '\s*$'));
    if (s.uom) { await L.m2o(page, 'uom_id', s.uom, null, new RegExp('^\s*' + s.uom + '\s*$')); }
    if (s.uompo) { await L.m2o(page, 'uom_po_id', s.uompo, null, new RegExp('^\s*' + s.uompo + '\s*$')); }
    await L.campo(page, 'list_price', String(s.venta).replace('.', ','));
    await L.campo(page, 'standard_price', String(s.coste).replace('.', ','));
    if (s.empresa) await L.m2o(page, 'company_id', s.empresa, null, s.empresa);
    await page.locator('.o_form_sheet').click({ position: { x: 5, y: 5 } }); await page.waitForTimeout(500);
    await shot('producto-' + s.slug + '-informacion-general');
    if (s.prov) {
      await page.locator('.o_notebook .nav-link', { hasText: 'Compra' }).click(); await page.waitForTimeout(700);
      await page.locator('.o_notebook .tab-pane.active .o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(800);
      const row = page.locator('.o_notebook .tab-pane.active .o_data_row.o_selected_row');
      const ac = row.locator('td[name=partner_id] input'); await ac.fill(''); await ac.type(s.prov[0].slice(0, 14), { delay: 40 });
      await page.locator('.o-autocomplete--dropdown-item', { hasText: s.prov[0] }).first().click(); await page.waitForTimeout(600);
      const set = async (f, v) => { const c = row.locator(`td[name=${f}]`); if (await c.count()) { await c.click(); await page.waitForTimeout(200); await c.locator('input').first().fill(String(v).replace('.', ',')); } else log('sin columna ' + f); };
      await set('price', s.prov[1]); await set('delay', s.prov[2]);
      await page.locator('.o_notebook .tab-pane.active').click({ position: { x: 5, y: 5 } }); await page.mouse.move(1350, 860); await page.waitForTimeout(700);
      await shot('producto-' + s.slug + '-pestana-compra-proveedor');
    }
    await page.locator('.o_notebook .nav-link', { hasText: 'Inventario' }).click(); await page.waitForTimeout(700);
    const rutas = page.locator('.o_field_widget[name=route_ids]');
    for (const r of (s.rutas || [])) { const lb = rutas.locator('label', { hasText: r }).first(); const id = await lb.getAttribute('for'); const c = page.locator('#' + id); if (!(await c.isChecked())) await c.click({ force: true }); await page.waitForTimeout(300); }
    if (s.lote) {
      await page.locator('.o_field_widget[name=tracking] label', { hasText: 'Por lotes' }).click(); await page.waitForTimeout(800);
      if (s.cad) {
        await L.check(page, 'use_expiration_date', true); await page.waitForTimeout(600);
        const [e, u, r, a] = s.cad;
        await L.campo(page, 'expiration_time', e); await L.campo(page, 'use_time', u); await L.campo(page, 'removal_time', r); await L.campo(page, 'alert_time', a);
      }
    }
    await page.locator('.o_notebook .tab-pane.active').click({ position: { x: 5, y: 5 } }); await page.mouse.move(1350, 860); await page.waitForTimeout(700);
    await shot('producto-' + s.slug + '-pestana-inventario-rutas-y-lotes');
    await L.guardar(page);
    if (s.guardado) await shot('producto-' + s.slug + '-guardado');
    const err = await page.locator('.o_notification.border-danger, .o_notification_manager .bg-danger').count();
    if (err) { log('ERROR al guardar ' + s.n); await shot('error-guardar-' + s.slug); throw new Error('no guardó ' + s.n); }
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
};
