// app/scrap.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ScrapPage() {
  const [scraps, setScraps] = useState([]);
  const router = useRouter();

  useEffect(() => {
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
    fetchScraps();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>스크랩 페이지</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="도서 명 검색창"
          editable={false} // 일단 비활성화
        />
        <TouchableOpacity style={styles.searchBtn}>
          <Text style={styles.searchBtnText}>검색</Text>
        </TouchableOpacity>
      </View>

      {scraps.map((item) => (
        <View key={item.scrapId} style={styles.itemBox}>
          <View style={styles.itemContent}>
            <Text style={styles.bookText}>Title : {item.title}</Text>
            <Text style={styles.dateText}>Written by : {item.author}</Text>
            <Text style={styles.dateText}>
              Date : {new Date(item.dateTime).toISOString().slice(0, 10).replace(/-/g, '.')}
            </Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.deleteBtn}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={{ alignSelf: 'center', fontSize: 20, marginTop: 20 }}>⋯</Text>
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
    fontSize: 24,
    fontWeight: 'bold',
    backgroundColor: '#ddd',
    padding: 6,
    borderRadius: 6,
    alignSelf: 'center',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
  },
  searchBtn: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  searchBtnText: {
    color: '#333',
    fontWeight: 'bold',
  },
  itemBox: {
    flexDirection: 'row',
    backgroundColor: '#333',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    alignItems: 'center',
  },
  itemContent: {
    flex: 1,
  },
  bookText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    color: '#ccc',
    fontSize: 13,
  },
  deleteBtn: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
  },
});
