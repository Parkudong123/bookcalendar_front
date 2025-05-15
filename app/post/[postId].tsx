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
    Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';


import BronzeMedal from '../../image/bronze1.png';
import SilverMedal from '../../image/silver1.png';
import GoldMedal from '../../image/gold1.png';
// UnrankMedal 이미지가 사용되지 않지만 임포트되어 있다면 유지
// import UnrankMedal from '../../image/unrank1.png';


export default function PostDetailScreen() {
    const { postId } = useLocalSearchParams();
    const router = useRouter();
    const [post, setPost] = useState<any>(null);
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [commentInput, setCommentInput] = useState('');
    const [isScrapped, setIsScrapped] = useState(false);

    const [isLiked, setIsLiked] = useState(false);
    const [likeCount, setLikeCount] = useState(0);
    const [liking, setLiking] = useState(false);


    // reviewCount가 undefined, null, 0 미만일 경우 null 반환하도록 수정
    const getMedalImage = (reviewCount: number | undefined | null) => {
         if (reviewCount === undefined || reviewCount === null || reviewCount < 5) {
             return null;
         }
         if (reviewCount >= 15) {
             return GoldMedal;
         } else if (reviewCount >= 10) {
             return SilverMedal;
         } else if (reviewCount >= 5) {
             return BronzeMedal;
         }
         return null; // 이 부분은 사실상 도달하지 않지만 안전성을 위해 남겨둠
     };

    useFocusEffect(
        useCallback(() => {
            const fetchPostData = async () => {
                setLoading(true);
                try {
                    const token = await SecureStore.getItemAsync('accessToken');
                     if (!token) {
                         Alert.alert('로그인 필요', '게시글 정보를 불러오려면 로그인이 필요합니다.');
                         router.replace('/login');
                         return;
                     }


                    // 게시글 상세 정보 가져오기
                    const postRes = await axios.get(
                        `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/lists/${postId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    const postData = postRes.data.data;
                    setPost(postData);

                    // 좋아요 상태 및 개수 가져오기
                     // API 응답에서 좋아요 상태 가져오기 (postRes에 포함될 수 있음)
                     const isLikedFromApi = postData?.clicked || false; // 'clicked' 필드 확인
                     setIsLiked(isLikedFromApi);
                     // 좋아요 개수는 별도 API 호출 또는 postRes에 포함된 값 사용
                     // 현재 코드는 별도 GET 요청 사용 (효율성은 떨어지나 동작하는대로 유지)
                    const likeCountRes = await axios.get(
                        `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/like/${postId}`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setLikeCount(likeCountRes.data.data || 0); // 숫자 0으로 초기화


                    // 댓글 목록 가져오기
                    const commentsRes = await axios.get(
                        `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    setComments(commentsRes.data.data);

                     // 스크랩 상태 가져오기 (postRes에 포함될 수도 있음)
                     // API 응답에 스크랩 상태 필드가 있다면 여기서 업데이트
                     // 예: const isScrappedFromApi = postData?.isScrapped || false;
                     // setIsScrapped(isScrappedFromApi);

                     // TODO: 스크랩 상태를 불러오는 API 호출 또는 게시글 정보에 포함된 데이터 확인 필요

                } catch (error: any) {
                    console.error('❌ 데이터 불러오기 실패:', error); // 데이터 불러오기 실패는 로그 유지 권장
                    Alert.alert('오류', '게시글 정보를 불러오는데 실패했습니다.');
                    setPost(null);
                    setComments([]);
                    setIsLiked(false);
                    setLikeCount(0);
                    setIsScrapped(false); // 오류 발생 시 스크랩 상태 초기화
                } finally {
                    setLoading(false);
                }
            };

            fetchPostData();

            return () => {
                // cleanup
            };
        }, [postId]) // postId가 변경될 때마다 다시 불러오도록 의존성 추가
    );


    const handleDeleteComment = async (commentId: number) => {
        Alert.alert('삭제 확인', '이 댓글을 삭제하시겠습니까?', [
            { text: '취소', style: 'cancel' },
            {
                text: '삭제',
                style: 'destructive',
                onPress: async () => { // async 추가
                    try {
                        const token = await SecureStore.getItemAsync('accessToken');
                         if (!token) {
                             Alert.alert('로그인 필요', '댓글을 삭제하려면 로그인이 필요합니다.');
                             router.replace('/login');
                             return;
                         }
                        // API endpoint 수정 (기존 코드에서 2번 시도하는 로직을 1번으로 변경)
                         // 정확한 댓글 삭제 API 엔드포인트와 메소드를 확인해야 합니다.
                         // 예시: DELETE /api/v1/community/comments/{commentId}
                         // 또는: DELETE /api/v1/community/posts/{postId}/comments/{commentId}
                        await axios.delete(
                             `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/comments/${commentId}`, // 확인 필요
                             { headers: { Authorization: `Bearer ${token}` } }
                        );

                        // 삭제 성공 시 댓글 목록 갱신
                         // 현재 댓글 목록에서 삭제된 댓글 제거하여 UI 즉시 업데이트 (옵티미스틱 업데이트)
                         setComments(comments.filter(comment => comment.commentId !== commentId));
                         Alert.alert('삭제 완료', '댓글이 삭제되었습니다.');

                         // 또는 댓글 목록 전체를 다시 불러와서 갱신 (안정적이지만 느림)
                         // const tokenRefetch = await SecureStore.getItemAsync('accessToken');
                         // const res = await axios.get(
                         //     `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                         //     { headers: { Authorization: `Bearer ${tokenRefetch}` } }
                         // );
                         // setComments(res.data.data);


                    } catch (error: any) {
                        console.error('❌ 댓글 삭제 실패:', error); // 개발 중에는 로그 유지 권장
                         if (error.response?.status === 401) {
                             Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                             router.replace('/login');
                         } else {
                             const errorMessage = error.response?.data?.message || '댓글 삭제 중 문제가 발생했습니다.';
                             Alert.alert('삭제 실패', errorMessage);
                         }
                    }
                },
            },
        ]);
    };


    const handleLikeToggle = async () => {
        if (liking) return;
        setLiking(true);

        const prevIsLiked = isLiked;
        const prevLikeCount = likeCount;

        // 옵티미스틱 업데이트: UI를 먼저 변경
        const newIsLiked = !prevIsLiked;
        const optimisticNewLikeCount = newIsLiked ? prevLikeCount + 1 : prevLikeCount - 1;
        setIsLiked(newIsLiked);
        setLikeCount(optimisticNewLikeCount >= 0 ? optimisticNewLikeCount : 0);

        try {
            const token = await SecureStore.getItemAsync('accessToken');
             if (!token) {
                 Alert.alert('로그인 필요', '좋아요/취소는 로그인 후 가능합니다.');
                 router.replace('/login');
                 // 옵티미스틱 업데이트 되돌리기
                 setIsLiked(prevIsLiked);
                 setLikeCount(prevLikeCount);
                 setLiking(false);
                 return;
             }

            // 좋아요/취소 API 호출
            await axios.post( // 좋아요/취소 API가 POST 메소드인지 확인 필요
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/like/${postId}`,
                {}, // POST 요청 본문 (필요시 데이터 추가)
                { headers: { Authorization: `Bearer ${token}` } }
            );

             // API 성공 후 실제 좋아요 개수를 다시 가져오거나 응답에서 파싱 (선택 사항)
             // 현재는 POST 성공 후 GET으로 다시 가져오는 방식 유지 (비효율적일 수 있음)
             try {
                 const updatedLikeCountRes = await axios.get(
                     `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/like/${postId}`,
                     { headers: { Authorization: `Bearer ${token}` } }
                 );
                 setLikeCount(updatedLikeCountRes.data.data || 0); // 실제 좋아요 개수로 업데이트

             } catch (getCountError: any) {
                 console.error('❌ 좋아요 수 갱신 GET 요청 실패:', getCountError); // 개발 중에는 로그 유지 권장
                 // 좋아요 수 갱신 실패 시에는 이전 값으로 되돌리거나 특정 메시지 표시
                 // Alert.alert('알림', '좋아요 수 업데이트에 실패했습니다.');
                 // 좋아요 수는 옵티미스틱 업데이트 값 그대로 두거나 prevLikeCount로 되돌릴 수 있음
             }

        } catch (error: any) {
            console.error('❌ 좋아요/취소 POST 요청 실패:', error); // 개발 중에는 로그 유지 권장
            // 오류 발생 시 옵티미스틱 업데이트 되돌리기
            setIsLiked(prevIsLiked);
            setLikeCount(prevLikeCount);

            if (error.response?.status === 401) {
                Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                router.replace('/login');
            } else {
                 const errorMessage = error.response?.data?.message || '좋아요/취소 처리 중 오류가 발생했습니다.';
                 Alert.alert('오류', errorMessage);
            }

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
                onPress: async () => { // async 추가
                    try {
                        const token = await SecureStore.getItemAsync('accessToken');
                         if (!token) {
                             Alert.alert('로그인 필요', '게시글을 신고하려면 로그인이 필요합니다.');
                             router.replace('/login');
                             return;
                         }
                        await axios.post(
                             // 게시글 신고 API 엔드포인트 확인 필요 (reports 복수형?)
                            `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/reports`, // 확인 필요
                            {}, // POST 요청 본문 (필요시 데이터 추가)
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        Alert.alert('신고 완료', '해당 게시글이 신고되었습니다.');
                    } catch (error: any) {
                         console.error('❌ 게시글 신고 실패:', error); // 개발 중에는 로그 유지 권장
                         if (error.response?.status === 401) {
                             Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                             router.replace('/login');
                         } else {
                             // 백엔드 응답 메시지에 따라 이미 신고했는지 구분 가능
                             const errorMessage = error.response?.data?.message || '이미 신고했거나 오류가 발생했습니다.';
                             Alert.alert('신고 실패', errorMessage);
                         }
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
                onPress: async () => { // async 추가
                    try {
                        const token = await SecureStore.getItemAsync('accessToken');
                         if (!token) {
                             Alert.alert('로그인 필요', '게시글을 삭제하려면 로그인이 필요합니다.');
                             router.replace('/login');
                             return;
                         }
                        // 게시글 삭제 API 엔드포인트 및 메소드 확인 필요
                        await axios.delete(
                            `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}`, // 확인 필요
                            { headers: { Authorization: `Bearer ${token}` } }
                        );
                        Alert.alert('삭제 완료', '게시글이 삭제되었습니다.');
                        router.replace('/(tabs)/na4'); // 삭제 성공 시 목록 화면으로 이동
                    } catch (error: any) {
                        console.error('❌ 게시글 삭제 실패:', error); // 개발 중에는 로그 유지 권장
                         if (error.response?.status === 401) {
                             Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                             router.replace('/login');
                         } else {
                             const errorMessage = error.response?.data?.message || '삭제 권한이 없거나 오류가 발생했습니다.';
                             Alert.alert('삭제 실패', errorMessage);
                         }
                    }
                },
            },
        ]);
    };


    // 댓글 작성 함수
    const handleAddComment = async () => { // 함수 이름 변경
         if (!commentInput.trim()) {
             Alert.alert('입력 오류', '댓글 내용을 입력해주세요.');
             return;
         }
         try {
             const token = await SecureStore.getItemAsync('accessToken');
              if (!token) {
                 Alert.alert('로그인 필요', '댓글 작성은 로그인 후 가능합니다.');
                 router.replace('/login');
                 return;
              }
             // 댓글 작성 API 엔드포인트 및 메소드 확인 필요
             const res = await axios.post(
                 `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`, // 확인 필요
                 { contents: commentInput.trim() }, // 앞뒤 공백 제거
                 { headers: { Authorization: `Bearer ${token}` } }
             );
             setCommentInput(''); // 입력 필드 초기화
             Alert.alert('작성 완료', '댓글이 작성되었습니다.'); // 사용자에게 알림

             // 댓글 작성 성공 후 댓글 목록 갱신
             // 작성된 댓글을 응답에서 받아와 기존 목록에 추가하여 UI 즉시 업데이트 (옵티미스틱 업데이트)
             if(res.data?.data) { // 응답 데이터에 새로 작성된 댓글 정보가 있는지 확인
                  // TODO: 응답 데이터 형식에 따라 새로 작성된 댓글 객체를 올바르게 구성해야 함
                  // 예: const newComment = res.data.data; setComments([...comments, newComment]);

                  // 또는 댓글 목록 전체를 다시 불러와서 갱신 (안정적)
                  const tokenRefetch = await SecureStore.getItemAsync('accessToken');
                  const updatedCommentsRes = await axios.get(
                      `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                      { headers: { Authorization: `Bearer ${tokenRefetch}` } }
                  );
                  setComments(updatedCommentsRes.data.data);

             } else {
                 // 응답 데이터에 새로 작성된 댓글 정보가 없는 경우, 댓글 목록 전체를 다시 불러옴
                 const tokenRefetch = await SecureStore.getItemAsync('accessToken');
                 const updatedCommentsRes = await axios.get(
                     `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/comments`,
                     { headers: { Authorization: `Bearer ${tokenRefetch}` } }
                 );
                 setComments(updatedCommentsRes.data.data);
             }


         } catch (err: any) {
             console.error('❌ 댓글 작성 실패:', err); // 개발 중에는 로그 유지 권장
              if (err.response?.status === 401) {
                 Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                 router.replace('/login');
             } else {
                 const errorMessage = err.response?.data?.message || '댓글 작성 중 오류가 발생했습니다.';
                 Alert.alert('작성 실패', errorMessage);
             }
         }
    };


    // 로딩 중이거나 게시글 정보가 없을 때 표시
    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#6b4eff" />
                <Text style={styles.loadingInitialText}>게시글 불러오는 중...</Text>
            </View>
        );
    }

    if (!post) {
         return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>게시글을 불러오지 못했습니다.</Text>
                <TouchableOpacity style={{marginTop: 20}} onPress={() => router.back()}>
                    <Text style={styles.backText}>← 뒤로가기</Text>
                </TouchableOpacity>
            </View>
         );
    }


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
                        // 스크랩 로직
                        try {
                            const token = await SecureStore.getItemAsync('accessToken');
                             if (!token) {
                                 Alert.alert('로그인 필요', '스크랩은 로그인 후 가능합니다.');
                                 router.replace('/login');
                                 return;
                             }
                            // 스크랩 API 호출
                            await axios.post(
                                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/${postId}/scraps`, // 스크랩 API 엔드포인트 확인 필요
                                {}, // POST 요청 본문 (필요시 데이터 추가)
                                { headers: { Authorization: `Bearer ${token}` } }
                            );
                            setIsScrapped(true); // 성공 시 스크랩 상태 업데이트
                            Alert.alert('스크랩 완료', '이 게시글이 스크랩되었습니다.');
                        } catch (error: any) {
                            // console.error('❌ 스크랩 실패:', error); // << 이 줄을 제거합니다.
                             if (error.response?.status === 401) {
                                 Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                                 router.replace('/login');
                             } else {
                                 // 백엔드 응답 메시지에 따라 이미 스크랩했는지 구분 가능
                                 const errorMessage = error.response?.data?.message || '이미 스크랩했거나 오류가 발생했습니다.';
                                 Alert.alert('스크랩 실패', errorMessage);
                             }
                        }
                    }} style={styles.scrabButton}>
                        <Text style={{ fontSize: 22, color: isScrapped ? '#FFD700' : '#ccc' }}>⭐</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.authorRow}>
                 <Text style={styles.author}>작성자 : {post?.author}</Text>
                 {/* 작성자 메달 및 랭크 표시 */}
                 {post?.reviewCount !== undefined && post?.reviewCount !== null && post?.reviewCount >= 0 && (() => {
                     const medalSource = getMedalImage(post.reviewCount);
                     return (
                             <>
                                 {medalSource && (
                                     <Image
                                         source={medalSource}
                                         style={styles.medalIcon}
                                         resizeMode="contain" // resizeMode 추가
                                     />
                                 )}
                                {typeof post?.rank === 'number' && ( // rank가 숫자일 때만 표시
                                     <Text style={styles.rankText}>
                                         (상위 {post.rank}%)
                                     </Text>
                                 )}
                             </>
                         );
                     })()}
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
                                 {/* 댓글 작성자 닉네임 */}
                                <Text style={styles.commentUser}>{comment.nickName}</Text>
                                 {/* 댓글 작성자 메달 및 랭크 표시 */}
                                 {comment.reviewCount !== undefined && comment.reviewCount !== null && comment.reviewCount >= 0 && (() => {
                                        const medalSource = getMedalImage(comment.reviewCount);
                                        return (
                                            <>
                                                {medalSource && (
                                                     <Image
                                                         source={medalSource}
                                                         style={styles.medalIcon}
                                                         resizeMode="contain" // resizeMode 추가
                                                     />
                                                )}
                                                {typeof comment.rank === 'number' && ( // rank가 숫자일 때만 표시
                                                     <Text style={styles.rankText}>
                                                         (상위 {comment.rank}%)
                                                     </Text>
                                                 )}
                                            </>
                                        );
                                    })()}
                            </View>
                            {/* 댓글 신고 버튼 */}
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
                                                     if (!token) {
                                                         Alert.alert('로그인 필요', '댓글을 신고하려면 로그인이 필요합니다.');
                                                         router.replace('/login');
                                                         return;
                                                     }
                                                     // 댓글 신고 API 엔드포인트 확인 필요
                                                    await axios.post(
                                                        `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/comments/${comment.commentId}/reports`, // 확인 필요
                                                        {}, // POST 요청 본문 (필요시 데이터 추가)
                                                        { headers: { Authorization: `Bearer ${token}` } }
                                                    );
                                                    Alert.alert('신고 완료', '해당 댓글이 신고되었습니다.');
                                                } catch (error: any) {
                                                    console.error('❌ 댓글 신고 실패:', error); // 개발 중에는 로그 유지 권장
                                                    if (error.response?.status === 401) {
                                                         Alert.alert('인증 오류', '로그인이 만료되었습니다. 다시 로그인해주세요.');
                                                         router.replace('/login');
                                                     } else {
                                                         // 백엔드 응답 메시지에 따라 이미 신고했는지 구분 가능
                                                        const errorMessage = error.response?.data?.message || '이미 신고했거나 오류가 발생했습니다.';
                                                        Alert.alert('신고 실패', errorMessage);
                                                     }
                                                }
                                            },
                                        },
                                    ]);
                                }}
                            >
                                <Text style={styles.commentReport}>🚨</Text>
                            </TouchableOpacity>
                        </View>
                        {/* 댓글 내용 및 날짜 */}
                        <Text style={styles.commentContent}>{comment.contents}</Text>
                        <Text style={styles.commentDate}>{new Date(comment.date).toLocaleString()}</Text>
                        {/* 댓글 삭제 버튼 */}
                        <TouchableOpacity
                            style={{ marginTop: 4 }}
                            onPress={() => handleDeleteComment(comment.commentId)} // Alert 로직은 handleDeleteComment 함수로 이동
                        >
                            <Text style={styles.deleteComment}>🗑 삭제</Text>
                        </TouchableOpacity>
                    </View>
                ))
            )}

            {/* 댓글 입력 및 등록 섹션 */}
            <View style={styles.commentBox}>
                <TextInput
                    style={styles.commentInput}
                    placeholder="댓글을 입력하세요"
                    value={commentInput}
                    onChangeText={setCommentInput}
                    multiline
                    textAlignVertical="top" // 여러 줄 입력 시 상단 정렬
                />
                <TouchableOpacity
                    style={styles.commentSubmit}
                    onPress={handleAddComment} // 함수 호출
                >
                    <Text style={styles.submitText}>등록</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    scrollContent: { paddingTop: 30, paddingHorizontal: 20, paddingBottom: 40 },
    centered: { // 로딩 또는 에러 시 중앙 정렬
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    loadingInitialText: { // 로딩 텍스트
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorText: { // 에러 텍스트
        fontSize: 16,
        color: '#ff3b30',
        textAlign: 'center',
    },
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
         // marginLeft는 다른 요소와의 간격에 따라 필요하면 추가
    }
});