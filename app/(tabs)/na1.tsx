import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function RedirectToBookPage() {
  const router = useRouter();

  useEffect(() => {
    const checkBookInfo = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const bookData = res.data.data;
        console.log('📚 도서 조회 응답:', bookData);

        if (bookData && bookData.bookName) {
          router.replace('/book'); // ✅ 도서 정보 있으면 book.tsx로 이동
        } else {
          router.replace('/bookregister'); // ✅ 없으면 도서 등록 페이지로 이동
        }
      } catch (e) {
        console.error('❌ 도서 정보 조회 실패:', e);
        router.replace('/bookregister'); // 에러 발생 시 fallback
      }
    };

    checkBookInfo();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#6b4eff" />
    </View>
  );
}
