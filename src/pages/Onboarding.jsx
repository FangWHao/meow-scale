import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createUserProfile, generatePartnerCode } from '../services/userService';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Cat, Heart } from 'lucide-react';

const Onboarding = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        displayName: '',
        height: '', // cm
        gender: 'female',
        partnerCode: generatePartnerCode(), // Auto-generate own code
        partnerId: '' // Optional: Enter partner's code
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            let partnerUid = null;
            if (formData.partnerId) {
                // Try to find partner by code
                const partner = await import('../services/userService').then(m => m.getPartnerByCode(formData.partnerId));
                if (partner) {
                    partnerUid = partner.id;
                    // Optional: You could also update the partner to link back to this user here,
                    // or rely on them entering this user's code.
                }
            }

            await createUserProfile(currentUser.uid, {
                ...formData,
                email: currentUser.email,
                height: Number(formData.height),
                partnerUid: partnerUid // Save the resolved UID, not just the code
            });
            navigate('/');
        } catch (error) {
            console.error("Onboarding error:", error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh' }}>
            <Card className="onboarding-card" style={{ maxWidth: '500px', width: '100%' }}>
                <div className="text-center" style={{ marginBottom: '24px' }}>
                    <div style={{
                        background: 'var(--color-secondary)',
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        margin: '0 auto 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Cat size={32} color="#FFF" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text)' }}>Let's get set up! 🐾</h2>
                    <p style={{ color: 'var(--color-text-light)' }}>Tell us a bit about yourself.</p>
                </div>

                {error && (
                    <div style={{
                        background: '#FFE5E5',
                        color: '#D63031',
                        padding: '12px',
                        borderRadius: 'var(--radius-sm)',
                        marginBottom: '16px',
                        fontSize: '0.9rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <Input
                        label="Display Name (Your Cat Name?)"
                        value={formData.displayName}
                        onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        placeholder="e.g. Fluffy destroyer"
                        required
                    />

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Input
                            label="Height (cm)"
                            type="number"
                            value={formData.height}
                            onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                            placeholder="170"
                            required
                        />

                        <div className="input-group" style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: 'var(--color-text)' }}>Gender</label>
                            <select
                                value={formData.gender}
                                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    borderRadius: 'var(--radius-md)',
                                    border: '2px solid transparent',
                                    backgroundColor: '#FFF',
                                    fontSize: '1rem',
                                    color: 'var(--color-text)'
                                }}
                            >
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                    </div>

                    <div style={{ margin: '20px 0', padding: '16px', background: '#FFF0F5', borderRadius: 'var(--radius-md)' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                            <Heart size={16} fill="var(--color-primary)" color="var(--color-primary)" style={{ marginRight: '8px' }} />
                            喵咪搭档 (可选)
                        </h3>
                        <p style={{ fontSize: '0.9rem', marginBottom: '12px', color: 'var(--color-text-light)' }}>
                            把你的邀请码分享给 Ta: <strong>{formData.partnerCode}</strong>
                        </p>
                        <Input
                            label="输入对方的邀请码"
                            value={formData.partnerId}
                            onChange={(e) => setFormData({ ...formData, partnerId: e.target.value })}
                            placeholder="粘贴邀请码到这里..."
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? '同步中...' : '开始探索！'}
                    </Button>
                </form>
            </Card>
        </div>
    );
};

export default Onboarding;
