import React, { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { Cat } from 'lucide-react';

const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                navigate('/');
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                navigate('/onboarding');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '80vh' }}>
            <Card className="login-card" style={{ maxWidth: '400px', width: '100%' }}>
                <div className="text-center" style={{ marginBottom: '24px' }}>
                    <div style={{
                        background: 'var(--color-primary)',
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
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--color-text)' }}>
                        {isLogin ? '欢迎回来，小主！' : '加入喵喵称重！'}
                    </h2>
                    <p style={{ color: 'var(--color-text-light)' }}>
                        {isLogin ? '你的猫咪想你啦。' : '开启和 Ta 的同步健康之旅。'}
                    </p>
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
                        label="邮箱"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="meow@example.com"
                        required
                    />
                    <Input
                        label="密码"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                    />

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                        style={{ marginTop: '8px' }}
                    >
                        {loading ? '同步中...' : (isLogin ? '登录' : '注册')}
                    </Button>
                </form>

                <div className="text-center" style={{ marginTop: '20px' }}>
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        style={{ color: 'var(--color-text-light)', textDecoration: 'underline', fontSize: '0.9rem' }}
                    >
                        {isLogin ? "还没有账号？去注册" : "已有账号？去登录"}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default Login;
