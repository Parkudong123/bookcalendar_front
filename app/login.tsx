import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import jwtDecode from 'jwt-decode';

export default function LoginScreen() {
  const router = useRouter();
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!nickname || !password) {
      alert('닉네임과 비밀번호를 입력하세요');
      return;
    }

    try {
      const response = await axios.post('http://ceprj.gachon.ac.kr:60001/api/api/v1/member/login', {
        nickName: nickname,
        password: password,
      });

      const accessToken = response.data.data.accessToken;
      const refreshToken = response.data.data.refreshToken;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      console.log('🔐 토큰 저장 완료!', accessToken);

      console.log('✅ 로그인 성공!', response.data);
      router.replace('/main');
    } catch (error) {
      console.error('❌ 로그인 실패:', error);
      alert('로그인에 실패했습니다. 다시 확인해주세요.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../image/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.form}>
        <Text style={styles.label}>닉네임</Text>
        <TextInput
          placeholder="입력하세요"
          style={styles.input}
          value={nickname}
          onChangeText={setNickname}
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
        />

        <Text style={styles.label}>비밀번호</Text>
        <TextInput
          placeholder="입력하세요"
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCorrect={false}
          autoComplete="off"
          spellCheck={false}
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>

        <Text style={styles.signup}>
          계정이 없으신가요?{' '}
          <Text style={styles.signupLink} onPress={() => router.push('/signup')}>
            회원가입
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fa',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 300,
    height: 300,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 12,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: '#444',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signup: {
    marginTop: 14,
    textAlign: 'center',
    color: '#555',
  },
  signupLink: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
