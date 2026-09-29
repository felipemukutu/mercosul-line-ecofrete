/** SPEC §10 — all data here is mock. */

export const WHATSAPP_URL = 'https://wa.me/5500000000000';

export const MOCK_USER = { firstName: 'Fernando' };

export const MOCK_COMPANY = {
  name: 'Nome da Empresa LTDA.',
  headerName: 'Nome Empresa LTDA',
  taxId: '0123456789991',
  stateRegistration: '098765431',
  freightNote: 'O frete será pago pelo contratante',
  whatsappDisplay: '(00) 0000-0000',
};

export interface Option {
  value: string;
  label: string;
}

const toOptions = (labels: string[]): Option[] => labels.map((label) => ({ value: label, label }));

export const MODALITY_OPTIONS: Option[] = [
  { value: 'porta-porta', label: 'Porta a Porta' },
  { value: 'porta-porto', label: 'Porta a Porto' },
  { value: 'porto-porta', label: 'Porto a Porta' },
  { value: 'porto-porto', label: 'Porto a Porto' },
];

export const GOODS_TYPE_OPTIONS = toOptions([
  'Produtos químicos',
  'Tintas e solventes',
  'Combustíveis e derivados',
  'Gases comprimidos',
  'Baterias de lítio',
  'Fertilizantes',
  'Outros',
]);

export const CONTAINER_SIZE_OPTIONS = toOptions(["20' DC", "40' DC", "40' HC"]);

export const CONTAINER_TYPE_OPTIONS = toOptions(['Dry', 'Reefer', 'Open Top', 'Flat Rack', 'Tank']);

export const CITY_OPTIONS = toOptions([
  'São Paulo/SP',
  'Campinas/SP',
  'Curitiba/PR',
  'Joinville/SC',
  'Porto Alegre/RS',
  'Manaus/AM',
  'Recife/PE',
  'Salvador/BA',
  'Belo Horizonte/MG',
  'Rio de Janeiro/RJ',
]);

export const PORT_OPTIONS = toOptions([
  'Santos',
  'Paranaguá',
  'Itajaí',
  'Navegantes',
  'Rio Grande',
  'Manaus',
  'Suape',
  'Salvador',
  'Pecém',
  'Vila do Conde',
]);

export const PACKAGING_OPTIONS = toOptions(['Caixa', 'Tambor', 'Bombona', 'IBC', 'Pallet', 'Saco']);

export const YES_NO_OPTIONS: Option[] = [
  { value: 'sim', label: 'Sim' },
  { value: 'nao', label: 'Não' },
];

export const COLLECTED_IN_OPTIONS: Option[] = [
  { value: 'carreta', label: 'Carreta' },
  { value: 'slider', label: 'Slider' },
];

/** Cargo Type Selector — only "Carga IMO" is enabled (SPEC §6). */
export const CARGO_TYPES = [
  { value: 'imo', label: 'Carga IMO', enabled: true },
  { value: 'oog', label: 'OOG', enabled: false },
  { value: 'soc', label: 'SOC', enabled: false },
  { value: 'servicos-especiais', label: 'Serviços Especiais', enabled: false },
  { value: 'reefer', label: 'Reefer Porta', enabled: false },
  { value: 'conteiner-padrao', label: 'Contêiner Padrão Alimentício', enabled: false },
] as const;

export type CargoTypeValue = (typeof CARGO_TYPES)[number]['value'];
