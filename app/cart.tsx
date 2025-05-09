// app/cart.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [search, setSearch] = useState('');

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

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/na5')}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>내 장바구니 목록</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="도서 명 검색창"
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity style={styles.searchButton}>
          <Text style={{ color: '#333' }}>검색</Text>
        </TouchableOpacity>
      </View>

      {cartItems.map((item) => (
        <View key={item.cartId} style={styles.card}>
          <View>
            <Text style={styles.cardText}>Book Name : {item.bookName}</Text>
            <Text style={styles.cardText}>Author : {item.author}</Text>
            <Text style={styles.dateText}>Added : {formatDate(item.date)}</Text>
          </View>
          <TouchableOpacity>
            <Image source={require('../image/logo.png')} style={styles.icon} />
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.pageDots}>• • •</Text>

      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>ADD Book</Text>
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
    top: 40,
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
    backgroundColor: '#ddd',
    paddingVertical: 6,
    borderRadius: 6,
  },
  searchBox: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  searchButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  icon: {
    width: 20,
    height: 20,
    tintColor: '#fff',
  },
  pageDots: {
    textAlign: 'center',
    fontSize: 20,
    marginTop: 20,
    color: '#888',
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
