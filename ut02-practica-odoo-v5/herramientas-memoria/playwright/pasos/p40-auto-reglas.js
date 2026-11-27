// Cap. 7 · Dos reglas de automatización (Ajustes → Técnico → Automatización → Reglas de automatización).
//  V-9 «OF bajo pedido → actividad»: cuando se crea una OF cuyo origen es un pedido de venta (S…), Odoo deja una
//       actividad «Por hacer» al responsable de producción para planificar la cocción. Es una acción sin código.
//  V-6 «Compra de la taberna → venta en la fábrica»: cuando la taberna confirma un pedido de compra a la fábrica, se crea
//       solo el pedido de venta en la fábrica con las mismas líneas y precios. Sustituye al módulo OCA
//       purchase_sale_inter_company, que no se instala (decisión de la v5: solo Community). Acción de código Python.
// Se crean por la API (el formulario de Odoo 17 es largo y el código Python no se puede escribir bien tecleando)
// y se captura cada regla ya creada.
// Incidencia I-09: la primera versión del código hacía «compra.partner_ref = venta.name» y Odoo la rechazó
// («forbidden opcode STORE_ATTR»): el código de las acciones se ejecuta con safe_eval, que no permite asignar atributos.
const CODIGO = `# La taberna compra a la fábrica: se crea el pedido de venta equivalente en la fábrica (compañía 1).
for compra in records:
    if compra.partner_ref:
        continue  # ya tiene venta asociada (evita duplicarla si se vuelve a confirmar)
    venta = env['sale.order'].with_company(1).sudo().create({
        'company_id': 1,
        'partner_id': compra.company_id.partner_id.id,
        'client_order_ref': compra.name,
        'order_line': [(0, 0, {
            'product_id': l.product_id.id,
            'product_uom_qty': l.product_qty,
            'price_unit': l.price_unit,
        }) for l in compra.order_line if l.product_id],
    })
    compra.write({'partner_ref': venta.name})  # safe_eval no deja asignar atributos (STORE_ATTR): se usa write()
    compra.message_post(body="Pedido de venta %s creado automáticamente en la fábrica." % venta.name)
    venta.message_post(body="Creado automáticamente desde la compra %s de La taberna de Moe." % compra.name)`;
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1, 2] } };
  const modelo = async (m) => (await call('ir.model', 'search_read', [[['model', '=', m]]], { fields: ['id'] }))[0].id;
  const campo = async (m, f) => (await call('ir.model.fields', 'search_read', [[['model', '=', m], ['name', '=', f]]], { fields: ['id'] }))[0].id;
  const [act] = await call('mail.activity.type', 'search_read', [[['name', 'in', ['To-Do', 'Por hacer']]]], { fields: ['id'], limit: 1 });
  let [a] = await call('base.automation', 'search_read', [[['name', '=', 'OF bajo pedido: planificar la cocción']]], { fields: ['id'] });
  if (!a) {
    a = { id: await call('base.automation', 'create', [{
      name: 'OF bajo pedido: planificar la cocción', model_id: await modelo('mrp.production'), trigger: 'on_create',
      filter_domain: "[('origin', '=like', 'S%')]",
      action_server_ids: [[0, 0, { name: 'Actividad para producción', model_id: await modelo('mrp.production'), state: 'next_activity',
        activity_type_id: act.id, activity_summary: 'Planificar la cocción del pedido bajo demanda', activity_date_deadline_range: 1,
        activity_date_deadline_range_type: 'days', activity_user_type: 'specific', activity_user_id: 2 }]],
    }], C) };
  }
  let [b] = await call('base.automation', 'search_read', [[['name', '=', 'Compra de la taberna → venta en la fábrica']]], { fields: ['id'] });
  if (!b) {
    b = { id: await call('base.automation', 'create', [{
      name: 'Compra de la taberna → venta en la fábrica', model_id: await modelo('purchase.order'), trigger: 'on_state_set',
      trg_selection_field_id: (await call('ir.model.fields.selection', 'search_read', [[['field_id', '=', await campo('purchase.order', 'state')], ['value', '=', 'purchase']]], { fields: ['id'] }))[0].id,
      filter_domain: "[('company_id', '=', 2), ('partner_id', '=', 1)]",
      action_server_ids: [[0, 0, { name: 'Crear la venta en la fábrica', model_id: await modelo('purchase.order'), state: 'code', code: CODIGO }]],
    }], C) };
  }
  for (const [id, slug, txt] of [[a.id, 'auto-02-regla-of-actividad', 'Regla V-9: OF con origen S… → actividad'], [b.id, 'auto-03-regla-intercompania', 'Regla V-6: compra de la taberna → venta en la fábrica']]) {
    await page.goto(BASE + '/web?r=' + Date.now() + `#model=base.automation&id=${id}&view_type=form&cids=1`); await page.waitForSelector('.o_form_view'); await L.esperar(page, 1200);
    await shot(slug, { zona: ['.o_form_sheet', '.o_control_panel'], borrador: txt });
    if (id === b.id) {
      const accion = page.locator('.o_field_widget[name=action_server_ids] .o_kanban_record, .o_field_widget[name=action_server_ids] .o_data_row').first();
      if (await accion.count()) { await accion.click(); await L.esperar(page, 1500); await shot('auto-04-codigo-intercompania', { zona: page.locator('.modal-content:visible').last(), borrador: 'Código Python de la acción' }); await page.keyboard.press('Escape'); }
    }
  }
  log(JSON.stringify(await call('base.automation', 'search_read', [[]], { fields: ['name', 'trigger', 'active'] })));
};
