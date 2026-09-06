import type { ReactNode } from 'react';
import { StyleSheet, View, Text, Pressable, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Icon } from '@/components/icon';

type Props = {
  title?: string;
  showBack?: boolean;
  headerRight?: ReactNode;
  children: ReactNode;
  contentStyle?: ViewStyle;
};

export default function Screen({
  title,
  showBack = true,
  children,
  contentStyle,
  headerRight
}: Props) {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {(title || showBack) && (
        <View style={styles.header}>
          {showBack && router.canGoBack() && (
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Icon name="arrow-left" size={20} color="#0F172A" />
            </Pressable>
          )}
          {title && <Text style={styles.title}>{title}</Text>}
          {headerRight && <View style={styles.headerRight}>{headerRight}</View>}
        </View>
      )}

      <View style={[styles.body, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    flex: 1,          // add this so headerRight is pushed to the edge
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRight: {
    marginLeft: 'auto',
  },
  body: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
});
