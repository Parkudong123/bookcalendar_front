import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AddPost() {
  const [title, setTitle] = useState('');
  const [contents, setContents] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!title.trim() || !contents.trim()) {
      Alert.alert('입력 오류', '제목과 본문을 모두 작성해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts',
        {
          title: title.trim(),
          contents: contents.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('게시물 등록 완료');
      router.push('/na4');
    } catch (error) {
      console.error('❌ 게시물 등록 실패:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || '게시물 등록 중 오류가 발생했습니다.';
      Alert.alert('등록 실패', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <TouchableOpacity onPress={() => router.push('/na4')} style={styles.backBtn}>
          <Text style={styles.backText}>← 뒤로가기</Text>
        </TouchableOpacity>

        <Text style={styles.header}>📝 게시물 작성</Text>

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
          textAlignVertical="top"
        />

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>등록</Text>
          )}
        </TouchableOpacity>

      </KeyboardAvoidingView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>등록 중...</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f7fa',
  },
  keyboardAvoidingView: {
    flex: 1,
    // padding: 20, // 이 라인을 제거합니다.
    paddingHorizontal: 20, // 좌우 패딩은 유지합니다.
    paddingTop: 80, // 상단 패딩을 80으로 설정하여 안전 영역 아래로 내립니다. (필요 시 조정)
    justifyContent: 'flex-start',
  },
  backBtn: {
    marginBottom: 20,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 22,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  bodyInput: {
    height: 180,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#BD9EFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
   buttonDisabled: {
     backgroundColor: '#a0a0a0',
     opacity: 0.7,
   },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingOverlayText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});