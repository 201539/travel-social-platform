import React, { useState } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
    TextInput,
} from 'react-native';
import { useQuery } from 'react-query';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import dayjs from 'dayjs';

const HomeScreen = () => {
    const navigation = useNavigation();
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');

    const { data, isLoading, refetch } = useQuery(
        ['travels', page, keyword],
        async () => {
            const params = { page, limit: 10 };
            if (keyword) params.keyword = keyword;
            return await api.get('/travels', { params });
        }
    );

    const renderTravelItem = ({ item }) => (
        <TouchableOpacity
            style={styles.travelCard}
            onPress={() => navigation.navigate('TravelDetail', { id: item._id })}
        >
            {item.photos && item.photos.length > 0 && (
                <Image source={{ uri: item.photos[0] }} style={styles.travelImage} />
            )}
            <View style={styles.travelContent}>
                <Text style={styles.travelTitle}>{item.title}</Text>
                <Text style={styles.travelDescription} numberOfLines={2}>
                    {item.description || item.summary || '暂无描述'}
                </Text>
                <View style={styles.travelMeta}>
                    <Text style={styles.metaText}>@{item.author?.username}</Text>
                    <Text style={styles.metaText}>
                        {dayjs(item.createdAt).format('YYYY-MM-DD')}
                    </Text>
                </View>
                <View style={styles.travelStats}>
                    <Text style={styles.statsText}>❤️ {item.likes?.length || 0}</Text>
                    <Text style={styles.statsText}>💬 {item.comments?.length || 0}</Text>
                    <Text style={styles.statsText}>👁️ {item.views || 0}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="搜索游记、地点..."
                    value={keyword}
                    onChangeText={setKeyword}
                    onSubmitEditing={() => {
                        setPage(1);
                        refetch();
                    }}
                />
            </View>
            <FlatList
                data={data?.travels || []}
                renderItem={renderTravelItem}
                keyExtractor={(item) => item._id}
                refreshControl={
                    <RefreshControl refreshing={isLoading} onRefresh={refetch} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>暂无游记</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
    },
    searchInput: {
        height: 40,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        paddingHorizontal: 16,
        fontSize: 14,
    },
    travelCard: {
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    travelImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    travelContent: {
        padding: 16,
    },
    travelTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    travelDescription: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    travelMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    metaText: {
        fontSize: 12,
        color: '#999',
    },
    travelStats: {
        flexDirection: 'row',
        gap: 16,
    },
    statsText: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

export default HomeScreen;

