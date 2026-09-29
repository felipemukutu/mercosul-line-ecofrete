/**
 * Reproduces the 12 states of the Figma "Flows" page (01 → 12) and saves a
 * screenshot of each one. Usage (with `npm run dev` running):
 *
 *   node scripts/capture-states.mjs [outDir] [baseUrl]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] ?? 'screenshots';
const base = process.argv[3] ?? 'http://localhost:5173';
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1640, height: 960 } });
const shot = async (name, opts = {}) => {
  await page.waitForTimeout(350);
  await page.screenshot({ path: join(outDir, `${name}.png`), ...opts });
  console.log('✓', name);
};

const pickDropdown = async (label, option) => {
  await page.getByRole('combobox', { name: new RegExp(`^${label}`) }).first().click();
  await page.getByRole('option', { name: option, exact: true }).click();
};
const pickRadio = async (groupLabel, option) => {
  await page.getByRole('radiogroup', { name: groupLabel }).getByLabel(option, { exact: true }).check();
};
const pdf = (name, mb) => ({ name, mimeType: 'application/pdf', buffer: Buffer.alloc(Math.round(mb * 1024 * 1024)) });

async function goToForm() {
  await page.goto(`${base}/cotacao`);
  await page.getByRole('button', { name: 'Selecionar carga' }).click();
  await page.getByRole('radio', { name: 'Carga IMO' }).click();
  await page.getByRole('button', { name: 'Avançar cotação' }).last().click();
  await page.waitForURL('**/cotacao/imo');
}

async function fillValid({ ecofrete }) {
  await page.getByLabel('CNPJ do Pagador do Frete').fill('11222333000181');
  await pickDropdown('Modalidade do transporte', 'Porta a Porto');
  await pickDropdown('Tipo de Mercadoria', 'Tintas e solventes');
  await page.locator('input[type=file]').setInputFiles([pdf('FISPQ-solvente-industrial.pdf', 2.4)]);
  await page.getByLabel('Valor da mercadoria / Contêiner').fill('1250000');
  await page.getByLabel('Peso da mercadoria / Contêiner').fill('18000');
  await pickDropdown('Tamanho do contêiner', "20' DC");
  await pickDropdown('Tipo de contêiner', 'Dry');
  await pickDropdown('Cidade de coleta', 'São Paulo/SP');
  await pickDropdown('Porto de destino', 'Manaus');
  await pickRadio('Deseja utilizar o Ecofrete e compensar a emissão de CO2?', ecofrete);
  await pickDropdown('Tipo de embalagem da mercadoria', 'Tambor');
  await pickRadio('É necessário o envio de material de peação?', 'Não');
  await pickRadio('Embarcador possui estrutura para o recebimento de contêiner?', 'Sim');
  await pickRadio('Destinatário possui estrutura para o recebimento de contêiner?', 'Sim');
  await pickRadio(/ovação da carga na coleta/, 'Não');
  await pickRadio(/desova da carga na entrega/, 'Não');
  await page.getByLabel('Quantidade de CNTRS/mês').fill('4');
  await page.waitForTimeout(2200); // simulated upload finishes
  await page.getByLabel('Ao solicitar a cotação você concorda com os dados informados acima').check();
}

// 01 — Dados da Carga inicial
await page.goto(`${base}/cotacao`);
await shot('01');
// 02 — seletor aberto
await page.getByRole('button', { name: 'Selecionar carga' }).click();
await page.mouse.move(800, 900);
await shot('02');
// 03 — tooltip "Em breve"
await page.getByRole('radio', { name: 'OOG' }).hover();
await page.waitForTimeout(400);
await shot('03');
// 04 — Carga IMO selecionada
await page.getByRole('radio', { name: 'Carga IMO' }).click();
await page.mouse.move(800, 900);
await shot('04');
// 05 — formulário vazio
await page.getByRole('button', { name: 'Avançar cotação' }).last().click();
await page.waitForURL('**/cotacao/imo');
await page.mouse.move(800, 5);
await shot('05');
await page.mouse.move(1500, 40);
await shot('05-full', { fullPage: true });
// 06 — preenchido (Porta a Porto + perguntas condicionais abertas)
await pickDropdown('Modalidade do transporte', 'Porta a Porto');
await pickRadio('Deseja utilizar o Ecofrete e compensar a emissão de CO2?', 'Sim');
await pickRadio('É necessário o envio de material de peação?', 'Sim');
await pickRadio('Embarcador possui estrutura para o recebimento de contêiner?', 'Não');
await pickRadio('Destinatário possui estrutura para o recebimento de contêiner?', 'Não');
await pickRadio(/ovação da carga na coleta/, 'Sim');
await pickRadio(/desova da carga na entrega/, 'Sim');
await page.evaluate(() => window.scrollTo(0, 0));
await shot('06');
await page.mouse.move(1500, 40);
await shot('06-full', { fullPage: true });

// 07 — envio com obrigatórios vazios
await goToForm();
await page.getByLabel('CNPJ do Pagador do Frete').fill('12345');
await page.getByLabel('Ao solicitar a cotação você concorda com os dados informados acima').check();
await page.getByRole('button', { name: 'Solicitar cotação' }).click();
await page.waitForTimeout(700);
await shot('07-viewport');
await page.evaluate(() => window.scrollTo(0, 0));
await shot('07');
await page.mouse.move(1500, 40);
await shot('07-full', { fullPage: true });
console.log('  focused:', await page.evaluate(() => document.activeElement?.id));

// 08 — upload FISPQ com lista (Done, Uploading, Error)
await goToForm();
const input = page.locator('input[type=file]');
await input.setInputFiles([pdf('FISPQ-solvente-industrial.pdf', 2.4)]);
await page.waitForTimeout(2200);
await input.setInputFiles([
  pdf('FISPQ-tinta-base-agua.pdf', 1.1),
  { name: 'foto-embalagem.heic', mimeType: 'image/heic', buffer: Buffer.alloc(3.8 * 1024 * 1024) },
]);
await page.waitForTimeout(250);
await page.evaluate(() => {
  document.getElementById('fispq-label').scrollIntoView({ block: 'start' });
  window.scrollBy(0, -140);
});
await shot('08');

// 09 — trecho adicional
await goToForm();
await pickDropdown('Modalidade do transporte', 'Porta a Porto');
await pickRadio('Deseja utilizar o Ecofrete e compensar a emissão de CO2?', 'Sim');
await page.getByRole('button', { name: '+ Adicionar trecho' }).click();
await page.getByRole('group', { name: 'Trecho 1' }).scrollIntoViewIfNeeded();
await page.evaluate(() => window.scrollBy(0, -160));
await shot('09');

// 10 — enviando (Loading)
await goToForm();
await fillValid({ ecofrete: 'Sim' });
await page.getByRole('button', { name: 'Solicitar cotação' }).click();
await page.waitForTimeout(150);
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.screenshot({ path: join(outDir, '10.png') });
console.log('✓ 10');
// 11 — sucesso com selo
await page.waitForTimeout(1700);
await page.evaluate(() => window.scrollTo(0, 0));
await shot('11');
console.log('  focused:', await page.evaluate(() => document.activeElement?.textContent));

// 12 — sucesso sem selo
await page.getByRole('button', { name: 'Nova cotação' }).click();
await page.waitForURL('**/cotacao');
await goToForm();
await fillValid({ ecofrete: 'Não' });
await page.getByRole('button', { name: 'Solicitar cotação' }).click();
await page.waitForTimeout(1900);
await page.evaluate(() => window.scrollTo(0, 0));
await shot('12');

await browser.close();
