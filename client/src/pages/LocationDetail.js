import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { Card, Empty, Row, Col } from 'antd';
import api from '../utils/api';
import Loading from '../components/Loading';
import './LocationDetail.css';

const LocationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: location, isLoading } = useQuery(
        ['location', id],
        () => api.get(`/locations/${id}`)
    );

    if (isLoading) {
        return <Loading />;
    }

    if (!location) {
        return <Empty description="地点不存在" />;
    }

    return (
        <div className="location-detail-container">
            <Card>
                <h1>{location.name}</h1>
                <p>{location.address}</p>
                <p>{location.description}</p>
                <div className="location-stats">
                    <span>访问次数: {location.visitCount || 0}</span>
                    <span>游记数: {location.travels?.length || 0}</span>
                </div>
            </Card>

            <Card title="相关游记" className="location-travels">
                {location.travels && location.travels.length > 0 ? (
                    <Row gutter={[16, 16]}>
                        {location.travels.map((travel) => (
                            <Col xs={24} sm={12} lg={8} key={travel._id}>
                                <Card
                                    hoverable
                                    cover={
                                        travel.photos?.length > 0 ? (
                                            <img
                                                alt={travel.title}
                                                src={travel.photos[0]}
                                                style={{ height: 200, objectFit: 'cover' }}
                                            />
                                        ) : null
                                    }
                                    onClick={() => navigate(`/travel/${travel._id}`)}
                                >
                                    <Card.Meta title={travel.title} />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                ) : (
                    <Empty description="暂无相关游记" />
                )}
            </Card>
        </div>
    );
};

export default LocationDetail;

