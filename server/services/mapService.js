const axios = require('axios');

// 地图服务封装
class MapService {
    constructor() {
        this.amapKey = process.env.AMAP_API_KEY || '';
        this.baiduKey = process.env.BAIDU_MAP_API_KEY || '';
    }

    // 地理编码（地址转坐标）
    async geocode(address) {
        try {
            // 使用高德地图API
            if (this.amapKey) {
                const response = await axios.get('https://restapi.amap.com/v3/geocode/geo', {
                    params: {
                        key: this.amapKey,
                        address: address
                    }
                });

                if (response.data.status === '1' && response.data.geocodes.length > 0) {
                    const location = response.data.geocodes[0].location.split(',');
                    return {
                        longitude: parseFloat(location[0]),
                        latitude: parseFloat(location[1])
                    };
                }
            }

            // 如果没有配置API，返回null
            return null;
        } catch (error) {
            console.error('地理编码失败:', error);
            return null;
        }
    }

    // 逆地理编码（坐标转地址）
    async reverseGeocode(longitude, latitude) {
        try {
            if (this.amapKey) {
                const response = await axios.get('https://restapi.amap.com/v3/geocode/regeo', {
                    params: {
                        key: this.amapKey,
                        location: `${longitude},${latitude}`
                    }
                });

                if (response.data.status === '1') {
                    return {
                        address: response.data.regeocode.formatted_address,
                        province: response.data.regeocode.addressComponent.province,
                        city: response.data.regeocode.addressComponent.city,
                        district: response.data.regeocode.addressComponent.district
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('逆地理编码失败:', error);
            return null;
        }
    }

    // 搜索POI（兴趣点）
    async searchPOI(keyword, city = '') {
        try {
            if (this.amapKey) {
                const response = await axios.get('https://restapi.amap.com/v3/place/text', {
                    params: {
                        key: this.amapKey,
                        keywords: keyword,
                        city: city,
                        output: 'json'
                    }
                });

                if (response.data.status === '1') {
                    return response.data.pois.map(poi => ({
                        name: poi.name,
                        address: poi.address,
                        location: {
                            longitude: parseFloat(poi.location.split(',')[0]),
                            latitude: parseFloat(poi.location.split(',')[1])
                        },
                        type: poi.type
                    }));
                }
            }

            return [];
        } catch (error) {
            console.error('POI搜索失败:', error);
            return [];
        }
    }

    // 计算距离
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 地球半径（公里）
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    toRad(degrees) {
        return degrees * (Math.PI / 180);
    }

    // 路线规划（驾车）
    async planRoute(origin, destination, strategy = '0') {
        try {
            if (this.amapKey) {
                // 高德地图路径规划API
                const response = await axios.get('https://restapi.amap.com/v3/direction/driving', {
                    params: {
                        key: this.amapKey,
                        origin: `${origin.longitude},${origin.latitude}`,
                        destination: `${destination.longitude},${destination.latitude}`,
                        strategy: strategy, // 0:速度优先, 1:费用优先, 2:距离优先, 3:不走高速
                        extensions: 'all' // 返回详细信息
                    }
                });

                if (response.data.status === '1' && response.data.route && response.data.route.paths.length > 0) {
                    const path = response.data.route.paths[0];
                    return {
                        distance: path.distance, // 距离（米）
                        duration: path.duration, // 时间（秒）
                        tolls: path.tolls, // 过路费（元）
                        tollDistance: path.toll_distance, // 收费路段距离（米）
                        steps: path.steps.map(step => ({
                            instruction: step.instruction,
                            road: step.road,
                            distance: step.distance,
                            duration: step.duration,
                            polyline: step.polyline, // 路段坐标点
                            action: step.action, // 动作
                            assistantAction: step.assistant_action
                        })),
                        polyline: path.polyline // 完整路线坐标点
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('路线规划失败:', error);
            return null;
        }
    }

    // 路线规划（步行）
    async planWalkingRoute(origin, destination) {
        try {
            if (this.amapKey) {
                const response = await axios.get('https://restapi.amap.com/v3/direction/walking', {
                    params: {
                        key: this.amapKey,
                        origin: `${origin.longitude},${origin.latitude}`,
                        destination: `${destination.longitude},${destination.latitude}`
                    }
                });

                if (response.data.status === '1' && response.data.route && response.data.route.paths.length > 0) {
                    const path = response.data.route.paths[0];
                    return {
                        distance: path.distance,
                        duration: path.duration,
                        steps: path.steps.map(step => ({
                            instruction: step.instruction,
                            road: step.road,
                            distance: step.distance,
                            duration: step.duration,
                            polyline: step.polyline
                        })),
                        polyline: path.polyline
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('步行路线规划失败:', error);
            return null;
        }
    }

    // 路线规划（公交）
    async planTransitRoute(origin, destination, city = '') {
        try {
            if (this.amapKey) {
                const response = await axios.get('https://restapi.amap.com/v3/direction/transit/integrated', {
                    params: {
                        key: this.amapKey,
                        origin: `${origin.longitude},${origin.latitude}`,
                        destination: `${destination.longitude},${destination.latitude}`,
                        city: city,
                        strategy: 0 // 0:最快捷模式, 1:最经济模式, 2:最少换乘模式, 3:最少步行模式
                    }
                });

                if (response.data.status === '1' && response.data.route && response.data.route.transits.length > 0) {
                    const transit = response.data.route.transits[0];
                    return {
                        cost: transit.cost, // 费用
                        duration: transit.duration, // 时间（秒）
                        nightflag: transit.nightflag, // 是否夜班车
                        walkingDistance: transit.walking_distance, // 步行距离
                        segments: transit.segments.map(segment => ({
                            walking: segment.walking,
                            bus: segment.bus,
                            entrance: segment.entrance,
                            exit: segment.exit
                        }))
                    };
                }
            }

            return null;
        } catch (error) {
            console.error('公交路线规划失败:', error);
            return null;
        }
    }
}

module.exports = new MapService();

