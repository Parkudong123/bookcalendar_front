import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function ReviewDetailScreen() {
  const { date } = useLocalSearchParams();
  const router = useRouter();

  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      try {
        const res = await axios.get(`http://ceprj.gachon.ac.kr:60001/api/api/v1/review/date?date=${date}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReview(res.data.data);
      } catch (err) {
        console.error('❌ 리뷰 조회 실패:', err);
      } finally {
        setLoading(false);
      }
    };
    if (date) fetchReview();
  }, [date]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#6b4eff" />;
  }

  if (!review) {
    return (
      <View style={styles.container}>
        <Text style={styles.noData}>해당 날짜에 작성된 독후감이 없습니다.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← 돌아가기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{date} 독후감</Text>
      <Text style={styles.label}>독후감 내용 :</Text>
<View style={styles.box}>
  <Text style={styles.content}>{review.contents}</Text>
</View>

      {[1, 2, 3].map(i => (
        <View key={i} style={styles.qaBox}>
          <Text style={styles.question}>Q{i}. {review[`question${i}`]}</Text>
          <Text style={styles.answer}>A{i}. {review[`answer${i}`]}</Text>
        </View>
      ))}

      <Text style={styles.aiTitle}>🤖 AI의 응답</Text>
      <Text style={styles.aiResponse}>{review.aiResponse}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#f8f7fa', flexGrow: 1 },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 12,marginTop:20 },
  box: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 20,
    marginTop: 10
  },
  content: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  
  qaBox: { marginBottom: 20 },
  question: { fontWeight: 'bold', color: '#444' },
  answer: { marginTop: 4, color: '#333' },
  aiTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 24, marginBottom: 6 },
  aiResponse: { fontSize: 14, color: '#333' },
  noData: { textAlign: 'center', marginTop: 40, color: '#777' },
  backBtn: { marginTop: 40 },
  backText: { color: '#666' },
});
