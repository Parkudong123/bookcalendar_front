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
  Image,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react'; // useCallback 임포트 추가


import BronzeMedal from '../../image/bronze.png';
import SilverMedal from '../../image/silver.png';
import GoldMedal from '../../image/gold.png';
import UnrankMedal from '../../image/unrank.png';

export default function PostDetailScreen() {
  const { postId } = useLocalSearchParams();
  const router = useRouter();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentInput, setCommentInput] = useState('');
  const [isScrapped, setIsScrapped] = useState(false);

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [liking, setLiking] = useState(false);


  const getMedalImage = (reviewCount: number | undefined | null) => {
    if (reviewCount === undefined || reviewCount === null || reviewCount < 0) {
      return UnrankMedal;
    }
    if (reviewCount >= 15) {
      return GoldMedal;
    } else if (reviewCount >= 10) {
      return SilverMedal;
    } else if (reviewCount >= 5) {
      return BronzeMedal;
    } else {
        return UnrankMedal;
    }
  };

  // 데이터 가져오는 로직을 useFocusEffect로 이동
  useFocusEffect(
    useCallback(() => { // useCallback으로 감싸기
      const fetchPostData = async () => {
        setLoading(true);
        try {
          const token = await SecureStore.getItemAsync('accessToken');

          // 게시글 상세 정보 및 isLiked 상태 가져오기
          const postRes = await axios.get(
              `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/lists/${postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
          );
          const postData = postRes.data.data;

          setPost(postData);
          // API 응답에서 isLiked 값을 추출하여 상태 설정
          const isLikedFromApi = postData?.isLiked || false;
          setIsLiked(isLikedFromApi);

          // 총 좋아요 수 가져오기
          const likeCountRes = await axios.get(
              `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/like/${postId}`,
               { headers: { Authorization: `Bearer ${token}` } }
          );
           setLikeCount(likeCountRes.data.data || 0);


          // 댓글 목록 가져오기
          const commentsRes = await axios.get(
              `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
              { headers: { Authorization: `Bearer ${token}` } }
          );
          setComments(commentsRes.data.data);

        } catch (error) {
            console.error('❌ 데이터 불러오기 실패:', error);
            Alert.alert('오류', '게시글 정보를 불러오는데 실패했습니다.');
            setPost(null);
            setComments([]);
            setIsLiked(false);
            setLikeCount(0);
        } finally {
            setLoading(false);
        }
      };

      fetchPostData();

      return () => {
          // 정리 함수
      };
    }, [postId]) // postId가 변경될 때마다 useFocusEffect 다시 실행
  );


  const handleDeleteComment = async (commentId: number) => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      try {
        await axios.delete(
          `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/comments/${commentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (err) {
        try {
          await axios.delete(
            `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments/${commentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
        } catch (err2) {
          Alert.alert('삭제 실패', '댓글을 삭제할 권한이 없거나 오류가 발생했습니다.');
          console.error('❌ 댓글 삭제 시도 2 실패:', err2);
          return;
        }
      }

      const tokenRefetch = await SecureStore.getItemAsync('accessToken');
      const res = await axios.get(
        `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
        { headers: { Authorization: `Bearer ${tokenRefetch}` } }
      );
      setComments(res.data.data);

    } catch (error) {
      console.error('❌ 댓글 삭제 실패:', error);
      Alert.alert('오류', '댓글 삭제 중 문제가 발생했습니다.');
    }
  };

    const handleLikeToggle = async () => {
        if (liking) return;
        setLiking(true);

        const prevIsLiked = isLiked;
        const prevLikeCount = likeCount;

        const newIsLiked = !prevIsLiked;
        const optimisticNewLikeCount = newIsLiked ? prevLikeCount + 1 : prevLikeCount - 1;

        setIsLiked(newIsLiked);
        setLikeCount(optimisticNewLikeCount >= 0 ? optimisticNewLikeCount : 0);

        try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.post(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/like/${postId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            try {
                 const updatedLikeCountRes = await axios.get(
                     `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/like/${postId}`,
                      { headers: { Authorization: `Bearer ${token}` } }
                 );
                 setLikeCount(updatedLikeCountRes.data.data || 0);

            } catch (getCountError: any) {
                 console.error('❌ 좋아요 수 갱신 GET 요청 실패:', getCountError);
            }

        } catch (error: any) {
            console.error('❌ 좋아요/취소 POST 요청 실패:', error);
            const errorMessage = error.response?.data?.message || '좋아요/취소 처리 중 오류가 발생했습니다.';
            Alert.alert('오류', errorMessage);

             setIsLiked(prevIsLiked);
             setLikeCount(prevLikeCount);

        } finally {
            setLiking(false);
        }
    };


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
              { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert('신고 완료', '해당 게시글이 신고되었습니다.');
          } catch (error: any) {
            console.error('❌ 게시글 신고 실패:', error);
            const errorMessage = error.response?.data?.message || '이미 신고했거나 오류가 발생했습니다.';
            Alert.alert('신고 실패', errorMessage);
          }
        },
      },
    ]);
  };

  const handleDeletePost = () => {
    Alert.alert('삭제 확인', '정말로 이 게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const token = await SecureStore.getItemAsync('accessToken');
            await axios.delete(
              `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            Alert.alert('삭제 완료', '게시글이 삭제되었습니다.');
            router.replace('/(tabs)/na4');
          } catch (error: any) {
            console.error('❌ 게시글 삭제 실패:', error);
            const errorMessage = error.response?.data?.message || '삭제 권한이 없거나 오류가 발생했습니다.';
            Alert.alert('삭제 실패', errorMessage);
          }
        },
      },
    ]);
  };


  if (loading) return <ActivityIndicator style={{ marginTop: 100 }} />;
  if (!post) return <Text style={{ textAlign: 'center', marginTop: 100 }}>게시글을 불러오지 못했습니다.</Text>;


  return (
    <ScrollView contentContainerStyle={styles.scrollContent} style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← 뒤로가기</Text>
        </TouchableOpacity>
        <View style={styles.rightButtons}>
          <TouchableOpacity onPress={handleReportPost} style={styles.reportBtnWrap}>
            <Text style={styles.reportBtn}>🚨 신고</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeletePost} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>🗑 삭제</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.headerRow}>
        <Text style={styles.title}>{post?.title}</Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity onPress={handleLikeToggle} disabled={liking} style={styles.likeButton}>
            <Text style={{ fontSize: 22, color: isLiked ? '#ff6b6b' : '#ccc' }}>
                {isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.likeCount}>{likeCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={async () => {
            try {
              const token = await SecureStore.getItemAsync('accessToken');
              await axios.post(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/scraps`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setIsScrapped(true);
              Alert.alert('스크랩 완료', '이 게시글이 스크랩되었습니다.');
            } catch (error: any) {
              console.error('❌ 스크랩 실패:', error);
              const errorMessage = error.response?.data?.message || '이미 스크랩했거나 오류가 발생했습니다.';
              Alert.alert('스크랩 실패', errorMessage);
            }
          }} style={styles.scrabButton}>
            <Text style={{ fontSize: 22, color: isScrapped ? '#FFD700' : '#ccc' }}>⭐</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.authorRow}>
          <Text style={styles.author}>작성자 : {post?.author}</Text>
          {post?.reviewCount !== undefined && post?.reviewCount !== null && (
              <>
                 <Image
                    source={getMedalImage(post.reviewCount)}
                    style={styles.medalIcon}
                />
                {typeof post?.rank === 'number' && (
                    <Text style={styles.rankText}>
                         (상위 {post.rank}% 이용자)
                    </Text>
                )}
              </>
          )}
      </View>


      <View style={styles.contentBox}>
        <Text style={styles.contents}>{post?.contents}</Text>
      </View>

      <Text style={styles.commentTitle}>💬 댓글</Text>
      {comments.length === 0 ? (
        <Text style={styles.noComment}>아직 댓글이 없습니다.</Text>
      ) : (
        comments.map((comment: any) => (
          <View key={comment.commentId} style={styles.commentItem}>
            <View style={styles.commentHeader}>
              <View style={styles.commentAuthorRow}>
                <Text style={styles.commentUser}>{comment.nickName}</Text>
                {comment.reviewCount !== undefined && comment.reviewCount !== null && (
                    <>
                         <Image
                            source={getMedalImage(comment.reviewCount)}
                            style={styles.medalIcon}
                        />
                        {typeof comment.rank === 'number' && (
                           <Text style={styles.rankText}>
                             (상위 {comment.rank}% 이용자)
                           </Text>
                        )}
                    </>
                )}
              </View>
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
                        } catch (error: any) {
                          console.error('❌ 댓글 신고 실패:', error);
                           const errorMessage = error.response?.data?.message || '이미 신고했거나 오류가 발생했습니다.';
                          Alert.alert('신고 실패', errorMessage);
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
                    onPress: () => handleDeleteComment(comment.commentId),
                  },
                ]);
              }}
            >
              <Text style={styles.deleteComment}>🗑 댓글 삭제</Text>
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
            if (!commentInput.trim()) {
               Alert.alert('입력 오류', '댓글 내용을 입력해주세요.');
               return;
            }
            try {
              const token = await SecureStore.getItemAsync('accessToken');
              await axios.post(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                { contents: commentInput },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setCommentInput('');
              const tokenRefetch = await SecureStore.getItemAsync('accessToken');
              const res = await axios.get(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                { headers: { Authorization: `Bearer ${tokenRefetch}` } }
              );
              setComments(res.data.data);

            } catch (err) {
              console.error('❌ 댓글 작성 실패:', err);
              Alert.alert('작성 실패', '댓글 작성 중 오류가 발생했습니다.');
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
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContent: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 40 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rightButtons: { flexDirection: 'row', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 16, color: '#6b4eff' },
  reportBtnWrap: { backgroundColor: '#ffecec', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5, marginRight: 4 },
  reportBtn: { color: '#ff3b30', fontWeight: 'bold', fontSize: 13 },
  deleteBtn: { backgroundColor: '#ff4d4d', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  deleteText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  title: { fontSize: 22, fontWeight: 'bold', flexShrink: 1, marginRight: 10 },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  commentAuthorRow: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, marginRight: 8 },
  author: { fontSize: 14, color: '#666', marginRight: 2 },
  commentUser: { fontWeight: 'bold', fontSize: 13, marginBottom: 4, marginRight: 1 },
  rankText: { fontSize: 12, color: '#888', marginRight: 4, marginLeft: 2 },
  medalIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    resizeMode: 'contain',
    marginLeft: 1,
    marginRight: 4,
  },
  contentBox: { backgroundColor: '#f5f5f5', borderRadius: 10, padding: 16, marginBottom: 24 },
  contents: { fontSize: 15, color: '#333' },
  commentTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  noComment: { fontSize: 14, color: '#999' },
  commentItem: { backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginBottom: 12 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  commentReport: { fontSize: 16, color: '#ff3b30', paddingLeft: 8 },
  commentContent: { fontSize: 14, color: '#333', marginBottom: 4 },
  commentDate: { fontSize: 11, color: '#888', textAlign: 'right' },
  deleteComment: { color: '#ff4d4d', fontSize: 12, textAlign: 'right' },
  commentBox: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 24 },
  commentInput: { backgroundColor: '#f0f0f0', padding: 14, borderRadius: 10, fontSize: 14, minHeight: 70, textAlignVertical: 'top', marginBottom: 12 },
  commentSubmit: { backgroundColor: '#6b4eff', paddingVertical: 14, borderRadius: 10 },
  submitText: { color: '#fff', textAlign: 'center', fontWeight: 'bold', fontSize: 16 },

  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  scrabButton: {
     marginLeft: 0,
  }
});