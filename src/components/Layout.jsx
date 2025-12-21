import React from 'react';
import { Cat, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
    return (
        <div className="layout-wrapper">
            <header className="main-header">
                <div className="container flex-center" style={{ flexDirection: 'row', justifyContent: 'space-between', minHeight: 'auto', padding: '10px 20px' }}>
                    <div className="brand flex-center">
                        <div className="cat-icon-bg">
                            <Cat size={24} color="#6A5D5D" />
                        </div>
                        <h1 style={{ fontSize: '1.5rem', marginLeft: '10px', color: 'var(--color-text)' }}>Meow Scale</h1>
                    </div>
                    <nav>
                        <Link to="/settings" style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            textDecoration: 'none',
                            color: 'var(--color-text-light)',
                            fontSize: '0.9rem'
                        }}>
                            <Settings size={18} /> 设置
                        </Link>
                    </nav>
                </div>
            </header>
            <main className="container">
                {children}
            </main>

            <style>{`
        .layout-wrapper {
          min-height: 100vh;
        }
        .main-header {
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 2px solid var(--color-surface);
        }
        .cat-icon-bg {
          background: var(--color-primary);
          padding: 8px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(255, 183, 178, 0.4);
        }
      `}</style>
        </div>
    );
};

export default Layout;
