// app/cartadd.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function CartAddPage() {
  const router = useRouter();

  const [bookName, setBookName] = useState('');
  const [author, setAuthor] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async () => {
    if (!bookName || !author || !url) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/cart',
        { bookName, author, url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('도서 등록 완료', '장바구니에 도서가 추가되었습니다.');
      router.push('/cart');
    } catch (err) {
      console.error('❌ 도서 등록 실패:', err);
      Alert.alert('등록 실패', '도서 추가 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/cart')}>
        <Text style={styles.backText}>← 장바구니 목록</Text>
      </TouchableOpacity>

      <Text style={styles.header}>도서 등록 페이지</Text>

      <Text style={styles.label}>책 제목</Text>
      <TextInput
        style={styles.input}
        placeholder="입력"
        value={bookName}
        onChangeText={setBookName}
      />

      <Text style={styles.label}>작가</Text>
      <TextInput
        style={styles.input}
        placeholder="입력"
        value={author}
        onChangeText={setAuthor}
      />

      <Text style={styles.label}>URL</Text>
      <TextInput
        style={styles.input}
        placeholder="도서 링크 입력"
        value={url}
        onChangeText={setUrl}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>도서 추가</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 100,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    paddingBottom: 100,
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 14,
    color: '#6b4eff',
  },
  header: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 8,
    color: '#444',
  },
  label: {
    marginBottom: 6,
    fontSize: 14,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#e2d9f9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#333',
    fontWeight: '600',
  },
});
