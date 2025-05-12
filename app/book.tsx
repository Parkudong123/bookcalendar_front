import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function BookScreen() {
  const router = useRouter();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBookInfo = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBook(res.data.data);
    } catch (err: any) {
      console.error('❌ 도서 정보 불러오기 실패:', err.response?.data || err);
      Alert.alert('에러', '도서 정보를 불러오는 데 실패했습니다.');
      router.replace('/bookregister');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookInfo();
  }, []);

  const handleGiveUp = async () => {
     Alert.alert('독서 포기', '정말로 독서를 포기하시겠습니까? 등록된 도서 정보가 삭제됩니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '포기',
        style: 'destructive',
        onPress: async () => {
           try {
              const token = await SecureStore.getItemAsync('accessToken');
              await axios.patch(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/book',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              Alert.alert('알림', '독서를 포기했습니다.');
              router.replace('/bookregister');
            } catch (error: any) {
              console.error('❌ 독서 포기 실패:', error.response?.data || error);
               const errorMessage = error.response?.data?.message || '독서 포기에 실패했습니다.';
              Alert.alert('실패', errorMessage);
            }
        }
      }
    ]);
  };

  const handleComplete = async () => {
     Alert.alert('독서 완료', '독서를 완료하셨습니까? 완료 처리 후에는 수정할 수 없습니다.', [
      { text: '취소', style: 'cancel' },
      {
        text: '완료',
        onPress: async () => {
           try {
              const token = await SecureStore.getItemAsync('accessToken');
              const res = await axios.post(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/book/complete',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              

              router.push({
                pathname: '/bookrecommend2',
                params: { data: JSON.stringify(res.data.data) },
              });

           } catch (error: any) {
              console.error('❌ 독서 완료 처리 실패:', error.response?.data || error);
               const errorMessage = error.response?.data?.message || '도서 완료 처리 중 문제가 발생했습니다.';
              Alert.alert('오류', errorMessage);
            }
        }
      }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6b4eff" />
      </View>
    );
  }

   if (!book) {
       return (
           <View style={styles.loadingContainer}>
               <Text>도서 정보가 없습니다.</Text>
               <TouchableOpacity onPress={() => router.replace('/bookregister')} style={{marginTop: 20, padding: 10, backgroundColor: '#6b4eff', borderRadius: 5}}>
                   <Text style={{color: '#fff'}}>도서 등록하러 가기</Text>
               </TouchableOpacity>
           </View>
       );
   }


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.backBtn}>
        <Text style={styles.backText}>← 뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.header}>📚 현재 읽는 도서</Text>

      <View style={styles.fieldBox}>
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>제목</Text>
          <TextInput value={book.bookName} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>저자</Text>
          <TextInput value={book.author} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>장르</Text>
          <TextInput value={book.genre} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>총 페이지 수</Text>
          <TextInput value={book.totalPage?.toString()} editable={false} style={styles.input} />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>시작일</Text>
          <TextInput value={book.startDate ?? '날짜 정보 없음'} editable={false} style={styles.input} />
        </View>

         {book.finishDate && (
           <View style={styles.fieldGroup}>
            <Text style={styles.label}>종료일</Text>
            <TextInput value={book.finishDate ?? '날짜 정보 없음'} editable={false} style={styles.input} />
          </View>
         )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.buttonBase, styles.giveUpButton]} onPress={handleGiveUp}>
           <Text style={styles.buttonText}>독서 포기</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonBase, styles.completeButton]} onPress={handleComplete}>
          <Text style={styles.buttonText}>독서 완료</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 60,
    backgroundColor: '#f4f4f4',
    flexGrow: 1,
  },
   loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f4',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  fieldBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#eee',
    padding: 12,
    borderRadius: 8,
    fontSize: 14,
    color: '#333',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonBase: {
     flex: 1,
     paddingVertical: 12,
     borderRadius: 8,
  },
  giveUpButton: {
    backgroundColor: '#ff4d4d',
    marginRight: 8,
  },
  completeButton: {
    backgroundColor: '#6b4eff',
    marginLeft: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});