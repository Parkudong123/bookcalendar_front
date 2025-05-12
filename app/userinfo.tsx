import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function UserDetailScreen() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState({
    nickName: '',
    phoneNumber: '',
    genre: '',
    job: '',
    birth: '',
  });

  const fetchUserDetail = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/info/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUserInfo(res.data.data);
    } catch (error) {
      console.error('❌ 유저 상세 정보 불러오기 실패:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserDetail();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Image source={require('..//image/logo.png')} style={styles.avatar} />

      <View style={styles.fieldBox}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>닉네임</Text>
          <TextInput value={userInfo.nickName} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>휴대전화</Text>
          <TextInput value={userInfo.phoneNumber} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>장르</Text>
          <TextInput value={userInfo.genre} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>직업</Text>
          <TextInput value={userInfo.job} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>생년월일</Text>
          <TextInput value={userInfo.birth} editable={false} style={styles.input} />
        </View>
      </View>

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => router.push('/userinfopatch')}
      >
        <Text style={styles.editText}>프로필 수정</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 60,
    backgroundColor: '#f4f4f4',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 24,
  },
  fieldBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  editBtn: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 24,
  },
  editText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
