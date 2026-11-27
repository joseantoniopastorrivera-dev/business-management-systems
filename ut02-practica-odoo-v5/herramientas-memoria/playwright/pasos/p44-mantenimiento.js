// Cap. 7 · V-8 Mantenimiento (app «Mantenimiento», Community).
//  - Categoría «Fermentadores» y equipo «Fermentador FV-01 (1.000 L)»; categoría «Embarrilado» y «Llenadora de barriles».
//  - Preventivo recurrente cada 30 días en el FV-01: limpieza CIP y revisión de juntas.
//  - Correctivo en la llenadora: revisar el cabezal tras la fuga del lote STO-261123-01 (retirada del cap. 4).
// Límite (incidencia I-02): vincular el equipo al centro de trabajo y bloquear la OF mientras está en mantenimiento es
// del módulo mrp_maintenance, que solo existe en Enterprise. En Community el equipo y el centro de trabajo van por separado.
module.exports = async ({ page, shot, BASE, L, call, log }) => {
  const C = { context: { allowed_company_ids: [1] } };
  if ((await L.ok(call, 'maintenance')) !== 'installed') await L.instalar({ page, shot, log, BASE }, 'Mantenimiento', 'Mantenimiento', 'mant-01-instalar', 'todas');
  const uno = async (m, dom, f = ['id']) => (await call(m, 'search_read', [dom], { fields: f, limit: 1, ...C }))[0];
  const cat = async (n) => (await uno('maintenance.equipment.category', [['name', '=', n]])) || { id: await call('maintenance.equipment.category', 'create', [{ name: n, company_id: 1 }], C) };
  const fer = await cat('Fermentadores'), emb = await cat('Embarrilado');
  const equipo = async (n, c, extra) => (await uno('maintenance.equipment', [['name', '=', n]])) || { id: await call('maintenance.equipment', 'create', [{ name: n, category_id: c.id, company_id: 1, ...extra }], C) };
  const fv1 = await equipo('Fermentador FV-01 (1.000 L)', fer, { serial_no: 'FV01-2024-117', model: 'Cilindrocónico 10 hL', location: 'Sala de fermentación', note: '<p>Uno de los fermentadores del centro de trabajo «Fermentadores».</p>' });
  const lle = await equipo('Llenadora de barriles LB-1', emb, { serial_no: 'LB1-2023-042', model: 'Llenadora semiautomática KEG 30 L', location: 'Línea de embarrilado' });
  let prev = await uno('maintenance.request', [['name', '=', 'Limpieza CIP y revisión de juntas del FV-01']]);
  if (!prev) prev = { id: await call('maintenance.request', 'create', [{ name: 'Limpieza CIP y revisión de juntas del FV-01', equipment_id: fv1.id, maintenance_type: 'preventive',
    schedule_date: '2026-12-01 07:00:00', duration: 3, recurring_maintenance: true, repeat_interval: 30, repeat_unit: 'day', repeat_type: 'forever', priority: '2',
    description: '<p>Ciclo CIP (sosa al 2 %, aclarado, ácido peracético) y cambio de juntas de la válvula de fondo si hay desgaste.</p>', company_id: 1 }], C) };
  let corr = await uno('maintenance.request', [['name', '=', 'Revisar el cabezal de llenado tras la fuga del lote STO-261123-01']]);
  if (!corr) corr = { id: await call('maintenance.request', 'create', [{ name: 'Revisar el cabezal de llenado tras la fuga del lote STO-261123-01', equipment_id: lle.id, maintenance_type: 'corrective',
    schedule_date: '2026-11-28 08:00:00', duration: 2, priority: '3',
    description: '<p>Un barril del lote de Stout se desechó por fuga (v4) y el lote entero se retiró (v5, cap. 4). Comprobar la junta del cabezal y el par de apriete de la válvula antes de volver a embarrilar Stout.</p>', company_id: 1 }], C) };
  const ir = async (h) => { await page.goto(BASE + '/web?r=' + Date.now() + '#' + h + '&cids=1'); await page.waitForSelector('.o_form_view, .o_list_view, .o_kanban_view', { timeout: 120000 }); await L.esperar(page, 1200); };
  await ir(`model=maintenance.equipment&id=${fv1.id}&view_type=form`);
  await shot('mant-02-equipo-fermentador', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Equipo Fermentador FV-01' });
  await ir(`model=maintenance.request&id=${prev.id}&view_type=form`);
  await shot('mant-03-preventivo-recurrente', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Mantenimiento preventivo cada 30 días' });
  await ir(`model=maintenance.request&id=${corr.id}&view_type=form`);
  await shot('mant-04-correctivo-llenadora', { zona: ['.o_form_sheet', '.o_control_panel'], borrador: 'Correctivo de la llenadora por la fuga' });
  await L.abrir(page, BASE, 'maintenance.hr_equipment_request_action', '1', '.o_kanban_view');
  await shot('mant-05-tablero-peticiones', { borrador: 'Tablero de peticiones de mantenimiento' });
  log(JSON.stringify(await call('maintenance.request', 'search_read', [[]], { fields: ['name', 'maintenance_type', 'stage_id', 'schedule_date'], ...C })));
};
