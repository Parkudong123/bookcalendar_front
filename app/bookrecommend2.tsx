import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Linking,
} from 'react-native';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useRouter } from 'expo-router';

export default function BookRecommendScreen() {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const token = await SecureStore.getItemAsync('accessToken');
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/recommend', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const booksData = res.data.data || [];
                const formattedBooks = booksData.map(book => ({
                    ...book,
                    url: book.url || null // URL이 없으면 null로 설정
                }));
                setBooks(formattedBooks);
            } catch (error) {
                console.error('📚 도서 추천 불러오기 실패:', error);
                const errorMessage = error.response?.data?.message || '도서 추천을 불러오지 못했습니다.';
                Alert.alert('오류', errorMessage);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const handleAddToCart = async (book) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.post(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/book/cart',
                {
                    bookName: book.bookName,
                    author: book.author,
                    url: book.url || '',
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            Alert.alert('장바구니 추가 완료', `"${book.bookName}"이(가) 장바구니에 추가되었습니다.`);
        } catch (err) {
            console.error('🛒 장바구니 추가 실패:', err);
            const errorMessage = err.response?.data?.message || '장바구니 추가 중 문제가 발생했습니다.';
            Alert.alert('오류', errorMessage);
        }
    };

    // URL 열기 또는 알림창 표시 함수
    const handleOpenUrl = async (url) => {
        if (!url) { // URL이 없으면 알림창 표시
            Alert.alert('알림', '알라딘 서점에 존재하지 않는 도서입니다');
            console.warn('Attempted to open URL but none was provided.');
            return;
        }
        try {
            const supported = await Linking.canOpenURL(url);

            if (supported) { // URL을 열 수 있으면 열기 시도
                await Linking.openURL(url);
            } else { // URL을 열 수 없으면 오류 알림
                console.error(`Don't know how to open URL: ${url}`);
                Alert.alert('오류', `이 URL을 열 수 없습니다: ${url}`);
            }
        } catch (error) { // 링킹 중 오류 발생 시 알림
            console.error('Failed to open URL:', error);
            Alert.alert('오류', 'URL을 여는 중 오류가 발생했습니다.');
        }
    };


    return (
        <View style={styles.mainContainer}>
            {isLoading ? (
                // 로딩 중일 때 전체 화면을 덮는 오버레이
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
                </View>
            ) : (
                // 로딩 완료 후 콘텐츠를 담을 컨테이너 (ScrollView와 하단 고정 버튼 포함)
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>📘 추천 도서 리스트</Text>

                    {/* 도서 목록 영역 (스크롤 가능) */}
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        {books.length === 0 ? (
                            <Text style={styles.noBooksText}>추천 도서가 없습니다.</Text>
                        ) : (
                            books.map((book, index) => (
                                <View key={index} style={styles.card}>
                                    <View style={styles.headerRow}>
                                        <View style={styles.circle}>
                                            <Text style={styles.circleText}>{index + 1}</Text>
                                        </View>
                                        <View style={styles.textCol}>
                                            {/* 도서 제목을 TouchableOpacity로 감싸고 onPress 이벤트 추가 */}
                                            <TouchableOpacity onPress={() => handleOpenUrl(book.url)}>
                                                <Text style={styles.bookTitle}>{book.bookName}</Text>
                                            </TouchableOpacity>
                                            <Text style={styles.bookAuthor}>저자: {book.author}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => handleAddToCart(book)}>
                                            <Text style={styles.cartIcon}>🛒</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.reason}>{book.reason}</Text>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* 하단 고정 버튼 */}
                    <TouchableOpacity
                        style={styles.fixedBottomButton}
                        onPress={() => router.push('/main')}
                    >
                        <Text style={styles.homeButtonText}>메인으로 돌아가기</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1, // 전체 화면을 채우도록 설정
        backgroundColor: '#f8f7fa',
        // paddingHorizontal, paddingTop, paddingBottom는 contentWrapper로 이동
    },
    contentWrapper: {
        flex: 1, // mainContainer 내에서 남은 공간을 모두 차지
        paddingHorizontal: 20, // 여기서 좌우 패딩 적용
        paddingTop: 60, // 여기서 상단 패딩 적용
        // 하단 패딩은 ScrollView의 contentContainerStyle에 적용
    },
    scrollViewContent: {
        flexGrow: 1, // ScrollView 내용이 충분하지 않아도 flex: 1처럼 동작 (전체 높이를 차지)
        paddingBottom: 80, // 하단 고정 버튼 높이 + 여백 확보 (버튼 높이에 맞게 조정 필요)
    },
    title: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        padding: 6,
        backgroundColor: '#eee',
        borderRadius: 8,
        // marginHorizontal: 0, // contentWrapper의 paddingHorizontal 사용
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 10,
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
        marginRight: 12,
    },
    circleText: {
        fontWeight: 'bold',
        color: '#444',
    },
    textCol: {
        flex: 1, // 남은 공간 차지
        // marginLeft: 12, // circle의 marginRight로 충분
    },
    bookTitle: {
        fontWeight: 'bold',
        fontSize: 15,
    },
    bookAuthor: {
        color: '#666',
        fontSize: 13,
        marginTop: 2,
    },
    reason: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
        marginTop: 8,
    },
    cartIcon: {
        fontSize: 20,
        padding: 4,
        marginLeft: 8,
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 99,
    },
    loadingText: {
        marginTop: 10,
        color: '#fff',
        fontSize: 16,
    },
    noBooksText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },
    // 하단 고정 버튼 스타일
    fixedBottomButton: {
        backgroundColor: '#BD9EFF',
        paddingVertical: 14,
        borderRadius: 10,
        alignSelf: 'stretch', // 부모 컨테이너 너비에 맞춤
        marginTop: 10, // 스크롤뷰와의 간격
        // 이 버튼은 contentWrapper 내에 배치되어 자동으로 하단에 위치하게 됩니다 (flexbox)
        // marginHorizontal: 0 // contentWrapper의 paddingHorizontal 사용
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    
    },
});