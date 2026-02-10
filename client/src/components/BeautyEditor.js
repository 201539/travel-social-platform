import React, { useState, useRef, useEffect } from 'react';
import { Modal, Button, Slider, Space, Card, Row, Col, message } from 'antd';
import { CheckOutlined, CloseOutlined, ReloadOutlined } from '@ant-design/icons';
import './BeautyEditor.css';

const BeautyEditor = ({ visible, imageUrl, onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const imageRef = useRef(null);
    const [brightness, setBrightness] = useState(0);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [originalImage, setOriginalImage] = useState(null);

    // 预设效果
    const presets = [
        { name: '自然', brightness: 0, contrast: 100, saturation: 100 },
        { name: '明亮', brightness: 20, contrast: 110, saturation: 105 },
        { name: '鲜艳', brightness: 5, contrast: 105, saturation: 130 },
        { name: '柔和', brightness: 10, contrast: 95, saturation: 90 },
    ];

    // 加载图片
    useEffect(() => {
        if (visible && imageUrl) {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                setOriginalImage(img);
                drawImage(img);
            };
            img.src = imageUrl;
        }
    }, [visible, imageUrl]);

    // 当参数改变时重新绘制
    useEffect(() => {
        if (originalImage) {
            drawImage(originalImage);
        }
    }, [brightness, contrast, saturation, originalImage]);

    // 绘制图片到Canvas
    const drawImage = (img) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;

        // 应用滤镜效果
        ctx.filter = `brightness(${100 + brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0);
    };

    // 应用预设效果
    const applyPreset = (preset) => {
        setBrightness(preset.brightness);
        setContrast(preset.contrast);
        setSaturation(preset.saturation);
    };

    // 重置效果
    const resetEffects = () => {
        setBrightness(0);
        setContrast(100);
        setSaturation(100);
    };

    // 保存编辑后的图片
    const handleSave = () => {
        const canvas = canvasRef.current;
        if (!canvas) {
            message.error('无法保存图片');
            return;
        }

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                onSave(url, blob);
            } else {
                message.error('保存失败');
            }
        }, 'image/jpeg', 0.95);
    };

    // 取消编辑
    const handleCancel = () => {
        resetEffects();
        onCancel();
    };

    return (
        <Modal
            title="美颜编辑"
            open={visible}
            onCancel={handleCancel}
            width={800}
            footer={null}
            className="beauty-editor-modal"
        >
            <div className="beauty-editor-container">
                <Row gutter={[16, 16]}>
                    {/* 图片预览区域 */}
                    <Col span={24}>
                        <Card title="预览" size="small">
                            <div className="image-preview-container">
                                <canvas
                                    ref={canvasRef}
                                    className="preview-canvas"
                                    style={{
                                        maxWidth: '100%',
                                        height: 'auto',
                                        display: 'block',
                                        margin: '0 auto'
                                    }}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* 预设效果 */}
                    <Col span={24}>
                        <Card title="预设效果" size="small">
                            <Space wrap>
                                {presets.map((preset, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => applyPreset(preset)}
                                        size="small"
                                    >
                                        {preset.name}
                                    </Button>
                                ))}
                                <Button
                                    icon={<ReloadOutlined />}
                                    onClick={resetEffects}
                                    size="small"
                                >
                                    重置
                                </Button>
                            </Space>
                        </Card>
                    </Col>

                    {/* 手动调整 */}
                    <Col span={24}>
                        <Card title="手动调整" size="small">
                            <div className="slider-item">
                                <div className="slider-label">
                                    <span>亮度</span>
                                    <span className="slider-value">{brightness > 0 ? '+' : ''}{brightness}</span>
                                </div>
                                <Slider
                                    min={-50}
                                    max={50}
                                    value={brightness}
                                    onChange={setBrightness}
                                    tooltip={{ formatter: (value) => `${value > 0 ? '+' : ''}${value}` }}
                                />
                            </div>

                            <div className="slider-item">
                                <div className="slider-label">
                                    <span>对比度</span>
                                    <span className="slider-value">{contrast}%</span>
                                </div>
                                <Slider
                                    min={50}
                                    max={150}
                                    value={contrast}
                                    onChange={setContrast}
                                    tooltip={{ formatter: (value) => `${value}%` }}
                                />
                            </div>

                            <div className="slider-item">
                                <div className="slider-label">
                                    <span>饱和度</span>
                                    <span className="slider-value">{saturation}%</span>
                                </div>
                                <Slider
                                    min={0}
                                    max={200}
                                    value={saturation}
                                    onChange={setSaturation}
                                    tooltip={{ formatter: (value) => `${value}%` }}
                                />
                            </div>
                        </Card>
                    </Col>

                    {/* 操作按钮 */}
                    <Col span={24}>
                        <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                            <Button onClick={handleCancel} icon={<CloseOutlined />}>
                                取消
                            </Button>
                            <Button type="primary" onClick={handleSave} icon={<CheckOutlined />}>
                                保存
                            </Button>
                        </Space>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default BeautyEditor;
