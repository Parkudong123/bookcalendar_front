import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 0,          // 탭바 높이 없애기
          display: 'none',    // 탭바 자체 숨기기
        },
      }}
    >
      {/* 홈 - 도서 등록 또는 조회 */}
      <Tabs.Screen
        name="na1"
        options={{
          title: '홈',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/image/icon_bookregister.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#6b4eff' : '#aaa',
              }}
            />
          ),
        }}
      />

      {/* 독후감 기록 */}
      <Tabs.Screen
        name="na2"
        options={{
          title: '기록',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/image/icon_bookreport.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#6b4eff' : '#aaa',
              }}
            />
          ),
        }}
      />

      {/* AI 챗봇 */}
      <Tabs.Screen
        name="na3"
        options={{
          title: 'AI챗',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/image/icon_aichat.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#6b4eff' : '#aaa',
              }}
            />
          ),
        }}
      />

      {/* 커뮤니티 */}
      <Tabs.Screen
        name="na4"
        options={{
          title: '커뮤니티',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/image/icon_community.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#6b4eff' : '#aaa',
              }}
            />
          ),
        }}
      />

      {/* 마이페이지 */}
      <Tabs.Screen
        name="na5"
        options={{
          title: '마이페이지',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('@/image/icon_mypage.png')}
              style={{
                width: 24,
                height: 24,
                tintColor: focused ? '#6b4eff' : '#aaa',
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}
