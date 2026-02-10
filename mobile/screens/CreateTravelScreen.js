import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Image,
    Alert,
    Platform,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import BeautyEditor from '../components/BeautyEditor';
// DateTimePicker 需要根据平台使用不同的实现

const CreateTravelScreen = () => {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [photos, setPhotos] = useState([]);
    const [location, setLocation] = useState(null);
    const [track, setTrack] = useState([]);
    const [isRecording, setIsRecording] = useState(false);
    const [loading, setLoading] = useState(false);
    const [beautyEditorVisible, setBeautyEditorVisible] = useState(false);
    const [selectedImageForBeauty, setSelectedImageForBeauty] = useState(null);

    useEffect(() => {
        if (!user) {
            navigation.navigate('Login');
        }
    }, [user]);

    const requestPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

        if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
            Alert.alert('权限', '需要相机和位置权限才能使用此功能');
            return false;
        }
        return true;
    };

    const takePhoto = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 0.9,
        });

        if (!result.canceled && result.assets[0]) {
            // 打开美颜编辑器
            setSelectedImageForBeauty(result.assets[0].uri);
            setBeautyEditorVisible(true);
        }
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: false,
            quality: 0.9,
            allowsMultipleSelection: true,
        });

        if (!result.canceled) {
            if (result.assets.length === 1) {
                // 单张图片，打开美颜编辑器
                setSelectedImageForBeauty(result.assets[0].uri);
                setBeautyEditorVisible(true);
            } else {
                // 多张图片，直接上传（不美颜）
                result.assets.forEach(asset => uploadImage(asset.uri));
            }
        }
    };

    const uploadImage = async (uri) => {
        try {
            const formData = new FormData();
            formData.append('image', {
                uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
                type: 'image/jpeg',
                name: 'photo.jpg',
            });

            const response = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            setPhotos([...photos, response.url]);
        } catch (error) {
            Alert.alert('错误', '图片上传失败');
        }
    };

    // 美颜编辑完成后的回调
    const handleBeautySave = (editedImageUri) => {
        uploadImage(editedImageUri);
        setBeautyEditorVisible(false);
        setSelectedImageForBeauty(null);
    };

    // 取消美颜编辑
    const handleBeautyCancel = () => {
        // 用户取消美颜，直接上传原图
        if (selectedImageForBeauty) {
            uploadImage(selectedImageForBeauty);
        }
        setBeautyEditorVisible(false);
        setSelectedImageForBeauty(null);
    };

    const startTracking = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        setIsRecording(true);
        const locationSubscription = await Location.watchPositionAsync(
            {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 10,
            },
            (location) => {
                setTrack([
                    ...track,
                    [location.coords.longitude, location.coords.latitude],
                ]);
            }
        );
    };

    const stopTracking = () => {
        setIsRecording(false);
    };

    const getCurrentLocation = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const location = await Location.getCurrentPositionAsync({});
            setLocation({
                coordinates: [location.coords.longitude, location.coords.latitude],
            });
        } catch (error) {
            Alert.alert('错误', '获取位置失败');
        }
    };

    const handleSubmit = async () => {
        if (!title || !description) {
            Alert.alert('提示', '请填写标题和内容');
            return;
        }

        setLoading(true);
        try {
            const travelData = {
                title,
                description,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                photos,
                track,
                location: location?.coordinates,
            };

            const response = await api.post('/travels', travelData);
            Alert.alert('成功', '游记创建成功', [
                { text: '确定', onPress: () => navigation.navigate('Home') },
            ]);
        } catch (error) {
            Alert.alert('错误', error.response?.data?.message || '创建失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.form}>
                <Text style={styles.label}>标题</Text>
                <TextInput
                    style={styles.input}
                    placeholder="给你的游记起个标题"
                    value={title}
                    onChangeText={setTitle}
                />

                <Text style={styles.label}>旅行日期</Text>
                <View style={styles.dateContainer}>
                    <TouchableOpacity onPress={() => {/* 可以添加日期选择器 */ }}>
                        <Text>开始: {startDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => {/* 可以添加日期选择器 */ }}>
                        <Text>结束: {endDate.toLocaleDateString()}</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.label}>游记内容</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="记录你的旅行故事..."
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={8}
                />

                <Text style={styles.label}>照片</Text>
                <View style={styles.photoContainer}>
                    {photos.map((photo, index) => (
                        <Image key={index} source={{ uri: photo }} style={styles.photo} />
                    ))}
                    <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                        <Text>📷 拍照</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                        <Text>🖼️ 相册</Text>
                    </TouchableOpacity>
                </View>

                {/* 美颜编辑器 */}
                <BeautyEditor
                    visible={beautyEditorVisible}
                    imageUri={selectedImageForBeauty}
                    onSave={handleBeautySave}
                    onCancel={handleBeautyCancel}
                />

                <Text style={styles.label}>位置</Text>
                <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                    <Text style={styles.buttonText}>获取当前位置</Text>
                </TouchableOpacity>

                <Text style={styles.label}>轨迹记录</Text>
                <View style={styles.trackContainer}>
                    <TouchableOpacity
                        style={[styles.button, isRecording && styles.buttonActive]}
                        onPress={isRecording ? stopTracking : startTracking}
                    >
                        <Text style={styles.buttonText}>
                            {isRecording ? '停止记录' : '开始记录轨迹'}
                        </Text>
                    </TouchableOpacity>
                    {track.length > 0 && (
                        <Text style={styles.trackInfo}>已记录 {track.length} 个点</Text>
                    )}
                </View>

                <TouchableOpacity
                    style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    <Text style={styles.submitButtonText}>
                        {loading ? '发布中...' : '发布游记'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    form: {
        padding: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        marginTop: 16,
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
    },
    textArea: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    dateContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    photoContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    photo: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 8,
        marginBottom: 8,
    },
    photoButton: {
        width: 80,
        height: 80,
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        marginBottom: 8,
    },
    button: {
        backgroundColor: '#1890ff',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 8,
    },
    buttonActive: {
        backgroundColor: '#ff4d4f',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    trackContainer: {
        marginBottom: 16,
    },
    trackInfo: {
        fontSize: 12,
        color: '#666',
        marginTop: 8,
    },
    submitButton: {
        backgroundColor: '#1890ff',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    submitButtonDisabled: {
        backgroundColor: '#ccc',
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CreateTravelScreen;

