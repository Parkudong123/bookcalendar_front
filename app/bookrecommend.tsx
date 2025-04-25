// app/bookrecommend.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function BookRecommendScreen() {
  const [books, setBooks] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/recommend', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setBooks(res.data.data);
      } catch (error) {
        console.error('📚 도서 추천 불러오기 실패:', error);
      }
    };

    fetchRecommendations();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← AI 챗봇으로 돌아가기</Text>
      </TouchableOpacity>

      {books.map((book, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.circle}>
              <Text style={styles.circleText}>{index + 1}</Text>
            </View>
            <View style={styles.titleBox}>
              <Text style={styles.bookTitle}>{book.bookName}</Text>
              <Text style={styles.author}>{book.author}</Text>
            </View>
            <View style={styles.iconBox}>
              <View style={styles.iconPlaceholder} />
              <View style={styles.iconPlaceholder} />
            </View>
          </View>
          <Text style={styles.reason}>{book.reason}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    backgroundColor: '#f8f7fa',
  },
  backText: {
    textAlign: 'center',
    color: '#555',
    fontWeight: '600',
    marginBottom: 20,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    color: '#555',
    fontWeight: 'bold',
  },
  titleBox: {
    flex: 1,
    marginLeft: 10,
  },
  bookTitle: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  author: {
    fontSize: 12,
    color: '#888',
  },
  reason: {
    fontSize: 13,
    color: '#333',
    marginTop: 8,
    lineHeight: 20,
  },
  iconBox: {
    flexDirection: 'row',
    gap: 4,
  },
  iconPlaceholder: {
    width: 20,
    height: 20,
    backgroundColor: '#ccc',
    borderRadius: 4,
    marginLeft: 6,
  },
});
