// app/(tabs)/na4.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function CommunityScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/community/lists', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.data) {
        setPosts(res.data.data);
      } else {
        console.warn('⚠️ 응답 형식 이상:', res.data);
      }
    } catch (error) {
      console.error('❌ 게시글 불러오기 실패:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View style={styles.container}>
      {/* 🔙 뒤로가기 */}
      <TouchableOpacity onPress={() => router.push('/main')}>
        <Text style={styles.backBtn}>← 뒤로가기</Text>
      </TouchableOpacity>

      {/* 🔘 타이틀 */}
      <Text style={styles.header}>📚 독서 커뮤니티</Text>

      {/* 🔍 검색창 */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="도서 명 검색창"
          placeholderTextColor="#888"
        />
        <TouchableOpacity>
          <Text style={styles.closeBtn}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* 📄 게시물 리스트 */}
      <ScrollView style={styles.postList}>
        {loading ? (
          <ActivityIndicator size="large" color="#333" />
        ) : posts.length === 0 ? (
          <Text style={{ textAlign: 'center', color: '#999' }}>게시물이 없습니다.</Text>
        ) : (
          posts.map((item) => (
            <TouchableOpacity
              key={item.postId}
              onPress={() => router.push(`/post/${item.postId}`)}
            >
              <View style={styles.postBox}>
                <Text style={styles.postTitle}>{item.title}</Text>
                <Text style={styles.postMeta}>작성자: {item.author}</Text>
                <Text style={styles.postMeta}>
                  작성일시: {new Date(item.date).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* ➕ 게시물 추가 버튼 */}
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => router.push('/addpost')}
      >
        <Text style={styles.addBtnText}>게시물 추가 버튼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: '#f8f7fa',
    flex: 1,
  },
  backBtn: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 10,
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#eee',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 15,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  closeBtn: {
    fontSize: 18,
    color: '#999',
    paddingLeft: 8,
  },
  postList: {
    flex: 1,
  },
  postBox: {
    backgroundColor: '#333',
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
  },
  postTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 6,
  },
  postMeta: {
    color: '#ccc',
    fontSize: 12,
  },
  addBtn: {
    marginTop: 10,
    marginBottom: 20, // 여유 공간 확보
    backgroundColor: '#333',
    paddingVertical: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
