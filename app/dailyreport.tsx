import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function ReviewDetailScreen() {
    const { date } = useLocalSearchParams();
    const router = useRouter();

    const [review, setReview] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReview = async () => {
            const token = await SecureStore.getItemAsync('accessToken');
             if (!token) {
                 Alert.alert('로그인 필요', '독후감 정보를 불러오려면 로그인이 필요합니다.');
                 router.replace('/login');
                 setLoading(false);
                 return;
             }
            try {
                const res = await axios.get(`http://ceprj.gachon.ac.kr:60001/api/api/v1/review/date?date=${date}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data?.data) {
                    setReview(res.data.data);
                } else {
                    setReview(null);
                }
            } catch (err: any) {
                 if (err.response?.status === 401) {
                     Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                     router.replace('/login');
                 } else {
                     const errorMessage = err.response?.data?.message || '독후감 정보를 불러오는데 실패했습니다.';
                     Alert.alert('오류', errorMessage);
                 }
                 setReview(null);
            } finally {
                setLoading(false);
            }
        };
        if (date) {
            fetchReview();
        } else {
             Alert.alert('오류', '조회할 날짜 정보가 없습니다.');
             router.replace('/main');
        }

    }, [date]);


    if (loading) {
        return (
             <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#6b4eff" />
                <Text style={styles.loadingText}>독후감 불러오는 중...</Text>
             </View>
        );
    }

    if (!review) {
        return (
            <View style={styles.centeredContainer}>
                <Text style={styles.noDataTextStyled}>{date}에 작성된 독후감이 없습니다.</Text>
                <TouchableOpacity onPress={() => router.back()} style={styles.styledBackButton}>
                    <Text style={styles.styledBackButtonText}>메인으로 돌아가기</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>← 메인페이지로</Text>
            </TouchableOpacity>

            <Text style={styles.title}>{date} 독후감</Text>

            <Text style={styles.label}>📗 독후감 내용</Text>
            <View style={styles.box}>
                <Text style={styles.content}>{review.contents}</Text>
            </View>

            {[1, 2, 3].map(i => (
                <View key={i} style={styles.qaBox}>
                    <Text style={styles.question}>Q{i}. {review[`question${i}`]}</Text>
                    <Text style={styles.answer}>A{i}. {review[`answer${i}`]}</Text>
                </View>
            ))}

            <View style={styles.aiBox}>
                <Text style={styles.aiTitle}>📢 AI 사서의 응답</Text>
                <Text style={styles.aiResponse}>{review.aiResponse}</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
     container: {
         flex: 1,
         backgroundColor: '#f8f7fa',
     },
    scrollContent: {
        padding: 24,
        flexGrow: 1,
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f7fa',
        padding: 24,
    },
     loadingText: {
         marginTop: 10,
         fontSize: 16,
         color: '#666',
     },
    noDataTextStyled: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#555',
        textAlign: 'center',
        marginBottom: 20,
    },
    styledBackButton: {
        backgroundColor: '#BD9EFF',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
    },
    styledBackButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginBottom: 12,
        marginTop: 20,
    },
    backBtn: {
        marginTop: 0,
        alignSelf: 'flex-start',
    },
    backText: {
        color: '#666',
        fontSize: 14,
    },
     label: {
         fontSize: 14,
         fontWeight: 'bold',
         marginBottom: 10,
         marginTop: 16,
         color: '#333',
     },
    box: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#fff',
        marginBottom: 20,
        marginTop: 0,
    },
    content: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },
    qaBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        borderColor: '#ccc',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    question: {
        fontWeight: 'bold',
        fontSize: 15,
        color: '#444',
        marginBottom: 6,
    },
    answer: {
        fontSize: 14,
        color: '#3b53ff',
        lineHeight: 20,
    },
    aiBox: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginTop: 10,
        marginBottom: 24,
        borderColor: '#ccc',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    aiTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
         color: '#333',
    },
    aiResponse: {
        fontSize: 14,
        color: '#333',
        lineHeight: 20,
    },
});