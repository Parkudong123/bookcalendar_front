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
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);

    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await axios.post(
        'http://ceprj.gachon.ac.kr:60001/api/api/v1/chatbot/chat',
        { chatMessage: input },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const aiResponse = res.data.data;
      setMessages(prev => [...prev, { sender: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error('❌ AI 응답 실패:', error.response?.data || error);
    }

    setInput('');
  };

  const handleRecommend = () => {
    router.push('/bookrecommend');
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
        <TouchableOpacity style={styles.recommendBtn} onPress={handleRecommend}>
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
