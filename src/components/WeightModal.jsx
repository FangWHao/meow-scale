import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import RulerPicker from './RulerPicker';
import { X } from 'lucide-react';

const WeightModal = ({ isOpen, onClose, onSave, initialWeight = 60, isUpdate = false }) => {
    const [weight, setWeight] = useState(initialWeight);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            animation: 'fadeIn 0.3s ease'
        }} onClick={onClose}>
            <div
                style={{
                    width: '100%',
                    maxWidth: '600px',
                    backgroundColor: 'var(--color-background)',
                    borderTopLeftRadius: '30px',
                    borderTopRightRadius: '30px',
                    padding: '30px 20px',
                    boxShadow: '0 -10px 30px rgba(0,0,0,0.1)',
                    animation: 'slideUp 0.3s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '1.4rem', color: 'var(--color-text)' }}>上传今日体重 🐾</h3>
                    <button onClick={onClose} style={{ color: '#BBB' }}>
                        <X size={28} />
                    </button>
                </div>

                <RulerPicker value={weight} onChange={setWeight} />

                {isUpdate && (
                    <p style={{
                        fontSize: '0.85rem',
                        color: '#E67E22',
                        background: '#FDF2E9',
                        padding: '10px',
                        borderRadius: '10px',
                        marginTop: '15px',
                        textAlign: 'center',
                        border: '1px solid #FAE5D3'
                    }}>
                        ⚠️ 您今天已经记录过体重了，确定要覆盖它吗？
                    </p>
                )}

                <div style={{ marginTop: '30px' }}>
                    <Button onClick={() => onSave(weight)} style={{ width: '100%', fontSize: '1.2rem', padding: '15px' }}>
                        {isUpdate ? '保存并覆盖' : '确定记录'}
                    </Button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default WeightModal;
