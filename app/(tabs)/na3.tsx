import React, { useState, useEffect, useRef } from 'react'; // useEffect와 useRef 임포트 추가
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

  // ScrollView 인스턴스에 접근하기 위한 ref 생성
  const scrollViewRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');

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
      setMessages(prev => [...prev, { sender: 'ai', text: 'AI 응답을 가져오는데 실패했습니다.' }]);
    }
    // 메시지가 추가되면 useEffect가 호출되어 스크롤됩니다.
  };

  const handleRecommend = () => {
     router.push('/bookrecommend');
  };

  // messages 상태가 변경될 때마다 스크롤 최하단으로 이동
  useEffect(() => {
    // scrollViewRef.current가 존재하는지 확인 (컴포넌트 마운트 후)
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true }); // animated: true로 부드럽게 스크롤
    }
  }, [messages]); // messages 배열을 의존성 배열로 설정

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.push('/main')} style={styles.back}>
        <Text style={{ color: '#666' }}>← 뒤로가기</Text>
      </TouchableOpacity>

      <Text style={styles.title}>🤖 AI 사서의 도서 추천</Text>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        <View style={styles.chatBox}>
          {/* ScrollView에 ref 연결 */}
          <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContainer}>
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
        </View>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#aaa"
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>전송</Text>
          </TouchableOpacity>
        </View>

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
  chatBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    marginBottom: 10,
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
    // justifyContent: 'flex-end', // 이 라인은 이전 수정에서 이미 제거되었습니다.
  },
  bubble: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
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
    backgroundColor: '#BD9EFF',
    borderRadius: 10,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendText: {
    color: '#fff',
    fontSize: 16,
  },
  recommendBtn: {
    backgroundColor: '#BD9EFF',
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