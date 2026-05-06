import React from 'react';

export default function UserAgreement() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '100px 24px' }}>
            <div className="glass-panel" style={{ padding: '60px', maxWidth: '900px', margin: '0 auto', borderRadius: 32 }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px', color: 'var(--text-main)', letterSpacing: '-1px' }}>Terms of <span style={{ color: 'var(--color-primary)' }}>Service</span></h1>
                <div style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <p style={{ marginBottom: '32px', fontSize: 16 }}>
                        Welcome to ShopSphere. By using our services, you agree to be bound by the following terms and conditions.
                    </p>

                    <div className="glass-card" style={{ padding: 28, borderRadius: 24, marginBottom: 24 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Account Responsibility</h2>
                        <p style={{ marginBottom: '0' }}>
                            You are responsible for maintaining the security of your account and credentials. Any activity registered under your account is your responsibility.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 28, borderRadius: 24, marginBottom: 24 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Usage Policy</h2>
                        <p style={{ marginBottom: '0' }}>
                            Unlawful or harmful use of our services is strictly prohibited. Any attempt to disrupt the platform or compromise user data will result in immediate account termination.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 32, borderRadius: 24 }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '16px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Neutralization</h2>
                        <p style={{ marginBottom: '0' }}>
                            We reserve the authority to neutralize or suspend access to this terminal at our discretion, without prior alert, for breach of protocol or conduct deemed hazardous to the network or its operatives.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
