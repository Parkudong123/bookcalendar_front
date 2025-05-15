import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList, Alert } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';

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
    const [progress, setProgress] = useState(0);
    const [dDay, setDDay] = useState(null);
    const [highlightedDates, setHighlightedDates] = useState<string[]>([]);
    const [bookPeriods, setBookPeriods] = useState([]);

    const fetchHighlightedDates = async (month: number) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/review/calendar', {
                params: { month: month },
                headers: { Authorization: `Bearer ${token}` },
            });

            const reviewData = res.data.data;
            const initialMarkedDates: any = {};

            reviewData.forEach((item: any) => {
                const dateString = item.date.split('T')[0];
                const color = item.color || '#BD9EFE';

                initialMarkedDates[dateString] = {
                    selected: true,
                    selectedColor: color,
                    textColor: '#ffffff',
                    dotColor: '#fff',
                };
            });

            setMarkedDates(initialMarkedDates);
            setHighlightedDates(reviewData.map((item: any) => item.date.split('T')[0]));

        } catch (error: any) {
            console.error('❌ 리뷰 캘린더 불러오기 실패:', error.response?.data || error);
            setHighlightedDates([]);
            setMarkedDates({});
        }
    };

    const fetchMainData = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
             if (!token) {
                console.warn('토큰 없음, 메인 데이터 불러오기 중단');
                router.replace('/login');
                return;
            }
            const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/review/mainpage', {
                headers: { Authorization: `Bearer ${token}` },
            });
             if (res.data?.data) {
                setProgress(res.data.data.progress);
                setDDay(res.data.data.remainDate);
            } else {
                console.warn('메인 데이터 응답 형식 이상', res.data);
                setProgress(0);
                setDDay(null);
            }

        } catch (error: any) {
            console.error('❌ 메인페이지 진행률/D-Day 불러오기 실패:', error.response?.data || error);
            setProgress(0);
            setDDay(null);
             if (error.response?.status === 401) {
                 router.replace('/login');
             } else {
                 Alert.alert('오류', '메인 정보를 불러오는데 실패했습니다.');
             }
        }
    };

     const fetchBookPeriod = async (month: number) => {
         try {
             const token = await SecureStore.getItemAsync('accessToken');
              if (!token) {
                 console.warn('토큰 없음, 도서 기간 불러오기 중단');
                 router.replace('/login');
                 return;
             }
             const res = await axios.post(
                 'http://ceprj.gachon.ac.kr:60001/api/api/v1/book/period',
                 { month: month },
                 { headers: { Authorization: `Bearer ${token}` } }
             );
              if (res.data?.data) {
                  const sortedPeriods = res.data.data.sort((a: any, b: any) =>
                      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                  );
                  setBookPeriods(sortedPeriods);
             } else {
                  setBookPeriods([]);
             }

         } catch (error: any) {
             console.error('❌ 도서 기간 불러오기 실패:', error.response?.data || error);
              setBookPeriods([]);
             if (error.response?.status === 401) {
                  router.replace('/login');
             } else {
                  Alert.alert('오류', '도서 기간 정보를 불러오는데 실패했습니다.');
             }
         }
     };


    useEffect(() => {
        const currentMonth = new Date().getMonth() + 1;
        fetchHighlightedDates(currentMonth);
        fetchMainData();
        fetchBookPeriod(currentMonth);
    }, []);

    useFocusEffect(
        useCallback(() => {
            // console.log('MainScreen Focused - 데이터 리로드'); // 이 로그를 제거합니다.
            const currentMonth = new Date().getMonth() + 1;
            fetchHighlightedDates(currentMonth);
            fetchMainData();
            fetchBookPeriod(currentMonth);

            return () => {
                // console.log('MainScreen Blurred'); // 이 로그를 제거합니다.
            };
        }, [])
    );


    const handleDayPress = (day: any) => {
        const newDateString = day.dateString;
        router.push(`/dailyreport?date=${newDateString}`);
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

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    const handleFirstTabPress = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                console.warn('토큰 없음, 첫 탭 버튼 클릭 시 로그인 페이지로 이동');
                router.replace('/login');
                return;
            }

            const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
                headers: { Authorization: `Bearer ${token}` },
            });

            const bookData = res.data.data;
            console.log('📚 첫 탭 버튼 클릭: 도서 정보 조회 응답:', bookData);

            if (bookData && bookData.bookName) {
                router.push('/book');
            } else {
                router.push('/bookregister');
            }
        } catch (e: any) {
            console.error('❌ 첫 탭 버튼 클릭: 도서 정보 조회 실패 또는 이동 오류:', e.response?.data || e);
            Alert.alert('오류', '도서 정보를 가져오는데 실패했습니다. 등록 페이지로 이동합니다.');
            router.push('/bookregister');
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
                    markedDates={markedDates}
                    onDayPress={handleDayPress}
                    monthFormat={'yyyy년 MM월'}
                    hideArrows={false}
                    hideExtraDays={true}
                    disableMonthChange={false}
                    firstDay={0}
                    onMonthChange={(month) => {
                         const newMonth = new Date(month.dateString).getMonth() + 1;
                         fetchHighlightedDates(newMonth);
                         fetchBookPeriod(newMonth);
                         console.log('month changed', month);
                    }}
                    theme={{
                        arrowColor: '#6b4eff',
                        textDayStyle: { color: '#333' },
                        textMonthFontWeight: 'bold',
                        textDayHeaderFontWeight: 'bold',
                        selectedDayBackgroundColor: '#6b4eff',
                        selectedDayTextColor: '#ffffff',
                    }}
                />

                 <View style={styles.bookPeriodContainer}>
                     <Text style={styles.bookPeriodTitle}>📚 읽고 있는 책 기간</Text>
                     {bookPeriods.length === 0 ? (
                          <Text style={styles.noBookPeriodText}>현재 읽고 있는 책이 없습니다.</Text>
                     ) : (
                           <FlatList
                                 data={bookPeriods}
                                 keyExtractor={(item: any) => item.BookId.toString()}
                                 renderItem={({ item }) => (
                                     <View style={styles.bookPeriodItem}>
                                         <View style={[styles.colorDot, { backgroundColor: item.color || '#BD9EFE' }]} />
                                         <View style={{flex: 1}}>
                                            <Text style={styles.bookNameText} numberOfLines={1} ellipsizeMode="tail">{item.BookName}</Text>
                                            <Text style={styles.bookDateRangeText}>{`${formatDate(item.startDate)} ~ ${formatDate(item.finishDate)}`}</Text>
                                         </View>
                                     </View>
                                 )}
                                 contentContainerStyle={styles.bookPeriodListContent}
                                 scrollEnabled={false}
                            />
                      )}
                  </View>

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
                    <Image source={require('@/image/community6.png')} style={styles.icon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/(tabs)/na5')}>
                    <Image source={require('@/image/icon_community.png')} style={styles.icon} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFF' },
    scrollContainer: { paddingHorizontal: 16, paddingTop: 50, paddingBottom: 100 },
    banner: {
    backgroundColor: '#F3EFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    alignItems: 'center', // 이 부분이 배너 내용(bannerContent)을 수직으로 중앙에 배치합니다.
},
bannerContent: {
    flexDirection: 'row', // 로고와 텍스트를 가로로 나열합니다.
    alignItems: 'center', // 로고와 텍스트를 가로 나열된 상태에서 수직으로 중앙에 맞춥니다.
},
logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    marginRight: 8, // 로고 오른쪽에 간격을 줍니다.
},
bannerText: {
    color: '#333',
    fontSize: 35,
    fontWeight: 'bold'
},
    calendar: { borderRadius: 8 },
    bookPeriodContainer: {
        marginTop: 20,
        padding: 16,
        backgroundColor:'#F3EFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
    },
    bookPeriodTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
        color: '#333',
    },
    bookPeriodListContent: {
        paddingHorizontal: 0,
        paddingBottom: 0,
       },
    bookPeriodItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#eee',
        marginHorizontal: 0,
    },
    colorDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 10,
    },
    bookPeriodItemBoxTwoColumn: {
        flex: 1,
        marginHorizontal: 8,
        marginBottom: 8,
        backgroundColor: '#fff',
        padding: 4,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#eee',
         alignItems: 'center',
       },
    bookNameText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'left',
    },
    bookDateRangeText: {
        fontSize: 13,
        color: '#666',
        marginTop: 4,
        textAlign: 'left',
    },
     noBookPeriodText: {
         fontSize: 13,
         color: '#888',
         textAlign: 'center',
         fontStyle: 'italic',
       },
    progressBox: {
        marginTop: 20,
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: '#F3EFFF',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 3,
        alignItems: 'center',
    },
    progressTitle: {
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 8,
        textAlign: 'center',
    },
    progressPercent: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#6b4eff',
        textAlign: 'center',
    },
    dueText: {
        marginTop: 8,
        fontSize: 13,
        color: '#666',
        marginBottom: 16,
        textAlign: 'center',
    },
    illustrationStyle: {
        width: '80%',
        height: 150,
        resizeMode: 'contain',
        marginTop: 8,
    },
    fakeTabBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        height: 80,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    icon: { width: 32, height: 32 },
    
});