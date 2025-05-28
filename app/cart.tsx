import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native'; // Import Linking
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
        // Assuming res.data structure is { "data": [...] }
        if (res.data && res.data.data) {
          setCartItems(res.data.data);
        } else {
          console.warn('❌ 장바구니 데이터 형식 이상:', res.data);
          setCartItems([]); // Set empty array if data is not in expected format
        }
      } catch (err) {
        console.error('❌ 장바구니 조회 실패:', err);
        // Optionally show an alert to the user
        Alert.alert('오류', '장바구니 정보를 불러오는데 실패했습니다.');
      }
    };

    fetchCart();
  }, []); // Empty dependency array ensures this runs only once on mount

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
            // Update state to remove the deleted item
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

  // New function to handle item click and open the link
  const handleItemPress = async (item) => {
    if (item.link) {
      try {
        const supported = await Linking.canOpenURL(item.link);

        if (supported) {
          await Linking.openURL(item.link);
        } else {
          Alert.alert('오류', `이 링크를 열 수 없습니다: ${item.link}`);
        }
      } catch (err) {
        console.error('❌ 링크 열기 실패:', err);
        Alert.alert('오류', '링크를 여는 중 문제가 발생했습니다.');
      }
    } else {
      Alert.alert('정보', '이 항목에는 연결된 링크가 없습니다.');
    }
  };


  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    // Use options for better date formatting if needed, but this matches your original format
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.push('/na5')}>
        <Text style={styles.backText}>← 뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.header}>🛒 내 장바구니 목록</Text>

      {cartItems.length === 0 ? (
          <Text style={styles.noDataText}>장바구니가 비어있습니다.</Text>
      ) : (
        cartItems.map((item) => (
          // Wrap the item content in TouchableOpacity for click handling
          <TouchableOpacity
            key={item.cartId}
            style={styles.card} // Apply the card style here
            onPress={() => handleItemPress(item)} // Call the new handler on press
          >
            {/* Inner View to hold text content, takes available space */}
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.cardText}>책 제목 : {item.bookName}</Text>
              <Text style={styles.cardText}>저자 : {item.author}</Text>
              <Text style={styles.dateText}>추가한 날짜 : {formatDate(item.date)}</Text>
            </View>
            {/* Delete button remains a separate TouchableOpacity inside */}
            <TouchableOpacity onPress={() => handleDelete(item.cartId)}>
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          </TouchableOpacity>
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
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#f4f4f4',
    paddingBottom: 100,
    flexGrow: 1, // Ensure ScrollView can grow
  },
   backBtn: {
    marginBottom: 18,
    alignSelf: 'flex-start',
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
    flexDirection: 'row', // Arrange children in a row
    justifyContent: 'space-between', // Space out items
    alignItems: 'center', // Vertically center items
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
    padding: 4, // Add padding to make it easier to tap
    marginLeft: 10, // Space between text and icon
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