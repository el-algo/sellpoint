export type Operator = '+' | '-' | '×' | '÷';

export type CalculatorAction =
  | { type: 'digit'; digit: string }
  | { type: 'dot' }
  | { type: 'operator'; operator: Operator }
  | { type: 'equals' }
  | { type: 'percent' }
  | { type: 'backspace' }
  | { type: 'clear' };

export type CalculatorState = {
  display: string;
  stored: number | null;
  operator: Operator | null;
  // True right after an operator/result, so the next digit starts a new number.
  overwrite: boolean;
};

const MAX_DIGITS = 12;
const ERROR = 'Error';

export const initialCalculatorState: CalculatorState = {
  display: '0',
  stored: null,
  operator: null,
  overwrite: false,
};

function format(value: number): string {
  if (!Number.isFinite(value)) {
    return ERROR;
  }
  // toPrecision trims float noise such as 0.1 + 0.2 = 0.30000000000000004.
  return String(Number(value.toPrecision(MAX_DIGITS)));
}

function compute(a: number, b: number, operator: Operator): number {
  switch (operator) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '×':
      return a * b;
    case '÷':
      return a / b;
  }
}

export function calculatorReducer(
  state: CalculatorState,
  action: CalculatorAction
): CalculatorState {
  const isError = state.display === ERROR;

  switch (action.type) {
    case 'clear':
      return initialCalculatorState;

    case 'digit': {
      if (state.overwrite || isError || state.display === '0') {
        return { ...state, display: action.digit, overwrite: false };
      }
      if (state.display.replace(/[-.]/g, '').length >= MAX_DIGITS) {
        return state;
      }
      return { ...state, display: state.display + action.digit };
    }

    case 'dot': {
      if (state.overwrite || isError) {
        return { ...state, display: '0.', overwrite: false };
      }
      if (state.display.includes('.')) {
        return state;
      }
      return { ...state, display: `${state.display}.` };
    }

    case 'backspace': {
      if (state.overwrite || isError) {
        return state;
      }
      const next = state.display.slice(0, -1);
      return { ...state, display: next === '' || next === '-' ? '0' : next };
    }

    case 'percent': {
      if (isError) {
        return state;
      }
      return { ...state, display: format(Number(state.display) / 100), overwrite: true };
    }

    case 'operator': {
      if (isError) {
        return state;
      }
      // Chained operations (e.g. 2 + 3 ×) resolve the pending one first.
      if (state.stored !== null && state.operator && !state.overwrite) {
        const result = format(compute(state.stored, Number(state.display), state.operator));
        if (result === ERROR) {
          return { ...initialCalculatorState, display: ERROR, overwrite: true };
        }
        return { display: result, stored: Number(result), operator: action.operator, overwrite: true };
      }
      return {
        ...state,
        stored: Number(state.display),
        operator: action.operator,
        overwrite: true,
      };
    }

    case 'equals': {
      if (state.stored === null || !state.operator || isError) {
        return state;
      }
      const result = format(compute(state.stored, Number(state.display), state.operator));
      return { display: result, stored: null, operator: null, overwrite: true };
    }
  }
}
