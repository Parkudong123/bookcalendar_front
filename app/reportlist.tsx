import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ReportListScreen() {
    const router = useRouter();
    const [reports, setReports] = useState([]);

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const token = await SecureStore.getItemAsync('accessToken');
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/reviews', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setReports(res.data.data);
            } catch (error) {
                console.error('❌ 독후감 리스트 조회 실패:', error);
            }
        };

        fetchReports();
    }, []);

    const handleDelete = async (reviewId) => {
        Alert.alert('삭제 확인', '해당 독후감을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => {
                    try {
                        const token = await SecureStore.getItemAsync('accessToken');
                        await axios.delete(`http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/review/${reviewId}`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        setReports((prev) => prev.filter((r) => r.reviewId !== reviewId));
                        Alert.alert('삭제 완료', '해당 독후감이 삭제되었습니다.');
                    } catch (error) {
                        console.error('❌ 독후감 삭제 실패:', error);
                        Alert.alert('오류 발생', '삭제 중 문제가 발생했습니다.');
                    }
                },
            },
        ]);
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                <Text style={styles.backText}>← 뒤로가기</Text>
            </TouchableOpacity>

            <View style={styles.headerBox}>
                <Text style={styles.header}>📖 내 독후감 목록</Text>
            </View>


            {reports.length === 0 ? (
                <Text style={styles.noDataText}>작성한 독후감이 없습니다.</Text>
            ) : (
                reports.map((item) => (
                    <View key={item.reviewId} style={styles.itemBox}>
                        <TouchableOpacity
                            style={styles.itemTextBox}
                            onPress={() => router.push(`/reviewdetail/${item.reviewId}`)}
                        >
                            <Text style={styles.bookName}>{item.bookName}</Text>
                            <Text style={styles.date}>{new Date(item.date).toLocaleDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.deleteIconContainer}
                            onPress={() => handleDelete(item.reviewId)}
                        >
                            <Text style={styles.deleteIcon}>🗑</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 500,
        backgroundColor: '#f4f4f4',
    },
     backBtn: {
    marginBottom: 18,
    alignSelf: 'flex-start',
    },
    
    headerBox: {
        textAlign: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 15,
    },
    header: {
        fontSize: 20, // Slightly reduced font size
        fontWeight: 'bold', // Made font bold
        textAlign: 'center',
        color: '#333', // Dark text color
    },
    noDataText: {
        textAlign: 'center',
        marginTop: 20,
        color: '#888',
    },
    itemBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    itemTextBox: {
        flex: 1,
    },
    bookName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: '#777',
    },
    deleteIconContainer: {
        padding: 8,
        marginLeft: 10,
    },
    deleteIcon: {
        fontSize: 20,
        color: '#444',
    },
});