// app/cart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/cart', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartItems(res.data.data);
      } catch (err) {
        console.error('❌ 장바구니 조회 실패:', err);
      }
    };

    fetchCart();
  }, []);

  const handleDelete = async (cartId: number) => {
    Alert.alert('삭제 확인', '해당 도서를 장바구니에서 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.delete(`http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/cart/${cartId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            setCartItems((prev) => prev.filter((item) => item.cartId !== cartId));
            Alert.alert('삭제 완료', '도서가 장바구니에서 삭제되었습니다.');
          } catch (err) {
            console.error('❌ 삭제 실패:', err);
            Alert.alert('오류', '삭제 중 문제가 발생했습니다.');
          }
        },
      },
    ]);
  };

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/na5')}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>🛒 내 장바구니 목록</Text>

      {cartItems.map((item) => (
        <View key={item.cartId} style={styles.card}>
          <View>
            <Text style={styles.cardText}>책 제목 : {item.bookName}</Text>
            <Text style={styles.cardText}>저자 : {item.author}</Text>
            <Text style={styles.dateText}>추가한 날짜 : {formatDate(item.date)}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.cartId)}>
            <Text style={styles.deleteIcon}>🗑</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/cartadd')}>
        <Text style={styles.addButtonText}>도서 추가</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    paddingHorizontal: 20,
    backgroundColor: '#f9f9f9',
    paddingBottom: 100,
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 14,
    color: '#6b4eff',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  cardText: {
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    color: '#bbb',
    fontSize: 11,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#fff',
    padding: 4,
  },
  addButton: {
    backgroundColor: '#e2d9f9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    color: '#333',
    fontWeight: '600',
  },
});
