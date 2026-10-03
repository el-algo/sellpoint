import { useReducer } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Screen from '@/components/screen';
import CalculatorKey from '@/components/calculator-key';
import {
  calculatorReducer,
  initialCalculatorState,
  type Operator,
} from '@/lib/calculator';

export default function Calculator() {
  const [state, dispatch] = useReducer(calculatorReducer, initialCalculatorState);

  const digit = (value: string) => () => dispatch({ type: 'digit', digit: value });
  const operator = (value: Operator) => ({
    label: value,
    active: state.operator === value && state.overwrite,
    onPress: () => dispatch({ type: 'operator', operator: value }),
  });

  return (
    <Screen title="Calculadora" contentStyle={styles.body}>
      <View style={styles.display}>
        <Text style={styles.displayText} numberOfLines={1} adjustsFontSizeToFit>
          {state.display}
        </Text>
      </View>

      <View style={styles.keypad}>
        <View style={styles.row}>
          <CalculatorKey label="C" onPress={() => dispatch({ type: 'clear' })} />
          <CalculatorKey icon="delete-left" onPress={() => dispatch({ type: 'backspace' })} />
          <CalculatorKey label="%" onPress={() => dispatch({ type: 'percent' })} />
          <CalculatorKey {...operator('÷')} />
        </View>
        <View style={styles.row}>
          <CalculatorKey label="7" onPress={digit('7')} />
          <CalculatorKey label="8" onPress={digit('8')} />
          <CalculatorKey label="9" onPress={digit('9')} />
          <CalculatorKey {...operator('×')} />
        </View>
        <View style={styles.row}>
          <CalculatorKey label="4" onPress={digit('4')} />
          <CalculatorKey label="5" onPress={digit('5')} />
          <CalculatorKey label="6" onPress={digit('6')} />
          <CalculatorKey {...operator('-')} />
        </View>
        <View style={styles.row}>
          <CalculatorKey label="1" onPress={digit('1')} />
          <CalculatorKey label="2" onPress={digit('2')} />
          <CalculatorKey label="3" onPress={digit('3')} />
          <CalculatorKey {...operator('+')} />
        </View>
        <View style={styles.row}>
          <CalculatorKey label="0" onPress={digit('0')} />
          <CalculatorKey label="." onPress={() => dispatch({ type: 'dot' })} />
          <CalculatorKey label="=" onPress={() => dispatch({ type: 'equals' })} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    justifyContent: 'center',
    gap: 24,
  },
  display: {
    height: 58,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  displayText: {
    textAlign: 'right',
    fontSize: 32,
    color: '#0F172A',
  },
  keypad: {
    gap: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
});
