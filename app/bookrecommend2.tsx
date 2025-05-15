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
    const [books, setBooks] = useState<any[]>([]); // 타입 명시
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const token = await SecureStore.getItemAsync('accessToken');
                 if (!token) {
                     // 토큰이 없으면 로그인 화면으로 리다이렉트
                     Alert.alert('로그인 필요', '서비스 이용을 위해 로그인이 필요합니다.');
                     router.replace('/login');
                     setIsLoading(false); // 로딩 상태 해제
                     return;
                 }
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/recommend', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                const booksData = res.data.data || [];
                const formattedBooks = booksData.map((book: any) => ({ // book 타입 명시
                    ...book,
                    url: book.url || null // URL이 없으면 null로 설정
                }));
                setBooks(formattedBooks);
            } catch (error: any) { // 오류 타입 명시
                console.error('📚 도서 추천 불러오기 실패:', error);
                 if (error.response?.status === 401) {
                     Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                     router.replace('/login');
                 } else {
                     const errorMessage = error.response?.data?.message || '도서 추천을 불러오지 못했습니다.';
                     Alert.alert('오류', errorMessage);
                 }
                setBooks([]); // 오류 발생 시 목록 비움
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, []);

    const handleAddToCart = async (book: any) => { // book 타입 명시
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
                    url: book.url || '', // URL이 null이면 빈 문자열로 보냄
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            Alert.alert('장바구니 추가 완료', `"${book.bookName}"이(가) 장바구니에 추가되었습니다.`);
        } catch (err: any) { // 오류 타입 명시
            console.error('🛒 장바구니 추가 실패:', err);
             if (err.response?.status === 401) {
                 Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                 router.replace('/login');
             } else if (err.response?.data?.message === '이미 장바구니에 담긴 도서입니다.') { // 예시 오류 메시지
                 Alert.alert('알림', '이미 장바구니에 담긴 도서입니다.');
             }
             else {
                 const errorMessage = err.response?.data?.message || '장바구니 추가 중 문제가 발생했습니다.';
                 Alert.alert('오류', errorMessage);
             }
        }
    };

    // URL 열기 또는 알림창 표시 함수
    const handleOpenUrl = async (url: string | null) => { // url 타입 명시
        if (!url) { // URL이 없거나 null이면 알림창 표시
            Alert.alert('알림', '알라딘 서점에 존재하지 않는 도서입니다');
            // console.warn('Attempted to open URL but none was provided or URL is null.'); // 디버그용
            return;
        }
         // URL 형식 검사 (간단하게 http 또는 https로 시작하는지 확인)
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
             console.error('Invalid URL format:', url);
             Alert.alert('오류', `유효하지 않은 URL 형식입니다: ${url}`);
             return;
        }

        try {
            const supported = await Linking.canOpenURL(url);

            if (supported) { // URL을 열 수 있으면 열기 시도
                await Linking.openURL(url);
            } else { // URL을 열 수 없으면 오류 알림 (예: 특정 앱 스키마 등)
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
            {/* 로딩 오버레이 */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#BD9EFF" />
                    <Text style={styles.loadingText}>추천 도서 불러오는 중...</Text>
                </View>
            )}

            {/* 로딩 완료 후 콘텐츠 */}
            {!isLoading && (
                <View style={styles.contentWrapper}>
                    <Text style={styles.title}>📘 추천 도서 리스트</Text>

                    {/* 도서 목록 영역 (스크롤 가능) */}
                    <ScrollView contentContainerStyle={styles.scrollViewContent}>
                        {books.length === 0 ? (
                            <Text style={styles.noBooksText}>추천 도서가 없습니다.</Text>
                        ) : (
                             // FlatList를 사용하는 것이 더 효율적일 수 있지만, 현재 map 구조 유지
                            books.map((book, index) => (
                                 // 각 카드 항목을 감싸는 View (스타일 적용)
                                <View key={index} style={styles.cardContainer}>
                                    {/* 카드 내용 전체 (장바구니 제외) - 클릭 시 URL 열기 */}
                                    <TouchableOpacity
                                        style={styles.cardContentTouchable} // 내용을 채우도록 flex: 1 적용 예정
                                        onPress={() => handleOpenUrl(book.url)}
                                    >
                                        <View style={styles.headerRow}>
                                            <View style={styles.circle}>
                                                <Text style={styles.circleText}>{index + 1}</Text>
                                            </View>
                                            <View style={styles.textCol}>
                                                {/* 제목과 저자는 TouchableOpacity 안에 일반 Text로 */}
                                                <Text style={styles.bookTitle}>{book.bookName}</Text>
                                                <Text style={styles.bookAuthor}>저자: {book.author}</Text>
                                            </View>
                                        </View>
                                        {/* 추천 이유는 TouchableOpacity 안에 일반 Text로 */}
                                        <Text style={styles.reason}>{book.reason}</Text>
                                    </TouchableOpacity>

                                    {/* 장바구니 아이콘 - 별도 TouchableOpacity */}
                                    <TouchableOpacity onPress={() => handleAddToCart(book)} style={styles.cartIconTouchable}>
                                        <Text style={styles.cartIcon}>🛒</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        )}
                    </ScrollView>

                    {/* 하단 고정 버튼 */}
                    {/* ScrollView 바깥에 배치하여 하단에 고정 */}
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
        flex: 1, // mainContainer 내에서 남은 공간 모두 차지
        paddingHorizontal: 20, // 여기서 좌우 패딩 적용
        paddingTop: 30, // 여기서 상단 패딩 적용
        // 하단 패딩은 scrollViewContent에 적용
    },
    scrollViewContent: {
        flexGrow: 1, // 내용이 적어도 최소한의 높이 확보
        paddingBottom: 80, // 하단 고정 버튼 공간 확보 (버튼 높이에 맞게 조정)
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
     // 각 카드 항목의 컨테이너 (배경, 그림자, 마진 등 스타일 적용)
     cardContainer: {
         backgroundColor: '#fff',
         borderRadius: 10,
         marginBottom: 10,
         shadowColor: '#000',
         shadowOpacity: 0.05,
         shadowRadius: 4,
         elevation: 2,
         flexDirection: 'row', // 내용과 장바구니 아이콘을 가로로 배치
         alignItems: 'center', // 가로 배치된 요소들을 수직 중앙 정렬
         paddingRight: 16, // 장바구니 아이콘 오른쪽 여백
     },
    // 카드 내용 전체 (장바구니 제외) - TouchableOpacity로 감싸고 flex: 1 적용
    cardContentTouchable: {
        flex: 1, // 남은 공간 모두 차지하여 터치 영역 넓힘
        padding: 16, // 내용의 내부 패딩
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
    // 장바구니 아이콘만 감싸는 TouchableOpacity
    cartIconTouchable: {
        padding: 8, // 터치 영역 확보
        // flexShrink: 0, // 축소되지 않도록 함
    },
    cartIcon: {
        fontSize: 20,
        // padding: 4, // cartIconTouchable에서 패딩 처리
        // marginLeft: 8, // cardContainer의 paddingRight로 충분
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
        alignSelf: 'stretch', // 부모 너비에 맞춤
        marginTop: 'auto', // ScrollView 아래 남은 공간을 밀어내서 하단에 붙도록 함
         marginBottom: 20, // 화면 하단과의 간격
    },
    homeButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
    },
});