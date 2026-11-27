// Utilidades comunes de los pasos (v5). Un solo objeto L exportado.
// Cambios respecto a la v4: regex y selectores escapados de verdad, menos esperas fijas
// (se espera a que desaparezca el bloqueo de Odoo) y capturas con id estable.
const L = {};

// Escapa un texto para meterlo dentro de una RegExp (la v4 escribía '\s' en una cadena, que es solo «s»).
L.re = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
L.exacto = (s) => new RegExp('^\\s*' + L.re(s) + '\\s*$');

// Espera a que Odoo termine: red tranquila y sin la capa de bloqueo; después, un margen corto para animaciones.
L.esperar = async (page, ms = 600) => {
  await page.waitForLoadState('networkidle', { timeout: 60000 }).catch(() => {});
  await page.locator('.o_blockUI').first().waitFor({ state: 'detached', timeout: 120000 }).catch(() => {});
  await page.waitForTimeout(ms);
};

L.ir = async (page, BASE, hash) => {
  await page.goto(BASE + '/web#' + hash, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('.o_action_manager .o_view_controller, .o_action_manager .o_form_view, .o_home_menu', { timeout: 120000 });
  await L.esperar(page);
};

// Abre una acción con las compañías activas indicadas (cids «2» o «1-2»). Recarga de verdad para que cambie la compañía.
L.abrir = async (page, BASE, accion, cids, sel = '.o_list_view, .o_kanban_view, .o_form_view, .o_setting_container') => {
  await page.goto(BASE + '/web?r=' + Date.now() + '#action=' + accion + '&cids=' + cids, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector(sel, { timeout: 120000 }); await L.esperar(page, 1000);
  return page.locator('.o_switch_company_menu').innerText().catch(() => '?');
};

// Espera a que termine una recarga larga (instalar un módulo, guardar ajustes).
L.esperarRecarga = async (page, max = 900000) => {
  const t0 = Date.now();
  await page.waitForTimeout(2000);
  while (Date.now() - t0 < max) {
    try {
      const listo = await page.evaluate(() => {
        const marca = (document.querySelector('.o_main_navbar .o_menu_brand') || {}).innerText || '';
        const vista = document.querySelector('.o_action_manager .o_view_controller, .o_action_manager .o_form_view, .o_setting_container');
        return !!(marca.trim() && marca.trim() !== 'Aplicaciones' && vista && !document.querySelector('.o_blockUI'));
      });
      if (listo) break;
    } catch (e) { /* la página se está recargando */ }
    await page.waitForTimeout(2000);
  }
  await L.esperar(page, 1500);
};

// Instala un módulo desde Aplicaciones. capturas: 'final' (por defecto, una figura), 'todas' o 'ninguna'.
L.instalar = async ({ page, shot, log, BASE }, buscar, nombreCard, slug, capturas = 'final') => {
  await L.ir(page, BASE, 'action=base.open_module_tree');
  const sv = page.locator('.o_searchview_input');
  await sv.fill(buscar); await sv.press('Enter'); await L.esperar(page);
  const card = page.locator('.o_kanban_record').filter({ has: page.locator('.o_kanban_record_title, h4, .card-title', { hasText: L.exacto(nombreCard) }) }).first();
  await card.scrollIntoViewIfNeeded();
  const boton = card.locator('button', { hasText: 'Activar' });
  if (capturas === 'todas') await shot(slug + '-buscar', { zona: '.o_kanban_renderer', foco: [boton] });
  await boton.click();
  await L.esperarRecarga(page);
  if (capturas !== 'ninguna') await shot(slug + '-instalado');
  log('URL tras instalar ' + page.url());
};

// Estado de un módulo por la API (installed, uninstalled...).
L.ok = async (call, modulo) => (await call('ir.module.module', 'search_read', [[['name', '=', modulo]]], { fields: ['state'] }))[0].state;

L.menuApps = async (page) => {
  await page.locator('.o_navbar_apps_menu button, .o_navbar_apps_menu .dropdown-toggle').first().click();
  await page.locator('.o_navbar_apps_menu .dropdown-menu, .o-dropdown--menu').first().waitFor();
};

// Selector del widget de un campo por su nombre técnico.
L.widget = (page, name, scope) => (scope || page).locator(`.o_field_widget[name="${name}"]`).first();

L.campo = async (page, name, valor, scope) => {
  const inp = L.widget(page, name, scope).locator('input, textarea').first();
  await inp.click(); await inp.fill(String(valor)); await inp.press('Tab');
};

// Campo many2one: escribe y elige la opción del desplegable (item = texto de la opción, si no coincide con el valor).
L.m2o = async (page, name, valor, scope, item) => {
  const inp = L.widget(page, name, scope).locator('input').first();
  await inp.click(); await inp.fill(''); await inp.pressSequentially(valor, { delay: 30 });
  const it = page.locator('.o-autocomplete--dropdown-item', { hasText: item || valor }).first();
  await it.waitFor({ timeout: 20000 }); await it.click();
  await page.locator('.o-autocomplete--dropdown-menu').first().waitFor({ state: 'detached', timeout: 10000 }).catch(() => {});
};

L.check = async (page, name, on = true, scope) => {
  const c = L.widget(page, name, scope).locator('input[type=checkbox]').first();
  if ((await c.isChecked()) !== on) await c.click({ force: true });
  await L.esperar(page, 200);
};

// Marca la casilla cuya etiqueta tiene exactamente ese texto (ajustes sin nombre técnico a la vista).
L.casillaPorEtiqueta = async (page, texto, on = true) => {
  const id = await page.evaluate((t) => {
    const l = [...document.querySelectorAll('label')].find(x => x.innerText.trim().replace(/\?$/, '').trim() === t);
    return l ? l.getAttribute('for') : null;
  }, texto);
  if (!id) throw new Error('sin etiqueta ' + texto);
  const c = page.locator(`[id="${id.replace(/"/g, '\\"')}"]`);   // selector por atributo: no hace falta escapar CSS
  await c.scrollIntoViewIfNeeded();
  if ((await c.isChecked()) !== on) await c.click({ force: true });
  await L.esperar(page, 200);
};

L.nuevo = async (page) => {
  await page.locator('.o_control_panel button:visible', { hasText: L.exacto('Nuevo') }).first().click();
  await page.waitForSelector('.o_form_view', { timeout: 30000 }); await L.esperar(page);
};

// Guarda el formulario y espera a que desaparezca el indicador de cambios sin guardar.
L.guardar = async (page) => {
  await page.locator('.o_form_button_save:visible').first().click();
  await page.locator('.o_form_status_indicator .o_form_button_save:visible').first().waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});
  await L.esperar(page);
};

L.guardarAjustes = async (page) => {
  await page.locator('.o_control_panel button.o_form_button_save, .o_control_panel button:has-text("Guardar")').first().click();
  await L.esperarRecarga(page);
};

// Devuelve el bloque de ajustes que contiene el texto (para recortar la captura a él).
L.ajuste = async (page, texto) => {
  const s = page.locator('.o_setting_box, .o_setting_container .row > div', { hasText: texto }).first();
  await s.scrollIntoViewIfNeeded(); return s;
};

// Lista de lotes con las columnas de caducidad visibles.
L.listaLotes = async (page) => {
  await page.locator('.o_cp_switch_buttons button, .o_switch_view').filter({ has: page.locator('.oi-view-list, .fa-list-ul') }).first().click().catch(() => {});
  await L.esperar(page);
  const x = page.locator('.o_searchview_facet .o_facet_remove').first(); if (await x.count()) { await x.click(); await L.esperar(page); }
  await page.locator('.o_optional_columns_dropdown_toggle, .o_optional_columns_dropdown button').first().click().catch(() => {});
  for (const t of ['Fecha de caducidad', 'Fecha de alerta']) {
    const it = page.locator('.o-dropdown--menu .dropdown-item, .o_optional_columns_dropdown .dropdown-item', { hasText: t }).first();
    if (await it.count() && !(await it.locator('input').isChecked().catch(() => true))) { await it.click(); await L.esperar(page, 200); }
  }
  await page.keyboard.press('Escape'); await L.esperar(page, 200);
};

// Registrar pago desde una factura abierta (diario Banco). Dos capturas: asistente y factura pagada.
L.pagar = async (page, shot, slug, diario = 'Banco') => {
  await page.locator('.o_form_statusbar button:visible', { hasText: 'Registrar pago' }).first().click();
  const modal = page.locator('.modal');
  await modal.locator('.o_field_widget[name=journal_id]').waitFor(); await L.esperar(page);
  const j = modal.locator('.o_field_widget[name=journal_id]');
  if (await j.locator('select').count()) await j.locator('select').selectOption({ label: diario }).catch(() => {});
  else if (await j.locator('input').count()) { if (!(await j.locator('input').inputValue()).includes(diario)) await L.m2o(page, 'journal_id', diario, modal, diario); }
  else { const b = j.locator('button, span', { hasText: diario }); if (await b.count()) await b.first().click(); }
  await shot(slug + '-asistente-pago', { zona: '.modal-content' });
  await modal.locator('.modal-footer button', { hasText: /Crear pago/ }).click(); await L.esperar(page, 1500);
  await page.mouse.move(5, 5);   // que ningún tooltip tape la factura
  await shot(slug + '-pagada');
};

// Registra una nota interna en el chatter del registro abierto y devuelve el mensaje publicado (para recortar la captura).
L.nota = async (page, texto) => {
  await page.locator('.o-mail-Chatter-topbar button', { hasText: 'Registrar una nota' }).first().click();
  const caja = page.locator('.o-mail-Composer-input').first(); await caja.waitFor();
  await caja.fill(texto);
  await page.locator('.o-mail-Composer button', { hasText: L.exacto('Registrar') }).first().click();
  const msg = page.locator('.o-mail-Message', { hasText: texto.slice(0, 40) }).first();
  await msg.waitFor({ timeout: 20000 }); await L.esperar(page, 300);
  return msg;
};

module.exports = L;
