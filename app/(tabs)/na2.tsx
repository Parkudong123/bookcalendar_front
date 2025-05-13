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
    const [book, setBook] = useState(null);
    const [currentPage, setCurrentPage] = useState('');
    const [review, setReview] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchBook = async () => {
            const token = await SecureStore.getItemAsync('accessToken');
            try {
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/book/info', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setBook(res.data.data);
            } catch (err) {

            }
        };
        fetchBook();
    }, []);

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        if (!currentPage || !review) {
            Alert.alert('입력 오류', '페이지 수와 독후감을 모두 입력해주세요.');
            return;
        }

        setIsSubmitting(true);

        const token = await SecureStore.getItemAsync('accessToken');
        try {
            const res = await axios.post(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/review/write',
                {
                    pages: parseInt(currentPage),
                    contents: review,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            router.push({
                pathname: '/reviewquestion',
                params: {
                    q1: res.data.data.question1,
                    q2: res.data.data.question2,
                    q3: res.data.data.question3,
                    questionId: res.data.data.questionId,
                    totalPages: res.data.data.totalPages,
                    currentPages: res.data.data.currentPages,
                    progress: res.data.data.progress,
                    finishDate: res.data.data.finishDate,
                    remainDate: res.data.data.remainDate,
                    averageMessage: res.data.data.averageMessage,
                    aiMessage: res.data.data.aiMessage,
                },
            });
        } catch (error) {

            Alert.alert('실패', '도서 등록 후 이용하세요.');
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
                   <ActivityIndicator size="large" color="#fff" />
                   <Text style={styles.loadingOverlayText}>독후감 제출 중...</Text>
                 </View>
               )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 24,
        flexGrow: 1,
        paddingTop: 80,
        paddingBottom: 150,
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
         textAlign: 'center',
        marginBottom: 20,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 30
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