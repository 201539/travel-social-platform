import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, DatePicker, Button, Upload, message, Card, Space, Alert, Modal, Spin } from 'antd';
import { PlusOutlined, EditOutlined, RobotOutlined } from '@ant-design/icons';
import api from '../utils/api';
import { isAuthenticated } from '../utils/auth';
import BeautyEditor from '../components/BeautyEditor';
import './CreateTravel.css';

const { TextArea } = Input;

const CreateTravel = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [authenticated, setAuthenticated] = useState(false);
    const [beautyEditorVisible, setBeautyEditorVisible] = useState(false);
    const [selectedImageForBeauty, setSelectedImageForBeauty] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(-1);
    const [aiWritingVisible, setAiWritingVisible] = useState(false);
    const [aiWritingLoading, setAiWritingLoading] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            navigate('/login');
        } else {
            setAuthenticated(true);
        }
    }, [navigate]);

    if (!authenticated) {
        return null;
    }

    // 上传图片（直接上传，不编辑）
    const handleUpload = async (file) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPhotos([...photos, response.url]);
            message.success('上传成功');
            return false; // 阻止默认上传
        } catch (error) {
            message.error(error.response?.data?.message || '上传失败');
            return false;
        }
    };

    // 打开美颜编辑器
    const openBeautyEditor = (imageUrl, index) => {
        setSelectedImageForBeauty(imageUrl);
        setSelectedImageIndex(index);
        setBeautyEditorVisible(true);
    };

    // 保存美颜编辑后的图片
    const handleBeautySave = async (imageUrl, blob) => {
        try {
            // 上传编辑后的图片
            const formData = new FormData();
            formData.append('image', blob, 'edited-image.jpg');

            const response = await api.post('/files/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            // 替换原图片
            if (selectedImageIndex >= 0) {
                const newPhotos = [...photos];
                newPhotos[selectedImageIndex] = response.url;
                setPhotos(newPhotos);
            } else {
                // 如果是新上传的，添加到列表
                setPhotos([...photos, response.url]);
            }

            message.success('美颜编辑已保存');
            setBeautyEditorVisible(false);
            setSelectedImageForBeauty(null);
            setSelectedImageIndex(-1);
        } catch (error) {
            message.error('保存失败：' + (error.response?.data?.message || '未知错误'));
        }
    };

    // 取消美颜编辑
    const handleBeautyCancel = () => {
        setBeautyEditorVisible(false);
        setSelectedImageForBeauty(null);
        setSelectedImageIndex(-1);
    };

    // AI帮写功能
    const handleAIWrite = () => {
        setAiWritingVisible(true);
        setAiPrompt('');
    };

    const handleAIWriteConfirm = async () => {
        setAiWritingLoading(true);
        try {
            const formValues = form.getFieldsValue();
            const tags = formValues.tags ? formValues.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

            const response = await api.post('/ai/write-travel', {
                title: formValues.title || '',
                locationName: formValues.locationName || '',
                startDate: formValues.dateRange?.[0]?.toISOString() || '',
                endDate: formValues.dateRange?.[1]?.toISOString() || '',
                tags: tags,
                userPrompt: aiPrompt || undefined
            });

            console.log('AI帮写响应:', response);
            
            // api拦截器已经返回了response.data，所以response就是数据对象
            if (response && response.success && response.content) {
                // 将AI生成的内容填入描述框
                const content = response.content.trim();
                console.log('准备填入内容，长度:', content.length, '内容预览:', content.substring(0, 50));
                
                // 使用setFieldsValue更新表单
                form.setFieldsValue({ 
                    description: content 
                });
                
                // 立即验证并强制更新
                const currentValue = form.getFieldValue('description');
                console.log('表单当前值（设置后）:', currentValue ? currentValue.substring(0, 50) : '空');
                
                // 如果setFieldsValue没有立即生效，使用setFieldValue
                if (!currentValue || currentValue !== content) {
                    console.log('使用setFieldValue重新设置');
                    form.setFieldValue('description', content);
                }
                
                message.success('AI帮写完成！内容已填入游记内容框');
                setAiWritingVisible(false);
                setAiPrompt('');
            } else {
                console.error('AI帮写响应格式错误:', response);
                const errorMsg = response?.message || 'AI帮写失败，请检查响应数据';
                message.error(errorMsg);
            }
        } catch (error) {
            console.error('AI帮写错误:', error);
            message.error(error.response?.data?.message || 'AI帮写失败，请稍后重试');
        } finally {
            setAiWritingLoading(false);
        }
    };

    const handleAIWriteCancel = () => {
        setAiWritingVisible(false);
        setAiPrompt('');
    };

    const onFinish = async (values) => {
        setLoading(true);
        try {
            // 处理tags - 将字符串转换为数组
            let tags = [];
            if (values.tags) {
                tags = values.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
            }

            const travelData = {
                title: values.title,
                description: values.description,
                locationName: values.locationName || '',
                startDate: values.dateRange[0].toISOString(),
                endDate: values.dateRange[1].toISOString(),
                photos: photos,
                tags: tags,
            };

            const response = await api.post('/travels', travelData);
            message.success('游记创建成功');
            navigate(`/travel/${response.travel._id}`);
        } catch (error) {
            message.error(error.response?.data?.message || '创建失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-travel-container">
            <Card title="创建游记">
                <Alert
                    message="提示"
                    description="上传的照片会自动保存，最多可上传10张。标签用逗号分隔。"
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                />
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="title"
                        label="标题"
                        rules={[{ required: true, message: '请输入游记标题' }]}
                    >
                        <Input placeholder="给你的游记起个标题" />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="旅行日期"
                        rules={[{ required: true, message: '请选择旅行日期' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="locationName"
                        label="地点"
                    >
                        <Input placeholder="旅行地点（可选）" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="游记内容"
                        rules={[{ required: true, message: '请输入游记内容' }]}
                    >
                        <TextArea
                            rows={8}
                            placeholder="记录你的旅行故事..."
                        />
                    </Form.Item>
                    
                    <Form.Item>
                        <Button
                            type="dashed"
                            icon={<RobotOutlined />}
                            onClick={handleAIWrite}
                            style={{ width: '100%' }}
                            block
                        >
                            🤖 AI帮写游记
                        </Button>
                    </Form.Item>

                    <Form.Item
                        name="tags"
                        label="标签"
                        help="用逗号分隔多个标签，如：旅行,摄影,美食"
                    >
                        <Input placeholder="旅行,摄影,美食" />
                    </Form.Item>

                    <Form.Item label="照片">
                        <div>
                            <Upload
                                listType="picture-card"
                                fileList={photos.map((url, index) => ({
                                    uid: index,
                                    url: url,
                                    status: 'done',
                                }))}
                                beforeUpload={handleUpload}
                                onRemove={(file) => {
                                    const index = photos.findIndex(p => p === file.url);
                                    if (index > -1) {
                                        setPhotos(photos.filter((_, i) => i !== index));
                                    }
                                }}
                                accept="image/*"
                                maxCount={10}
                            >
                                {photos.length < 10 && (
                                    <div>
                                        <PlusOutlined />
                                        <div style={{ marginTop: 8 }}>上传</div>
                                    </div>
                                )}
                            </Upload>
                            {photos.length > 0 && (
                                <div style={{ marginTop: 16 }}>
                                    <Space wrap>
                                        {photos.map((url, index) => (
                                            <div key={index} style={{ position: 'relative', display: 'inline-block', marginRight: 8, marginBottom: 8 }}>
                                                <img
                                                    src={url}
                                                    alt={`预览 ${index + 1}`}
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 4,
                                                        border: '1px solid #d9d9d9'
                                                    }}
                                                />
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<EditOutlined />}
                                                    onClick={() => openBeautyEditor(url, index)}
                                                    style={{
                                                        position: 'absolute',
                                                        bottom: 4,
                                                        left: '50%',
                                                        transform: 'translateX(-50%)',
                                                        width: '90%'
                                                    }}
                                                >
                                                    美颜
                                                </Button>
                                            </div>
                                        ))}
                                    </Space>
                                </div>
                            )}
                        </div>
                        <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                            💡 提示：上传后可以点击照片下方的"美颜"按钮对照片进行编辑
                        </div>
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                发布游记
                            </Button>
                            <Button onClick={() => navigate('/')}>
                                取消
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>

            {/* 美颜编辑器 */}
            <BeautyEditor
                visible={beautyEditorVisible}
                imageUrl={selectedImageForBeauty}
                onSave={handleBeautySave}
                onCancel={handleBeautyCancel}
            />

            {/* AI帮写对话框 */}
            <Modal
                title={
                    <span>
                        <RobotOutlined style={{ marginRight: 8 }} />
                        AI帮写游记
                    </span>
                }
                open={aiWritingVisible}
                onOk={handleAIWriteConfirm}
                onCancel={handleAIWriteCancel}
                okText="生成内容"
                cancelText="取消"
                confirmLoading={aiWritingLoading}
                width={600}
            >
                <div style={{ marginBottom: 16 }}>
                    <p style={{ marginBottom: 8, color: '#666' }}>
                        AI将根据你已填写的信息（标题、地点、日期、标签）自动生成游记内容。
                    </p>
                    <p style={{ marginBottom: 16, color: '#666', fontSize: '12px' }}>
                        你也可以在下方输入自定义要求，让AI按照你的想法来写：
                    </p>
                    <TextArea
                        rows={4}
                        placeholder="例如：写一篇轻松愉快的游记，重点描述美食体验...（可选，留空则使用默认风格）"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                    />
                </div>
                {aiWritingLoading && (
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                        <p style={{ marginTop: 16, color: '#666' }}>AI正在创作中，请稍候...</p>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CreateTravel;

