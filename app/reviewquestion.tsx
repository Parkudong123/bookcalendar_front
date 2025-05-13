import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!a1 || !a2 || !a3) {
      Alert.alert('입력 오류', '모든 질문에 답변해주세요!');
      return;
    }

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📖 감상 질문에 답변해보세요</Text>

        <Text style={styles.question}>Q1. {q1}</Text>
        <TextInput
          style={styles.input}
          multiline
          value={a1}
          onChangeText={setA1}
          placeholder="답변을 입력하세요"
          textAlignVertical="top"
        />

        <Text style={styles.question}>Q2. {q2}</Text>
        <TextInput
          style={styles.input}
          multiline
          value={a2}
          onChangeText={setA2}
          placeholder="답변을 입력하세요"
          textAlignVertical="top"
        />

        <Text style={styles.question}>Q3. {q3}</Text>
        <TextInput
          style={styles.input}
          multiline
          value={a3}
          onChangeText={setA3}
          placeholder="답변을 입력하세요"
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
             <Text style={styles.buttonText}>제출</Text>
           )}
        </TouchableOpacity>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingOverlayText}>제출 중...</Text>
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
  container: {
    paddingHorizontal: 24,
    paddingTop: 80,
    paddingBottom: 50,
    flexGrow: 1,
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
    marginBottom: 50,
    alignItems: 'center',
    justifyContent: 'center',
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