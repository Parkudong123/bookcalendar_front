import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native'; // 초기 로드/일반 포커스를 위해 유지

export default function CommunityScreen() {
    const router = useRouter();
    const [allPosts, setAllPosts] = useState([]);
    const [topLikedPosts, setTopLikedPosts] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searching, setSearching] = useState(false);

    // 데이터를 모두 불러오는 함수를 하나로 묶습니다.
    const fetchData = async () => {
        setLoading(true);
        await Promise.all([
            fetchAllPosts(),
            fetchTopLikedPosts(),
        ]);
        setLoading(false);
    };

    const fetchAllPosts = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/community/lists', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.data?.data) {
                const sortedPosts = res.data.data.sort((a, b) => {
                    return new Date(b.date).getTime() - new Date(a.date).getTime();
                });
                setAllPosts(sortedPosts);
            } else {
                setAllPosts([]);
            }
        } catch (error: any) {
            console.error('❌ 전체 게시글 불러오기 실패:', error.response?.data || error);
            Alert.alert('오류', '전체 게시글을 불러오는데 실패했습니다.');
            setAllPosts([]);
        }
    };

    const fetchTopLikedPosts = async () => {
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const res = await axios.get('http://ceprj.gachon.ac.kr:60001/api/api/v1/community/posts/top-liked', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (res.data?.data) {
                setTopLikedPosts(res.data.data);
            } else {
                setTopLikedPosts([]);
            }
        } catch (error: any) {
            console.error('❌ 인기 게시글 불러오기 실패:', error.response?.data || error);
            setTopLikedPosts([]);
        }
    };

    // useFocusEffect는 화면이 포커싱될 때마다 fetchData를 호출합니다.
    useFocusEffect(
      useCallback(() => {
        fetchData(); // 화면이 다시 포커싱될 때 데이터를 새로 불러옵니다.
        return () => {}; // 필요시 정리 함수
      }, []) // 빈 의존성 배열로 컴포넌트 마운트 시, 언마운트 시, 그리고 포커싱 시에만 실행
    );

    const handleSearch = async () => {
        if (!searchKeyword.trim()) {
            setSearchKeyword('');
            setSearchResults([]);
            fetchAllPosts(); // 검색어를 지우면 전체 게시물 새로고침
            return;
        }

        setSearching(true);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            const res = await axios.post(
                `http://ceprj.gachon.ac.kr:60001/api/api/v1/community/search?keyword=${encodeURIComponent(searchKeyword)}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res.data?.data) {
                setSearchResults(res.data.data);
            } else {
                setSearchResults([]);
            }
        } catch (error: any) {
            console.error('❌ 검색 실패:', error.response?.data || error);
            Alert.alert('오류', '검색 중 문제가 발생했습니다.');
            setSearchResults([]);
        } finally {
            setSearching(false);
        }
    };

    const postsToDisplay = searchKeyword.trim() ? searchResults : allPosts;
    const mainListHeading = searchKeyword.trim() ? '🔍 검색 결과' : '📄 전체 게시물';

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => router.push('/main')}>
               <Text style={styles.backBtn}>← 뒤로가기</Text>
            </TouchableOpacity>

            <Text style={styles.header}>📚 독서 커뮤니티</Text>

            <View style={styles.searchRow}>
               <TextInput
                 style={styles.searchInput}
                 placeholder="게시물 검색창"
                 placeholderTextColor="#888"
                 value={searchKeyword}
                 onChangeText={(text) => {
                     setSearchKeyword(text);
                     if (!text.trim()) {
                         setSearchResults([]);
                         // 필요하다면 여기서 fetchData()를 호출하여 검색어가 지워질 때 즉시 전체 목록을 새로고침할 수 있습니다.
                     }
                 }}
               />
               <TouchableOpacity onPress={handleSearch} disabled={searching}>
                  {searching ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={styles.closeBtn}>검색</Text>}
               </TouchableOpacity>
            </View>

            {loading && <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />}

            {!loading && (
               <ScrollView style={styles.postList}>
                  <Text style={styles.sectionHeader}>🌟 인기 게시글</Text>
                  {topLikedPosts.length === 0 ? (
                      <Text style={{ textAlign: 'center', color: '#999', marginBottom: 20 }}>인기 게시글이 없습니다.</Text>
                  ) : (
                      topLikedPosts.map((item) => (
                          <TouchableOpacity
                            key={`top-${item.postId}`}
                            onPress={() => router.push(`/post/${item.postId}`)}
                          >
                            <View style={styles.popularPostBox}>
                              <Text style={styles.postTitle}>{item.title}</Text>
                              <View style={styles.metaAndLikeRow}>
                                <View>
                                  <Text style={styles.postMeta}>작성자: {item.author}</Text>
                                  {item.date && <Text style={styles.postMeta}>작성일시: {new Date(item.date).toLocaleString()}</Text>}
                                </View>
                                {typeof item.likeCount === 'number' && (
                                    <Text style={styles.postLikeCountCompact}>❤️ {item.likeCount}</Text>
                                )}
                              </View>
                            </View>
                          </TouchableOpacity>
                      ))
                  )}

                  <Text style={styles.sectionHeader}>{mainListHeading}</Text>
                  {searching ? (
                      <ActivityIndicator size="large" color="#333" style={{ marginTop: 20 }} />
                  ) : postsToDisplay.length === 0 ? (
                      <Text style={{ textAlign: 'center', color: '#999' }}>
                          {searchKeyword.trim() ? '검색 결과가 없습니다.' : '게시물이 없습니다.'}
                      </Text>
                  ) : (
                      postsToDisplay.map((item) => (
                          <TouchableOpacity
                            key={`all-${item.postId}`}
                            onPress={() => router.push(`/post/${item.postId}`)}
                          >
                            <View style={styles.postBox}>
                              <Text style={styles.postTitle}>{item.title}</Text>
                              <Text style={styles.postMeta}>작성자: {item.author}</Text>
                              {item.date && <Text style={styles.postMeta}>작성일시: {new Date(item.date).toLocaleString()}</Text>}
                               {item.hasOwnProperty('likeCount') && typeof item.likeCount === 'number' && (
                                   <Text style={styles.postLikeCount}>❤️ {item.likeCount}</Text>
                               )}
                            </View>
                          </TouchableOpacity>
                      ))
                  )}
               </ScrollView>
            )}

            <TouchableOpacity
               style={styles.addBtn}
               // addpost 경로로 이동할 때 onPostAdded 파라미터를 true로 전달합니다.
               onPress={() => router.push({ pathname: '/addpost', params: { onPostAdded: true } })}
            >
               <Text style={styles.addBtnText}>게시물 추가 버튼</Text>
            </TouchableOpacity>
           </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 30,
        paddingHorizontal: 24,
        backgroundColor: '#f8f7fa',
        flex: 1,
    },
    backBtn: {
        marginBottom: 20,
    alignSelf: 'flex-start',
    },
    header: {
        textAlign: 'center',
        marginBottom: 16,
        padding: 8,
        backgroundColor: '#eee',
        borderRadius: 8,
        fontWeight: 'bold',
        fontSize: 20
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 20,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
    },
    closeBtn: {
        fontSize: 14,
        color: '#007AFF',
        paddingLeft: 8,
    },
    postList: {
        flex: 1,
    },
    sectionHeader: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        paddingBottom: 5,
    },
    postBox: {
        backgroundColor: '#ebe4fa',
        borderRadius: 8,
        padding: 14,
        marginBottom: 16,
    },
    popularPostBox: {
        backgroundColor: '#ebe4fa',
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    postTitle: {
        color: '#333',
        fontWeight: 'bold',
        fontSize: 14,
        marginBottom: 4,
    },
    postMeta: {
        color: '#666',
        fontSize: 12,
    },
    metaAndLikeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 2,
    },
    postLikeCount: {
        fontSize: 12,
        color: '#ff6b6b',
        marginTop: 4,
        textAlign: 'right',
    },
    postLikeCountCompact: {
        fontSize: 12,
        color: '#ff6b6b',
    },
    addBtn: {
        marginTop: 10,
        marginBottom: 20,
        backgroundColor: '#333',
        paddingVertical: 12,
        borderRadius: 8,
    },
    addBtnText: {
        color: '#fff',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});