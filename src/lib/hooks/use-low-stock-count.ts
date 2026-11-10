import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { initDatabase, getLowStockCount } from '@/lib/db';

export function useLowStockCount(): number {
  const [count, setCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      initDatabase()
        .then(getLowStockCount)
        .then((result) => {
          if (active) setCount(result);
        });

      return () => {
        active = false;
      };
    }, [])
  );

  return count;
}
