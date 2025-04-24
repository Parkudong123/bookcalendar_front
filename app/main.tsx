import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function MainScreen() {
  const router = useRouter();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [dDay, setDDay] = useState(null);

  // 📅 도서 기간을 캘린더에 표시
  const fetchBookPeriod = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const book = res.data.data;
      if (book?.startDate && book?.finishDate) {
        const range = getDateRange(book.startDate, book.finishDate);
        const newMarked: any = {};
        range.forEach((date, i) => {
          newMarked[date] = {
            startingDay: i === 0,
            endingDay: i === range.length - 1,
            color: '#c7b8f5',
            textColor: 'white',
          };
        });
        setMarkedDates(newMarked);
      }
    } catch (error) {
      console.error('📅 도서 기간 불러오기 실패:', error.response?.data || error);
    }
  };

  // 📈 진행률 + 남은 D-Day
  const fetchMainData = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/review/mainpage', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgress(res.data.data.progress);
      setDDay(res.data.data.remainDate);
    } catch (error) {
      console.error('📉 메인페이지 진행률/D-Day 불러오기 실패:', error.response?.data || error);
    }
  };

  useEffect(() => {
    fetchBookPeriod();
    fetchMainData();
  }, []);

  const handleDayPress = (day: any) => {
    router.push(`/dailyreport?date=${day.dateString}`);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.transparentButton}>
          <Text style={styles.transparentText}>📚 Daily 독후감 캘린더</Text>
        </TouchableOpacity>

        <Calendar
          style={styles.calendar}
          markingType="period"
          markedDates={{
            ...markedDates,
            ...(selectedDate && {
              [selectedDate]: {
                ...(markedDates[selectedDate] || {}),
                selected: true,
                selectedColor: '#6b4eff',
              },
            }),
          }}
          onDayPress={handleDayPress}
        />

        <View style={styles.progressBox}>
          <Text style={styles.progressTitle}>📈 독서 진행률</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          <Text style={styles.dueText}>📅 마감까지 남은 일수 : D-{dDay}</Text>
        </View>
      </ScrollView>

      <View style={styles.fakeTabBar}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na1')}>
          <Image source={require('@/image/icon_bookregister.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na2')}>
          <Image source={require('@/image/icon_bookreport.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na3')}>
          <Image source={require('@/image/icon_aichat.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na4')}>
          <Image source={require('@/image/icon_community.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na5')}>
          <Image source={require('@/image/icon_mypage.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getDateRange(start: string, end: string): string[] {
  const result: string[] = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    result.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f7fa' },
  scrollContainer: { paddingHorizontal: 16, paddingTop: 100, paddingBottom: 20 },
  transparentButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  transparentText: { color: '#555', fontWeight: '600' },
  calendar: { borderRadius: 8 },
  progressBox: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  progressTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 8 },
  progressPercent: { fontSize: 24, fontWeight: 'bold', color: '#6b4eff' },
  dueText: { marginTop: 8, fontSize: 13, color: '#666' },
  fakeTabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 80,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  icon: { width: 32, height: 32 },
});
