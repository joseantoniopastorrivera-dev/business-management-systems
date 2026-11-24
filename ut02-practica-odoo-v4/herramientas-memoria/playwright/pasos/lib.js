// Utilidades comunes de los pasos
const L = {};
// escapa los caracteres especiales de una expresión regular (para buscar un texto literal)
L.escRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
L.esperar = async (page, ms = 1500) => { await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {}); await page.waitForTimeout(ms); };
L.ir = async (page, BASE, hash) => { await page.goto(BASE + '/web#' + hash, { waitUntil: 'domcontentloaded' }); await page.waitForSelector('.o_action_manager .o_view_controller, .o_action_manager .o_form_view, .o_home_menu', { timeout: 120000 }); await L.esperar(page); };
L.instalar = async ({ page, shot, log, BASE }, buscar, nombreCard, slug, opts = {}) => {
  await L.ir(page, BASE, 'action=base.open_module_tree');
  const sv = page.locator('.o_searchview_input');
  await sv.fill(''); await page.keyboard.press('Backspace'); // quitar filtro «Aplicaciones» no: se deja
  await sv.fill(buscar); await page.waitForTimeout(400);
  await shot(slug + '-buscar-en-aplicaciones');
  await sv.press('Enter'); await L.esperar(page, 1500);
  const card = page.locator('.o_kanban_record').filter({ has: page.locator('.o_kanban_record_title, h4, .card-title', { hasText: new RegExp('^\\s*' + L.escRegex(nombreCard) + '\\s*$') }) }).first();
  await card.scrollIntoViewIfNeeded();
  await shot(slug + '-resultado-y-boton-activar');
  await card.locator('button', { hasText: 'Activar' }).click();
  await page.waitForTimeout(2500);
  await shot(slug + '-instalando');
  await L.esperarRecarga(page);
  await shot(slug + '-instalado');
  log('URL tras instalar ' + page.url());
};
L.esperarRecarga = async (page, max = 900000) => {
  const t0 = Date.now();
  while (Date.now() - t0 < max) {
    await page.waitForTimeout(3000);
    try {
      const st = await page.evaluate(() => ({ brand: (document.querySelector('.o_main_navbar .o_menu_brand') || {}).innerText || '', bloq: !!document.querySelector('.o_blockUI, .o_loading_indicator') }));
      if (st.brand && st.brand.trim() !== 'Aplicaciones' && !st.bloq) break;
    } catch (e) { /* recargando */ }
  }
  await L.esperar(page, 4000);
};
L.ok = async (call, modulo) => (await call('ir.module.module', 'search_read', [[['name', '=', modulo]]], { fields: ['state'] }))[0].state;
L.menuApps = async (page) => { await page.locator('.o_navbar_apps_menu button, .o_navbar_apps_menu .dropdown-toggle').first().click(); await page.waitForTimeout(1000); };
L.campo = async (page, name, valor, scope) => {
  const r = (scope || page).locator(`.o_field_widget[name="${name}"]`).first();
  const inp = r.locator('input, textarea').first();
  await inp.click(); await inp.fill(String(valor)); await page.waitForTimeout(250);
};
L.m2o = async (page, name, valor, scope, item) => {
  const r = (scope || page).locator(`.o_field_widget[name="${name}"]`).first();
  const inp = r.locator('input').first();
  await inp.click(); await inp.fill(''); await inp.type(valor, { delay: 40 });
  const it = page.locator('.o-autocomplete--dropdown-item', { hasText: item || valor }).first();
  await it.waitFor({ timeout: 20000 }); await page.waitForTimeout(400); await it.click(); await page.waitForTimeout(600);
};
L.check = async (page, name, on = true, scope) => {
  const c = (scope || page).locator(`.o_field_widget[name="${name}"] input[type=checkbox]`).first();
  if ((await c.isChecked()) !== on) await c.click({ force: true }); await page.waitForTimeout(500);
};
L.guardar = async (page) => { await page.locator('.o_form_button_save:visible').first().click(); await page.waitForTimeout(1500); await L.esperar(page); };
L.guardarAjustes = async (page) => { await page.locator('.o_control_panel button.o_form_button_save, .o_control_panel button:has-text("Guardar")').first().click(); await L.esperarRecarga2(page); };
L.esperarRecarga2 = async (page) => { await page.waitForTimeout(3000); for (let i = 0; i < 150; i++) { try { if (await page.locator('.o_main_navbar').count() && await page.locator('.o_action_manager .o_view_controller, .o_action_manager .o_form_view, .o_setting_container').count() && !(await page.locator('.o_blockUI').count())) break; } catch (e) {} await page.waitForTimeout(2000); } await L.esperar(page, 2500); };
L.ajuste = async (page, texto) => { const s = page.locator('.o_setting_box, .o_setting_container .row > div', { hasText: texto }).first(); await s.scrollIntoViewIfNeeded(); await page.waitForTimeout(500); return s; };
L.nuevo = async (page) => { await page.locator('.o_control_panel button:visible', { hasText: /^\s*Nuevo\s*$/ }).first().click(); await page.waitForSelector('.o_form_view', { timeout: 30000 }); await L.esperar(page); };
// marca la casilla cuyo label (for=) contiene el texto
L.casillaPorEtiqueta = async (page, texto, on = true) => {
  const id = await page.evaluate((t) => { const l = [...document.querySelectorAll('label')].find(x => x.innerText.trim().replace(/\?$/, '').trim() === t); return l ? l.getAttribute('for') : null; }, texto);
  if (!id) throw new Error('sin etiqueta ' + texto);
  // selector de atributo: sirve para cualquier id (los de Odoo llevan «_0», puntos…) sin tener que escaparlo como CSS
  const c = page.locator(`[id="${id.replace(/["\\]/g, '\\$&')}"]`);
  await c.scrollIntoViewIfNeeded(); if ((await c.isChecked()) !== on) await c.click({ force: true }); await page.waitForTimeout(600);
};
// abrir una acción con las empresas activas indicadas (recarga real para que cambie la empresa)
L.abrir = async (page, BASE, accion, cids, sel = '.o_list_view, .o_kanban_view, .o_form_view, .o_setting_container') => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#action=' + accion + '&cids=' + cids, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(sel, { timeout: 120000 }); await L.esperar(page, 2000);
  const emp = await page.locator('.o_switch_company_menu').innerText().catch(() => '?');
  return emp;
};
L.listaLotes = async (page) => {
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {}); await L.esperar(page);
  const x = page.locator('.o_searchview_facet .o_facet_remove').first(); if (await x.count()) { await x.click(); await L.esperar(page); }
  await page.locator('.o_optional_columns_dropdown_toggle, .o_optional_columns_dropdown button').first().click().catch(() => {}); await page.waitForTimeout(500);
  for (const t of ['Fecha de caducidad', 'Fecha de alerta']) { const it = page.locator('.o-dropdown--menu .dropdown-item, .o_optional_columns_dropdown .dropdown-item', { hasText: t }).first(); if (await it.count()) { const c = it.locator('input'); if (!(await c.isChecked().catch(() => true))) await it.click(); await page.waitForTimeout(400); } }
  await page.keyboard.press('Escape'); await page.waitForTimeout(500);
};
// Registrar pago desde una factura/recibo abierta (diario Banco)
L.pagar = async (page, shot, slug, diario = 'Banco') => {
  await page.locator('.o_form_statusbar button:visible', { hasText: 'Registrar pago' }).first().click();
  await page.waitForSelector('.modal .o_field_widget[name=journal_id]'); await page.waitForTimeout(1200);
  const j = page.locator('.modal .o_field_widget[name=journal_id]');
  if (await j.locator('select').count()) await j.locator('select').selectOption({ label: diario }).catch(() => {});
  else if (await j.locator('input').count()) { const v = await j.locator('input').inputValue(); if (!v.includes(diario)) await L.m2o(page, 'journal_id', diario, page.locator('.modal'), diario); }
  else { const b = j.locator('button, span', { hasText: diario }); if (await b.count()) await b.first().click(); }
  await page.waitForTimeout(600);
  await shot(slug + '-asistente-registrar-pago');
  await page.locator('.modal-footer button', { hasText: /Crear pago/ }).click(); await L.esperar(page, 2500);
  await page.mouse.move(1350, 860); await shot(slug + '-pagada');
};
module.exports = L;
