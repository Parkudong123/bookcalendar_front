import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

import BronzeMedal from '../image/bronze.png';
import SilverMedal from '../image/silver.png';
import GoldMedal from '../image/gold.png';

export default function ChallengeScreen() {
  const router = useRouter();
  const [bookCount, setBookCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0); // 독후감 수 상태

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
        setReviewCount(res.data.data.reviewCount); // 독후감 수 상태 업데이트
      } catch (error) {
        console.error('❌ 통계 정보 불러오기 실패:', error);
        setBookCount(0);
        setReviewCount(0);
      }
    };

    fetchStats();
  }, []);

  // 프로그레스 바의 너비를 계산하는 함수 (현재 단계의 5개 기준)
  const calculateStepProgressWidth = (currentStepCount: number) => {
      const targetStep = 5; // 각 단계는 5개 단위
      const progress = Math.min(currentStepCount, targetStep);
      return `${(progress / targetStep) * 100}%`;
  };


  // 각 메달 티어별 현재 상태 텍스트 계산
  const getProgressText = (tier: 'bronze' | 'silver' | 'gold', currentCount: number) => {
    if (tier === 'bronze') {
      const target = 5;
      const progress = Math.min(currentCount, target);
      if (currentCount >= target) return `${target} / ${target} 개 달성!`; // 5개 이상이면 달성 표시
      return `${progress} / ${target} 개`;
    } else if (tier === 'silver') {
      const target = 10;
      const stepStart = 5; // 실버 단계 시작은 5개 초과부터
      const stepTarget = 5; // 실버 단계 목표는 5개 (6~10)

      if (currentCount < stepStart + 1) return `0 / ${stepTarget} 개`; // 6개 미만이면 실버 단계 시작 전

      const progressInStep = Math.min(currentCount - stepStart, stepTarget); // 6->1, 7->2, ..., 10->5
      if (currentCount >= target) return `${stepTarget} / ${stepTarget} 개 달성!`; // 10개 이상이면 실버 달성 표시
      return `${progressInStep} / ${stepTarget} 개`; // 실버 단계 진행 (1/5, 2/5 등)
    } else if (tier === 'gold') {
      const target = 15; // 골드 최종 목표 개수
      const stepStart = 10; // 골드 단계 시작은 10개 초과부터
      const stepTarget = 5; // 골드 단계 목표는 5개 (11~15)

      if (currentCount < stepStart + 1) return `0 / ${stepTarget} 개`; // 11개 미만이면 골드 단계 시작 전

      const progressInStep = Math.min(currentCount - stepStart, stepTarget); // 11->1, 12->2, ..., 15->5

      if (currentCount >= target) {
          return `${currentCount} 개 달성!`; // 15개 이상이면 최종 달성 메시지 표시 (실제 개수 포함)
      } else {
           return `${progressInStep} / ${stepTarget} 개`; // 골드 단계 진행 (1/5, 2/5 등)
      }
    }
    return ''; // 예상치 못한 경우
  };


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/na5')} style={styles.backBtn}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>독후감 작성 Challenge</Text>
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
              { width: calculateStepProgressWidth(reviewCount) }, // 0~5개 범위 진행률 (총 5단계)
               // 5개 이상이면 달성 색상, 5개 미만은 진행 색상
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
              { width: calculateStepProgressWidth(Math.max(0, reviewCount - 5)) }, // 6~10개 범위 진행률 (총 5단계)
              // 10개 이상이면 달성 색상, 6-9는 진행 색상, 6 미만은 배경색 (회색)
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
              { width: calculateStepProgressWidth(Math.max(0, reviewCount - 10)) }, // 11~15개 범위 진행률 (총 5단계)
              // 15개 이상이면 달성 색상, 11-14는 진행 색상, 11 미만은 배경색
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
    paddingTop: 100,
    paddingBottom: 60,
    backgroundColor: '#f8f8f8',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
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
    marginBottom: 24,
    alignItems: 'center', // 자식 요소들을 중앙 정렬
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
    backgroundColor: '#e0e0e0', // 바의 배경색 (빈 부분)
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 8,
  },
  progressBarFilled: {
    height: '100%',
    // width와 backgroundColor는 인라인 스타일로 적용됨
  },
   progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
});