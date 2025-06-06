import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function MyPageScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [rank, setRank] = useState(null);

  const fetchUserInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) { // 토큰이 있을 때만 요청하도록 조건 유지 (안정성)
        const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/info/simple', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setNickname(res.data.data.nickName);
        setRank(res.data.data.rank);
      }
    } catch (error) {
      console.error('❌ 사용자 정보 불러오기 실패:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      const checkTokenAndFetch = async () => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          router.replace('/login'); // 뒤로가기로도 접근 방지
        } else {
          fetchUserInfo();
        }
      };

      checkTokenAndFetch();
    }, [])
  );

  const handleLogout = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (token) {
        // 서버 로그아웃 API 호출
        await axios.post('http://ceprj.gachon.ac.kr:60001/api/api/v1/member/logout', {}, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('✅ 서버 로그아웃 성공');
      }
    } catch (error) {
      console.error('❌ 서버 로그아웃 실패:', error);
      // 서버 로그아웃 실패 시에도 클라이언트 측 토큰은 삭제하는 것이 좋습니다.
      // 필요하다면 사용자에게 오류 메시지를 보여줄 수 있습니다.
    } finally {
      // 항상 클라이언트 측 토큰을 삭제합니다.
      await SecureStore.deleteItemAsync('accessToken');
      router.replace('/login'); // 로그인 페이지로 리다이렉트
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.backBtn}>
        <Text style={styles.backBtn}>← 뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.header}>마이 페이지</Text>

      <View style={styles.profileBox}>
        <Image source={require('../image/people2.png')} style={styles.avatar} />
        <View>
          <Text style={styles.nickname}>{nickname || '닉네임 불러오는 중...'}</Text>
          <Text style={styles.rank}>Rank: 상위 {rank !== null ? rank : '?'}% User</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.push('/userinfo')}>
        <Text style={styles.buttonText}>내 정보 조회</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/reportlist')}>
        <Text style={styles.buttonText}>내 독후감 일괄 조회</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/scrap')}>
        <Text style={styles.buttonText}>스크랩 페이지</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/cart')}>
        <Text style={styles.buttonText}>내 장바구니 목록</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => router.push('/challenge')}>
        <Text style={styles.buttonText}>독서 챌린지 페이지</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 200,
    backgroundColor: '#f4f4f4',
  },
  backBtn: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  profileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 30,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16,
  },
  nickname: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  rank: {
    fontSize: 13,
    color: '#888',
  },
  button: {
    backgroundColor: '#dcdcdc',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  logoutBtn: {
    alignSelf: 'flex-end',
    marginTop: 20,
    backgroundColor: '#3c0000',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});