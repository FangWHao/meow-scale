import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfile } from '../services/userService';
import { getWeightHistory } from '../services/weightService';
import Card from '../components/Card';
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { format } from 'date-fns';

const WeightHistory = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [partnerProfile, setPartnerProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [partnerHistory, setPartnerHistory] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            if (currentUser) {
                try {
                    const profile = await getUserProfile(currentUser.uid);
                    setUserProfile(profile);

                    const weights = await getWeightHistory(currentUser.uid);
                    setHistory(weights);

                    if (profile?.partnerUid) {
                        const pProfile = await getUserProfile(profile.partnerUid);
                        setPartnerProfile(pProfile);
                        const pWeights = await getWeightHistory(profile.partnerUid);
                        setPartnerHistory(pWeights);
                    }
                    setLoading(false);
                } catch (err) {
                    console.error("Error loading history:", err);
                    setLoading(false);
                }
            }
        };
        loadData();
    }, [currentUser]);

    if (loading) return <div className="flex-center" style={{ height: '50vh' }}>加载中... 🐾</div>;

    // Merge and sort all dates
    const allDates = Array.from(new Set([
        ...history.map(d => format(new Date(d.timestamp), 'yyyy-MM-dd')),
        ...partnerHistory.map(d => format(new Date(d.timestamp), 'yyyy-MM-dd'))
    ])).sort().reverse();

    const getRecordForDate = (data, date) => {
        return data.find(d => format(new Date(d.timestamp), 'yyyy-MM-dd') === date);
    };

    const getTrend = (current, previous) => {
        if (!current || !previous) return null;
        const diff = current - previous;
        if (Math.abs(diff) < 0.1) return { icon: Minus, color: '#999', text: '持平' };
        if (diff > 0) return { icon: TrendingUp, color: '#e74c3c', text: `+${diff.toFixed(1)}` };
        return { icon: TrendingDown, color: '#2ecc71', text: diff.toFixed(1) };
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem' }}>详细体重记录 📋</h2>
            </div>

            <Card style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #EEE' }}>
                            <th style={{ padding: '12px 8px', textAlign: 'left', color: '#666', fontWeight: '600' }}>日期</th>
                            <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--color-primary)', fontWeight: '600' }}>
                                {userProfile?.displayName || '我'}
                            </th>
                            <th style={{ padding: '12px 8px', textAlign: 'center', color: '#999', fontWeight: '500' }}>趋势</th>
                            {partnerProfile && (
                                <>
                                    <th style={{ padding: '12px 8px', textAlign: 'center', color: 'var(--color-secondary)', fontWeight: '600' }}>
                                        {partnerProfile.displayName}
                                    </th>
                                    <th style={{ padding: '12px 8px', textAlign: 'center', color: '#999', fontWeight: '500' }}>趋势</th>
                                </>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {allDates.map((date, index) => {
                            const userRecord = getRecordForDate(history, date);
                            const partnerRecord = getRecordForDate(partnerHistory, date);
                            const prevUserRecord = index < allDates.length - 1 ? getRecordForDate(history, allDates[index + 1]) : null;
                            const prevPartnerRecord = index < allDates.length - 1 ? getRecordForDate(partnerHistory, allDates[index + 1]) : null;

                            const userTrend = getTrend(userRecord?.weight, prevUserRecord?.weight);
                            const partnerTrend = getTrend(partnerRecord?.weight, prevPartnerRecord?.weight);

                            return (
                                <tr key={date} style={{ borderBottom: '1px solid #F5F5F5' }}>
                                    <td style={{ padding: '12px 8px', color: isDark ? '#e0e0e0' : '#333', fontWeight: '500' }}>
                                        {format(new Date(date), 'MM.dd')}
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                        {userRecord ? (
                                            <div>
                                                <div style={{ fontWeight: '600', color: 'var(--color-primary)' }}>
                                                    {userRecord.weight} kg
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                                    BMI: {userRecord.bmi}
                                                </div>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#CCC' }}>-</span>
                                        )}
                                    </td>
                                    <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                        {userTrend ? (
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: userTrend.color }}>
                                                <userTrend.icon size={14} />
                                                <span style={{ fontSize: '0.8rem' }}>{userTrend.text}</span>
                                            </div>
                                        ) : (
                                            <span style={{ color: '#CCC' }}>-</span>
                                        )}
                                    </td>
                                    {partnerProfile && (
                                        <>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                {partnerRecord ? (
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--color-secondary)' }}>
                                                            {partnerRecord.weight} kg
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                                            BMI: {partnerRecord.bmi}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#CCC' }}>-</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px 8px', textAlign: 'center' }}>
                                                {partnerTrend ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', color: partnerTrend.color }}>
                                                        <partnerTrend.icon size={14} />
                                                        <span style={{ fontSize: '0.8rem' }}>{partnerTrend.text}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: '#CCC' }}>-</span>
                                                )}
                                            </td>
                                        </>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {allDates.length === 0 && (
                    <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>
                        还没有任何记录哦 🐾
                    </p>
                )}
            </Card>
        </div>
    );
};

export default WeightHistory;
