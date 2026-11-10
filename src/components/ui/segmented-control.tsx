import { StyleSheet, View, Pressable, Text } from 'react-native';
import { control } from '@/components/ui/theme';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: Props<T>) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={[styles.segment, selected && styles.segmentSelected]}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...control,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#E2E8F0',
  },
  segmentSelected: {
    backgroundColor: '#EFFDF1',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  labelSelected: {
    color: '#16A34A',
  },
});
