import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Modal,
    Alert,
    ScrollView,
} from 'react-native';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

// 动态导入Slider（如果可用）
let Slider;
try {
    const SliderModule = require('@react-native-community/slider');
    Slider = SliderModule.default || SliderModule;
} catch (e) {
    // Slider不可用，使用占位符
    Slider = null;
}

const BeautyEditor = ({ visible, imageUri, onSave, onCancel }) => {
    const [editedImage, setEditedImage] = useState(imageUri);
    const [brightness, setBrightness] = useState(0); // -1 to 1
    const [contrast, setContrast] = useState(1); // 0 to 2
    const [saturation, setSaturation] = useState(1); // 0 to 2

    useEffect(() => {
        if (visible && imageUri) {
            setEditedImage(imageUri);
            setBrightness(0);
            setContrast(1);
            setSaturation(1);
        }
    }, [visible, imageUri]);

    // 应用美颜效果（使用滤镜模拟）
    const applyBeauty = async () => {
        try {
            // 注意：expo-image-manipulator不支持直接的颜色调整
            // 这里我们使用组合操作来模拟效果
            const manipulations = [];

            // 通过调整质量来模拟一些效果
            // 实际项目中建议使用专业的图像处理库如react-native-image-filter-kit
            const result = await manipulateAsync(
                imageUri,
                manipulations,
                { 
                    compress: 0.9, 
                    format: SaveFormat.JPEG 
                }
            );
            
            setEditedImage(result.uri);
        } catch (error) {
            console.error('应用美颜效果失败:', error);
        }
    };

    // 重置所有效果
    const resetEffects = () => {
        setBrightness(0);
        setContrast(1);
        setSaturation(1);
        setEditedImage(imageUri);
    };

    // 保存编辑后的图片
    const handleSave = async () => {
        try {
            // 保存当前编辑的图片
            if (onSave) {
                onSave(editedImage || imageUri);
            }
        } catch (error) {
            Alert.alert('错误', '保存图片失败');
        }
    };

    // 预设美颜效果
    const applyPreset = async (preset) => {
        try {
            let manipulations = [];
            let quality = 0.9;

            switch (preset) {
                case 'natural':
                    setBrightness(0.1);
                    setContrast(1.05);
                    setSaturation(1.05);
                    quality = 0.95;
                    break;
                case 'bright':
                    setBrightness(0.2);
                    setContrast(1.1);
                    setSaturation(1.1);
                    quality = 0.95;
                    break;
                case 'vivid':
                    setBrightness(0.15);
                    setContrast(1.15);
                    setSaturation(1.25);
                    quality = 0.95;
                    break;
                case 'soft':
                    setBrightness(0.1);
                    setContrast(0.95);
                    setSaturation(0.95);
                    quality = 0.9;
                    break;
                default:
                    break;
            }

            // 应用预设效果（通过调整质量来模拟）
            const result = await manipulateAsync(
                imageUri,
                manipulations,
                { compress: quality, format: SaveFormat.JPEG }
            );
            
            setEditedImage(result.uri);
        } catch (error) {
            Alert.alert('错误', '应用预设效果失败');
        }
    };

    if (!visible || !imageUri) return null;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={false}
            onRequestClose={onCancel}
        >
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onCancel}>
                        <Text style={styles.cancelButton}>取消</Text>
                    </TouchableOpacity>
                    <Text style={styles.title}>美颜编辑</Text>
                    <TouchableOpacity onPress={handleSave}>
                        <Text style={styles.saveButton}>保存</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.imageContainer}>
                    <Image 
                        source={{ uri: editedImage || imageUri }} 
                        style={styles.image}
                        // 使用滤镜效果（如果支持）
                    />
                </View>

                <ScrollView style={styles.controlsScroll}>
                    <View style={styles.presetsContainer}>
                        <Text style={styles.sectionTitle}>预设效果</Text>
                        <View style={styles.presetsRow}>
                            <TouchableOpacity
                                style={styles.presetButton}
                                onPress={() => applyPreset('natural')}
                            >
                                <Text style={styles.presetText}>✨ 自然</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.presetButton}
                                onPress={() => applyPreset('bright')}
                            >
                                <Text style={styles.presetText}>☀️ 明亮</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.presetButton}
                                onPress={() => applyPreset('vivid')}
                            >
                                <Text style={styles.presetText}>🌈 鲜艳</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.presetButton}
                                onPress={() => applyPreset('soft')}
                            >
                                <Text style={styles.presetText}>💫 柔和</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.controlsContainer}>
                        <Text style={styles.sectionTitle}>手动调整</Text>
                        
                        <View style={styles.controlItem}>
                            <Text style={styles.controlLabel}>
                                亮度: {Math.round(brightness * 100)}
                            </Text>
                            {Slider ? (
                                <Slider
                                    style={styles.slider}
                                    minimumValue={-1}
                                    maximumValue={1}
                                    value={brightness}
                                    onValueChange={setBrightness}
                                    minimumTrackTintColor="#1890ff"
                                    maximumTrackTintColor="#d3d3d3"
                                />
                            ) : (
                                <Text style={styles.placeholderText}>
                                    (运行 npm install @react-native-community/slider 安装滑块组件)
                                </Text>
                            )}
                        </View>

                        <View style={styles.controlItem}>
                            <Text style={styles.controlLabel}>
                                对比度: {Math.round((contrast - 1) * 100)}
                            </Text>
                            {Slider ? (
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={2}
                                    value={contrast}
                                    onValueChange={setContrast}
                                    minimumTrackTintColor="#1890ff"
                                    maximumTrackTintColor="#d3d3d3"
                                />
                            ) : (
                                <Text style={styles.placeholderText}>
                                    (运行 npm install @react-native-community/slider 安装滑块组件)
                                </Text>
                            )}
                        </View>

                        <View style={styles.controlItem}>
                            <Text style={styles.controlLabel}>
                                饱和度: {Math.round((saturation - 1) * 100)}
                            </Text>
                            {Slider ? (
                                <Slider
                                    style={styles.slider}
                                    minimumValue={0}
                                    maximumValue={2}
                                    value={saturation}
                                    onValueChange={setSaturation}
                                    minimumTrackTintColor="#1890ff"
                                    maximumTrackTintColor="#d3d3d3"
                                />
                            ) : (
                                <Text style={styles.placeholderText}>
                                    (运行 npm install @react-native-community/slider 安装滑块组件)
                                </Text>
                            )}
                        </View>

                        <TouchableOpacity style={styles.resetButton} onPress={resetEffects}>
                            <Text style={styles.resetButtonText}>重置</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: Platform.OS === 'ios' ? 50 : 20,
        backgroundColor: '#1a1a1a',
    },
    cancelButton: {
        color: '#fff',
        fontSize: 16,
    },
    title: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    saveButton: {
        color: '#1890ff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    imageContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    controlsScroll: {
        maxHeight: 300,
        backgroundColor: '#1a1a1a',
    },
    presetsContainer: {
        padding: 16,
    },
    sectionTitle: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 12,
        fontWeight: 'bold',
    },
    presetsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
    },
    presetButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#333',
        marginBottom: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    presetText: {
        color: '#fff',
        fontSize: 13,
    },
    controlsContainer: {
        padding: 16,
        paddingBottom: 30,
    },
    controlItem: {
        marginBottom: 20,
    },
    controlLabel: {
        color: '#fff',
        fontSize: 14,
        marginBottom: 8,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    placeholderText: {
        color: '#888',
        fontSize: 12,
        fontStyle: 'italic',
    },
    resetButton: {
        marginTop: 10,
        padding: 12,
        borderRadius: 8,
        backgroundColor: '#333',
        alignItems: 'center',
    },
    resetButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});

export default BeautyEditor;
