const L = require('./lib');
const OPS = (ferm) => [
  ['Macerado', 'Sala de cocción', '90:00', 'Empastar la malta molida a 67 °C durante 60 min; recircular y lavar el grano a 76 °C.'],
  ['Cocción y lupulado', 'Sala de cocción', '75:00', 'Hervir 60 min. Lúpulo de amargor al inicio y de aroma en los últimos 10 min y en el whirlpool.'],
  ['Enfriado y trasiego al fermentador', 'Sala de cocción', '45:00', 'Enfriar el mosto con el intercambiador de placas a la temperatura de inoculación y oxigenar.'],
  ['Fermentación y maduración', 'Fermentadores', ferm[0], ferm[1]],
  ['Embarrilado', 'Línea de embarrilado', '60:00', 'Carbonatar a 2,4 vol. de CO2, llenar los 10 barriles PET de 30 L y etiquetar con el número de lote.'],
];
const B = [
  ['Llamarada Moe IPA', 'LdM-IPA', [['Malta Pale Ale', '60'], ['Malta Caramelo', '6'], ['Lúpulo Cascade', '3'], ['Levadura US-05', '0,5'], ['Barril PET', '10']], ['20160:00', 'Fermentar 7 días a 19 °C con US-05, dry hopping con Cascade el día 5 y madurar 7 días a 2 °C.'], '80', 'llamarada-moe-ipa'],
  ['Springfield Lager', 'LdM-LAG', [['Malta Pilsen', '62'], ['Lúpulo Saaz', '1,2'], ['Levadura W-34/70', '1'], ['Barril PET', '10']], ['50400:00', 'Fermentar 14 días a 11 °C con W-34/70 y guarda en frío (lagering) 21 días a 1 °C.'], '75', 'springfield-lager'],
  ['Springfield Stout', 'LdM-STO', [['Malta Pale Ale', '52'], ['Malta tostada', '6'], ['Malta Caramelo', '4'], ['Lúpulo Fuggle', '1,5'], ['Levadura S-04', '0,5'], ['Barril PET', '10']], ['20160:00', 'Fermentar 7 días a 18 °C con S-04 y madurar 7 días a 4 °C.'], '75', 'springfield-stout'],
  ['Trigo de Shelbyville', 'LdM-TRI', [['Malta de trigo', '33'], ['Malta Pilsen', '30'], ['Lúpulo Saaz', '0,8'], ['Levadura WB-06', '0,5'], ['Barril PET', '10']], ['14400:00', 'Fermentar 6 días a 20 °C con WB-06 y madurar 4 días a 4 °C. Sin filtrar.'], '75', 'trigo-de-shelbyville'],
];
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'mrp.mrp_bom_form_action', '1');
  await shot('listas-de-materiales-vacio');
  for (const [prod, code, comps, ferm, bagazo, slug] of B) {
    await L.nuevo(page);
    await L.m2o(page, 'product_tmpl_id', prod, null, prod);
    await L.campo(page, 'product_qty', '10'); await L.campo(page, 'code', code);
    await page.mouse.move(1350, 860); await shot('ldm-' + slug + '-cabecera-10-barriles');
    // Componentes
    await page.locator('.o_notebook .nav-link', { hasText: 'Componentes' }).click(); await page.waitForTimeout(500);
    for (const [p, q] of comps) {
      await page.locator('.o_notebook .tab-pane.active .o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(700);
      const row = page.locator('.o_notebook .tab-pane.active .o_data_row.o_selected_row');
      const i = row.locator('td[name=product_id] input'); await i.type(p, { delay: 30 });
      await page.locator('.o-autocomplete--dropdown-item', { hasText: p }).first().click(); await page.waitForTimeout(700);
      const c = row.locator('td[name=product_qty]'); await c.click(); await c.locator('input').fill(q); await page.waitForTimeout(300);
    }
    await page.locator('.o_form_sheet').click({ position: { x: 5, y: 5 } }); await page.mouse.move(1350, 860); await page.waitForTimeout(600);
    await shot('ldm-' + slug + '-componentes');
    // Operaciones
    await page.locator('.o_notebook .nav-link', { hasText: 'Operaciones' }).click(); await page.waitForTimeout(500);
    let k = 0;
    for (const [n, wc, dur, nota] of OPS(ferm)) {
      await page.locator('.o_notebook .tab-pane.active .o_field_x2many_list_row_add a').first().click(); await page.waitForSelector('.modal .o_field_widget[name=name]'); await page.waitForTimeout(500);
      const m = page.locator('.modal');
      await L.campo(page, 'name', n, m);
      await L.m2o(page, 'workcenter_id', wc, m, wc);
      await L.campo(page, 'time_cycle_manual', dur, m);
      const ed = m.locator('.o_field_widget[name=note] .note-editable, .o_field_widget[name=note] [contenteditable=true]').first();
      await ed.click(); await page.waitForTimeout(300); await page.keyboard.type(nota, { delay: 5 }); await page.waitForTimeout(400);
      if (k === 0 || n.startsWith('Fermentación')) await shot('ldm-' + slug + '-operacion-' + (k + 1) + '-' + n.split(' ')[0].toLowerCase());
      await m.locator('.modal-footer button', { hasText: 'Guardar y cerrar' }).click(); await page.waitForTimeout(900);
      k++;
    }
    await page.mouse.move(1350, 860); await shot('ldm-' + slug + '-operaciones');
    // Subproducto
    await page.locator('.o_notebook .nav-link', { hasText: 'Subproductos' }).click(); await page.waitForTimeout(500);
    await page.locator('.o_notebook .tab-pane.active .o_field_x2many_list_row_add a').first().click(); await page.waitForTimeout(700);
    const r = page.locator('.o_notebook .tab-pane.active .o_data_row.o_selected_row');
    await r.locator('td[name=product_id] input').type('Bagazo', { delay: 30 }); await page.locator('.o-autocomplete--dropdown-item', { hasText: 'Bagazo' }).first().click(); await page.waitForTimeout(600);
    const q = r.locator('td[name=product_qty]'); await q.click(); await q.locator('input').fill(bagazo);
    await page.locator('.o_form_sheet').click({ position: { x: 5, y: 5 } }); await page.mouse.move(1350, 860); await page.waitForTimeout(600);
    await shot('ldm-' + slug + '-subproducto-bagazo');
    await L.guardar(page); await shot('ldm-' + slug + '-guardada');
    await page.locator('.o_breadcrumb a').first().click(); await L.esperar(page);
  }
  await shot('listas-de-materiales-de-las-cuatro-cervezas');
  log(JSON.stringify(await call('mrp.bom', 'search_read', [[]], { fields: ['product_tmpl_id', 'product_qty', 'code', 'bom_line_ids', 'operation_ids', 'byproduct_ids'] })));
};
