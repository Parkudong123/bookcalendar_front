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

  const handleDelete = async (cartId) => {
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
            const errorMessage = err.response?.data?.message || '삭제 중 문제가 발생했습니다.';
            Alert.alert('오류', errorMessage);
          }
        },
      },
    ]);
  };

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/na5')}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>🛒 내 장바구니 목록</Text>

      {cartItems.length === 0 ? (
         <Text style={styles.noDataText}>장바구니가 비어있습니다.</Text>
      ) : (
        cartItems.map((item) => (
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
        ))
      )}


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
    backgroundColor: '#f4f4f4',
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
    textAlign: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 20,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardText: {
    color: '#333',
    marginBottom: 4,
  },
  dateText: {
    color: '#666',
    fontSize: 11,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#444',
    padding: 4,
    marginLeft: 10,
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
   noDataText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
});