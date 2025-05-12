// app/reportlist.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ReportListScreen() {
  const router = useRouter();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/reviews', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports(res.data.data);
      } catch (error) {
        console.error('❌ 독후감 리스트 조회 실패:', error);
      }
    };

    fetchReports();
  }, []);

  const handleDelete = async (reviewId: number) => {
    Alert.alert('삭제 확인', '해당 독후감을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.delete(`http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/review/${reviewId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setReports((prev) => prev.filter((r) => r.reviewId !== reviewId));
            Alert.alert('삭제 완료', '해당 독후감이 삭제되었습니다.');
          } catch (error) {
            console.error('❌ 독후감 삭제 실패:', error);
            Alert.alert('오류 발생', '삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>내 독후감 목록</Text>

      {reports.length === 0 ? (
        <Text style={styles.noDataText}>작성한 독후감이 없습니다.</Text>
      ) : (
        reports.map((item) => (
          <View key={item.reviewId} style={styles.itemBox}>
            <TouchableOpacity
              style={styles.itemTextBox}
              onPress={() => router.push(`/reviewdetail/${item.reviewId}`)}
            >
              <Text style={styles.bookName}>{item.bookName}</Text>
              <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => handleDelete(item.reviewId)}
            >
              <Text style={styles.deleteText}>🗑 삭제</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 500,
    backgroundColor: '#fff',
  },
  backBtn: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  itemTextBox: {
    flex: 1,
  },
  bookName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#777',
  },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
