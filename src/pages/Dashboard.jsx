import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfile } from '../services/userService';
import { addWeightRecord, getWeightHistory } from '../services/weightService';
import Card from '../components/Card';
import Button from '../components/Button';
import HistoryChart from '../components/HistoryChart';
import WeightModal from '../components/WeightModal';
import { Cat, Pencil } from 'lucide-react';

const Dashboard = () => {
    const { currentUser } = useAuth();
    const { isDark } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [userProfile, setUserProfile] = useState(null);
    const [partnerProfile, setPartnerProfile] = useState(null);
    const [history, setHistory] = useState([]);
    const [partnerHistory, setPartnerHistory] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadData = async () => {
        if (currentUser) {
            try {
                const profile = await getUserProfile(currentUser.uid);
                if (!profile) {
                    navigate('/onboarding');
                    return;
                }
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
                console.error("Dashboard data load error:", err);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        loadData();
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, [currentUser, navigate]);

    // Daily Reminder Logic
    useEffect(() => {
        if (!userProfile?.reminderEnabled || !userProfile?.reminderTime) return;

        const checkReminder = () => {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

            // Check if it's the right time and we haven't recorded today
            const wasRecordedToday = history.length > 0 && new Date(history[0].timestamp).toLocaleDateString() === now.toLocaleDateString();

            if (currentTime === userProfile.reminderTime && !wasRecordedToday) {
                if ('Notification' in window && Notification.permission === 'granted') {
                    new Notification('喵喵体重提醒 🐾', {
                        body: '嗨！快来秤一下今天的体重吧，看看有没有变成可爱的小胖猫？🐱',
                        icon: '/meow_scale_app_icon.png'
                    });
                }
            }
        };

        const interval = setInterval(checkReminder, 60000); // Check every minute
        return () => clearInterval(interval);
    }, [userProfile, history]);

    const handleAddWeight = async (weightValue) => {
        try {
            const height = userProfile.height;
            const bmi = weightValue / ((height / 100) * (height / 100));

            const result = await addWeightRecord(currentUser.uid, {
                weight: Number(weightValue),
                bmi: Number(bmi.toFixed(1)),
                timestamp: new Date().toISOString()
            });

            setIsModalOpen(false);
            await loadData();

            // 生成反馈
            const latestWeightVal = Number(weightValue);
            if (result.type === 'update') {
                setFeedback({ type: 'neutral', message: `今日记录已更新！🐾` });
            } else if (history.length > 0) {
                const lastW = history[0].weight;
                const diff = latestWeightVal - lastW;
                if (diff > 0.5) {
                    setFeedback({ type: 'mockery', message: `哎呀，又重了 ${diff.toFixed(1)}kg！是不是偷喝奶茶了？🧋` });
                } else if (diff < -0.5) {
                    setFeedback({ type: 'praise', message: `哇！瘦了 ${Math.abs(diff).toFixed(1)}kg！你是最棒的小猫咪！✨` });
                } else {
                    setFeedback({ type: 'neutral', message: `体重很稳定哦，继续保持！🐾` });
                }
            } else {
                setFeedback({ type: 'praise', message: `第一条记录！开启你的喵喵健康之旅吧。🚀` });
            }
        } catch (error) {
            console.error("Error adding weight:", error);
        }
    };

    const getBMICategory = (bmi) => {
        if (bmi < 18.5) return { label: '过低 🦴', color: '#3498db', range: '< 18.5' };
        if (bmi < 24.0) return { label: '正常 ✨', color: '#2ecc71', range: '18.5-24.0' };
        if (bmi < 28.0) return { label: '超重 🍞', color: '#f1c40f', range: '24.0-28.0' };
        return { label: '肥胖 🍕', color: '#e74c3c', range: '≥ 28.0' };
    };

    const BMIIndicator = ({ bmi }) => {
        const category = getBMICategory(bmi);

        // 以 BMI=20 为中心，范围 10-30
        const minBMI = 10;
        const maxBMI = 30;
        const percentage = Math.min(Math.max((bmi - minBMI) / (maxBMI - minBMI) * 100, 0), 100);

        // BMI 区间定义 - 统一颜色
        const ranges = [
            { label: '过低', color: '#3498db', start: 10, end: 18.5 },
            { label: '正常', color: '#2ecc71', start: 18.5, end: 24.0 },
            { label: '超重', color: '#f1c40f', start: 24.0, end: 28.0 },
            { label: '肥胖', color: '#e74c3c', start: 28.0, end: 30 }
        ];

        const totalRange = maxBMI - minBMI;

        return (
            <div style={{ marginTop: '10px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px', color: isDark ? '#a0a0a0' : '#888' }}>
                    <span>{category.label}</span>
                    <span>BMI: {bmi}</span>
                </div>
                <div style={{
                    height: '8px',
                    background: isDark ? '#3a3a3a' : '#eee',
                    borderRadius: '4px',
                    position: 'relative',
                    overflow: 'hidden',
                    display: 'flex'
                }}>
                    {/* 分段显示 BMI 区间 */}
                    {ranges.map((range, index) => {
                        const width = ((range.end - range.start) / totalRange) * 100;
                        const isActive = bmi >= range.start && bmi < range.end;
                        return (
                            <div
                                key={index}
                                style={{
                                    width: `${width}%`,
                                    height: '100%',
                                    background: range.color,
                                    opacity: isActive ? 1 : 0.3,
                                    transition: 'opacity 0.3s ease',
                                    borderRight: index < ranges.length - 1 ? `1px solid ${isDark ? '#2d2d2d' : '#fff'}` : 'none'
                                }}
                            />
                        );
                    })}
                    {/* 当前 BMI 指示器 */}
                    <div style={{
                        position: 'absolute',
                        left: `${percentage}%`,
                        top: '-2px',
                        height: 'calc(100% + 4px)',
                        width: '3px',
                        background: '#fff',
                        boxShadow: '0 0 8px rgba(0,0,0,0.5)',
                        transform: 'translateX(-50%)',
                        transition: 'left 0.5s ease-out',
                        borderRadius: '2px'
                    }} />
                </div>
            </div>
        );
    };

    const ProgressCircle = ({ current, target, initial, label = '目标进度', color = 'var(--color-primary)' }) => {
        if (!target) return null;
        let progress = 0;
        if (initial && target !== initial) {
            progress = ((initial - current) / (initial - target)) * 100;
        } else if (target) {
            progress = Math.max(0, Math.min(100, 100 - Math.abs(current - target) * 10));
        }
        progress = Math.min(Math.max(progress, 0), 100);

        return (
            <div style={{ marginTop: '15px', width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '5px' }}>
                    <span style={{ color: 'var(--color-text-light)' }}>{label}: {target} kg</span>
                    <span style={{ fontWeight: '600' }}>{Math.round(progress)}%</span>
                </div>
                <div className="progress-bar-bg" style={{
                    height: '12px',
                    background: isDark ? '#3a3a3a' : '#f0f0f0',
                    borderRadius: '6px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: color,
                        transition: 'width 1s ease-in-out',
                        borderRadius: '6px'
                    }} />
                </div>
            </div>
        );
    };

    if (loading) return <div className="flex-center" style={{ height: '50vh' }}>加载中... 🐾</div>;

    const latestWeight = history.length > 0 ? history[0] : null;
    const initialWeight = history.length > 0 ? history[history.length - 1].weight : null;
    const partnerLatest = partnerHistory.length > 0 ? partnerHistory[0] : null;
    const partnerInitial = partnerHistory.length > 0 ? partnerHistory[partnerHistory.length - 1].weight : null;

    const wasRecordedToday = latestWeight && new Date(latestWeight.timestamp).toLocaleDateString() === new Date().toLocaleDateString();

    return (
        <div style={{ paddingBottom: '80px' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-text)' }}>
                        嗨，{userProfile?.displayName || '小猫咪'}! 🐱
                    </h2>
                    {partnerProfile && <p style={{ fontSize: '0.9rem', color: 'var(--color-text-light)' }}>伴侣: {partnerProfile.displayName}</p>}
                </div>
                {!partnerProfile && (
                    <div style={{ fontSize: '0.8rem', background: '#EEE', padding: '4px 8px', borderRadius: '8px' }}>
                        我的邀请码: {userProfile?.partnerCode}
                    </div>
                )}
            </div>

            {!wasRecordedToday && !loading && (
                <Card style={{ background: '#FFF9C4', color: '#856404', border: '1px solid #FFE082', marginBottom: '20px', padding: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Cat size={20} />
                        <span style={{ fontWeight: '600' }}>今日尚未记录体重哦，快去秤一下吧！🐾</span>
                    </div>
                </Card>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: partnerProfile ? '1fr 1fr' : '1fr', gap: '16px', marginBottom: '20px' }}>
                <Card className="flex-center" style={{
                    flexDirection: 'column',
                    background: isDark
                        ? 'linear-gradient(135deg, #3a2828 0%, #2d2d2d 50%, #2d2d2d 100%)'
                        : 'linear-gradient(135deg, #FFE5E5 0%, #FFF5F5 50%, #FFFFFF 100%)',
                    padding: '20px 16px'
                }}>
                    <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2px' }}>我</div>
                    <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-primary)', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                        {latestWeight ? latestWeight.weight : '--'} <span style={{ fontSize: '1.2rem' }}>kg</span>
                    </div>
                    {latestWeight && <BMIIndicator bmi={latestWeight.bmi} />}
                    {userProfile?.targetWeight && latestWeight && (
                        <ProgressCircle current={latestWeight.weight} target={userProfile.targetWeight} initial={initialWeight} label="目标" color="var(--color-primary)" />
                    )}
                </Card>

                {partnerProfile && (
                    <Card className="flex-center" style={{
                        flexDirection: 'column',
                        background: isDark
                            ? 'linear-gradient(135deg, #1f3a3a 0%, #2d2d2d 50%, #2d2d2d 100%)'
                            : 'linear-gradient(135deg, #D4F1F4 0%, #E8F8F5 50%, #FFFFFF 100%)',
                        padding: '20px 16px'
                    }}>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '2px' }}>{partnerProfile.displayName}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--color-secondary)', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                            {partnerLatest ? partnerLatest.weight : '--'} <span style={{ fontSize: '1.2rem' }}>kg</span>
                        </div>
                        {partnerLatest && <BMIIndicator bmi={partnerLatest.bmi} />}
                        {partnerProfile.targetWeight && partnerLatest && (
                            <ProgressCircle current={partnerLatest.weight} target={partnerProfile.targetWeight} initial={partnerInitial} label="目标" color="var(--color-secondary)" />
                        )}
                    </Card>
                )}
            </div>

            {feedback && (
                <Card style={{ background: feedback.type === 'mockery' ? 'var(--color-danger)' : (feedback.type === 'praise' ? 'var(--color-success)' : '#F0F0F0'), color: '#555', border: 'none', animation: 'popIn 0.3s ease', marginBottom: '20px' }}>
                    <div className="flex-center" style={{ gap: '12px' }}>
                        <Cat size={24} />
                        <strong>{feedback.message}</strong>
                    </div>
                </Card>
            )}

            <Card>
                <HistoryChart
                    title="体重趋势"
                    userData={history}
                    partnerData={partnerHistory}
                    onViewDetails={() => navigate('/history')}
                />
            </Card>

            {/* Floating Action Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                style={{
                    position: 'fixed',
                    right: '25px',
                    bottom: '25px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(255, 183, 178, 0.6)',
                    zIndex: 900,
                    transition: 'transform 0.2s'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.9)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
                <Pencil size={28} />
            </button>

            <WeightModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddWeight}
                initialWeight={latestWeight ? latestWeight.weight : 60}
                isUpdate={wasRecordedToday}
            />

            <style>{`
                @keyframes popIn {
                  from { transform: scale(0.9); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
