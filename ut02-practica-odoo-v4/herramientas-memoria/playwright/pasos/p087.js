const L = require('./lib');
const etapa = async (page, n) => { await page.locator('.o_form_statusbar .o_statusbar_status button', { hasText: n }).first().click({ force: true }).catch(async () => { await page.locator('.o_form_statusbar .o_statusbar_status .dropdown-toggle').first().click(); await page.locator('.dropdown-item', { hasText: n }).first().click(); }); await L.esperar(page, 1500); };
module.exports = async ({ page, shot, log, call, BASE }) => {
  await L.abrir(page, BASE, 'hr_recruitment.action_hr_job', '1', '.o_kanban_view, .o_list_view');
  await shot('reclutamiento-puestos-de-trabajo');
  await L.abrir(page, BASE, 'hr_recruitment.crm_case_categ0_act_job', '1', '.o_kanban_view, .o_list_view');
  await shot('reclutamiento-solicitudes-vacio');
  await L.nuevo(page);
  await L.campo(page, 'name', 'Operaria de producción · refuerzo de la sala de cocción');
  await L.campo(page, 'partner_name', 'Sara Vidal Romero');
  await L.campo(page, 'email_from', 'sara.vidal@example.com');
  await L.campo(page, 'partner_phone', '+34 600 223 418');
  await L.m2o(page, 'job_id', 'Operario', null, 'Operario/a de producción');
  await L.campo(page, 'salary_expected', '1700'); await L.campo(page, 'salary_proposed', '1650');
  const d = page.locator('.o_field_widget[name=availability] input'); await d.click(); await page.keyboard.press('Control+A'); await page.keyboard.type('01/12/2026'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
  const ed = page.locator('.o_field_widget[name=description] [contenteditable=true]').first();
  if (await ed.count()) { await ed.click(); await page.keyboard.type('Técnica en Elaboración de Productos Alimenticios (FP de grado medio). Dos años en una bodega de vino de la Ribera del Duero. Carné de carretillera. Incorporación inmediata.', { delay: 3 }); }
  await page.mouse.move(1350, 860); await shot('candidatura-sara-vidal-datos');
  await L.guardar(page); await page.mouse.move(1350, 860); await shot('candidatura-sara-vidal-nueva');
  for (const [n, slug] of [['Calificación inicial', 'calificacion-inicial'], ['Primera entrevista', 'primera-entrevista'], ['Segunda entrevista', 'segunda-entrevista'], ['Propuesta de contrato', 'propuesta-de-contrato'], ['Contrato firmado', 'contrato-firmado']]) {
    await etapa(page, n);
    if (n === 'Primera entrevista') {
      await page.locator('button', { hasText: 'Registrar una nota' }).first().click(); await page.waitForTimeout(600);
      await page.keyboard.type('Entrevista el 26/11 a las 10:00 con Daniel Ortega (maestro cervecero) en la sala de cocción: conoce el proceso de macerado y la limpieza CIP.', { delay: 3 });
      await page.locator('.o-mail-Composer button', { hasText: /Registrar|Enviar/ }).first().click().catch(() => page.keyboard.press('Control+Enter')); await page.waitForTimeout(1200);
    }
    await page.mouse.move(1350, 860); await shot('candidatura-sara-vidal-' + slug);
  }
  log('SB=' + await page.locator('.o_form_statusbar .o_statusbar_buttons').innerText());
  await page.locator('.o_form_statusbar button:visible', { hasText: 'Crear empleado' }).first().click(); await L.esperar(page, 2500);
  await page.waitForSelector('.o_form_view .o_field_widget[name=name]');
  await L.m2o(page, 'department_id', 'Producción', null, 'Producción');
  await L.m2o(page, 'parent_id', 'Daniel', null, 'Daniel Ortega');
  await L.campo(page, 'mobile_phone', '+34 600 112 307'); await L.campo(page, 'work_email', 'sara.vidal@cerveceriaspringfield.es');
  await page.mouse.move(1350, 860); await shot('empleada-sara-vidal-creada-desde-la-candidatura');
  await L.guardar(page); await page.mouse.move(1350, 860); await shot('empleada-sara-vidal-guardada');
  log(JSON.stringify(await call('hr.applicant', 'search_read', [[]], { fields: ['partner_name', 'stage_id', 'emp_id', 'date_closed'] })));
};
