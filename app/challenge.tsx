// app/challenge.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function ChallengeScreen() {
  const router = useRouter();
  const [bookCount, setBookCount] = useState(0);

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
      } catch (error) {
        console.error('❌ 통계 정보 불러오기 실패:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity onPress={() => router.push('/na5')} style={styles.backBtn}>
        <Text style={styles.backText}>← 마이 페이지</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Challenge</Text>
      <Text style={styles.bookCount}>현재 내 독서 권수 : {bookCount} 권</Text>

      <View style={styles.medalBox}>
        <Image source={require('../image/logo.png')} style={styles.medalIcon} />
        <Text style={styles.medalTitle}>Bronze Medal</Text>
        <View style={styles.progressDot} />
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.medalDesc}>
          <Text>독서 완료 5권 달성 시 취득</Text>
        </View>
      </View>

      <View style={styles.medalBox}>
        <Image source={require('../image/logo.png')} style={styles.medalIcon} />
        <Text style={styles.medalTitle}>Silver Medal</Text>
        <View style={styles.progressDot} />
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.medalDesc}>
          <Text>독서 완료 10권 달성 시 취득</Text>
        </View>
      </View>

      <View style={styles.medalBox}>
        <Image source={require('../image/logo.png')} style={styles.medalIcon} />
        <Text style={styles.medalTitle}>Gold Medal</Text>
        <View style={styles.progressDot} />
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.medalDesc}>
          <Text>독서 완료 30권 달성 시 취득</Text>
        </View>
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
    top: 40,
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
    marginBottom: 30,
  },
  medalBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
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
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',
    marginVertical: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
  },
  medalDesc: {
    marginTop: 12,
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
  },
});
