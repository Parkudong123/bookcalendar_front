import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function BookRecommendScreen() {
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
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
        Alert.alert('오류', '도서 추천을 불러오지 못했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleAddToCart = async (book) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/cart',
        {
          bookName: book.bookName,
          author: book.author,
          url: book.url || '',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      Alert.alert('장바구니 추가 완료', `"${book.bookName}"이(가) 장바구니에 추가되었습니다.`);
    } catch (err) {
      console.error('🛒 장바구니 추가 실패:', err);
      Alert.alert('오류', '장바구니 추가 중 문제가 발생했습니다.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.backText}>← AI 챗봇으로 돌아가기</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8854d0" />
          <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.title}>📘 추천 도서 리스트</Text>

          {books.map((book, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.headerRow}>
                <View style={styles.circle}>
                  <Text style={styles.circleText}>{index + 1}</Text>
                </View>
                <View style={styles.textCol}>
                  <Text style={styles.bookTitle}>{book.bookName}</Text>
                  <Text style={styles.bookAuthor}>저자: {book.author}</Text>
                </View>
                <TouchableOpacity onPress={() => handleAddToCart(book)}>
                  <Text style={styles.cartIcon}>🛒</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.reason}>{book.reason}</Text>
            </View>
          ))}
        </>
      )}
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
    marginBottom: 8,
    backgroundColor: '#eee',
    padding: 8,
    borderRadius: 10,
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  circle: {
    backgroundColor: '#d8d1ff',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleText: {
    fontWeight: 'bold',
    color: '#444',
  },
  textCol: {
    marginLeft: 12,
    flex: 1,
  },
  bookTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2,
  },
  bookAuthor: {
    color: '#666',
    fontSize: 13,
  },
  reason: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
  cartIcon: {
    fontSize: 20,
    padding: 4,
  },
  loadingContainer: {
    marginTop: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
});
