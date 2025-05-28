import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

export default function BookRegisterScreen() {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [pages, setPages] = useState('');
    const [genre, setGenre] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [finishDate, setFinishDate] = useState(new Date());
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showFinishPicker, setShowFinishPicker] = useState(false);

    const handleRegister = async () => {
        const token = await SecureStore.getItemAsync('accessToken');

        try {
            const response = await axios.post(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/book',
                {
                    bookName: title,
                    author,
                    totalPage: parseInt(pages),
                    genre,
                    startDate: startDate.toISOString().split('T')[0],
                    finishDate: finishDate.toISOString().split('T')[0],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Alert.alert(
                '알림',
                '도서 등록 완료!',
                [
                    {
                        text: '확인',
                    },
                ]
            );
            router.push({
                pathname: '/main',
                params: {
                    startDate: startDate.toISOString().split('T')[0],
                    finishDate: finishDate.toISOString().split('T')[0],
                },
            });
        } catch (error) {
            Alert.alert(
                '알림',
                '도서 등록에 실패했어요.',
                [
                    {
                        text: '확인',
                    },
                ]
            );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <TouchableOpacity onPress={() => router.push('/main')} style={styles.backButton}>
                <Text style={styles.backBtn}>← 뒤로가기</Text>
            </TouchableOpacity>

            <Text style={styles.header}>도서 등록 페이지</Text>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                 <View style={styles.formBox}>
                    <Text style={styles.label}>제목</Text>
                    <TextInput
                        style={[styles.inputBase, styles.multilineInput]}
                        placeholder="입력"
                        value={title}
                        onChangeText={setTitle}
                        multiline={true}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>저자</Text>
                    <TextInput
                        style={[styles.inputBase, styles.multilineInput]}
                        placeholder="입력"
                        value={author}
                        onChangeText={setAuthor}
                        multiline={true}
                        textAlignVertical="top"
                    />

                    <Text style={styles.label}>총 페이지 수</Text>
                    <TextInput
                        style={styles.inputBase} // 숫자 입력은 한 줄 유지
                        placeholder="입력"
                        value={pages}
                        onChangeText={setPages}
                        keyboardType="numeric"
                    />

                    <Text style={styles.label}>장르</Text>
                    <TextInput
                        style={[styles.inputBase, styles.multilineInput]}
                        placeholder="입력"
                        value={genre}
                        onChangeText={setGenre}
                        multiline={true}
                        textAlignVertical="top"
                    />

                    <View style={{ marginBottom: 28 }} />

                    <View style={styles.dateRowInBox}>
                        <TouchableOpacity onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateText}>시작일: {startDate.toDateString()}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowFinishPicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateText}>종료일: {finishDate.toDateString()}</Text>
                        </TouchableOpacity>
                    </View>

                    {showStartPicker && (
                        <DateTimePicker
                            value={startDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                setShowStartPicker(Platform.OS === 'ios');
                                if (date) setStartDate(date);
                            }}
                        />
                    )}
                    {showFinishPicker && (
                        <DateTimePicker
                            value={finishDate}
                            mode="date"
                            display="default"
                            onChange={(e, date) => {
                                setShowFinishPicker(Platform.OS === 'ios');
                                if (date) setFinishDate(date);
                            }}
                        />
                    )}

                    <TouchableOpacity style={styles.submitButtonInBox} onPress={handleRegister}>
                        <Text style={styles.submitText}>도서 등록</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 40,
    backgroundColor: '#f4f4f4',
  },
  backBtn: {
    marginBottom: 18,
    alignSelf: 'flex-start',
  },
    scrollContent: {
        flexGrow: 1, // ScrollView 내용이 컨테이너를 채우도록 설정
        paddingHorizontal: 20, // ScrollView 좌우 패딩
        paddingBottom: 40, // ScrollView 하단 패딩
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 20,
        marginTop: 25,
        textAlign: 'center',
        color: '#333',
    },
    formBox: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20, // 박스 내부 패딩
        // marginHorizontal: 20, // ScrollView padding으로 대체
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    label: {
        fontSize: 14,
        marginBottom: 6, // 라벨 아래 여백
        // marginHorizontal 제거 (formBox padding 사용)
        color: '#444',
    },
    inputBase: { // 모든 TextInput에 공통으로 적용될 기본 스타일
        borderWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 6,
        marginBottom: 16, // 입력창 아래 여백
        backgroundColor: '#fff',
        fontSize: 14,
        color: '#333',
    },
    multilineInput: { // 여러 줄 입력창에 추가될 스타일 (스크롤 가능하게 함)
        height: 40, // 고정 높이
        textAlignVertical: 'top', // Android에서 텍스트 시작 위치 상단으로
    },
    dateRowInBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    dateButton: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        backgroundColor: '#e0ddfa',
        marginHorizontal: 4,
    },
    dateText: {
        textAlign: 'center',
        fontSize: 14,
        color: '#333',
    },
    submitButtonInBox: {
        marginTop: 12,
        backgroundColor: '#BD9EFF',
        paddingVertical: 12,
        borderRadius: 8,
    },
    submitText: {
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
    },
});