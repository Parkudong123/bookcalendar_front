import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import BronzeMedal from '../image/bronze1.png';
import SilverMedal from '../image/silver1.png';
import GoldMedal from '../image/gold1.png';

export default function ChallengeScreen() {
    const router = useRouter();
    const [bookCount, setBookCount] = useState(0);
    const [reviewCount, setReviewCount] = useState(0);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await SecureStore.getItemAsync('accessToken');
                const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/mypage/statistics', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setBookCount(res.data.data.bookCount);
                setReviewCount(res.data.data.reviewCount);
            } catch (error) {
                console.error('❌ 통계 정보 불러오기 실패:', error);
                setBookCount(0);
                setReviewCount(0);
            }
        };

        fetchStats();
    }, []);

    const calculateStepProgressWidth = (currentStepCount: number) => {
        const targetStep = 5;
        const progress = Math.min(currentStepCount, targetStep);
        return `${(progress / targetStep) * 100}%`;
    };


    const getProgressText = (tier: 'bronze' | 'silver' | 'gold', currentCount: number) => {
        if (tier === 'bronze') {
            const target = 5;
            const progress = Math.min(currentCount, target);
            if (currentCount >= target) return `${target} / ${target} 개 달성!`;
            return `${progress} / ${target} 개`;
        } else if (tier === 'silver') {
            const target = 10;
            const stepStart = 5;
            const stepTarget = 5;

            if (currentCount < stepStart + 1) return `0 / ${stepTarget} 개`;

            const progressInStep = Math.min(currentCount - stepStart, stepTarget);
            if (currentCount >= target) return `${stepTarget} / ${stepTarget} 개 달성!`;
            return `${progressInStep} / ${stepTarget} 개`;
        } else if (tier === 'gold') {
            const target = 15;
            const stepStart = 10;
            const stepTarget = 5;

            if (currentCount < stepStart + 1) return `0 / ${stepTarget} 개`;

            const progressInStep = Math.min(currentCount - stepStart, stepTarget);

            if (currentCount >= target) {
                 return `${stepTarget} / ${stepTarget} 개 달성!`;
            } else {
                 return `${progressInStep} / ${stepTarget} 개`;
            }
        }
        return '';
    };


    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity onPress={() => router.push('/na5')} style={styles.backBtn}>
                <Text style={styles.backBtn}>← 뒤로가기</Text>
            </TouchableOpacity>

            <Text style={styles.header}>🏆 독후감 작성 Challenge</Text>
            <Text style={styles.bookCount}>현재 내 독서 권수 : {bookCount} 권</Text>
            <Text style={styles.bookCount}>현재 내 독후감 작성 수 : {reviewCount} 개</Text>


            <View style={styles.medalBox}>
                <Image source={BronzeMedal} style={styles.medalIcon} />
                <Text style={styles.medalTitle}>Bronze Medal</Text>
                <Text style={styles.medalDescText}>독후감 작성 5개 달성 시 취득</Text>


                <View style={styles.progressBarContainer}>

                    <View
                        style={[
                            styles.progressBarFilled,
                            { width: calculateStepProgressWidth(reviewCount) },
                            { backgroundColor: reviewCount >= 5 ? '#4CAF50' : '#6b4eff' }
                        ]}
                    />
                </View>

                <Text style={styles.progressText}>
                    {getProgressText('bronze', reviewCount)}
                </Text>
            </View>


            <View style={styles.medalBox}>
                <Image source={SilverMedal} style={styles.medalIcon} />
                <Text style={styles.medalTitle}>Silver Medal</Text>
                <Text style={styles.medalDescText}>독후감 작성 10개 달성 시 취득</Text>

                <View style={styles.progressBarContainer}>

                   <View
                    style={[
                      styles.progressBarFilled,
                      { width: calculateStepProgressWidth(Math.max(0, reviewCount - 5)) },
                      { backgroundColor: reviewCount >= 10 ? '#4CAF50' : (reviewCount >= 6 ? '#6b4eff' : '#e0e0e0') }
                    ]}
                   />
                </View>

                <Text style={styles.progressText}>
                    {getProgressText('silver', reviewCount)}
                </Text>
            </View>


            <View style={styles.medalBox}>
                <Image source={GoldMedal} style={styles.medalIcon} />

                <Text style={styles.medalTitle}>Gold Medal</Text>
                <Text style={styles.medalDescText}>독후감 작성 15개 달성 시 취득</Text>


                <View style={styles.progressBarContainer}>

                   <View
                     style={[
                       styles.progressBarFilled,
                       { width: calculateStepProgressWidth(Math.max(0, reviewCount - 10)) },
                       { backgroundColor: reviewCount >= 15 ? '#4CAF50' : (reviewCount >= 11 ? '#6b4eff' : '#e0e0e0') }
                     ]}
                   />
                </View>
                 <Text style={styles.progressText}>
                    {getProgressText('gold', reviewCount)}
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 30,
        paddingBottom: 60,
        backgroundColor: '#f8f8f8',
    },
     backBtn: {
    marginBottom: 18,
    alignSelf: 'flex-start',
    },
    
    header: {
        textAlign: 'center',
        marginBottom: 12,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 20,
    },
    bookCount: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
        marginBottom: 10,
    },
    medalBox: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
    },
    medalIcon: {
        width: 40,
        height: 40,
        marginBottom: 10,
    },
    medalTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    medalDescText: {
        fontSize: 13,
        color: '#666',
        marginBottom: 12,
        textAlign: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: '#e0e0e0',
        borderRadius: 4,
        overflow: 'hidden',
        marginVertical: 8,
    },
    progressBarFilled: {
        height: '100%',
    },
    progressText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 4,
    },
});