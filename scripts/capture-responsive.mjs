/** Tablet / mobile checks (SPEC §11). Usage: node scripts/capture-responsive.mjs [outDir] [baseUrl] */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

const outDir = process.argv[2] ?? 'screenshots';
const base = process.argv[3] ?? 'http://localhost:5173';
mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch();

for (const [name, width, height] of [['tablet', 1024, 900], ['mobile', 390, 844]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  const overflow = async (label) => {
    const w = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${name} ${label}: horizontal overflow = ${w}px`);
  };
  await page.goto(`${base}/cotacao`);
  await page.getByRole('button', { name: 'Selecionar carga' }).click();
  await page.getByRole('radio', { name: 'Carga IMO' }).click();
  await page.screenshot({ path: join(outDir, `${name}-01.png`), fullPage: true });
  await overflow('step 1');
  await page.getByRole('button', { name: 'Expandir painel do contratante' }).click();
  await page.waitForTimeout(300);
  await page.screenshot({ path: join(outDir, `${name}-panel.png`) });
  await page.getByRole('button', { name: 'Recolher painel do contratante' }).click();
  if (name === 'mobile') {
    await page.getByRole('button', { name: 'Abrir menu' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: join(outDir, `${name}-menu.png`) });
    await page.keyboard.press('Escape');
  }
  await page.getByRole('button', { name: 'Avançar cotação' }).last().click();
  await page.waitForURL('**/cotacao/imo');
  await page.getByLabel('Ao solicitar a cotação você concorda com os dados informados acima').check();
  await page.getByRole('button', { name: 'Solicitar cotação' }).click();
  await page.waitForTimeout(600);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: join(outDir, `${name}-form.png`), fullPage: true });
  await overflow('step 2');
  await page.close();
}
await browser.close();
