import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function BookReviewScreen() {
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [currentPage, setCurrentPage] = useState('');
  const [review, setReview] = useState('');

  useEffect(() => {
    const fetchBook = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      try {
        const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setBook(res.data.data);
      } catch (err) {
        console.error('❌ 도서 정보 불러오기 실패:', err);
      }
    };
    fetchBook();
  }, []);

  const handleSubmit = async () => {
    if (!currentPage || !review) {
      Alert.alert('입력 오류', '페이지 수와 독후감을 모두 입력해주세요.');
      return;
    }

    const token = await SecureStore.getItemAsync('accessToken');
    console.log('🧪 na2.tsx 토큰:', token);
    try {
      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/review/write',
        {
          pages: parseInt(currentPage),
          contents: review,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('✅ 독후감 등록 성공:', res.data);

      router.push({
        pathname: '/reviewquestion',
        params: {
          q1: res.data.data.question1,
          q2: res.data.data.question2,
          q3: res.data.data.question3,
          questionId: res.data.data.questionId,
          totalPages: res.data.data.totalPages,
          currentPages: res.data.data.currentPages,
          progress: res.data.data.progress,
          finishDate: res.data.data.finishDate,
          remainDate: res.data.data.remainDate,
          averageMessage: res.data.data.averageMessage,
          aiMessage: res.data.data.aiMessage,
        },
      });
    } catch (error) {
      console.error('❌ 독후감 등록 실패:', error);
      Alert.alert('실패', '독후감 등록에 오류가 발생하였습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.header}>📚 Daily 독후감 기록</Text>

      {book && (
        <View style={styles.bookInfo}>
          <Text style={styles.label}>현재 읽고 있는 책</Text>
          <Text style={styles.bookText}>제목: {book.bookName}</Text>
          <Text style={styles.bookText}>저자: {book.author}</Text>
        </View>
      )}

      <Text style={styles.label}>오늘 읽은 페이지</Text>
      <TextInput
        placeholder="예 : 30 "
        style={styles.input}
        keyboardType="numeric"
        value={currentPage}
        onChangeText={setCurrentPage}
      />

      <Text style={styles.label}>독후감</Text>
      <TextInput
        placeholder="자유롭게 입력하세요"
        multiline
        numberOfLines={6}
        style={styles.textarea}
        value={review}
        onChangeText={setReview}
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>독후감 제출</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f7fa',
    flexGrow: 1,
    paddingTop: 80,
  },
  backButton: {
    marginBottom: 30,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    color: '#666',
    fontSize: 14,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 11,
    height: 250,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#6b4eff',
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  bookInfo: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 24,
  },
  bookText: {
    fontSize: 15,
    marginTop: 4,
  },
});
