import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function BookRecommend2() {
  const router = useRouter();
  const { data } = useLocalSearchParams();

  const [books, setBooks] = useState([]);

  useEffect(() => {
    if (data) {
      try {
        const parsed = JSON.parse(data as string);
        setBooks(parsed);
      } catch (err) {
        console.error('❌ 도서 추천 파싱 실패:', err);
      }
    }
  }, [data]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            <View style={styles.placeholder} />
          </View>
          <Text style={styles.reason}>{book.reason}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/main')}>
        <Text style={styles.backText}>홈으로</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#f8f7fa',
  },
  title: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
    padding: 6,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
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
  placeholder: {
    width: 30,
    height: 30,
  },
  backBtn: {
    marginTop: 20,
    backgroundColor: '#444',
    paddingVertical: 14,
    borderRadius: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
