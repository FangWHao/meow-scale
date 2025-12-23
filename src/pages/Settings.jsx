import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserProfile, updateUserProfile, getPartnerByCode } from '../services/userService';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Settings as SettingsIcon, Save, ArrowLeft, Heart, Link as LinkIcon, Unlink, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const { currentUser, logout } = useAuth();
    const { themeMode, setTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [partnerActionLoading, setPartnerActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [partnerProfile, setPartnerProfile] = useState(null);
    const [partnerCodeInput, setPartnerCodeInput] = useState('');
    const [formData, setFormData] = useState({
        displayName: '',
        height: '',
        targetWeight: '',
        reminderEnabled: false,
        reminderTime: '08:00'
    });

    const fetchProfile = async () => {
        if (currentUser) {
            try {
                const profile = await getUserProfile(currentUser.uid);
                if (profile) {
                    setUserProfile(profile);
                    setFormData({
                        displayName: profile.displayName || '',
                        height: profile.height || '',
                        targetWeight: profile.targetWeight || '',
                        reminderEnabled: profile.reminderEnabled || false,
                        reminderTime: profile.reminderTime || '08:00'
                    });

                    if (profile.partnerUid) {
                        const pProfile = await getUserProfile(profile.partnerUid);
                        setPartnerProfile(pProfile);
                    } else {
                        setPartnerProfile(null);
                    }
                }
            } catch (err) {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await updateUserProfile(currentUser.uid, {
                displayName: formData.displayName,
                height: Number(formData.height),
                targetWeight: formData.targetWeight ? Number(formData.targetWeight) : null,
                reminderEnabled: formData.reminderEnabled,
                reminderTime: formData.reminderTime
            });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleLinkPartner = async () => {
        if (!partnerCodeInput) return;
        setPartnerActionLoading(true);
        setError(null);
        try {
            const partner = await getPartnerByCode(partnerCodeInput.toUpperCase());
            if (!partner) {
                throw new Error("无效的邀请码！请检查后重试。");
            }
            if (partner.id === currentUser.uid) {
                throw new Error("不能绑定你自己哦！🐱");
            }

            // Bidirectional linking
            await updateUserProfile(currentUser.uid, { partnerUid: partner.id });
            await updateUserProfile(partner.id, { partnerUid: currentUser.uid });

            setPartnerCodeInput('');
            await fetchProfile();
        } catch (err) {
            setError(err.message);
        } finally {
            setPartnerActionLoading(false);
        }
    };

    const handleUnlinkPartner = async () => {
        if (!window.confirm("确定要解除与对方的绑定吗？")) return;
        setPartnerActionLoading(true);
        try {
            if (userProfile?.partnerUid) {
                // Bidirectional unlinking
                await updateUserProfile(userProfile.partnerUid, { partnerUid: null });
            }
            await updateUserProfile(currentUser.uid, { partnerUid: null });
            await fetchProfile();
        } catch (err) {
            setError(err.message);
        } finally {
            setPartnerActionLoading(false);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '50vh' }}>加载中... 🐾</div>;

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '10px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <SettingsIcon size={24} /> 个人设置
                </h2>
            </div>

            <section style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-text-light)' }}>资料修改 📝</h3>
                <Card>
                    <form onSubmit={handleSubmit}>
                        <Input
                            label="我的昵称 (或者猫咪名?)"
                            value={formData.displayName}
                            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                            required
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <Input
                                label="身高 (cm)"
                                type="number"
                                value={formData.height}
                                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                                required
                            />
                            <Input
                                label="理想体重 (kg)"
                                type="number"
                                step="0.1"
                                value={formData.targetWeight}
                                onChange={(e) => setFormData({ ...formData, targetWeight: e.target.value })}
                                placeholder="例如 70.0"
                            />
                        </div>

                        {success && <div style={{ color: 'var(--color-success)', marginBottom: '10px', fontSize: '0.9rem' }}>设置保存成功啦！✨</div>}

                        <Button type="submit" disabled={saving} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            {saving ? '同步中...' : <><Save size={18} /> 保存资料</>}
                        </Button>
                    </form>
                </Card>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-text-light)' }}>通知设置 🔔</h3>
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ fontWeight: '600' }}>开启每日提醒</div>
                                <div style={{ fontSize: '0.8rem', color: '#888' }}>每天准时喊你秤重</div>
                            </div>
                            <input
                                type="checkbox"
                                checked={formData.reminderEnabled}
                                onChange={(e) => setFormData({ ...formData, reminderEnabled: e.target.checked })}
                                style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                            />
                        </div>

                        {formData.reminderEnabled && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontWeight: '600' }}>提醒时间</div>
                                <input
                                    type="time"
                                    value={formData.reminderTime}
                                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                                    style={{
                                        padding: '8px 12px',
                                        borderRadius: '8px',
                                        border: isDark ? '1px solid #4a4a4a' : '1px solid #ddd',
                                        backgroundColor: isDark ? '#3a3a3a' : '#fff',
                                        color: isDark ? '#e0e0e0' : 'var(--color-text)',
                                        fontSize: '1rem'
                                    }}
                                />
                            </div>
                        )}

                        <Button
                            onClick={handleSubmit}
                            disabled={saving}
                            style={{ width: '100%' }}
                        >
                            {saving ? '保存中...' : '保存通知设置'}
                        </Button>
                    </div>
                </Card>
            </section>

            <section style={{ marginBottom: '30px' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-text-light)' }}>主题设置 🎨</h3>
                <Card>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <div style={{ fontWeight: '600', marginBottom: '10px' }}>选择主题模式</div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '15px' }}>
                                选择你喜欢的界面风格
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                            {/* 浅色模式 */}
                            <button
                                onClick={() => setTheme('light')}
                                style={{
                                    padding: '16px 12px',
                                    borderRadius: '12px',
                                    border: themeMode === 'light' ? '2px solid var(--color-primary)' : `2px solid ${isDark ? '#4a4a4a' : '#ddd'}`,
                                    background: themeMode === 'light' ? 'rgba(255, 183, 178, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Sun size={24} color={themeMode === 'light' ? 'var(--color-primary)' : '#888'} />
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: themeMode === 'light' ? '600' : '400',
                                    color: themeMode === 'light' ? 'var(--color-primary)' : 'var(--color-text)'
                                }}>
                                    浅色
                                </span>
                            </button>

                            {/* 深色模式 */}
                            <button
                                onClick={() => setTheme('dark')}
                                style={{
                                    padding: '16px 12px',
                                    borderRadius: '12px',
                                    border: themeMode === 'dark' ? '2px solid var(--color-primary)' : `2px solid ${isDark ? '#4a4a4a' : '#ddd'}`,
                                    background: themeMode === 'dark' ? 'rgba(255, 183, 178, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Moon size={24} color={themeMode === 'dark' ? 'var(--color-primary)' : '#888'} />
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: themeMode === 'dark' ? '600' : '400',
                                    color: themeMode === 'dark' ? 'var(--color-primary)' : 'var(--color-text)'
                                }}>
                                    深色
                                </span>
                            </button>

                            {/* 跟随系统 */}
                            <button
                                onClick={() => setTheme('auto')}
                                style={{
                                    padding: '16px 12px',
                                    borderRadius: '12px',
                                    border: themeMode === 'auto' ? '2px solid var(--color-primary)' : `2px solid ${isDark ? '#4a4a4a' : '#ddd'}`,
                                    background: themeMode === 'auto' ? 'rgba(255, 183, 178, 0.1)' : 'transparent',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '8px',
                                    transition: 'all 0.2s'
                                }}
                            >
                                <Monitor size={24} color={themeMode === 'auto' ? 'var(--color-primary)' : '#888'} />
                                <span style={{
                                    fontSize: '0.85rem',
                                    fontWeight: themeMode === 'auto' ? '600' : '400',
                                    color: themeMode === 'auto' ? 'var(--color-primary)' : 'var(--color-text)'
                                }}>
                                    跟随系统
                                </span>
                            </button>
                        </div>
                    </div>
                </Card>
            </section>

            <section>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: 'var(--color-text-light)' }}>喵咪搭档 💖</h3>
                <Card style={{ border: '2px solid var(--color-surface)' }}>
                    <div style={{ marginBottom: '20px', padding: '15px', background: isDark ? '#3a3a3a' : '#f8f9fa', borderRadius: 'var(--radius-md)' }}>
                        <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>快把你的邀请码分享给 Ta 吧：</p>
                        <div style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '2px' }}>
                            {userProfile?.partnerCode}
                        </div>
                    </div>

                    {partnerProfile ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', background: isDark ? '#3a3a4a' : 'var(--color-accent)', borderRadius: 'var(--radius-md)' }}>
                                <Heart size={20} fill="var(--color-primary)" color="var(--color-primary)" />
                                <div>
                                    <div style={{ fontSize: '0.8rem', color: '#888' }}>当前的猫咪搭档</div>
                                    <div style={{ fontWeight: '600' }}>{partnerProfile.displayName}</div>
                                </div>
                            </div>
                            <Button
                                onClick={handleUnlinkPartner}
                                disabled={partnerActionLoading}
                                style={{ width: '100%' }}
                            >
                                <Unlink size={18} style={{ marginRight: '8px' }} /> 解除绑定
                            </Button>
                        </div>
                    ) : (
                        <div>
                            <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '15px' }}>
                                还没有绑定搭档哦。输入对方的邀请码，开启共同减脂之旅！
                            </p>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input
                                    type="text"
                                    value={partnerCodeInput}
                                    onChange={(e) => setPartnerCodeInput(e.target.value.toUpperCase())}
                                    placeholder="输入对方的邀请码"
                                    style={{
                                        flex: 2,
                                        padding: '12px',
                                        borderRadius: 'var(--radius-md)',
                                        border: '2px solid var(--color-accent)',
                                        fontSize: '1rem',
                                        textAlign: 'center',
                                        letterSpacing: '2px',
                                        backgroundColor: isDark ? '#3a3a3a' : '#fff',
                                        color: isDark ? '#e0e0e0' : 'var(--color-text)'
                                    }}
                                />
                                <Button
                                    onClick={handleLinkPartner}
                                    disabled={partnerActionLoading || !partnerCodeInput}
                                    style={{ flex: 1 }}
                                >
                                    <LinkIcon size={18} style={{ marginRight: '8px' }} /> 绑定
                                </Button>
                            </div>
                        </div>
                    )}

                    {error && !success && (
                        <div style={{ color: '#e74c3c', marginTop: '15px', fontSize: '0.9rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}
                </Card>
            </section>

            <section style={{ marginTop: '30px' }}>
                <Card style={{ border: isDark ? '2px solid #5c3a3a' : '2px solid #fee', background: isDark ? '#3a2a2a' : '#fff5f5' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div>
                            <div style={{ fontWeight: '600', color: '#e74c3c' }}>退出登录</div>
                            <div style={{ fontSize: '0.8rem', color: '#888', marginTop: '4px' }}>
                                退出后需要重新登录才能访问
                            </div>
                        </div>
                        <Button
                            onClick={async () => {
                                if (window.confirm('确定要退出登录吗？')) {
                                    await logout();
                                    navigate('/login');
                                }
                            }}
                            style={{
                                background: '#e74c3c',
                                color: 'white',
                                width: '100%'
                            }}
                        >
                            退出登录
                        </Button>
                    </div>
                </Card>
            </section>
        </div>
    );
};

export default Settings;
