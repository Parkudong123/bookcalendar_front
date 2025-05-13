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

  const formatRemainDate = (days) => {
      const numDays = Number(days);
      if (isNaN(numDays)) return String(days);
      if (numDays < 0) return `D+${Math.abs(numDays)}`;
      if (numDays === 0) return `D-Day`;
      return `D-${numDays}`;
  };


  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← 목록으로</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📚 독서 요약 리포트</Text>

      <View style={styles.section}>
        <Text style={styles.label}>총 페이지 수</Text>
        <Text style={styles.value}>{totalPages} page</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>현재까지 읽은 페이지</Text>
        <Text style={styles.value}>{currentPages} page</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>진행률</Text>
        <Text style={styles.value}>{Math.round(Number(progress || 0))}%</Text>
      </View>

      {finishDate && (
        <View style={styles.section}>
          <Text style={styles.label}>마감 예정일</Text>
          <Text style={styles.value}>{finishDate}</Text>
        </View>
      )}

       {remainDate !== undefined && remainDate !== null && (
        <View style={styles.section}>
          <Text style={styles.label}>남은 날짜</Text>
          <Text style={styles.value}>{formatRemainDate(remainDate)}</Text>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>남은 기간 동안 평균 읽어야 할 분량</Text>
        <Text style={styles.value}>{averageMessage}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>📣 AI 사서의 격려 메시지</Text>
        <Text style={styles.value}>{aiMessage}</Text>
      </View>

      <TouchableOpacity style={styles.mainButton} onPress={() => router.replace('/main')}>
        <Text style={styles.mainButtonText}>메인으로 돌아가기</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 80,
    flexGrow: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 6,
    color: '#444',
  },
  value: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 10,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  mainButton: {
    backgroundColor: '#6b4eff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  mainButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    marginTop: 100,
    textAlign: 'center',
    color: 'red',
  },
});