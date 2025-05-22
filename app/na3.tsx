import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator, // ActivityIndicator를 임포트합니다.
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AIChatScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 추가

  const scrollViewRef = useRef(null);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { sender: 'user', text: input };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsLoading(true); // 메시지 전송 시 로딩 시작

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
    } finally {
      setIsLoading(false); // 응답 (성공 또는 실패) 후 로딩 종료
    }
  };

  const handleRecommend = () => {
    router.push('/bookrecommend');
  };

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isLoading]); // messages와 isLoading이 변경될 때마다 스크롤

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

            {/* 로딩 표시기 버블 */}
            {isLoading && (
              <View style={[styles.bubble, styles.aiBubble, styles.loadingBubble]}>
                {/* 옵션 1: 간단한 "..." 텍스트 */}
                <Text style={styles.msgText}>. . .</Text>
                {/* 옵션 2: ActivityIndicator (임포트 필요) */}
                {/* <ActivityIndicator size="small" color="#333" /> */}
              </View>
            )}
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
            editable={!isLoading} // 로딩 중일 때 입력 비활성화
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={isLoading}>
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
    paddingTop: 30,
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
  loadingBubble: {
    opacity: 0.7, // 로딩 버블을 약간 투명하게 만듭니다.
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