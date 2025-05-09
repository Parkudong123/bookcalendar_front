// app/na5.tsx
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
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/info/simple', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNickname(res.data.data.nickName);
      setRank(res.data.data.rank);
    } catch (error) {
      console.error('❌ 사용자 정보 불러오기 실패:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserInfo();
    }, [])
  );

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.backBtn}>
        <Text style={styles.backText}>← 메인으로</Text>
      </TouchableOpacity>

      <Text style={styles.header}>마이 페이지</Text>

      <View style={styles.profileBox}>
        <Image source={require('../..//image/logo.png')} style={styles.avatar} />
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
      <TouchableOpacity style={styles.button}onPress={() => router.push('/cart')}>
        <Text style={styles.buttonText}>내 장바구니 목록</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button}onPress={() => router.push('/challenge')}>
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
    paddingTop: 100,paddingBottom: 200,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
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
    backgroundColor: '#f2f2f2',
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
