import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            background: 'var(--bg-primary)',
            padding: '40px 24px'
        }}>
            <div className="glass-panel" style={{
                maxWidth: 600,
                padding: '80px 48px',
                borderRadius: 40,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                <div style={{
                    fontSize: '100px',
                    marginBottom: '32px',
                    filter: 'drop-shadow(0 0 30px rgba(99, 102, 241, 0.3))'
                }}>🛸</div>

                <h1 style={{
                    fontSize: '48px',
                    fontWeight: 900,
                    color: '#fff',
                    marginBottom: '16px',
                    letterSpacing: '-2px'
                }}>
                    Sector <span style={{ color: 'var(--color-primary)' }}>Unknown</span>
                </h1>

                <p style={{
                    fontSize: '18px',
                    color: 'var(--text-muted)',
                    marginBottom: '48px',
                    maxWidth: 400,
                    lineHeight: 1.6,
                    fontWeight: 500
                }}>
                    Your navigation coordinates lead to a void. The requested data packet does not exist in this sector.
                </p>

                <Link
                    to="/"
                    className="glass-card"
                    style={{
                        padding: '18px 48px',
                        background: 'var(--color-primary)',
                        color: '#fff',
                        borderRadius: '16px',
                        textDecoration: 'none',
                        fontWeight: 800,
                        fontSize: 16,
                        boxShadow: '0 20px 40px rgba(99, 102, 241, 0.2)',
                        transition: 'all 0.3s',
                        marginTop: 12
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                    RETURN TO HUB
                </Link>
            </div>

            <div style={{
                position: 'fixed',
                bottom: 40,
                fontSize: 12,
                color: 'var(--text-dim)',
                fontFamily: 'monospace',
                letterSpacing: 2,
                opacity: 0.5
            }}>
                {error.statusText || error.message || "ERROR_CODE: 404_VOID_SECTOR"}
            </div>
        </div>
    );
}
