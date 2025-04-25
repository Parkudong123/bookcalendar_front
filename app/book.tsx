import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function BookScreen() {
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook(res.data.data);
    } catch (err) {
      console.error('❌ 도서 정보 불러오기 실패:', err);
      Alert.alert('에러', '도서 정보를 불러오는 데 실패했습니다.');
      router.replace('/bookregister');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookInfo();
  }, []);

  const handleGiveUp = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      await axios.patch(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/book',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('알림', '독서를 포기했습니다.');
      router.replace('/bookregister');
    } catch (error) {
      console.error('❌ 독서 포기 실패:', error);
      Alert.alert('실패', '독서 포기에 실패했습니다.');
    }
  };

  const handleComplete = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/book/complete',
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('📘 독서 완료:', res.data);
      router.push({
        pathname: '/bookrecommend2',
        params: { data: JSON.stringify(res.data.data) },
      });
    } catch (error) {
      console.error('❌ 독서 완료 처리 실패:', error.response?.data || error);
      Alert.alert('오류', '도서 완료 처리 중 문제가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b4eff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.backButton}>
        <Text style={styles.backButtonText}>← 뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.header}>📚 등록된 도서 정보</Text>

      {book && (
        <View style={styles.infoBox}>
          <Text style={styles.label}>제목: <Text style={styles.value}>{book.bookName}</Text></Text>
          <Text style={styles.label}>저자: <Text style={styles.value}>{book.author}</Text></Text>
          <Text style={styles.label}>장르: <Text style={styles.value}>{book.genre}</Text></Text>
          <Text style={styles.label}>총 페이지 수: <Text style={styles.value}>{book.totalPage}</Text></Text>
          <Text style={styles.label}>시작일: <Text style={styles.value}>{book.startDate}</Text></Text>
          <Text style={styles.label}>종료일: <Text style={styles.value}>{book.finishDate}</Text></Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.giveUpButton} onPress={handleGiveUp}>
          <Text style={styles.buttonText}>독서 포기</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.completeButton} onPress={handleComplete}>
          <Text style={styles.buttonText}>독서 완료</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f7fa',
    flex: 1,
    paddingTop: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 80,
  },
  label: {
    fontWeight: 'bold',
    lineHeight: 40,
    fontSize: 20,
    marginBottom: 5,
    color: '#444',
  },
  value: {
    fontWeight: 'normal',
    color: '#222',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  giveUpButton: {
    flex: 1,
    backgroundColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  completeButton: {
    flex: 1,
    backgroundColor: '#6b4eff',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
