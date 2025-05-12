import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ReviewQuestionScreen() {
  const router = useRouter();
  const {
    q1,
    q2,
    q3,
    questionId,
  } = useLocalSearchParams();

  const [a1, setA1] = useState('');
  const [a2, setA2] = useState('');
  const [a3, setA3] = useState('');

  const handleSubmit = async () => {
    if (!a1 || !a2 || !a3) {
      Alert.alert('입력 오류', '모든 질문에 답변해주세요!');
      return;
    }

    try {
      const token = await SecureStore.getItemAsync('accessToken');

      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/question/write',
        {
          questionId: Number(questionId),
          answer1: a1,
          answer2: a2,
          answer3: a3,
          feedback1: 0,
          feedback2: 0,
          feedback3: 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      

      // 응답 받은 독서 요약 데이터 reviewsummary로 전달
      const summary = res.data.data;

      router.replace({
        pathname: '/reviewsummary',
        params: {
          totalPages: summary.totalPages,
          currentPages: summary.currentPages,
          progress: summary.progress,
          finishDate: summary.finishDate,
          remainDate: summary.remainDate,
          averageMessage: summary.averageMessage,
          aiMessage: summary.aiMessage,
        },
      });
    } catch (error) {
      console.error('❌ 질문 응답 전송 실패:', error);
      Alert.alert('제출 실패', '서버와 통신 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📖 감상 질문에 답변해보세요</Text>

      {/* Q1. 접두사 추가 */}
      <Text style={styles.question}>Q1. {q1}</Text>
      <TextInput
        style={styles.input}
        multiline
        value={a1}
        onChangeText={setA1}
        placeholder="답변을 입력하세요"
      />

      {/* Q2. 접두사 추가 */}
      <Text style={styles.question}>Q2. {q2}</Text>
      <TextInput
        style={styles.input}
        multiline
        value={a2}
        onChangeText={setA2}
        placeholder="답변을 입력하세요"
      />

      {/* Q3. 접두사 추가 */}
      <Text style={styles.question}>Q3. {q3}</Text>
      <TextInput
        style={styles.input}
        multiline
        value={a3}
        onChangeText={setA3}
        placeholder="답변을 입력하세요"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>제출</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f7fa',
    flexGrow: 1,
    marginTop: 50,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  question: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff',
    marginBottom: 20,
    textAlignVertical: 'top',
    height: 120, 
  },
  button: {
    backgroundColor: '#6b4eff',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom :50 ,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});