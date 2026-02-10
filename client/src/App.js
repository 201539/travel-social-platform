import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import Layout from './components/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TravelDetail from './pages/TravelDetail';
import CreateTravel from './pages/CreateTravel';
import Profile from './pages/Profile';
import LocationDetail from './pages/LocationDetail';
import WeatherSearch from './pages/WeatherSearch';
import CitySearch from './pages/CitySearch';
import AdminUsers from './pages/AdminUsers';
import './App.css';

function App() {
    return (
        <ConfigProvider locale={zhCN}>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="travel/:id" element={<TravelDetail />} />
                    <Route path="create-travel" element={<CreateTravel />} />
                    <Route path="profile/:id" element={<Profile />} />
                    <Route path="location/:id" element={<LocationDetail />} />
                    <Route path="weather-search" element={<WeatherSearch />} />
                    <Route path="search" element={<CitySearch />} />
                    <Route path="admin/users" element={<AdminUsers />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ConfigProvider>
    );
}

export default App;

