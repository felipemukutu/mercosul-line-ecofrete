import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { FormDropdown } from '../components/FormDropdown/FormDropdown';
import { FormInput } from '../components/FormInput/FormInput';
import { FormRadioGroup } from '../components/FormRadioGroup/FormRadioGroup';
import { FormTextArea } from '../components/FormTextArea/FormTextArea';
import {
  AddRouteButton,
  CargoSummary,
  EcofreteRow,
  FieldRow,
  FormCard,
  QuestionStack,
  Reveal,
} from '../components/layout/Layout';
import { ModalQuotationSuccess } from '../components/ModalQuotationSuccess/ModalQuotationSuccess';
import { RouteRow, type RouteRowField } from '../components/RouteRow/RouteRow';
import { TermsCheckbox } from '../components/TermsCheckbox/TermsCheckbox';
import { UploadDropzone } from '../components/UploadDropzone/UploadDropzone';
import { UploadFileItem } from '../components/UploadFileItem/UploadFileItem';
import { MAX_ROUTES, fieldDomId, isRevealed, routeFieldsFor, routeKey, type ScalarField } from '../state/formModel';
import { formatBytes } from '../state/format';
import { maskCnpj, maskCurrency, maskInteger, maskTemperature, maskVariation, maskWeight } from '../state/masks';
import {
  CITY_OPTIONS,
  COLLECTED_IN_OPTIONS,
  CONTAINER_SIZE_OPTIONS,
  CONTAINER_TYPE_OPTIONS,
  GOODS_TYPE_OPTIONS,
  MODALITY_OPTIONS,
  PACKAGING_OPTIONS,
  PORT_OPTIONS,
  YES_NO_OPTIONS,
} from '../state/mockData';
import { useQuotation } from '../state/QuotationContext';
import styles from './ImoFormPage.module.css';

const SUBMIT_DELAY = 1500;

const optionsForRoute = (field: RouteRowField) =>
  field === 'cidadeColeta' || field === 'cidadeEntrega' ? CITY_OPTIONS : PORT_OPTIONS;

/** Moves the viewport to a field and focuses it (first error on submit). */
function focusField(key: string) {
  const el = document.getElementById(fieldDomId(key));
  if (!el) return;
  const target = el.tagName === 'FIELDSET' ? el.querySelector<HTMLElement>('input') : el;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  target?.focus({ preventScroll: true });
}

/** Step 2 — /cotacao/imo (SPEC §7). */
export function ImoFormPage() {
  const navigate = useNavigate();
  const q = useQuotation();
  const { state, visibleError, setValue, touch, errors } = q;
  const { values, files } = state;
  const [submitting, setSubmitting] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [sealOnSuccess, setSealOnSuccess] = useState(false);
  const submitTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(submitTimer.current), []);

  // Direct access without the IMO type → back to step 1 (SPEC §4).
  if (state.cargoType !== 'imo') return <Navigate to="/cotacao" replace />;

  const id = (key: string) => fieldDomId(key);

  /** Props shared by every text input bound to a scalar field. */
  const text = (field: ScalarField, mask?: (v: string) => string) => ({
    id: id(field),
    value: values[field] as string,
    onChange: (v: string) => setValue(field, mask ? mask(v) : v),
    onBlur: () => touch(field),
    errorMessage: visibleError(field),
  });

  const choice = (field: ScalarField) => ({
    id: id(field),
    value: values[field] as string,
    onChange: (v: string) => {
      setValue(field, v);
      touch(field);
    },
    onBlur: () => touch(field),
    errorMessage: visibleError(field),
    required: true,
  });

  const radio = (field: ScalarField) => ({
    id: id(field),
    name: field,
    value: values[field] as string,
    onChange: (v: string) => {
      setValue(field, v);
      touch(field);
    },
    onBlur: () => touch(field),
    errorMessage: visibleError(field),
    required: true,
  });

  const routeFields = routeFieldsFor(values.modalidade);
  const fispqError = visibleError('fispq');
  const dropzoneError = state.lastBatchRejected.length > 0 || !!fispqError;

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!values.aceite || submitting) return;
    q.submitAttempt();
    const firstError = errors.keys().next().value as string | undefined;
    if (firstError) {
      focusField(firstError);
      return;
    }
    setSubmitting(true);
    submitTimer.current = window.setTimeout(() => {
      setSubmitting(false);
      setSealOnSuccess(values.ecofrete === 'sim');
      setSuccessOpen(true);
    }, SUBMIT_DELAY);
  };

  const changeCargo = () => {
    q.setSelectorOpen(true);
    navigate('/cotacao');
  };

  const newQuotation = () => {
    setSuccessOpen(false);
    q.reset();
    navigate('/cotacao');
  };

  return (
    <div className={styles.page}>
      <h1 className="visually-hidden">Cotação de Carga IMO</h1>
      <CargoSummary cargoLabel="Carga IMO" onChange={changeCargo} />

      <form className={styles.form} noValidate onSubmit={onSubmit} aria-label="Formulário Carga IMO">
        <div className={styles.cards}>
          <FormCard>
            <FormInput label="CNPJ do Pagador do Frete" inputMode="numeric" autoComplete="off" aria-required {...text('cnpj', maskCnpj)} />
          </FormCard>

          <FormCard>
            <FormDropdown label="Modalidade do transporte" options={MODALITY_OPTIONS} {...choice('modalidade')} />
          </FormCard>

          <FormCard>
            <FormDropdown label="Tipo de Mercadoria" options={GOODS_TYPE_OPTIONS} {...choice('tipoMercadoria')} />
            <FieldRow>
              <FormInput label="Temperatura" suffix="°C" {...text('temperatura', maskTemperature)} />
              <FormInput label="Variação" prefix="±" suffix="°C" inputMode="decimal" {...text('variacao', maskVariation)} />
            </FieldRow>
          </FormCard>

          <FormCard>
            <div className={styles.upload}>
              <p id="fispq-label" className={styles.uploadLabel}>
                Carga Perigosa – IMO (Enviar FISPQ)
              </p>
              <UploadDropzone
                id={id('fispq')}
                labelledBy="fispq-label"
                error={dropzoneError}
                describedBy={fispqError ? 'fispq-error' : undefined}
                onFiles={q.addFiles}
              />
              {files.length > 0 && (
                <ul className={styles.fileList} aria-label="Arquivos enviados" aria-live="polite">
                  {files.map((f) => (
                    <UploadFileItem
                      key={f.id}
                      fileName={f.name}
                      fileSize={formatBytes(f.size)}
                      state={f.status}
                      progress={f.progress}
                      errorMessage={f.error}
                      onRemove={() => q.removeFile(f.id)}
                    />
                  ))}
                </ul>
              )}
              {fispqError && (
                <p id="fispq-error" className={styles.error}>
                  {fispqError}
                </p>
              )}
            </div>
          </FormCard>

          <FormCard>
            <FieldRow columns={4}>
              <FormInput label="Valor da mercadoria / Contêiner" inputMode="numeric" aria-required {...text('valorMercadoria', maskCurrency)} />
              <FormInput label="Peso da mercadoria / Contêiner" inputMode="numeric" suffix="kg" aria-required {...text('pesoMercadoria', maskWeight)} />
              <FormDropdown label="Tamanho do contêiner" options={CONTAINER_SIZE_OPTIONS} {...choice('tamanhoConteiner')} />
              <FormDropdown label="Tipo de contêiner" options={CONTAINER_TYPE_OPTIONS} {...choice('tipoConteiner')} />
            </FieldRow>
          </FormCard>

          <FormCard>
            <FormInput label="CTNR padrão alimento" {...text('ctnrPadraoAlimento')} />
          </FormCard>

          <FormCard gap="md">
            {values.routes.map((route, i) => (
              <RouteRow
                key={route.id}
                type={i === 0 ? 'first' : 'additional'}
                title={`Trecho ${i + 1}`}
                visibleFields={routeFields}
                values={route}
                optionsFor={optionsForRoute}
                fieldId={(f) => id(routeKey(route.id, f))}
                errorFor={(f) => visibleError(routeKey(route.id, f))}
                onChange={(f, v) => {
                  q.setRouteValue(route.id, f, v);
                  touch(routeKey(route.id, f));
                }}
                onBlur={(f) => touch(routeKey(route.id, f))}
                onRemove={() => q.removeRoute(route.id)}
              />
            ))}
            {values.routes.length < MAX_ROUTES && <AddRouteButton onClick={q.addRoute} />}
            <EcofreteRow>
              <FormRadioGroup
                label="Deseja utilizar o Ecofrete e compensar a emissão de CO2?"
                description="Com essa opção você compensa as suas emissões de carbono na operação de transporte contribuindo para projetos ambientais"
                options={YES_NO_OPTIONS}
                {...radio('ecofrete')}
              />
            </EcofreteRow>
          </FormCard>

          <FormCard>
            <FormDropdown label="Tipo de embalagem da mercadoria" options={PACKAGING_OPTIONS} {...choice('tipoEmbalagem')} />
          </FormCard>

          <FormCard>
            <QuestionStack>
              <FormRadioGroup label="É necessário o envio de material de peação?" options={YES_NO_OPTIONS} {...radio('peacao')} />
              {isRevealed(values, 'peacao') && (
                <Reveal>
                  <FieldRow>
                    <FormInput label="Tipo" aria-required {...text('peacaoTipo')} />
                    <FormInput label="Medidas" placeholder="C x L x A (cm)" aria-required {...text('peacaoMedidas')} />
                  </FieldRow>
                </Reveal>
              )}
            </QuestionStack>
          </FormCard>

          <FormCard>
            <QuestionStack>
              <FormRadioGroup
                label="Embarcador possui estrutura para o recebimento de contêiner?"
                options={YES_NO_OPTIONS}
                {...radio('embarcadorEstrutura')}
              />
              {isRevealed(values, 'embarcadorEstrutura') && (
                <Reveal>
                  <FormRadioGroup label="Coletado em:" options={COLLECTED_IN_OPTIONS} {...radio('embarcadorColetadoEm')} />
                </Reveal>
              )}
            </QuestionStack>
          </FormCard>

          <FormCard>
            <QuestionStack>
              <FormRadioGroup
                label="Destinatário possui estrutura para o recebimento de contêiner?"
                options={YES_NO_OPTIONS}
                {...radio('destinatarioEstrutura')}
              />
              {isRevealed(values, 'destinatarioEstrutura') && (
                <Reveal>
                  <FormRadioGroup label="Coletado em:" options={COLLECTED_IN_OPTIONS} {...radio('destinatarioColetadoEm')} />
                </Reveal>
              )}
            </QuestionStack>
          </FormCard>

          <FormCard>
            <QuestionStack>
              <FormRadioGroup
                label="É necessário o envio de ajudantes ou valor de numerário para a ovação da carga na coleta?"
                options={YES_NO_OPTIONS}
                {...radio('coletaAjudantes')}
              />
              {isRevealed(values, 'coletaAjudantes') && (
                <Reveal>
                  <FieldRow>
                    <FormInput
                      label="Número de ajudantes"
                      inputMode="numeric"
                      aria-required
                      {...text('coletaNumAjudantes', (v) => maskInteger(v, 20, 2))}
                    />
                    <FormInput label="Valor do numerário" inputMode="numeric" aria-required {...text('coletaValorNumerario', maskCurrency)} />
                  </FieldRow>
                </Reveal>
              )}
            </QuestionStack>
          </FormCard>

          <FormCard>
            <QuestionStack>
              <FormRadioGroup
                label="É necessário o envio de ajudantes ou valor de numerário para a desova da carga na entrega:"
                options={YES_NO_OPTIONS}
                {...radio('entregaAjudantes')}
              />
              {isRevealed(values, 'entregaAjudantes') && (
                <Reveal>
                  <FieldRow>
                    <FormInput
                      label="Número de ajudantes"
                      inputMode="numeric"
                      aria-required
                      {...text('entregaNumAjudantes', (v) => maskInteger(v, 20, 2))}
                    />
                    <FormInput label="Valor do numerário" inputMode="numeric" aria-required {...text('entregaValorNumerario', maskCurrency)} />
                  </FieldRow>
                </Reveal>
              )}
            </QuestionStack>
          </FormCard>

          <FormCard>
            <FormInput label="Quantidade de CNTRS/mês" inputMode="numeric" aria-required {...text('cntrsMes', (v) => maskInteger(v))} />
          </FormCard>

          <FormCard>
            <FormTextArea
              id={id('observacoes')}
              label="Observações"
              value={values.observacoes}
              onChange={(v) => setValue('observacoes', v)}
            />
          </FormCard>
        </div>

        <TermsCheckbox
          id="aceite"
          checked={values.aceite}
          onCheckedChange={(c) => setValue('aceite', c)}
          loading={submitting}
        />
      </form>

      <ModalQuotationSuccess
        open={successOpen}
        showEcofreteSeal={sealOnSuccess}
        onNewQuotation={newQuotation}
        onClose={() => setSuccessOpen(false)}
      />
    </div>
  );
}
