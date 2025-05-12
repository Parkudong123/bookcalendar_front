import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

LocaleConfig.locales['ko'] = {
  monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
  dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘',
};
LocaleConfig.defaultLocale = 'ko';

export default function MainScreen() {
  const router = useRouter();
  const [markedDates, setMarkedDates] = useState({});
  const [selectedDate, setSelectedDate] = useState('');
  const [progress, setProgress] = useState(0);
  const [dDay, setDDay] = useState(null);
  const [highlightedDates, setHighlightedDates] = useState<string[]>([]);

  const fetchBookPeriod = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/book/period',
        { month: new Date().getMonth() + 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMarked = {};
      res.data.data.forEach((book: any) => {
        const range = getDateRange(book.startDate, book.finishDate);
        range.forEach((date, i) => {
          newMarked[date] = {
            startingDay: i === 0,
            endingDay: i === range.length - 1,
            color: book.color || '#c7b8f5',
            textColor: 'white',
            ...(newMarked[date] || {}),
          };
        });
      });

      highlightedDates.forEach((date) => {
        newMarked[date] = {
          ...(newMarked[date] || {}),
          selected: true,
          selectedColor: '#002FA7',
          textColor: '#ffffff',
          dotColor: '#fff',
        };
      });

      setMarkedDates(newMarked);
    } catch (error: any) {
      console.error('📅 도서 기간 불러오기 실패:', error.response?.data || error);
    }
  };

  const fetchHighlightedDates = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/review/calendar', {
        params: { month: new Date().getMonth() + 1 },
        headers: { Authorization: `Bearer ${token}` },
      });

      const dates = res.data.data.map((item: any) => item.date.split('T')[0]);
      setHighlightedDates(dates);
    } catch (error: any) {
      console.error('📆 리뷰 캘린더 불러오기 실패:', error.response?.data || error);
    }
  };

  const fetchMainData = async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/review/mainpage', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProgress(res.data.data.progress);
      setDDay(res.data.data.remainDate);
    } catch (error: any) {
      console.error('📉 메인페이지 진행률/D-Day 불러오기 실패:', error.response?.data || error);
      setProgress(0);
      setDDay(null);
    }
  };

  useEffect(() => {
    fetchHighlightedDates();
    fetchMainData();
  }, []);

  useEffect(() => {
    if (highlightedDates.length >= 0) {
      fetchBookPeriod();
    }
  }, [highlightedDates]);

  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    router.push(`/dailyreport?date=${day.dateString}`);
  };

  const getIllustrationSource = (progress: number) => {
    if (progress >= 80) {
      return require('../image/flower.png');
    } else if (progress >= 60) {
      return require('../image/plant.png');
    } else if (progress >= 40) {
      return require('../image/sprout.png');
    } else if (progress >= 20) {
      return require('../image/seed.png');
    } else {
      return require('../image/soil.png');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.banner}>
  <View style={styles.bannerContent}>
    <Image source={require('../image/logosmall.png')} style={styles.logo} />
    <Text style={styles.bannerText}> Book Calendar</Text>
  </View>
</View>


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
                textColor: '#ffffff',
                dotColor: '#fff',
              },
            }),
          }}
          onDayPress={handleDayPress}
          monthFormat={'yyyy년 MM월'}
          hideArrows={false}
          hideExtraDays={true}
          disableMonthChange={false}
          firstDay={0}
          onMonthChange={(month) => {
            console.log('month changed', month);
          }}
          theme={{
            arrowColor: '#6b4eff',
            todayTextColor: '#6b4eff',
            textDayStyle: { color: '#333' },
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: 'bold',
          }}
        />

        <View style={styles.progressBox}>
          <Text style={styles.progressTitle}>📈 독서 진행률</Text>
          <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
          <Text style={styles.dueText}>📅 마감까지 남은 일수 : D-{dDay !== null ? dDay : '-'}</Text>

          <Image
            source={getIllustrationSource(progress)}
            style={styles.illustrationStyle}
          />
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
          <Image source={require('@/image/community5.png')} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na5')}>
          <Image source={require('@/image/icon_community.png')} style={styles.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function getDateRange(start: string | undefined | null, end: string | undefined | null): string[] {
  if (!start || !end) return [];

  const result = [];
  let current = new Date(start);
  const last = new Date(end);

  current.setHours(0, 0, 0, 0);
  last.setHours(0, 0, 0, 0);

  while (current <= last) {
    result.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }
  return result;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f7fa' },
  scrollContainer: { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 20 },
  banner: {
    backgroundColor: '#DCDCDC',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center',
  },
  bannerText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  calendar: { borderRadius: 8 },
  progressBox: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  progressTitle: { fontWeight: 'bold', fontSize: 14, marginBottom: 8 },
  progressPercent: { fontSize: 24, fontWeight: 'bold', color: '#6b4eff' },
  dueText: { marginTop: 8, fontSize: 13, color: '#666', marginBottom: 16 },
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
  illustrationStyle: {
    width: '80%',
    height: 150,
    resizeMode: 'contain',
    marginTop: 8,
  },
  bannerContent: {
  flexDirection: 'row',
  alignItems: 'center',
},
logo: {
  width: 50,
  height: 50,
  resizeMode: 'contain',
  marginRight: 8,
},


});
