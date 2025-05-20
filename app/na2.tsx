import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { useRouter } from 'expo-router';

export default function BookReviewScreen() {
    const router = useRouter();
    const [book, setBook] = useState<any>(null);
    const [currentPage, setCurrentPage] = useState('');
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                 router.replace('/login');
                 return;
            }
            try {
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBook(res.data.data);
            } catch (err: any) {
                 setBook(null);
                 if (err.response?.status === 401) {
                     Alert.alert('인증 오류', '로그인이 필요합니다.');
                     router.replace('/login');
                 }
            }
        };
        fetchBook();
    }, []);

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        if (!currentPage || review.trim() === '') {
            Alert.alert('입력 오류', '페이지 수와 독후감을 모두 입력해주세요.');
            return;
        }
         const pagesInt = parseInt(currentPage, 10);
         if (isNaN(pagesInt) || pagesInt <= 0) {
             Alert.alert('입력 오류', '올바른 페이지 수를 입력해주세요.');
             return;
         }

        setIsSubmitting(true);

        const token = await SecureStore.getItemAsync('accessToken');
         if (!token) {
            Alert.alert('인증 오류', '로그인이 필요합니다.');
            router.replace('/login');
            setIsSubmitting(false);
            return;
         }

        try {
            const res = await axios.post(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/review/write',
                {
                    pages: pagesInt,
                    contents: review.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

             Alert.alert('제출 성공', '독후감이 기록되었습니다.');

            router.push({
                pathname: '/reviewquestion',
                params: {
                    q1: res.data.data.question1,
                    q2: res.data.data.question2,
                    q3: res.data.data.question3,
                    questionId: res.data.data.questionId,
                    totalPages: res.data.data.totalPages ? String(res.data.data.totalPages) : '',
                    currentPages: res.data.data.currentPages ? String(res.data.data.currentPages) : '',
                    progress: res.data.data.progress ? String(res.data.data.progress) : '',
                    finishDate: res.data.data.finishDate || '',
                    remainDate: res.data.data.remainDate !== null && res.data.data.remainDate !== undefined ? String(res.data.data.remainDate) : '',
                    averageMessage: res.data.data.averageMessage || '',
                    aiMessage: res.data.data.aiMessage || '',
                },
            });
             setCurrentPage('');
             setReview('');


        } catch (error: any) {
            // console.error('❌ 독후감 제출 실패:', error.response?.data || error); // 콘솔 출력 제거

            if (error.response && error.response.data && typeof error.response.data.message === 'string') {
                const backendErrorMessage = error.response.data.message;

                if (backendErrorMessage === '해당 아이디로 등록된 도서를 찾을 수 없습니다.') {
                    Alert.alert('실패', '등록된 책이 없습니다. 먼저 책을 등록해주세요.');
                } else if (backendErrorMessage === '오늘 이미 작성한 독후감이 존재합니다.') {
                    Alert.alert('실패', '오늘은 이미 독후감을 작성했습니다.');
                }
                 else if (backendErrorMessage === '페이지 수를 초과했습니다.') {
                     Alert.alert('입력 오류', '입력한 페이지 수가 책의 총 페이지 수를 초과했습니다.');
                 }
                else {
                    Alert.alert('오류', `독후감 제출 중 오류가 발생했습니다: ${backendErrorMessage}`);
                }
            } else if (error.response && error.response.status === 401) {
                 Alert.alert('인증 오류', '로그인이 필요합니다.');
                 router.replace('/login');
            }
             else if (error.response) {
                 Alert.alert('오류', `독후감 제출 중 알 수 없는 서버 오류가 발생했습니다 (상태 코드: ${error.response.status})`);
            }
            else {
                Alert.alert('오류', '네트워크 오류가 발생했거나 서버에 연결할 수 없습니다.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={{ flex: 1, backgroundColor: '#f8f7fa' }}>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity onPress={() => router.push('/main')} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← 뒤로가기</Text>
                </TouchableOpacity>

                <View style={styles.headerBox}>
                    <Text style={styles.headerText}>📚 Daily 독후감 기록</Text>
                </View>

                {book && (
                    <View style={styles.bookInfo}>
                        <Text style={styles.label}>현재 읽고 있는 책</Text>
                        <Text style={styles.bookText}>제목: {book.bookName}</Text>
                        <Text style={styles.bookText}>저자: {book.author}</Text>
                    </View>
                )}

                <Text style={styles.label}>오늘 읽은 페이지</Text>
                <TextInput
                    placeholder="예 : 30 "
                    style={styles.input}
                    keyboardType="numeric"
                    value={currentPage}
                    onChangeText={setCurrentPage}
                />

                <Text style={styles.label}>독후감</Text>
                <TextInput
                    placeholder="자유롭게 입력하세요"
                    multiline={true}
                    numberOfLines={6}
                    style={styles.textareaBasic}
                    textAlignVertical="top"
                    value={review}
                    onChangeText={setReview}
                />

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                   {isSubmitting ? (
                     <ActivityIndicator color="#fff" />
                   ) : (
                     <Text style={styles.buttonText}>독후감 제출</Text>
                   )}
                </TouchableOpacity>
            </ScrollView>

             {isSubmitting && (
                <View style={styles.loadingOverlay}>
                   <ActivityIndicator size="large" color="#BD9EFF" />
                   <Text style={styles.loadingOverlayText}>처리 중...</Text>
                </View>
               )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        flexGrow: 1,
        paddingTop: 30,
        paddingBottom: 100,
    },
    backButton: {
        marginBottom: 30,
        alignSelf: 'flex-start',
    },
    backButtonText: {
        color: '#666',
        fontSize: 14,
    },
     headerBox: {
        marginBottom: 20,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
     },
     headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#333',
     },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 6,
        padding: 10,
        marginBottom: 24,
        backgroundColor: '#fff',
    },
    textareaBasic: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 20,
        backgroundColor: '#fff',
        height : 120,
        textAlignVertical: 'top',
         borderRadius: 6,
    },
    button: {
        backgroundColor: '#BD9EFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
     buttonDisabled: {
        backgroundColor: '#a0a0a0',
        opacity: 0.7,
     },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    bookInfo: {
        padding: 16,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
        marginBottom: 24,
    },
    bookText: {
        fontSize: 15,
        marginTop: 4,
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
        zIndex: 999,
      },
     loadingOverlayText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
     },
});