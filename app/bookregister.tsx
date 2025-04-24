import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function BookRegisterScreen() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [pages, setPages] = useState('');
  const [genre, setGenre] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [finishDate, setFinishDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showFinishPicker, setShowFinishPicker] = useState(false);

  const handleRegister = async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    console.log('🔐 저장된 accessToken:', token);

    try {
      const response = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/book',
        {
          bookName: title,
          author,
          totalPage: parseInt(pages),
          genre,
          startDate: startDate.toISOString().split('T')[0],
          finishDate: finishDate.toISOString().split('T')[0],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('📚 도서 등록 성공:', response.data);
      Alert.alert('도서 등록 완료!');
      router.push({
        pathname: '/main',
        params: {
          startDate: startDate.toISOString().split('T')[0],
          finishDate: finishDate.toISOString().split('T')[0],
        },
      });
    } catch (error) {
      console.error('❌ 도서 등록 실패:', error);
      Alert.alert('도서 등록에 실패했어요.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1, marginTop: 32 }}>
        <TouchableOpacity onPress={() => router.push('/main')} style={styles.backButton}>
          <Text style={styles.backButtonText}>← 뒤로가기</Text>
        </TouchableOpacity>

        <Text style={styles.header}>도서 등록 페이지</Text>

        <Text style={styles.label}>제목</Text>
        <TextInput style={styles.input} placeholder="입력" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>저자</Text>
        <TextInput style={styles.input} placeholder="입력" value={author} onChangeText={setAuthor} />

        <Text style={styles.label}>총 페이지 수</Text>
        <TextInput
          style={styles.input}
          placeholder="입력"
          value={pages}
          onChangeText={setPages}
          keyboardType="numeric"
        />

        <Text style={styles.label}>장르</Text>
        <TextInput style={styles.input} placeholder="입력" value={genre} onChangeText={setGenre} />

        <View style={{ marginBottom: 28 }} />
        <View style={styles.dateRow}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>시작일: {startDate.toDateString()}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowFinishPicker(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>종료일: {finishDate.toDateString()}</Text>
          </TouchableOpacity>
        </View>

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowStartPicker(Platform.OS === 'ios');
              if (date) setStartDate(date);
            }}
          />
        )}
        {showFinishPicker && (
          <DateTimePicker
            value={finishDate}
            mode="date"
            display="default"
            onChange={(e, date) => {
              setShowFinishPicker(Platform.OS === 'ios');
              if (date) setFinishDate(date);
            }}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleRegister}>
          <Text style={styles.submitText}>도서 등록</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f7fa' },
  backButton: { alignSelf: 'flex-start', marginTop: 16, marginLeft: 16, marginBottom: 24 },
  backButtonText: { fontSize: 14, color: '#666' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 36, textAlign: 'center', color: '#333' },
  label: { fontSize: 14, marginBottom: 10, marginLeft: 24, color: '#444' },
  input: {
    marginHorizontal: 24,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24, paddingHorizontal: 20 },
  dateButton: { flex: 1, padding: 12, borderRadius: 6, backgroundColor: '#e0ddfa', marginHorizontal: 4 },
  dateText: { textAlign: 'center', fontSize: 14, color: '#333' },
  submitButton: { marginHorizontal: 24, marginTop: 12, backgroundColor: '#6b4eff', paddingVertical: 12, borderRadius: 8 },
  submitText: { textAlign: 'center', fontWeight: 'bold', color: 'white' },
});
