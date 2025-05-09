import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get(
          `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/lists/${postId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setPost(res.data.data);
      } catch (error) {
        console.error('❌ 게시글 상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        const res = await axios.get(
          `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setComments(res.data.data);
      } catch (error) {
        console.error('❌ 댓글 목록 불러오기 실패:', error);
      }
    };

    fetchPost();
    fetchComments();
  }, []);

  const handleReportPost = () => {
    Alert.alert('신고 확인', '이 게시글을 정말로 신고하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '신고',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.post(
              `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/reports`,
              {},
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            Alert.alert('신고 완료', '해당 게시글이 신고되었습니다.');
          } catch (error) {
            console.error('❌ 게시글 신고 실패:', error);
            Alert.alert('신고 실패', '이미 신고했거나 오류가 발생했습니다.');
          }
        },
      },
    ]);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;

  if (!post)
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>게시글을 불러오지 못했습니다.</Text>
      </View>
    );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/na4')}>
          <Text style={styles.backText}>← 뒤로가기</Text>
        </TouchableOpacity>
        <View style={styles.rightButtons}>
          <TouchableOpacity style={styles.reportBtnWrap} onPress={handleReportPost}>
            <Text style={styles.reportBtn}>🚨 신고</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => {
              Alert.alert('삭제 확인', '정말로 이 게시글을 삭제하시겠습니까?', [
                { text: '취소', style: 'cancel' },
                {
                  text: '삭제',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      const token = await SecureStore.getItemAsync('accessToken');
                      await axios.delete(`http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}`, {
                        headers: { Authorization: `Bearer ${token}` },
                      });
                      router.replace('/(tabs)/na4');
                    } catch (error) {
                      console.error('❌ 게시글 삭제 실패:', error);
                      alert('삭제 권한이 없거나 오류가 발생했습니다.');
                    }
                  },
                },
              ]);
            }}
          >
            <Text style={styles.deleteText}>🗑 게시글 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.title}>{post.title}</Text>
      <Text style={styles.author}>작성자: {post.author}</Text>

      <View style={styles.contentBox}>
        <Text style={styles.contents}>{post.contents}</Text>
      </View>

      <Text style={styles.commentTitle}>💬 댓글</Text>
      {comments.length === 0 ? (
        <Text style={styles.noComment}>아직 댓글이 없습니다.</Text>
      ) : (
        comments.map((comment) => (
          <View key={comment.commentId} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentUser}>
                {comment.nickName} · Lv.{comment.rank} · 리뷰 {comment.reviewCount}개
              </Text>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('신고 확인', '이 댓글을 신고하시겠습니까?', [
                    { text: '취소', style: 'cancel' },
                    {
                      text: '신고',
                      style: 'destructive',
                      onPress: async () => {
                        try {
                          const token = await SecureStore.getItemAsync('accessToken');
                          await axios.post(
                            `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/comments/${comment.commentId}/reports`,
                            {},
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          Alert.alert('신고 완료', '해당 댓글이 신고되었습니다.');
                        } catch (error) {
                          console.error('❌ 댓글 신고 실패:', error);
                          Alert.alert('신고 실패', '이미 신고했거나 오류가 발생했습니다.');
                        }
                      },
                    },
                  ]);
                }}
              >
                <Text style={styles.commentReport}>🚨</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.commentContent}>{comment.contents}</Text>
            <Text style={styles.commentDate}>{new Date(comment.date).toLocaleString()}</Text>

            <TouchableOpacity
              style={{ marginTop: 4 }}
              onPress={() => {
                Alert.alert('삭제 확인', '이 댓글을 삭제하시겠습니까?', [
                  { text: '취소', style: 'cancel' },
                  {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        const token = await SecureStore.getItemAsync('accessToken');
                        await axios.delete(
                          `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/comments/${comment.commentId}`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        const res = await axios.get(
                          `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                          { headers: { Authorization: `Bearer ${token}` } }
                        );
                        setComments(res.data.data);
                      } catch (error) {
                        console.error('❌ 댓글 삭제 실패:', error);
                        alert('댓글 삭제 중 오류가 발생했습니다.');
                      }
                    },
                  },
                ]);
              }}
            >
              <Text style={{ color: '#ff4d4d', fontSize: 12, textAlign: 'right' }}>🗑 댓글 삭제</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      <View style={styles.commentBox}>
        <TextInput
          style={styles.commentInput}
          placeholder="댓글을 입력하세요"
          value={commentInput}
          onChangeText={setCommentInput}
          multiline
        />
        <TouchableOpacity
          style={styles.commentSubmit}
          onPress={async () => {
            if (!commentInput.trim()) return;
            try {
              const token = await SecureStore.getItemAsync('accessToken');
              await axios.post(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                { contents: commentInput },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setCommentInput('');
              const res = await axios.get(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setComments(res.data.data);
            } catch (err) {
              console.error('❌ 댓글 작성 실패:', err);
            }
          }}
        >
          <Text style={styles.submitText}>등록</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 16,
    color: '#6b4eff',
  },
  reportBtnWrap: {
    justifyContent: 'center',
    backgroundColor: '#ffecec',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 4,
  },
  reportBtn: {
    color: '#ff3b30',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteBtn: {
    backgroundColor: '#ff4d4d',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 10,
  },
  author: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  contentBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  contents: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noComment: {
    fontSize: 14,
    color: '#999',
  },
  commentItem: {
    backgroundColor: '#f0f0f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentUser: {
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 4,
  },
  commentReport: {
    fontSize: 16,
    color: '#ff3b30',
    paddingLeft: 8,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  commentDate: {
    fontSize: 11,
    color: '#888',
    textAlign: 'right',
  },
  commentBox: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 24,
  },
  commentInput: {
    backgroundColor: '#f0f0f0',
    padding: 14,
    borderRadius: 10,
    fontSize: 14,
    minHeight: 70,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentSubmit: {
    backgroundColor: '#6b4eff',
    paddingVertical: 14,
    borderRadius: 10,
  },
  submitText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  errorText: {
    marginTop: 100,
    textAlign: 'center',
    color: 'red',
  },
});
