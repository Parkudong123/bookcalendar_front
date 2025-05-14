import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Image,
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
                    url: book.url || null
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
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/cart',
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

    const handleOpenUrl = async (url) => {
        if (!url) {
            Alert.alert('알림', '알라딘 서점에 존재하지 않는 도서입니다');
            console.warn('Attempted to open URL but none was provided.');
            return;
        }
        try {
            const supported = await Linking.canOpenURL(url);

            if (supported) {
                await Linking.openURL(url);
            } else {
                console.error(`Don't know how to open URL: ${url}`);
                Alert.alert('오류', `이 URL을 열 수 없습니다: ${url}`);
            }
        } catch (error) {
            console.error('Failed to open URL:', error);
            Alert.alert('오류', 'URL을 여는 중 오류가 발생했습니다.');
        }
    };

    return (
        <View style={styles.container}>
            {/* 로딩 중이 아닐 때만 콘텐츠 표시 */}
             {!isLoading && (
                 <>
                    <Text style={styles.title}>📘 추천 도서 리스트</Text>

                    {/* 도서 목록 영역 */}
                    <View style={styles.contentArea}>
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
                                                <TouchableOpacity
                                                    onPress={() => handleOpenUrl(book.url)}
                                                >
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
                    </View>
                     {/* End content area */}

                    <TouchableOpacity
                        style={styles.homeButton}
                        onPress={() => router.push('/main')}
                    >
                        <Text style={styles.homeButtonText}>메인으로 돌아가기</Text>
                    </TouchableOpacity>
                 </>
             )}


            {/* 로딩 중일 때 전체 화면을 덮는 오버레이 표시 */}
            {isLoading && (
                 <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1, // 컨테이너가 전체 화면 공간을 사용하도록 설정
        paddingHorizontal: 20,
        paddingTop: 60,
        backgroundColor: '#f8f7fa',
        paddingBottom: 20, // 하단 버튼을 위한 패딩
    },

    title: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        padding: 6,
        backgroundColor: '#eee',
        borderRadius: 8,
        marginHorizontal: 0,
    },

    // 도서 목록 또는 로딩창이 표시될 중간 영역
    contentArea: {
        flex: 1, // 남은 공간을 모두 차지
    },

    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 100, // 하단 버튼 공간 확보
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
    textCol: {
        flex: 1,
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

    // 로딩창 컨테이너 스타일 (전체 화면 오버레이)
    loadingOverlay: {
        position: 'absolute', // 절대 위치
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // 반투명 검정 배경
        justifyContent: 'center', // 내용 중앙 정렬
        alignItems: 'center',
        zIndex: 99, // 다른 요소들 위에 표시
    },
    loadingText: {
        marginTop: 10,
        color: '#fff', // 흰색 텍스트
        fontSize: 16,
    },
    noBooksText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: '#666',
    },

    homeButton: {
        backgroundColor: '#BD9EFF',
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 20,
        marginHorizontal: 0,
        marginBottom: 0,
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});