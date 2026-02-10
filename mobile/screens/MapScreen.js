import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Modal,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../utils/api';

const MapScreen = () => {
    const [region, setRegion] = useState({
        latitude: 39.9042,
        longitude: 116.4074,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
    });
    const [nearbyLocations, setNearbyLocations] = useState([]);
    const [route, setRoute] = useState(null);
    const [destination, setDestination] = useState(null);
    const [navigationMode, setNavigationMode] = useState(null); // 'driving', 'walking', 'transit'
    const [showNavigationModal, setShowNavigationModal] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [weather, setWeather] = useState(null);
    const [loadingWeather, setLoadingWeather] = useState(false);

    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = async () => {
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限', '需要位置权限才能使用此功能');
                return;
            }

            const location = await Location.getCurrentPositionAsync({});
            const newRegion = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            };
            setRegion(newRegion);
            setCurrentLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            // 获取附近地点
            const locations = await api.get('/locations/search/nearby', {
                params: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude,
                    distance: 5000,
                },
            });
            setNearbyLocations(locations);

            // 获取天气信息
            fetchWeather(location.coords.latitude, location.coords.longitude);
        } catch (error) {
            Alert.alert('错误', '获取位置失败');
        }
    };

    // 解析坐标字符串（高德地图返回的格式：经度,纬度）
    const parsePolyline = (polylineString) => {
        if (!polylineString) return [];
        return polylineString.split(';').map(point => {
            const [lng, lat] = point.split(',');
            return {
                latitude: parseFloat(lat),
                longitude: parseFloat(lng),
            };
        });
    };

    // 规划路线
    const planRoute = async (mode) => {
        if (!currentLocation || !destination) {
            Alert.alert('提示', '请先选择目的地');
            return;
        }

        try {
            const endpoint = mode === 'driving' ? '/navigation/route/driving' :
                            mode === 'walking' ? '/navigation/route/walking' :
                            '/navigation/route/transit';

            const response = await api.post(endpoint, {
                origin: {
                    longitude: currentLocation.longitude,
                    latitude: currentLocation.latitude,
                },
                destination: {
                    longitude: destination.longitude,
                    latitude: destination.latitude,
                },
                strategy: '0', // 驾车模式：0-速度优先
            });

            // API响应拦截器已经返回response.data，所以response直接是数据对象
            const routeData = response.route || response;
            
            if (routeData && routeData.polyline) {
                setRoute(routeData);
                setNavigationMode(mode);
                setShowNavigationModal(false);

                // 调整地图视野以显示完整路线
                const coordinates = parsePolyline(routeData.polyline);
                if (coordinates.length > 0) {
                    const minLat = Math.min(...coordinates.map(c => c.latitude));
                    const maxLat = Math.max(...coordinates.map(c => c.latitude));
                    const minLng = Math.min(...coordinates.map(c => c.longitude));
                    const maxLng = Math.max(...coordinates.map(c => c.longitude));

                    setRegion({
                        latitude: (minLat + maxLat) / 2,
                        longitude: (minLng + maxLng) / 2,
                        latitudeDelta: Math.max((maxLat - minLat) * 1.5, 0.01),
                        longitudeDelta: Math.max((maxLng - minLng) * 1.5, 0.01),
                    });
                }

                const distance = routeData.distance ? (routeData.distance / 1000).toFixed(2) : '未知';
                const duration = routeData.duration ? Math.floor(routeData.duration / 60) : '未知';
                Alert.alert('成功', `路线规划成功！距离：${distance}公里，预计时间：${duration}分钟`);
            } else {
                Alert.alert('提示', '路线规划成功，但未返回路线数据');
            }
        } catch (error) {
            Alert.alert('错误', error.response?.data?.message || '路线规划失败，请配置地图API密钥');
        }
    };

    // 选择目的地
    const selectDestination = (location) => {
        setDestination({
            latitude: location.location.coordinates[1],
            longitude: location.location.coordinates[0],
        });
        setShowNavigationModal(true);
    };

    // 清除路线
    const clearRoute = () => {
        setRoute(null);
        setDestination(null);
        setNavigationMode(null);
    };

    // 获取天气信息
    const fetchWeather = async (latitude, longitude) => {
        setLoadingWeather(true);
        try {
            const weatherData = await api.get('/weather', {
                params: {
                    latitude,
                    longitude,
                },
            });
            setWeather(weatherData);
        } catch (error) {
            console.error('获取天气失败:', error);
            // 不显示错误，因为天气是辅助功能
        } finally {
            setLoadingWeather(false);
        }
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={setRegion}
                showsUserLocation
                showsMyLocationButton
            >
                {nearbyLocations.map((location, index) => (
                    <Marker
                        key={index}
                        coordinate={{
                            latitude: location.location.coordinates[1],
                            longitude: location.location.coordinates[0],
                        }}
                        title={location.name}
                        description={location.address}
                        onPress={() => selectDestination(location)}
                    />
                ))}
                {destination && (
                    <Marker
                        coordinate={{
                            latitude: destination.latitude,
                            longitude: destination.longitude,
                        }}
                        pinColor="red"
                        title="目的地"
                    />
                )}
                {route && route.polyline && (
                    <Polyline
                        coordinates={parsePolyline(route.polyline)}
                        strokeColor="#1890ff"
                        strokeWidth={4}
                    />
                )}
            </MapView>
            
            {/* 天气信息卡片 */}
            {weather && weather.current && (
                <View style={styles.weatherCard}>
                    <Text style={styles.weatherTitle}>🌤️ 天气</Text>
                    <Text style={styles.weatherLocation}>{weather.location || '当前位置'}</Text>
                    <View style={styles.weatherInfo}>
                        <Text style={styles.weatherTemp}>{weather.current.temperature}°C</Text>
                        <Text style={styles.weatherCondition}>{weather.current.condition}</Text>
                    </View>
                    <View style={styles.weatherDetails}>
                        <Text style={styles.weatherDetail}>湿度: {weather.current.humidity}%</Text>
                        <Text style={styles.weatherDetail}>风速: {weather.current.windSpeed}km/h</Text>
                    </View>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.button} onPress={getCurrentLocation}>
                    <Text style={styles.buttonText}>📍 定位</Text>
                </TouchableOpacity>
                {route && (
                    <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clearRoute}>
                        <Text style={styles.buttonText}>清除路线</Text>
                    </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.button, styles.navButton]} onPress={() => setShowNavigationModal(true)}>
                    <Text style={styles.buttonText}>🧭 导航</Text>
                </TouchableOpacity>
            </View>

            {/* 导航模式选择模态框 */}
            <Modal
                visible={showNavigationModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowNavigationModal(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>选择导航方式</Text>
                        {destination && (
                            <Text style={styles.modalSubtitle}>
                                目的地：{destination.latitude.toFixed(4)}, {destination.longitude.toFixed(4)}
                            </Text>
                        )}
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => planRoute('driving')}
                        >
                            <Text style={styles.modalButtonText}>🚗 驾车导航</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => planRoute('walking')}
                        >
                            <Text style={styles.modalButtonText}>🚶 步行导航</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => planRoute('transit')}
                        >
                            <Text style={styles.modalButtonText}>🚌 公交导航</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowNavigationModal(false)}
                        >
                            <Text style={styles.modalButtonText}>取消</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
    weatherCard: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 12,
        minWidth: 150,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    weatherTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    weatherLocation: {
        fontSize: 12,
        color: '#666',
        marginBottom: 8,
    },
    weatherInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    weatherTemp: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1890ff',
        marginRight: 8,
    },
    weatherCondition: {
        fontSize: 14,
        color: '#333',
    },
    weatherDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 4,
    },
    weatherDetail: {
        fontSize: 11,
        color: '#666',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'column',
        gap: 10,
    },
    button: {
        backgroundColor: '#1890ff',
        padding: 12,
        borderRadius: 8,
        minWidth: 100,
        alignItems: 'center',
    },
    clearButton: {
        backgroundColor: '#ff4d4f',
    },
    navButton: {
        backgroundColor: '#52c41a',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        width: '80%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalSubtitle: {
        fontSize: 12,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#1890ff',
        padding: 15,
        borderRadius: 8,
        marginBottom: 10,
        alignItems: 'center',
    },
    cancelButton: {
        backgroundColor: '#ccc',
        marginTop: 10,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default MapScreen;

