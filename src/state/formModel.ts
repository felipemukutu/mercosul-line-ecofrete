import { isValidCnpj } from './masks';
import { MESSAGES } from './messages';

export type YesNo = '' | 'sim' | 'nao';
export type CollectedIn = '' | 'carreta' | 'slider';
export type RouteField = 'cidadeColeta' | 'portoOrigem' | 'portoDestino' | 'cidadeEntrega';

export interface RouteSegment {
  id: string;
  cidadeColeta: string;
  portoOrigem: string;
  portoDestino: string;
  cidadeEntrega: string;
}

export interface FormValues {
  cnpj: string;
  modalidade: string;
  tipoMercadoria: string;
  temperatura: string;
  variacao: string;
  valorMercadoria: string;
  pesoMercadoria: string;
  tamanhoConteiner: string;
  tipoConteiner: string;
  ctnrPadraoAlimento: string;
  routes: RouteSegment[];
  ecofrete: YesNo;
  tipoEmbalagem: string;
  peacao: YesNo;
  peacaoTipo: string;
  peacaoMedidas: string;
  embarcadorEstrutura: YesNo;
  embarcadorColetadoEm: CollectedIn;
  destinatarioEstrutura: YesNo;
  destinatarioColetadoEm: CollectedIn;
  coletaAjudantes: YesNo;
  coletaNumAjudantes: string;
  coletaValorNumerario: string;
  entregaAjudantes: YesNo;
  entregaNumAjudantes: string;
  entregaValorNumerario: string;
  cntrsMes: string;
  observacoes: string;
  aceite: boolean;
}

export type ScalarField = Exclude<keyof FormValues, 'routes' | 'aceite'>;

export type UploadStatus = 'uploading' | 'done' | 'error';
export interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export const MAX_ROUTES = 5;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

let routeSeq = 0;
export const newRoute = (): RouteSegment => ({
  id: `trecho-${++routeSeq}`,
  cidadeColeta: '',
  portoOrigem: '',
  portoDestino: '',
  cidadeEntrega: '',
});

export const initialValues = (): FormValues => ({
  cnpj: '',
  modalidade: '',
  tipoMercadoria: '',
  temperatura: '',
  variacao: '',
  valorMercadoria: '',
  pesoMercadoria: '',
  tamanhoConteiner: '',
  tipoConteiner: '',
  ctnrPadraoAlimento: '',
  routes: [newRoute()],
  ecofrete: '',
  tipoEmbalagem: '',
  peacao: '',
  peacaoTipo: '',
  peacaoMedidas: '',
  embarcadorEstrutura: '',
  embarcadorColetadoEm: '',
  destinatarioEstrutura: '',
  destinatarioColetadoEm: '',
  coletaAjudantes: '',
  coletaNumAjudantes: '',
  coletaValorNumerario: '',
  entregaAjudantes: '',
  entregaNumAjudantes: '',
  entregaValorNumerario: '',
  cntrsMes: '',
  observacoes: '',
  aceite: false,
});

/* ------------------------------------------------------------------ */
/* Modalidade → route fields (SPEC §7.2)                               */
/* ------------------------------------------------------------------ */

/** 1st term = origin (Porta → Cidade de coleta; Porto → Porto de origem),
 *  2nd term = destination (Porto → Porto de destino; Porta → Cidade de entrega). */
export function routeFieldsFor(modalidade: string): RouteField[] {
  if (!modalidade) return [];
  const [origin, destination] = modalidade.split('-');
  return [
    origin === 'porta' ? 'cidadeColeta' : 'portoOrigem',
    destination === 'porta' ? 'cidadeEntrega' : 'portoDestino',
  ];
}

export const ALL_ROUTE_FIELDS: RouteField[] = ['cidadeColeta', 'portoOrigem', 'portoDestino', 'cidadeEntrega'];

/* ------------------------------------------------------------------ */
/* Conditional fields (SPEC §7.1)                                      */
/* ------------------------------------------------------------------ */

/** Which answer of a Yes/No question reveals which dependent fields. */
export const CONDITIONALS: Partial<Record<ScalarField, { when: string; fields: ScalarField[] }>> = {
  peacao: { when: 'sim', fields: ['peacaoTipo', 'peacaoMedidas'] },
  embarcadorEstrutura: { when: 'nao', fields: ['embarcadorColetadoEm'] },
  destinatarioEstrutura: { when: 'nao', fields: ['destinatarioColetadoEm'] },
  coletaAjudantes: { when: 'sim', fields: ['coletaNumAjudantes', 'coletaValorNumerario'] },
  entregaAjudantes: { when: 'sim', fields: ['entregaNumAjudantes', 'entregaValorNumerario'] },
};

export const isRevealed = (values: FormValues, parent: ScalarField) => {
  const rule = CONDITIONALS[parent];
  return !!rule && values[parent] === rule.when;
};

/* ------------------------------------------------------------------ */
/* Validation (SPEC §7.4 / §8)                                         */
/* ------------------------------------------------------------------ */

export const routeKey = (routeId: string, field: RouteField) => `route.${routeId}.${field}`;

/** DOM id used for scroll/focus on the first error. */
export const fieldDomId = (key: string) => `field-${key.replace(/\./g, '-')}`;

type Rule = { key: string; kind: 'text' | 'choice' | 'radio' | 'upload' | 'cnpj' };

/** Required fields currently visible, in DOM order. Hidden fields are never required. */
export function requiredFields(values: FormValues): Rule[] {
  const rules: Rule[] = [
    { key: 'cnpj', kind: 'cnpj' },
    { key: 'modalidade', kind: 'choice' },
    { key: 'tipoMercadoria', kind: 'choice' },
    { key: 'fispq', kind: 'upload' },
    { key: 'valorMercadoria', kind: 'text' },
    { key: 'pesoMercadoria', kind: 'text' },
    { key: 'tamanhoConteiner', kind: 'choice' },
    { key: 'tipoConteiner', kind: 'choice' },
  ];
  const routeFields = routeFieldsFor(values.modalidade);
  for (const route of values.routes) {
    for (const field of routeFields) rules.push({ key: routeKey(route.id, field), kind: 'choice' });
  }
  rules.push({ key: 'ecofrete', kind: 'radio' }, { key: 'tipoEmbalagem', kind: 'choice' });
  rules.push({ key: 'peacao', kind: 'radio' });
  if (isRevealed(values, 'peacao')) rules.push({ key: 'peacaoTipo', kind: 'text' }, { key: 'peacaoMedidas', kind: 'text' });
  rules.push({ key: 'embarcadorEstrutura', kind: 'radio' });
  if (isRevealed(values, 'embarcadorEstrutura')) rules.push({ key: 'embarcadorColetadoEm', kind: 'radio' });
  rules.push({ key: 'destinatarioEstrutura', kind: 'radio' });
  if (isRevealed(values, 'destinatarioEstrutura')) rules.push({ key: 'destinatarioColetadoEm', kind: 'radio' });
  rules.push({ key: 'coletaAjudantes', kind: 'radio' });
  if (isRevealed(values, 'coletaAjudantes'))
    rules.push({ key: 'coletaNumAjudantes', kind: 'text' }, { key: 'coletaValorNumerario', kind: 'text' });
  rules.push({ key: 'entregaAjudantes', kind: 'radio' });
  if (isRevealed(values, 'entregaAjudantes'))
    rules.push({ key: 'entregaNumAjudantes', kind: 'text' }, { key: 'entregaValorNumerario', kind: 'text' });
  rules.push({ key: 'cntrsMes', kind: 'text' });
  return rules;
}

function readValue(values: FormValues, key: string): string {
  if (key.startsWith('route.')) {
    const [, id, field] = key.split('.');
    const route = values.routes.find((r) => r.id === id);
    return route ? route[field as RouteField] : '';
  }
  return String(values[key as ScalarField] ?? '');
}

/** Returns an ordered map key → message for every invalid visible field. */
export function validate(values: FormValues, files: UploadFile[]): Map<string, string> {
  const errors = new Map<string, string>();
  for (const rule of requiredFields(values)) {
    if (rule.kind === 'upload') {
      if (!files.some((f) => f.status === 'done')) errors.set(rule.key, MESSAGES.required);
      continue;
    }
    const value = readValue(values, rule.key).trim();
    if (!value) {
      errors.set(rule.key, rule.kind === 'radio' ? MESSAGES.selectOption : MESSAGES.required);
    } else if (rule.kind === 'cnpj' && !isValidCnpj(value)) {
      errors.set(rule.key, MESSAGES.invalidCnpj);
    }
  }
  return errors;
}
