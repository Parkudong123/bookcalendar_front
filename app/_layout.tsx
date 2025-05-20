// app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
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
        <Stack.Screen name="main" />
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="book" />
        <Stack.Screen name="bookregister" />
        <Stack.Screen name="reviewquestion" />
        <Stack.Screen name="na1" />
        <Stack.Screen name="na2" />
        <Stack.Screen name="na3" />
        <Stack.Screen name="na4" />
        <Stack.Screen name="na5" />
        <Stack.Screen name="post/[postId]" />
        <Stack.Screen name="reportlist" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="cartadd" />
        <Stack.Screen name="scrap" />
        <Stack.Screen name="challenge" />
        <Stack.Screen name="bookrecommend" />
        <Stack.Screen name="bookrecommend2" />
        <Stack.Screen name="dailyreport" />
        <Stack.Screen name="reviewdetail/[reviewId]" />
        <Stack.Screen name="reviewsummary" />
        <Stack.Screen name="addpost" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
