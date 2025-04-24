import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 100); // 딜레이를 줘서 Navigation 준비 완료 후 리디렉션

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
