import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';

export default function SignupScreen() {
    const router = useRouter();

    const [nickname, setNickname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [genre, setGenre] = useState('');
    const [job, setJob] = useState('');
    const [birth, setBirth] = useState('');
    const [isDatePickerVisible, setDatePickerVisible] = useState(false);

    const showDatePicker = () => setDatePickerVisible(true);
    const hideDatePicker = () => setDatePickerVisible(false);

    const handleConfirm = (date) => {
        const formatted = date.toISOString().split('T')[0];
        setBirth(formatted);
        hideDatePicker();
    };

    const handleRegister = async () => {
        if (!nickname || !password || !confirmPassword || !phone || !genre || !job || !birth) {
            Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('입력 오류', '비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            const res = await axios.post('http://ceprj.gachon.ac.kr:60001/api/api/v1/member/register', {
                nickName: nickname,
                password,
                phoneNumber: phone,
                genre,
                job,
                birth,
            });

            console.log('✅ 회원가입 성공:', res.data);
            Alert.alert('회원가입 완료', '로그인 화면으로 이동합니다.');
            router.replace('/login');
        } catch (error: any) {
            console.error('❌ 회원가입 실패:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || '회원가입에 실패했어요. 다시 시도해주세요.';
            Alert.alert('회원가입 실패', errorMessage);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.banner}>
                     <Text style={styles.bannerText}>회원가입</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>닉네임</Text>
                    <TextInput
                        placeholder="입력"
                        value={nickname}
                        onChangeText={setNickname}
                        style={styles.input}
                    />

                    <Text style={styles.label}>비밀번호</Text>
                    <TextInput
                        placeholder="입력"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={styles.input}
                    />

                    <Text style={styles.label}>비밀번호 확인</Text>
                    <TextInput
                        placeholder="비밀번호 다시 입력"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        style={styles.input}
                    />

                    <Text style={styles.label}>전화번호</Text>
                    <TextInput
                        placeholder="010-xxxx-xxxx"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        style={styles.input}
                    />

                    <Text style={styles.label}>선호 장르</Text>
                    <TextInput
                        placeholder="입력"
                        value={genre}
                        onChangeText={setGenre}
                        style={styles.input}
                    />

                    <Text style={styles.label}>직업</Text>
                    <TextInput
                        placeholder="입력"
                        value={job}
                        onChangeText={setJob}
                        style={styles.input}
                    />

                    <Text style={styles.label}>생년월일</Text>
                    <TouchableOpacity onPress={showDatePicker} style={styles.dateInput}>
                        <Text style={{ color: birth ? '#000' : '#aaa' }}>
                            {birth ? birth : '생년월일을 선택하세요'}
                        </Text>
                    </TouchableOpacity>

                    <DateTimePickerModal
                        isVisible={isDatePickerVisible}
                        mode="date"
                        onConfirm={handleConfirm}
                        onCancel={hideDatePicker}
                        maximumDate={new Date()}
                        locale='ko'
                    />

                    <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
                        <Text style={styles.registerText}>회원가입</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8f7fa',
    },
    scrollContent: {
        flexGrow: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 40,
        justifyContent: 'center', // 내용이 짧을 때 중앙 정렬
    },
    banner: {
        backgroundColor: '#DCDCDC',
        paddingVertical: 15,
        paddingHorizontal: 20, // 배너 내부 좌우 패딩
        borderRadius: 12,
        marginBottom: 30,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        alignItems: 'center', // 텍스트 중앙 정렬
        // width는 ScrollView padding으로 결정됨
    },
    bannerText: {
        color: '#333',
        fontSize: 20,
        fontWeight: 'bold',
    },
    form: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20, // 폼 박스 내부 패딩
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        // width는 ScrollView padding으로 결정됨
    },
    label: {
        fontSize: 14,
        marginBottom: 4,
        color: '#444',
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    dateInput: {
        height: 40,
        borderWidth: 1,
        borderColor: '#ddd',
        marginBottom: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
        backgroundColor: '#fff',
        justifyContent: 'center',
    },
    registerButton: {
        backgroundColor: '#6b4eff',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    registerText: {
        fontWeight: 'bold',
        color: '#fff',
    },
});