import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from 'react-query';
import { Ionicons } from '@expo/vector-icons';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
    const navigation = useNavigation();
    const { user, logout } = useAuth();

    const { data: userData } = useQuery(
        ['user', user?.id],
        () => api.get(`/users/${user?.id}`),
        { enabled: !!user }
    );

    const { data: travels } = useQuery(
        ['travels', 'author', user?.id],
        () => api.get('/travels', { params: { author: user?.id } }),
        { enabled: !!user }
    );

    if (!user) {
        return (
            <View style={styles.container}>
                <View style={styles.loginPrompt}>
                    <Text style={styles.loginText}>请先登录</Text>
                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginButtonText}>登录</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const profile = userData || user;

    const handleLogout = () => {
        logout();
        navigation.navigate('Login');
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Image
                    source={{ uri: profile.avatar || 'https://via.placeholder.com/80' }}
                    style={styles.avatar}
                />
                <Text style={styles.username}>{profile.username}</Text>
                <Text style={styles.bio}>{profile.bio || '这个人很懒，什么都没有留下'}</Text>
            </View>

            <View style={styles.stats}>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.travelCount || 0}</Text>
                    <Text style={styles.statLabel}>游记</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.following?.length || 0}</Text>
                    <Text style={styles.statLabel}>关注</Text>
                </View>
                <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{profile.followers?.length || 0}</Text>
                    <Text style={styles.statLabel}>粉丝</Text>
                </View>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>我的游记</Text>
                {travels?.travels && travels.travels.length > 0 ? (
                    <FlatList
                        data={travels.travels}
                        horizontal
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.travelItem}
                                onPress={() => navigation.navigate('TravelDetail', { id: item._id })}
                            >
                                {item.photos && item.photos.length > 0 && (
                                    <Image
                                        source={{ uri: item.photos[0] }}
                                        style={styles.travelImage}
                                    />
                                )}
                                <Text style={styles.travelTitle} numberOfLines={2}>
                                    {item.title}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                ) : (
                    <Text style={styles.emptyText}>暂无游记</Text>
                )}
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>退出登录</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    loginPrompt: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
    },
    loginText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    loginButton: {
        backgroundColor: '#1890ff',
        paddingHorizontal: 32,
        paddingVertical: 12,
        borderRadius: 8,
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 24,
        marginBottom: 8,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
    },
    username: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    bio: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
    },
    stats: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#999',
    },
    section: {
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    travelItem: {
        width: 120,
        marginRight: 12,
    },
    travelImage: {
        width: '100%',
        height: 120,
        borderRadius: 8,
        marginBottom: 8,
    },
    travelTitle: {
        fontSize: 12,
        color: '#333',
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        textAlign: 'center',
        padding: 20,
    },
    logoutButton: {
        backgroundColor: '#ff4d4f',
        margin: 16,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;

