import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Icon } from '@/components/ui/icon';

type Props = {
  message: string;
  onUndo: () => void;
};

export default function UndoToast({ message, onUndo }: Props) {
  return (
    <View style={styles.toast}>
      <Icon name="check" size={16} color="#41CF56" />
      <Text style={styles.message}>{message}</Text>
      <Pressable onPress={onUndo} hitSlop={8}>
        <Text style={styles.undo}>Deshacer</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  message: {
    flex: 1,
    fontSize: 15,
    color: '#fff',
  },
  undo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#41CF56',
  },
});
