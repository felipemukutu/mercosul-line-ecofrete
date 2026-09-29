import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react';
import {
  ALL_ROUTE_FIELDS,
  CONDITIONALS,
  MAX_ROUTES,
  MAX_UPLOAD_BYTES,
  initialValues,
  newRoute,
  routeFieldsFor,
  routeKey,
  validate,
  type FormValues,
  type RouteField,
  type ScalarField,
  type UploadFile,
} from './formModel';
import { MESSAGES } from './messages';
import type { CargoTypeValue } from './mockData';

/* ------------------------------------------------------------------ */
/* State (in memory only — SPEC §4)                                    */
/* ------------------------------------------------------------------ */

export interface QuotationState {
  cargoType: CargoTypeValue | null;
  /** Cargo Type Selector accordion (Collapsed ↔ Open). */
  selectorOpen: boolean;
  values: FormValues;
  files: UploadFile[];
  /** Ids of files rejected in the last dropped/selected batch → Dropzone State=Error. */
  lastBatchRejected: string[];
  touched: Record<string, boolean>;
  submitAttempted: boolean;
}

const initialState = (): QuotationState => ({
  cargoType: null,
  selectorOpen: false,
  values: initialValues(),
  files: [],
  lastBatchRejected: [],
  touched: {},
  submitAttempted: false,
});

type Action =
  | { type: 'selectCargo'; cargoType: CargoTypeValue | null }
  | { type: 'setSelectorOpen'; open: boolean }
  | { type: 'setValue'; field: ScalarField | 'aceite'; value: string | boolean }
  | { type: 'setRouteValue'; routeId: string; field: RouteField; value: string }
  | { type: 'addRoute' }
  | { type: 'removeRoute'; routeId: string }
  | { type: 'touch'; key: string }
  | { type: 'addFiles'; files: UploadFile[] }
  | { type: 'progress'; id: string; progress: number }
  | { type: 'removeFile'; id: string }
  | { type: 'submitAttempt' }
  | { type: 'reset' };

function untouch(touched: Record<string, boolean>, keys: string[]) {
  const next = { ...touched };
  for (const k of keys) delete next[k];
  return next;
}

function reducer(state: QuotationState, action: Action): QuotationState {
  switch (action.type) {
    case 'selectCargo':
      return { ...state, cargoType: action.cargoType };

    case 'setSelectorOpen':
      return { ...state, selectorOpen: action.open };

    case 'setValue': {
      const values = { ...state.values, [action.field]: action.value } as FormValues;
      let touched = state.touched;

      // Hidden conditional fields are cleared (SPEC §7.1).
      const rule = action.field !== 'aceite' ? CONDITIONALS[action.field] : undefined;
      if (rule && action.value !== rule.when) {
        for (const f of rule.fields) (values[f] as string) = '';
        touched = untouch(touched, rule.fields);
      }

      // Changing Modalidade clears route fields that no longer apply (SPEC §7.2).
      if (action.field === 'modalidade') {
        const keep = routeFieldsFor(String(action.value));
        values.routes = values.routes.map((r) => {
          const next = { ...r };
          for (const f of ALL_ROUTE_FIELDS) if (!keep.includes(f)) next[f] = '';
          return next;
        });
        touched = untouch(
          touched,
          values.routes.flatMap((r) => ALL_ROUTE_FIELDS.map((f) => routeKey(r.id, f))),
        );
      }
      return { ...state, values, touched };
    }

    case 'setRouteValue':
      return {
        ...state,
        values: {
          ...state.values,
          routes: state.values.routes.map((r) => (r.id === action.routeId ? { ...r, [action.field]: action.value } : r)),
        },
      };

    case 'addRoute':
      if (state.values.routes.length >= MAX_ROUTES) return state;
      return { ...state, values: { ...state.values, routes: [...state.values.routes, newRoute()] } };

    case 'removeRoute': {
      // Trecho 1 cannot be removed.
      if (state.values.routes[0]?.id === action.routeId) return state;
      return {
        ...state,
        values: { ...state.values, routes: state.values.routes.filter((r) => r.id !== action.routeId) },
        touched: untouch(state.touched, ALL_ROUTE_FIELDS.map((f) => routeKey(action.routeId, f))),
      };
    }

    case 'touch':
      return state.touched[action.key] ? state : { ...state, touched: { ...state.touched, [action.key]: true } };

    case 'addFiles':
      return {
        ...state,
        files: [...state.files, ...action.files],
        lastBatchRejected: action.files.filter((f) => f.status === 'error').map((f) => f.id),
        touched: { ...state.touched, fispq: true },
      };

    case 'progress':
      return {
        ...state,
        files: state.files.map((f) =>
          f.id === action.id && f.status === 'uploading'
            ? { ...f, progress: action.progress, status: action.progress >= 100 ? 'done' : 'uploading' }
            : f,
        ),
      };

    case 'removeFile':
      return {
        ...state,
        files: state.files.filter((f) => f.id !== action.id),
        lastBatchRejected: state.lastBatchRejected.filter((id) => id !== action.id),
      };

    case 'submitAttempt':
      return { ...state, submitAttempted: true };

    case 'reset':
      return initialState();
  }
}

/* ------------------------------------------------------------------ */
/* Upload helpers (SPEC §7.3)                                          */
/* ------------------------------------------------------------------ */

const ACCEPTED_EXT = ['pdf', 'jpg', 'jpeg', 'png'];
const ACCEPTED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
let fileSeq = 0;

function toUploadFile(file: File): UploadFile {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  const formatOk = ACCEPTED_EXT.includes(ext) && (!file.type || ACCEPTED_MIME.includes(file.type));
  const base = { id: `file-${++fileSeq}`, name: file.name, size: file.size, progress: 0 };
  if (!formatOk) return { ...base, status: 'error', error: MESSAGES.uploadFormat };
  if (file.size > MAX_UPLOAD_BYTES) return { ...base, status: 'error', error: MESSAGES.uploadSize };
  return { ...base, status: 'uploading' };
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface QuotationContextValue {
  state: QuotationState;
  errors: Map<string, string>;
  /** Error shown in the UI: only after blur (touched) or a submit attempt. */
  visibleError: (key: string) => string | undefined;
  selectCargo: (cargoType: CargoTypeValue | null) => void;
  setSelectorOpen: (open: boolean) => void;
  setValue: (field: ScalarField | 'aceite', value: string | boolean) => void;
  setRouteValue: (routeId: string, field: RouteField, value: string) => void;
  addRoute: () => void;
  removeRoute: (routeId: string) => void;
  touch: (key: string) => void;
  addFiles: (files: File[]) => void;
  removeFile: (id: string) => void;
  submitAttempt: () => void;
  reset: () => void;
}

const Ctx = createContext<QuotationContextValue | null>(null);

export function QuotationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const timers = useRef(new Map<string, number>());

  // Simulated upload: ~1–2 s from 0 to 100 % per valid file.
  const startUpload = useCallback((id: string) => {
    const duration = 1000 + Math.random() * 1000;
    const started = performance.now();
    const handle = window.setInterval(() => {
      const progress = Math.min(100, Math.round(((performance.now() - started) / duration) * 100));
      dispatch({ type: 'progress', id, progress });
      if (progress >= 100) {
        window.clearInterval(handle);
        timers.current.delete(id);
      }
    }, 80);
    timers.current.set(id, handle);
  }, []);

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((h) => window.clearInterval(h));
  }, []);

  const errors = useMemo(() => validate(state.values, state.files), [state.values, state.files]);

  const value = useMemo<QuotationContextValue>(
    () => ({
      state,
      errors,
      visibleError: (key) => (state.touched[key] || state.submitAttempted ? errors.get(key) : undefined),
      selectCargo: (cargoType) => dispatch({ type: 'selectCargo', cargoType }),
      setSelectorOpen: (open) => dispatch({ type: 'setSelectorOpen', open }),
      setValue: (field, v) => dispatch({ type: 'setValue', field, value: v }),
      setRouteValue: (routeId, field, v) => dispatch({ type: 'setRouteValue', routeId, field, value: v }),
      addRoute: () => dispatch({ type: 'addRoute' }),
      removeRoute: (routeId) => dispatch({ type: 'removeRoute', routeId }),
      touch: (key) => dispatch({ type: 'touch', key }),
      addFiles: (files) => {
        const batch = files.map(toUploadFile);
        dispatch({ type: 'addFiles', files: batch });
        batch.filter((f) => f.status === 'uploading').forEach((f) => startUpload(f.id));
      },
      removeFile: (id) => {
        const h = timers.current.get(id);
        if (h) window.clearInterval(h);
        timers.current.delete(id);
        dispatch({ type: 'removeFile', id });
      },
      submitAttempt: () => dispatch({ type: 'submitAttempt' }),
      reset: () => {
        timers.current.forEach((h) => window.clearInterval(h));
        timers.current.clear();
        dispatch({ type: 'reset' });
      },
    }),
    [state, errors, startUpload],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useQuotation() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useQuotation must be used inside <QuotationProvider>');
  return ctx;
}
