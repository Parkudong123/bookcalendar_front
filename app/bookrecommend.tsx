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
    const [books, setBooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const token = await SecureStore.getItemAsync('accessToken');
                 if (!token) {
                     Alert.alert('로그인 필요', '서비스 이용을 위해 로그인이 필요합니다.');
                     router.replace('/login');
                     setIsLoading(false);
                     return;
                 }
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/recommend', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const booksData = res.data.data || [];
                const formattedBooks = booksData.map((book: any) => ({
                    ...book,
                    url: book.url || null
                }));
                setBooks(formattedBooks);
            } catch (error: any) {
                 console.error('📚 도서 추천 불러오기 실패:', error);
                 if (error.response?.status === 401) {
                     Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                     router.replace('/login');
                 } else {
                     const errorMessage = error.response?.data?.message || '도서 추천을 불러오지 못했습니다.';
                     Alert.alert('오류', errorMessage);
                 }
                setBooks([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const handleAddToCart = async (book: any) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
             if (!token) {
                 Alert.alert('로그인 필요', '로그인 후 이용해주세요.');
                 router.replace('/login');
                 return;
             }
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
        } catch (err: any) {
            console.error('🛒 장바구니 추가 실패:', err);
             if (err.response?.status === 401) {
                 Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                 router.replace('/login');
             } else if (err.response?.data?.message === '이미 장바구니에 담긴 도서입니다.') {
                 Alert.alert('알림', '이미 장바구니에 담긴 도서입니다.');
             }
             else {
                 const errorMessage = err.response?.data?.message || '장바구니 추가 중 문제가 발생했습니다.';
                 Alert.alert('오류', errorMessage);
             }
        }
    };

    const handleOpenUrl = async (url: string | null) => {
        if (!url) {
            Alert.alert('알림', '알라딘 서점에 존재하지 않는 도서입니다');
            return;
        }
         if (!url.startsWith('http://') && !url.startsWith('https://')) {
             console.error('Invalid URL format:', url);
             Alert.alert('오류', `유효하지 않은 URL 형식입니다: ${url}`);
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
            {!isLoading && (
                 <View style={styles.contentAndButtonWrapper}>
                    <Text style={styles.title}>📘 추천 도서 리스트</Text>

                    <View style={styles.contentArea}>
                        <ScrollView contentContainerStyle={styles.scrollViewContent}>
                            {books.length === 0 ? (
                                <Text style={styles.noBooksText}>추천 도서가 없습니다.</Text>
                            ) : (
                                books.map((book, index) => (
                                    <View key={index} style={styles.cardContainer}>
                                        <TouchableOpacity
                                            style={styles.cardContentTouchable}
                                            onPress={() => handleOpenUrl(book.url)}
                                        >
                                            <View style={styles.headerRow}>
                                                <View style={styles.circle}>
                                                    <Text style={styles.circleText}>{index + 1}</Text>
                                                </View>
                                                <View style={styles.textCol}>
                                                    <Text style={styles.bookTitle}>{book.bookName}</Text>
                                                    <Text style={styles.bookAuthor}>저자: {book.author}</Text>
                                                </View>
                                            </View>
                                            <Text style={styles.reason}>{book.reason}</Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={() => handleAddToCart(book)} style={styles.cartIconTouchable}>
                                            <Text style={styles.cartIcon}>🛒</Text>
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                 </View>
            )}

            {isLoading && (
                 <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#BD9EFF" />
                    <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
                 </View>
            )}

             {!isLoading && (
                 <TouchableOpacity
                     style={styles.fixedBottomButton}
                     onPress={() => router.push('/main')}
                 >
                     <Text style={styles.homeButtonText}>메인으로 돌아가기</Text>
                 </TouchableOpacity>
             )}

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f7fa',
    },
    contentAndButtonWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
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

    contentArea: {
        flex: 1,
    },

    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 80,
    },

     cardContainer: {
         backgroundColor: '#fff',
         borderRadius: 10,
         marginBottom: 10,
         shadowColor: '#000',
         shadowOpacity: 0.05,
         shadowRadius: 4,
         elevation: 2,
         flexDirection: 'row',
         alignItems: 'center',
     },
    cardContentTouchable: {
        flex: 1,
        paddingVertical: 16,
        paddingLeft: 16,
        paddingRight: 8,
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
        flexShrink: 0,
    },
    textCol: {
        flex: 1,
        justifyContent: 'center',
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
    cartIconTouchable: {
        padding: 16,
        alignSelf: 'center',
        flexShrink: 0,
    },
    cartIcon: {
        fontSize: 20,
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

    fixedBottomButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        right: 20,
        backgroundColor: '#BD9EFF',
        borderRadius: 10,
        paddingVertical: 14,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});