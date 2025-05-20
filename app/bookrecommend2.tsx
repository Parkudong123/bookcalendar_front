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
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function BookRecommendScreen() {
    const [books, setBooks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const params = useLocalSearchParams();

    useEffect(() => {
        const loadRecommendations = async () => {
            if (params.recommendedBooks) {
                try {
                    const recommendedData = JSON.parse(params.recommendedBooks as string);
                    const formattedBooks = recommendedData.map((book: any) => ({
                        ...book,
                        url: book.url || null
                    }));
                    setBooks(formattedBooks);
                    setIsLoading(false);
                    return;
                } catch (e) {
                    console.error('⚠️ 전달받은 추천 데이터 파싱 오류:', e);
                }
            }
            setIsLoading(false);
            Alert.alert('알림', '현재 추천할 도서가 없습니다. 독서 활동을 통해 새로운 추천을 받아보세요.');
        };

        loadRecommendations();
    }, [params.recommendedBooks]);

    const handleAddToCart = async (book: any) => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                Alert.alert('로그인 필요', '로그인 후 이용해주세요.');
                router.replace('/login');
                return;
            }
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
        } catch (err: any) {
            console.error('🛒 장바구니 추가 실패:', err);
            if (err.response?.status === 401) {
                Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                router.replace('/login');
            } else if (err.response?.data?.message === '이미 장바구니에 담긴 도서입니다.') {
                Alert.alert('알림', '이미 장바구니에 담긴 도서입니다.');
            } else {
                const errorMessage = err.response?.data?.message || '장바구니 추가 중 문제가 발생했습니다.';
                Alert.alert('오류', errorMessage);
            }
        }
    };

    const handleOpenUrl = async (url: string | null) => {
        if (!url) {
            Alert.alert('알림', '알라딘 서점에 존재하지 않는 도서입니다.');
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
        <View style={styles.mainContainer}>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#BD9EFF" />
                    <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
                </View>
            )}

            {!isLoading && (
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>📘 추천 도서 리스트</Text>

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
        flex: 1,
        backgroundColor: '#f8f7fa',
    },
    contentWrapper: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 80,
    },
    title: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 16,
        padding: 6,
        backgroundColor: '#eee',
        borderRadius: 8,
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
        paddingRight: 16,
    },
    cardContentTouchable: {
        flex: 1,
        padding: 16,
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
    cartIconTouchable: {
        padding: 8,
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
        backgroundColor: '#BD9EFF',
        paddingVertical: 14,
        borderRadius: 10,
        alignSelf: 'stretch',
        marginTop: 'auto',
        marginBottom: 20,
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});