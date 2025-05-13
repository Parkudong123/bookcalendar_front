// app/scrap.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ScrapPage() {
  const [scraps, setScraps] = useState([]);
  const router = useRouter();

  const fetchScraps = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/scraps', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScraps(res.data.data);
    } catch (err) {
      console.error('❌ 스크랩 불러오기 실패:', err);
    }
  };

  useEffect(() => {
    fetchScraps();
  }, []);

  const handleScrapPress = async (scrapId: number) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get(`http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/scrap/${scrapId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const postId = res.data.data.postId;
      router.push(`/post/${postId}`);
    } catch (error) {
      console.error('❌ 스크랩 상세조회 실패:', error);
    }
  };

  const handleDeleteScrap = async (scrapId: number) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      await axios.delete(`http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/scrap/${scrapId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setScraps(scraps.filter((s) => s.scrapId !== scrapId));
      Alert.alert('삭제 완료', '스크랩이 삭제되었습니다.');
    } catch (error) {
      console.error('❌ 스크랩 삭제 실패:', error);
      Alert.alert('삭제 실패', '스크랩 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>⭐ 스크랩 페이지</Text>

      {scraps.map((item) => (
        <View key={item.scrapId} style={styles.itemBox}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => handleScrapPress(item.scrapId)}>
            <View style={styles.itemContent}>
              <Text style={styles.bookText}>책 제목 : {item.title}</Text>
              <Text style={styles.dateText}>작성자 : {item.author}</Text>
              <Text style={styles.dateText}>
                작성 날짜 : {new Date(item.dateTime).toISOString().slice(0, 10).replace(/-/g, '.')}
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDeleteScrap(item.scrapId)}>
            <Text style={styles.deleteBtn}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#f4f4f4',
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
    marginBottom: 16,
  },
  header: {
    textAlign: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 20,
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  itemContent: {
    flex: 1,
  },
  bookText: {
    color: '#333',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#666',
    fontSize: 13,
  },
  deleteBtn: {
    color: '#666',
    fontSize: 20,
    marginLeft: 10,
  },
});
