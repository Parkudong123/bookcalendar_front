import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { sender: 'ai', text: '나는 요즘 들어서 자기계발 서적에 관심을 가지기 시작했어. 하지만 자기계발 서적 안에 어떤 한 영역들이 있는지를 모르겠어' },
    { sender: 'ai', text: '자기계발 영역에 관심이 가는구나! 자기계발 안에는 다음과 같은 영역들이 존재해!\n\n1. 시간 관리\n2. 동기부여 & 성공 철학\n3. 리더십 & 인간 관계\n4. 경제 & 재테크\n\n등등... 어떤 영역이 가장 관심이 가? 🤔' },
    { sender: 'user', text: '위 예시 중에서 1번 항목에 대해 더욱 자세하게 설명해줄래?' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
  };

  return (
    <View style={styles.container}>
      {/* 🔙 뒤로가기 */}
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.back}>
        <Text style={{ color: '#666' }}>← 돌아가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🤖 AI 사서의 도서 추천</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={80}
      >
        <ScrollView contentContainerStyle={styles.chatContainer}>
          {messages.map((msg, idx) => (
            <View
              key={idx}
              style={[
                styles.bubble,
                msg.sender === 'user' ? styles.userBubble : styles.aiBubble,
              ]}
            >
              <Text style={styles.msgText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* ✉️ 입력창 + 보내기 버튼 */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>전송</Text>
          </TouchableOpacity>
        </View>

        {/* 📚 도서 추천 받기 버튼 */}
        <TouchableOpacity style={styles.recommendBtn}>
          <Text style={styles.recommendText}>도서 추천 받기</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f7fa',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  back: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chatContainer: {
    paddingBottom: 20,
  },
  bubble: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
    maxWidth: '85%',
  },
  aiBubble: {
    backgroundColor: '#eee',
    alignSelf: 'flex-start',
  },
  userBubble: {
    backgroundColor: '#d8d1ff',
    alignSelf: 'flex-end',
  },
  msgText: {
    fontSize: 14,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  sendBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#6b4eff',
    borderRadius: 10,
  },
  sendText: {
    color: '#fff',
    fontSize: 18,
  },
  recommendBtn: {
    backgroundColor: '#6b4eff',
    borderRadius: 10,
    paddingVertical: 12,
    marginTop: 12,
    marginBottom: 20,
  },
  recommendText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
});
