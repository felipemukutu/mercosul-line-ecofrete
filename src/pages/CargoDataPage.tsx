import { useNavigate } from 'react-router-dom';
import { CargoTypeSelector } from '../components/CargoTypeSelector/CargoTypeSelector';
import { OtherCargoCard, PageHeading } from '../components/layout/Layout';
import { useQuotation } from '../state/QuotationContext';
import { CARGO_TYPES, type CargoTypeValue } from '../state/mockData';
import styles from './CargoDataPage.module.css';

/** Step 1 — /cotacao (SPEC §6). */
export function CargoDataPage() {
  const navigate = useNavigate();
  const { state, setSelectorOpen, selectCargo } = useQuotation();

  return (
    <div className={styles.page}>
      <PageHeading
        title="Dados da Carga"
        description="Antes de completar o formulário, precisamos de algumas informações iniciais para assegurar que poderá realizar o procedimento diretamente pelo nosso site. Selecione abaixo quais dos itens estão de acordo com sua carga."
      />
      <div className={styles.cards}>
        <OtherCargoCard off={state.selectorOpen} />
        <CargoTypeSelector
          title="Cargas IMO, OOG, SOC, Serviços Especiais, Reefer e Padrão Alimentício"
          description="Lorem ipsum dolor sit amet consectetur."
          options={CARGO_TYPES}
          open={state.selectorOpen}
          selected={state.cargoType}
          onOpenChange={setSelectorOpen}
          onSelect={(v) => selectCargo(v as CargoTypeValue)}
          onAdvance={() => navigate('/cotacao/imo')}
        />
      </div>
    </div>
  );
}
