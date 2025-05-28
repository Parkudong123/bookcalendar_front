import React, { useState } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Text,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router'; // useLocalSearchParams를 임포트합니다.
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function AddPost() {
    const [title, setTitle] = useState('');
    const [contents, setContents] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams(); // CommunityScreen에서 전달된 파라미터를 가져옵니다.

    const handleSubmit = async () => {
        if (isSubmitting) {
            return;
        }

        if (!title.trim() || !contents.trim()) {
            Alert.alert('입력 오류', '제목과 본문을 모두 작성해주세요.');
            return;
        }

        setIsSubmitting(true);

        try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.post(
                'http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts',
                {
                    title: title.trim(),
                    contents: contents.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            Alert.alert('게시물 등록 완료', '새 게시물이 성공적으로 등록되었습니다.', [
                {
                    text: '확인',
                    onPress: () => {
                        // CommunityScreen에서 'onPostAdded: true' 파라미터를 전달받았다면
                        // router.back()을 호출하여 이전 화면으로 돌아가고,
                        // useFocusEffect가 해당 화면을 갱신하도록 합니다.
                        if (params.onPostAdded) {
                            router.back();
                        } else {
                            // 혹시 파라미터가 없거나 다른 경로로 왔다면, 기본적으로 na4로 이동
                            router.push('/na4');
                        }
                    },
                },
            ]);
        } catch (error: any) { // 타입 에러를 피하기 위해 'any'를 사용합니다.
            console.error('❌ 게시물 등록 실패:', error.response?.data || error);
            const errorMessage = error.response?.data?.message || '게시물 등록 중 오류가 발생했습니다.';
            Alert.alert('등록 실패', errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <View style={styles.mainContainer}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.keyboardAvoidingView}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
            >
                {/* 뒤로가기 버튼도 router.back()을 사용하면 자연스럽게 이전 화면으로 돌아갑니다. */}
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Text style={styles.backBtn}>← 뒤로가기</Text>
                </TouchableOpacity>

                <Text style={styles.header}>📝 게시물 작성</Text>

                <TextInput
                    style={styles.input}
                    placeholder="제목을 입력하세요"
                    value={title}
                    onChangeText={setTitle}
                />
                <TextInput
                    style={[styles.input, styles.bodyInput]}
                    placeholder="본문을 입력하세요"
                    value={contents}
                    onChangeText={setContents}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                />

                <TouchableOpacity
                    style={[styles.button, isSubmitting && styles.buttonDisabled]}
                    onPress={handleSubmit}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>등록</Text>
                    )}
                </TouchableOpacity>

            </KeyboardAvoidingView>

            {isSubmitting && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingOverlayText}>등록 중...</Text>
                </View>
            )}

        </View>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: '#f8f7fa',
    },
    keyboardAvoidingView: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80,
        justifyContent: 'flex-start',
    },
    backBtn: {
        marginBottom: 20,
        alignSelf: 'flex-start',
    },
    header: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 30,
        textAlign: 'center',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#fff',
    },
    bodyInput: {
        height: 180,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#BD9EFF',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonDisabled: {
        backgroundColor: '#a0a0a0',
        opacity: 0.7,
    },
    buttonText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 999,
    },
    loadingOverlayText: {
        color: '#fff',
        marginTop: 10,
        fontSize: 16,
    },
});