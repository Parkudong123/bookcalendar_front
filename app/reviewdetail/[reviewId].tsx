import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ReviewDetailScreen() {
  const { reviewId } = useLocalSearchParams();
  const router = useRouter();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewDetail = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get(
          `http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/review/${reviewId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setReview(res.data.data);
      } catch (error) {
        console.error('❌ 리뷰 상세 정보 불러오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviewDetail();
  }, []);

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6b4eff" />;

  if (!review) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>리뷰를 불러오지 못했습니다.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← 목록으로</Text>
      </TouchableOpacity>

      <Text style={styles.title}>📘 독후감 상세보기</Text>

      <View style={styles.section}>
        <Text style={styles.label}>독후감 내용</Text>
        <Text style={styles.value}>{review.contents}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Q1. {review.question1}</Text>
        <Text style={styles.value}>{review.answer1}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Q2. {review.question2}</Text>
        <Text style={styles.value}>{review.answer2}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Q3. {review.question3}</Text>
        <Text style={styles.value}>{review.answer3}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>📊 AI 사서의 분석</Text>
        <Text style={styles.value}>{review.aiResponse}</Text>
      </View>
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
    fontWeight: 'bold',
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
    // 그림자 속성 추가
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, // 아래쪽으로 약간의 그림자
    shadowOpacity: 0.05, // 투명도를 높여 연하게
    shadowRadius: 4, // 그림자 블러 효과
    elevation: 2, // 안드로이드용 그림자 깊이
  },
  errorText: {
    marginTop: 100,
    textAlign: 'center',
    color: 'red',
  },
});