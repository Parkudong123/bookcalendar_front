import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated'; // Reanimated 필수

import { useColorScheme } from '@/hooks/useColorScheme';

// SplashScreen 자동 숨김 방지
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'), // 예시 폰트, 원하는 경우 변경 가능
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="main" />           {/* 메인 (달력 등) */}
        <Stack.Screen name="(tabs)" />         {/* 하단 탭 라우팅 */}
        <Stack.Screen name="login" />          {/* 로그인 */}
        <Stack.Screen name="signup" />         {/* 회원가입 */}
        <Stack.Screen name="book" />           {/* 도서 정보 조회 */}
        <Stack.Screen name="bookregister" />   {/* 도서 등록 */}
        <Stack.Screen name="reviewquestion" /> {/* 질문 응답 페이지 */}
        <Stack.Screen name="+not-found" />     {/* 404 */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
