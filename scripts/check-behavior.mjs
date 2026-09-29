/**
 * Behaviour checks for SPEC §4–§9. Usage (with `npm run dev` running):
 *   node scripts/check-behavior.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://localhost:5173';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.setDefaultTimeout(4000);
let passed = 0;
const check = async (name, fn) => {
  try {
    await fn();
    passed++;
    console.log('✓', name);
  } catch (e) {
    console.log('✗', name, '\n   ', e.message.split('\n').slice(0, 4).join(' | '));
    process.exitCode = 1;
  }
};
const val = (label) => page.getByLabel(label, { exact: true }).inputValue();
const combo = (name) => page.getByRole('combobox', { name: new RegExp(`^${name}`) }).first();
const group = (name) => page.getByRole('radiogroup', { name });
const focusedId = () => page.evaluate(() => document.activeElement?.id);

async function goToForm() {
  await page.goto(`${base}/cotacao`);
  await page.getByRole('button', { name: 'Selecionar carga' }).click();
  await page.getByRole('radio', { name: 'Carga IMO' }).click();
  await page.getByRole('button', { name: 'Avançar cotação' }).last().click();
  await page.waitForURL('**/cotacao/imo');
}

// ---------------- Routes & shell ----------------
await check('direct access to /cotacao/imo redirects to /cotacao', async () => {
  await page.goto(`${base}/cotacao/imo`);
  await page.waitForURL('**/cotacao');
});

await check('WhatsApp opens wa.me in a new tab; header menus are inert', async () => {
  const link = page.getByRole('link', { name: /WhatsApp/ });
  assert.equal(await link.getAttribute('href'), 'https://wa.me/5500000000000');
  assert.equal(await link.getAttribute('target'), '_blank');
  assert.equal(await page.getByText('Olá, Fernando').evaluate((el) => el.closest('button,a')), null);
});

await check('Side Menu: 72px, expands on hover over the content, Sustentabilidade active', async () => {
  const nav = page.getByRole('navigation', { name: 'Menu principal' });
  const mainX = await page.locator('main').evaluate((el) => el.getBoundingClientRect().x);
  assert.equal(Math.round((await nav.boundingBox()).width), 72);
  await nav.hover();
  await page.waitForTimeout(300);
  assert.equal(Math.round((await nav.boundingBox()).width), 270);
  assert.equal(await page.locator('main').evaluate((el) => el.getBoundingClientRect().x), mainX, 'content must not move');
  assert.equal(await page.getByRole('link', { name: 'Sustentabilidade' }).getAttribute('aria-current'), 'page');
  await page.mouse.move(900, 600);
});

await check('Contractor panel: expanded on /cotacao, tab toggles', async () => {
  const tab = page.getByRole('button', { name: /painel do contratante/ });
  assert.equal(await tab.getAttribute('aria-expanded'), 'true');
  await tab.click();
  assert.equal(await tab.getAttribute('aria-expanded'), 'false');
  await tab.click();
  assert.equal(await tab.getAttribute('aria-expanded'), 'true');
});

// ---------------- Step 1 ----------------
await check('accordion: aria-expanded, Avançar disabled, header click collapses', async () => {
  const open = page.getByRole('button', { name: 'Selecionar carga' });
  assert.equal(await open.getAttribute('aria-expanded'), 'false');
  await open.click();
  const header = page.getByRole('button', { name: /Cargas IMO, OOG/ });
  assert.equal(await header.getAttribute('aria-expanded'), 'true');
  assert.ok(await page.getByRole('button', { name: 'Avançar cotação' }).last().isDisabled());
  assert.equal(await page.getByRole('radio', { checked: true }).count(), 0, 'no pre-selection');
  await header.click();
  assert.equal(await page.getByRole('radiogroup').count(), 0);
  await page.getByRole('button', { name: 'Selecionar carga' }).click();
});

await check('"Outros tipos" card is Off while the selector is open', async () => {
  await page.waitForTimeout(300);
  const bg = await page.locator('section[aria-labelledby=other-cargo-title]').evaluate((el) => getComputedStyle(el).backgroundColor);
  assert.equal(bg, 'rgb(243, 245, 247)'); // color/bg/page
});

await check('unavailable options: aria-disabled, not selectable, "Em breve" on focus after ~300 ms', async () => {
  const oog = page.getByRole('radio', { name: 'OOG' });
  assert.equal(await oog.getAttribute('aria-disabled'), 'true');
  await oog.click({ force: true }); // aria-disabled: Playwright would wait forever otherwise
  assert.equal(await oog.getAttribute('aria-checked'), 'false');
  await page.getByRole('radio', { name: 'Carga IMO' }).focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'OOG');
  await page.waitForTimeout(100);
  assert.equal(await page.getByRole('tooltip', { name: 'Em breve' }).count(), 0, 'not before the delay');
  await page.waitForTimeout(350);
  assert.equal(await page.getByRole('tooltip', { name: 'Em breve' }).count(), 1);
});

await check('keyboard: arrows + Space select Carga IMO and enable Avançar', async () => {
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press(' ');
  assert.equal(await page.getByRole('radio', { name: 'Carga IMO' }).getAttribute('aria-checked'), 'true');
  assert.ok(await page.getByRole('button', { name: 'Avançar cotação' }).last().isEnabled());
});

await check('Avançar navigates to /cotacao/imo with the panel collapsed', async () => {
  await page.getByRole('button', { name: 'Avançar cotação' }).last().click();
  await page.waitForURL('**/cotacao/imo');
  assert.equal(await page.getByRole('button', { name: /painel do contratante/ }).getAttribute('aria-expanded'), 'false');
});

// ---------------- Step 2 ----------------
await check('masks: CNPJ, R$, kg, °C (negative), ± °C, helpers 1–20', async () => {
  await page.getByLabel('CNPJ do Pagador do Frete').fill('11222333000181');
  assert.equal(await val('CNPJ do Pagador do Frete'), '11.222.333/0001-81');
  await page.getByLabel('Valor da mercadoria / Contêiner').fill('123456');
  assert.equal(await val('Valor da mercadoria / Contêiner'), 'R$ 1.234,56');
  await page.getByLabel('Peso da mercadoria / Contêiner').fill('18500');
  assert.equal(await val('Peso da mercadoria / Contêiner'), '18.500');
  await page.getByLabel('Temperatura').fill('-18,5');
  assert.equal(await val('Temperatura'), '-18,5');
  await page.getByLabel('Variação').fill('-2,3');
  assert.equal(await val('Variação'), '2,3');
  await group(/ovação da carga na coleta/).getByLabel('Sim').check();
  await page.getByLabel('Número de ajudantes').first().fill('35');
  assert.equal(await page.getByLabel('Número de ajudantes').first().inputValue(), '20');
});

await check('CNPJ validation on blur: "CNPJ inválido." with aria-invalid + aria-describedby', async () => {
  const cnpj = page.getByLabel('CNPJ do Pagador do Frete');
  await cnpj.fill('11222333000100');
  await cnpj.blur();
  assert.equal(await cnpj.getAttribute('aria-invalid'), 'true');
  const describedBy = await cnpj.getAttribute('aria-describedby');
  assert.equal(await page.locator(`#${describedBy}`).textContent(), 'CNPJ inválido.');
  await cnpj.fill('');
  assert.equal(await page.locator(`#${describedBy}`).textContent(), 'Campo obrigatório.');
  await cnpj.fill('11222333000181');
});

await check('dropdown keyboard: Enter opens, arrows, Enter selects, Esc closes', async () => {
  const c = combo('Tipo de Mercadoria');
  await c.focus();
  await page.keyboard.press('Enter');
  assert.equal(await c.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  assert.match(await c.textContent(), /Tintas e solventes/);
  await page.keyboard.press(' ');
  assert.equal(await c.getAttribute('aria-expanded'), 'true');
  await page.keyboard.press('Escape');
  assert.equal(await c.getAttribute('aria-expanded'), 'false');
});

await check('dropdown menu scrolls after 5 items', async () => {
  await combo('Tipo de Mercadoria').click();
  const { scrollHeight, clientHeight } = await page.getByRole('listbox').evaluate((el) => ({ scrollHeight: el.scrollHeight, clientHeight: el.clientHeight }));
  assert.ok(scrollHeight > clientHeight && clientHeight <= 262, `${scrollHeight}/${clientHeight}`);
  await page.keyboard.press('Escape');
});

await check('Modalidade: 4 disabled fields without it; 2 enabled after; switching clears', async () => {
  const trecho1 = page.getByRole('group', { name: 'Trecho 1' });
  assert.equal(await trecho1.getByRole('combobox').count(), 4);
  assert.ok(await trecho1.getByRole('combobox').first().isDisabled());
  await combo('Modalidade do transporte').click();
  await page.getByRole('option', { name: 'Porta a Porto' }).click();
  assert.deepEqual(
    await trecho1.getByRole('combobox').evaluateAll((els) => els.map((e) => e.getAttribute('aria-labelledby') && e.closest('div').parentElement.querySelector('label').textContent)),
    ['Cidade de coleta (caso PORTA)', 'Porto de destino (caso PORTO)'],
  );
  await combo('Cidade de coleta').click();
  await page.getByRole('option', { name: 'Curitiba/PR' }).click();
  await combo('Porto de destino').click();
  await page.getByRole('option', { name: 'Santos' }).click();
  await combo('Modalidade do transporte').click();
  await page.getByRole('option', { name: 'Porta a Porta' }).click();
  assert.match(await combo('Cidade de coleta').textContent(), /Curitiba/, 'still applies → kept');
  assert.match(await combo('Cidade de entrega').textContent(), /Selecione/);
  await combo('Modalidade do transporte').click();
  await page.getByRole('option', { name: 'Porto a Porto' }).click();
  await combo('Modalidade do transporte').click();
  await page.getByRole('option', { name: 'Porta a Porto' }).click();
  assert.match(await combo('Cidade de coleta').textContent(), /Selecione/, 'no longer applied → cleared');
});

await check('"+ Adicionar trecho": up to 5, then hidden; Trecho N removable; Trecho 1 is not', async () => {
  const add = page.getByRole('button', { name: '+ Adicionar trecho' });
  for (let i = 0; i < 4; i++) await add.click();
  assert.equal(await add.count(), 0);
  assert.equal(await page.getByRole('group', { name: /^Trecho \d$/ }).count(), 5);
  assert.equal(await page.getByRole('button', { name: 'Remover Trecho 1' }).count(), 0);
  await page.getByRole('button', { name: 'Remover Trecho 3' }).click();
  assert.equal(await page.getByRole('group', { name: 'Trecho 4' }).count(), 1);
  assert.equal(await page.getByRole('group', { name: 'Trecho 5' }).count(), 0, 'renumbered');
  assert.equal(await add.count(), 1);
  for (const n of [4, 3, 2]) await page.getByRole('button', { name: `Remover Trecho ${n}` }).click();
});

await check('conditional fields appear/disappear and hidden values are cleared', async () => {
  const peacao = group('É necessário o envio de material de peação?');
  await peacao.getByLabel('Sim').check();
  await page.getByLabel('Tipo', { exact: true }).fill('Cinta');
  await peacao.getByLabel('Não').check();
  assert.equal(await page.getByLabel('Tipo', { exact: true }).count(), 0);
  await peacao.getByLabel('Sim').check();
  assert.equal(await val('Tipo'), '', 'value cleared');
  assert.equal(await page.getByLabel('Medidas').getAttribute('placeholder'), 'C x L x A (cm)');
  const emb = group('Embarcador possui estrutura para o recebimento de contêiner?');
  await emb.getByLabel('Não').check();
  await group('Coletado em:').first().getByLabel('Slider').check();
  await emb.getByLabel('Sim').check();
  assert.equal(await group('Coletado em:').count(), 0);
  await emb.getByLabel('Não').check();
  assert.equal(await group('Coletado em:').getByRole('radio', { checked: true }).count(), 0);
});

await check('upload: accepts PDF/JPG/PNG ≤ 10 MB, rejects others, progress → Done, removable', async () => {
  const input = page.locator('input[type=file]');
  await input.setInputFiles([
    { name: 'a.pdf', mimeType: 'application/pdf', buffer: Buffer.alloc(1024 * 1024) },
    { name: 'b.png', mimeType: 'image/png', buffer: Buffer.alloc(11 * 1024 * 1024) },
    { name: 'c.docx', mimeType: 'application/octet-stream', buffer: Buffer.alloc(10) },
  ]);
  const items = page.locator('li[data-state]');
  assert.equal(await items.count(), 3);
  assert.equal(await items.nth(0).getAttribute('data-state'), 'uploading');
  assert.match(await items.nth(1).textContent(), /Arquivo acima de 10 MB\./);
  assert.match(await items.nth(2).textContent(), /Formato não suportado\. Envie PDF, JPG ou PNG\./);
  assert.equal(await page.locator('#field-fispq').getAttribute('data-state'), 'error');
  await page.waitForTimeout(2200);
  assert.equal(await items.nth(0).getAttribute('data-state'), 'done');
  await page.getByRole('button', { name: 'Remover c.docx' }).click();
  await page.getByRole('button', { name: 'Remover b.png' }).click();
  assert.equal(await items.count(), 1);
  assert.equal(await page.locator('#field-fispq').getAttribute('data-state'), 'default');
});

await check('Dropzone is operable with Enter (opens the file chooser)', async () => {
  await page.locator('#field-fispq').focus();
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.keyboard.press('Enter')]);
  assert.ok(chooser.isMultiple());
});

await check('"Alterar carga" returns to /cotacao (selector open, IMO checked) keeping data', async () => {
  await page.getByRole('button', { name: 'Alterar carga' }).click();
  await page.waitForURL('**/cotacao');
  assert.equal(await page.getByRole('radio', { name: 'Carga IMO' }).getAttribute('aria-checked'), 'true');
  await page.getByRole('button', { name: 'Avançar cotação' }).last().click();
  assert.equal(await val('CNPJ do Pagador do Frete'), '11.222.333/0001-81');
  assert.equal(await page.locator('li[data-state=done]').count(), 1);
});

await check('submit disabled until terms are accepted', async () => {
  assert.ok(await page.getByRole('button', { name: 'Solicitar cotação' }).isDisabled());
});

await check('submit with errors: messages, scroll + focus on the first invalid field', async () => {
  await page.getByLabel('Ao solicitar a cotação você concorda com os dados informados acima').check();
  await page.getByRole('button', { name: 'Solicitar cotação' }).click();
  await page.waitForTimeout(600);
  assert.equal(await focusedId(), 'field-tamanhoConteiner');
  assert.ok(await page.getByText('Selecione uma opção.').first().isVisible());
  const r = await page.locator('#field-tamanhoConteiner').boundingBox();
  assert.ok(r.y > 0 && r.y < 900, 'in viewport');
});

await check('radio group error state: fieldset aria-invalid + options in Error', async () => {
  const g = group('Deseja utilizar o Ecofrete e compensar a emissão de CO2?');
  assert.equal(await g.getAttribute('aria-invalid'), 'true');
  assert.match(await g.textContent(), /Selecione uma opção\./);
});

async function completeForm(ecofrete) {
  const pick = async (name, option) => {
    await combo(name).click();
    await page.getByRole('option', { name: option, exact: true }).click();
  };
  await pick('Tamanho do contêiner', "40' HC");
  await pick('Tipo de contêiner', 'Dry');
  await pick('Cidade de coleta', 'Joinville/SC');
  await pick('Porto de destino', 'Itajaí');
  await pick('Tipo de embalagem da mercadoria', 'IBC');
  await group('Deseja utilizar o Ecofrete e compensar a emissão de CO2?').getByLabel(ecofrete).check();
  await page.getByLabel('Tipo', { exact: true }).fill('Cinta');
  await page.getByLabel('Medidas').fill('100 x 50 x 20');
  await group('Coletado em:').getByLabel('Carreta').check();
  await group('Destinatário possui estrutura para o recebimento de contêiner?').getByLabel('Sim').check();
  await page.getByLabel('Valor do numerário').first().fill('5000');
  await group(/desova da carga na entrega/).getByLabel('Não').check();
  await page.getByLabel('Quantidade de CNTRS/mês').fill('3');
}

await check('valid submit: Loading ~1.5 s (no re-click) → modal with Ecofrete seal', async () => {
  await completeForm('Sim');
  const btn = page.getByRole('button', { name: /Solicitar cotação|Enviando/ });
  await btn.click();
  await page.waitForTimeout(100);
  assert.match(await btn.textContent(), /Enviando…/);
  assert.equal(await btn.getAttribute('aria-busy'), 'true');
  await btn.click({ force: true });
  await page.waitForTimeout(1600);
  const dialog = page.getByRole('dialog', { name: 'Cotação solicitada com sucesso!' });
  assert.equal(await dialog.getAttribute('aria-modal'), 'true');
  assert.match(await dialog.textContent(), /As emissões de CO₂ desta operação serão compensadas pelo Ecofrete\./);
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Visualizar propostas');
});

await check('modal: focus trapped, overlay does not close, Esc closes', async () => {
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Nova cotação');
  await page.keyboard.press('Tab');
  assert.equal(await page.evaluate(() => document.activeElement?.textContent), 'Visualizar propostas');
  await page.mouse.click(20, 890);
  assert.equal(await page.getByRole('dialog').count(), 1);
  await page.keyboard.press('Escape');
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.match(page.url(), /\/cotacao\/imo$/);
});

await check('"Visualizar propostas" only closes; Ecofrete Não → no seal', async () => {
  await group('Deseja utilizar o Ecofrete e compensar a emissão de CO2?').getByLabel('Não').check();
  await page.getByRole('button', { name: 'Solicitar cotação' }).click();
  await page.waitForTimeout(1700);
  assert.doesNotMatch(await page.getByRole('dialog').textContent(), /Ecofrete/);
  await page.getByRole('button', { name: 'Visualizar propostas' }).click();
  assert.equal(await page.getByRole('dialog').count(), 0);
  assert.equal(await val('CNPJ do Pagador do Frete'), '11.222.333/0001-81');
});

await check('"Nova cotação" resets everything and returns to /cotacao collapsed', async () => {
  await page.getByRole('button', { name: 'Solicitar cotação' }).click();
  await page.waitForTimeout(1700);
  await page.getByRole('button', { name: 'Nova cotação' }).click();
  await page.waitForURL('**/cotacao');
  assert.equal(await page.getByRole('button', { name: 'Selecionar carga' }).count(), 1);
  await goToForm();
  assert.equal(await val('CNPJ do Pagador do Frete'), '');
  assert.equal(await page.locator('li[data-state]').count(), 0);
});

await check('every form control has a label; radio groups use fieldset + legend', async () => {
  const unlabeled = await page.evaluate(() =>
    [...document.querySelectorAll('input:not([type=file]), textarea, [role=combobox]')].filter((el) => !el.labels?.length && !el.getAttribute('aria-labelledby')).map((el) => el.id),
  );
  assert.deepEqual(unlabeled, []);
  const legends = await page.locator('fieldset > legend').count();
  assert.equal(legends, await page.locator('fieldset').count());
});

console.log(`\n${passed} checks passed${process.exitCode ? ' — with failures' : ''}`);
await browser.close();
