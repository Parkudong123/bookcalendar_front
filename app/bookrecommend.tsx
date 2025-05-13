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
                setBooks(res.data.data);
            } catch (error) {
                console.error('📚 도서 추천 불러오기 실패:', error);
                Alert.alert('오류', '도서 추천을 불러오지 못했습니다.');
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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📘 추천 도서 리스트</Text>

            {isLoading ? (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollViewContent}>
                    {books.map((book, index) => (
                        <View key={index} style={styles.card}>
                            <View style={styles.headerRow}>
                                <View style={styles.circle}>
                                    <Text style={styles.circleText}>{index + 1}</Text>
                                </View>
                                <View style={styles.textCol}>
                                    <Text style={styles.bookTitle}>{book.bookName}</Text>
                                    <Text style={styles.bookAuthor}>저자: {book.author}</Text>
                                </View>
                                <TouchableOpacity onPress={() => handleAddToCart(book)}>
                                    <Text style={styles.cartIcon}>🛒</Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.reason}>{book.reason}</Text>
                        </View>
                    ))}
                </ScrollView>
            )}

            <TouchableOpacity
                style={styles.homeButton}
                onPress={() => router.push('/main')}
            >
                <Text style={styles.homeButtonText}>메인으로 돌아가기</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 60,
        backgroundColor: '#f8f7fa',
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

    scrollViewContent: {
        flexGrow: 1,
        paddingBottom: 100,
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
    },
    circleText: {
        fontWeight: 'bold',
        color: '#444',
    },
    textCol: {
        marginLeft: 12,
        flex: 1,
    },
    bookTitle: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 2,
    },
    bookAuthor: {
        color: '#666',
        fontSize: 13,
    },
    reason: {
        fontSize: 14,
        lineHeight: 20,
        color: '#333',
    },
    cartIcon: {
        fontSize: 20,
        padding: 4,
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

    homeButton: {
        backgroundColor: '#BD9EFF',
        borderRadius: 10,
        paddingVertical: 12,
        marginTop: 20,
        // position: 'absolute', // Absolute positioning can cause overlap with scroll view content
        // bottom: 20, // Use margin instead of absolute positioning within ScrollView
        // left: 20,
        // right: 20,
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});