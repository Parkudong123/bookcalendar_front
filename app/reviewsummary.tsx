// app/reviewsummary.tsx

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function ReviewSummaryScreen() {
  const router = useRouter();
  const {
    totalPages,
    currentPages,
    progress,
    finishDate,
    remainDate,
    averageMessage,
    aiMessage,
  } = useLocalSearchParams();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>📚 독서 요약 리포트</Text>

      <View style={styles.card}>
        <Text style={styles.label}>총 페이지 수</Text>
        <Text style={styles.value}>{totalPages} page</Text>

        <Text style={styles.label}>현재까지 읽은 페이지</Text>
        <Text style={styles.value}>{currentPages} page</Text>

        <Text style={styles.label}>진행률</Text>
        <Text style={styles.value}>{Math.round(Number(progress))}%</Text>

        <Text style={styles.label}>📅 마감 예정일</Text>
        <Text style={styles.value}>{finishDate}</Text>

        <Text style={styles.label}>남은 날짜</Text>
        <Text style={styles.value}>D-{remainDate}</Text>

        <Text style={styles.label}>남은 기간 동안 평균 읽어야 할 분량</Text>
        <Text style={styles.value}>{averageMessage}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>📣 AI 사서의 격려 메시지</Text>
        <Text style={styles.value}>{aiMessage}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => router.replace('/main')}>
        <Text style={styles.buttonText}>메인으로 돌아가기</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f7fa',
    flexGrow: 1,
    marginTop:20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 15,
    marginBottom: 16,
    color: '#333',
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
});
