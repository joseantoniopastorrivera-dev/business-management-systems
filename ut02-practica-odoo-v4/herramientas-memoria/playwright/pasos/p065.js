const L = require('./lib');
module.exports = async ({ page, shot, log, call, BASE }) => {
  await page.locator('.o_form_statusbar button:visible', { hasText: /^\s*Validar\s*$/ }).first().click(); await L.esperar(page, 2500);
  if (await page.locator('.modal').count()) { log('MODAL ' + (await page.locator('.modal').innerText()).slice(0, 300)); await shot('desecho-aviso'); }
  await page.mouse.move(1350, 860); await shot('desecho-barril-stout-hecho');
  log(JSON.stringify(await call('stock.scrap', 'search_read', [[]], { fields: ['name', 'product_id', 'lot_id', 'scrap_qty', 'state'] })));
  // Contabilidad de la fábrica
  await L.abrir(page, BASE, 'account.open_account_journal_dashboard_kanban', '1', '.o_kanban_view');
  await shot('fabrica-tablero-de-contabilidad');
  await L.abrir(page, BASE, 'account.action_move_journal_line', '1');
  await shot('fabrica-asientos-contables-de-todo-el-flujo');
  await L.abrir(page, BASE, 'account.action_account_moves_all', '1');
  const sv = page.locator('.o_searchview_input');
  await page.locator('.o_searchview_dropdown_toggler, .o_searchview .dropdown-toggle').first().click(); await page.waitForTimeout(700);
  await page.locator('.o_group_by_menu .dropdown-item, .o-dropdown--menu .dropdown-item', { hasText: /^\s*Cuenta\s*$/ }).first().click(); await page.waitForTimeout(1200);
  await page.keyboard.press('Escape'); await L.esperar(page);
  await shot('fabrica-apuntes-agrupados-por-cuenta-del-pgc');
  await sv.fill('430000'); await page.waitForTimeout(800);
  await page.locator('.o_searchview_autocomplete li, .o-dropdown-item', { hasText: 'Cuenta' }).first().click().catch(async () => page.keyboard.press('Enter'));
  await L.esperar(page, 1500);
  const g = page.locator('.o_group_header').first(); if (await g.count()) { await g.click(); await page.waitForTimeout(1200); }
  await page.mouse.move(1350, 860); await shot('fabrica-cuenta-430-factura-y-cobro-conciliados');
  log(JSON.stringify(await call('account.move.line', 'search_read', [[['account_id.code', '=', '430000'], ['company_id', '=', 1]]], { fields: ['move_id', 'debit', 'credit', 'matching_number', 'reconciled'] })));
  await page.locator('.o_main_navbar .o_menu_sections button, .o_main_navbar .o_menu_sections a', { hasText: 'Informes' }).first().click(); await page.waitForTimeout(800);
  await shot('fabrica-menu-informes-de-contabilidad-community');
  log('INFORMES=' + await page.locator('.o-dropdown--menu, .dropdown-menu.show').first().innerText().catch(() => '?'));
};
