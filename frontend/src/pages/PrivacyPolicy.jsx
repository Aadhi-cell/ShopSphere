import React from 'react';

export default function PrivacyPolicy() {
    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', padding: '100px 24px' }}>
            <div className="glass-panel" style={{ padding: '60px', maxWidth: '900px', margin: '0 auto', borderRadius: 32 }}>
                <h1 style={{ fontSize: '32px', fontWeight: '900', marginBottom: '24px', color: 'var(--text-main)', letterSpacing: '-1px' }}>Privacy <span style={{ color: 'var(--color-primary)' }}>Policy</span></h1>
                <div style={{ lineHeight: '1.8', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <p style={{ marginBottom: '24px', fontSize: 16 }}>
                        Your privacy is our priority. This policy outlines how ShopSphere collects, uses, and protects your personal information.
                    </p>

                    <div className="glass-card" style={{ padding: 28, borderRadius: 20, marginBottom: 24 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Information Collection</h2>
                        <p style={{ marginBottom: '0' }}>
                            We collect information when you register, make a purchase, or contact support. This includes your name, email address, and shipping details.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 28, borderRadius: 20, marginBottom: 24 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Data Usage</h2>
                        <p style={{ marginBottom: '0' }}>
                            Your data is used to process orders and improve our services. We do not share your personal information with third parties for marketing purposes.
                        </p>
                    </div>

                    <div className="glass-card" style={{ padding: 28, borderRadius: 20 }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '12px', color: 'var(--color-primary)', textTransform: 'uppercase', letterSpacing: 1 }}>Security</h2>
                        <p style={{ marginBottom: '0' }}>
                            We use industry-standard encryption to protect your data. While no system is absolute, we continuously update our security measures to ensure user safety.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
