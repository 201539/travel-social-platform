import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    Image,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import dayjs from 'dayjs';

const TravelDetailScreen = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { id } = route.params;
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [comment, setComment] = useState('');

    const { data: travel, isLoading } = useQuery(
        ['travel', id],
        () => api.get(`/travels/${id}`)
    );

    const likeMutation = useMutation(
        () => api.post(`/travels/${id}/like`),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['travel', id]);
            },
        }
    );

    const commentMutation = useMutation(
        () => api.post(`/travels/${id}/comment`, { content: comment }),
        {
            onSuccess: () => {
                queryClient.invalidateQueries(['travel', id]);
                setComment('');
                Alert.alert('成功', '评论成功');
            },
        }
    );

    const handleLike = () => {
        if (!user) {
            Alert.alert('提示', '请先登录');
            navigation.navigate('Login');
            return;
        }
        likeMutation.mutate();
    };

    const handleComment = () => {
        if (!user) {
            Alert.alert('提示', '请先登录');
            navigation.navigate('Login');
            return;
        }
        if (!comment.trim()) {
            Alert.alert('提示', '请输入评论内容');
            return;
        }
        commentMutation.mutate();
    };

    if (isLoading || !travel) {
        return (
            <View style={styles.loadingContainer}>
                <Text>加载中...</Text>
            </View>
        );
    }

    const isLiked = travel.likes?.some(like =>
        typeof like === 'object' ? like._id === user?.id : like === user?.id
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{travel.title}</Text>
                <View style={styles.authorInfo}>
                    <Text style={styles.author}>@{travel.author?.username}</Text>
                    <Text style={styles.date}>
                        {dayjs(travel.createdAt).format('YYYY-MM-DD')}
                    </Text>
                </View>
            </View>

            {travel.photos && travel.photos.length > 0 && (
                <ScrollView horizontal pagingEnabled style={styles.photosContainer}>
                    {travel.photos.map((photo, index) => (
                        <Image
                            key={index}
                            source={{ uri: photo }}
                            style={styles.photo}
                        />
                    ))}
                </ScrollView>
            )}

            <View style={styles.content}>
                <Text style={styles.description}>{travel.description}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, isLiked && styles.actionButtonActive]}
                        onPress={handleLike}
                    >
                        <Ionicons
                            name={isLiked ? 'heart' : 'heart-outline'}
                            size={24}
                            color={isLiked ? '#ff4d4f' : '#666'}
                        />
                        <Text style={styles.actionText}>{travel.likes?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="chatbubble-outline" size={24} color="#666" />
                        <Text style={styles.actionText}>{travel.comments?.length || 0}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton}>
                        <Ionicons name="eye-outline" size={24} color="#666" />
                        <Text style={styles.actionText}>{travel.views || 0}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.commentsSection}>
                    <Text style={styles.sectionTitle}>评论</Text>
                    {travel.comments && travel.comments.length > 0 ? (
                        travel.comments.map((comment, index) => (
                            <View key={index} style={styles.commentItem}>
                                <Text style={styles.commentAuthor}>
                                    @{comment.user?.username}
                                </Text>
                                <Text style={styles.commentText}>{comment.content}</Text>
                                <Text style={styles.commentDate}>
                                    {dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm')}
                                </Text>
                            </View>
                        ))
                    ) : (
                        <Text style={styles.emptyText}>暂无评论</Text>
                    )}

                    {user && (
                        <View style={styles.commentInput}>
                            <TextInput
                                style={styles.input}
                                placeholder="写下你的评论..."
                                value={comment}
                                onChangeText={setComment}
                                multiline
                            />
                            <TouchableOpacity
                                style={styles.submitButton}
                                onPress={handleComment}
                            >
                                <Text style={styles.submitButtonText}>发表</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        color: '#333',
    },
    authorInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    author: {
        fontSize: 14,
        color: '#666',
    },
    date: {
        fontSize: 14,
        color: '#999',
    },
    photosContainer: {
        height: 300,
    },
    photo: {
        width: 400,
        height: 300,
        resizeMode: 'cover',
    },
    content: {
        padding: 16,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#666',
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#f0f0f0',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    actionButtonActive: {
        // Active state styling
    },
    actionText: {
        fontSize: 14,
        color: '#666',
    },
    commentsSection: {
        marginTop: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    commentItem: {
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    commentAuthor: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    commentText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    commentDate: {
        fontSize: 12,
        color: '#999',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        paddingVertical: 20,
    },
    commentInput: {
        marginTop: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        minHeight: 80,
        textAlignVertical: 'top',
        marginBottom: 8,
    },
    submitButton: {
        backgroundColor: '#1890ff',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'flex-end',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
});

export default TravelDetailScreen;

