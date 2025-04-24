import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import axios from 'axios';

export default function SignupScreen() {
  const router = useRouter();

  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [genre, setGenre] = useState('');
  const [job, setJob] = useState('');
  const [birth, setBirth] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);

  const showDatePicker = () => setDatePickerVisible(true);
  const hideDatePicker = () => setDatePickerVisible(false);

  const handleConfirm = (date: Date) => {
    const formatted = date.toISOString().split('T')[0];
    setBirth(formatted);
    hideDatePicker();
  };

  const handleRegister = async () => {
    if (!nickname || !password || !phone || !genre || !job || !birth) {
      Alert.alert('입력 오류', '모든 항목을 입력해주세요.');
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
    } catch (error) {
      console.error('❌ 회원가입 실패:', error);
      Alert.alert('회원가입 실패', '다시 시도해주세요.');
    }
  };

  return (
    <View style={styles.container}>
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
        <TouchableOpacity onPress={showDatePicker} style={styles.input}>
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
        />

        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerText}>회원가입</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fa',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
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
    justifyContent: 'center',
  },
  registerButton: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  registerText: {
    fontWeight: 'bold',
    color: '#666',
  },
});
