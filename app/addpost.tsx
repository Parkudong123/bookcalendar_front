// app/addpost.tsx

import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AddPost() {
  const [title, setTitle] = useState('');
  const [contents, setContents] = useState('');
  const router = useRouter();

  const handleSubmit = async () => {
    if (!title.trim() || !contents.trim()) {
      Alert.alert('입력 오류', '제목과 본문을 모두 작성해주세요.');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts',
        {
          title,
          contents,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('게시물 등록 완료');
      router.push('/(tabs)/na4'); // 게시물 리스트로 이동
    } catch (error) {
      console.error('❌ 게시물 등록 실패:', error.response?.data || error);
      Alert.alert('등록 실패', '서버와 통신 중 오류가 발생했습니다.');
    }
  };

  return (
    <View style={styles.container}>
      {/* 🔙 뒤로가기 */}
      <TouchableOpacity onPress={() => router.push('/(tabs)/na4')}>
        <Text style={styles.backBtn}>← 뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.header}>게시물 작성</Text>

      <TextInput
        style={styles.input}
        placeholder="제목을 입력하세요"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.bodyInput]}
        placeholder="본문을 입력하세요"
        value={contents}
        onChangeText={setContents}
        multiline
        numberOfLines={8}
      />
      <Button title="등록" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 30,
  },
  backBtn: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },
  header: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 30,
  },
  bodyInput: {
    height: 200,
    textAlignVertical: 'top',
  },
});
