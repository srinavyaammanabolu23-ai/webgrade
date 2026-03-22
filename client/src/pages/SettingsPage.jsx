import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import './SettingsPage.css';

const TABS = ['Profile', 'Appearance', 'About', 'Terms'];

export default function SettingsPage() {
  const { user, updateUserProfile, logout } = useAuth();
  const { theme, setTheme, THEMES } = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState('Profile');
  const [name, setName] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveProfile() {
    setSaving(true);
    await updateUserProfile({ displayName: name });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <div className="settings-page">
      <div className="settings-header">
        <button className="settings-back" onClick={() => navigate('/app')}>← Back</button>
        <h1>Settings</h1>
      </div>

      <div className="settings-layout">
        <nav className="settings-tabs">
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'Profile' && '👤 '}
              {t === 'Appearance' && '🎨 '}
              {t === 'About' && 'ℹ️ '}
              {t === 'Terms' && '📄 '}
              {t}
            </button>
          ))}
        </nav>

        <div className="settings-content">
          {/* Profile Tab */}
          {tab === 'Profile' && (
            <div className="settings-panel fade-in">
              <h2>Profile</h2>
              <p className="panel-sub">Manage your account information</p>

              <div className="profile-avatar-section">
                <div className="profile-avatar-lg">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="" />
                  ) : (
                    <span>{(user?.displayName || 'U')[0].toUpperCase()}</span>
                  )}
                </div>
                <div className="profile-avatar-info">
                  <h3>{user?.displayName || 'User'}</h3>
                  <p>{user?.email}</p>
                </div>
              </div>

              <div className="settings-field">
                <label>Display Name</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name" />
              </div>

              <div className="settings-field">
                <label>Email</label>
                <input type="email" value={user?.email || ''} disabled
                  className="field-disabled" />
                <span className="field-note">Email cannot be changed</span>
              </div>

              <div className="settings-actions">
                <button className="settings-save" onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </div>

              <div className="danger-zone">
                <h3>Session</h3>
                <button className="danger-btn" onClick={handleLogout}>Log out of WebGrade</button>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {tab === 'Appearance' && (
            <div className="settings-panel fade-in">
              <h2>Appearance</h2>
              <p className="panel-sub">Choose your preferred theme</p>

              <div className="theme-options">
                {THEMES.map(t => (
                  <button key={t} className={`theme-option ${theme === t ? 'active' : ''}`}
                    onClick={() => setTheme(t)}>
                    <span className="theme-preview" data-preview={t}>
                      {t === 'dark' ? '🌙' : t === 'light' ? '☀️' : '💻'}
                    </span>
                    <span className="theme-name">{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                    {theme === t && <span className="theme-check">✓</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* About Tab */}
          {tab === 'About' && (
            <div className="settings-panel fade-in">
              <h2>About WebGrade</h2>
              <p className="panel-sub">Version 1.0.0</p>

              <div className="about-info">
                <div className="about-row">
                  <span className="about-label">Platform</span>
                  <span>Live Product Comparison & Grading</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Coverage</span>
                  <span>20+ Indian & Global Sources</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Currency</span>
                  <span>All prices in ₹ (INR)</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Sources</span>
                  <span>Flipkart, Amazon, BigBasket, eBay, openFDA, OpenFoodFacts, UPCItemDB & more</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Rating System</span>
                  <span>Bronze → Silver → Gold → Platinum</span>
                </div>
              </div>
            </div>
          )}

          {/* Terms Tab */}
          {tab === 'Terms' && (
            <div className="settings-panel fade-in">
              <h2>Terms & Conditions</h2>
              <p className="panel-sub">Last updated: March 2026</p>

              <div className="terms-content">
                <h3>1. Service Description</h3>
                <p>WebGrade is a product comparison platform that aggregates pricing data from third-party APIs including Google Shopping, eBay, OpenFoodFacts, openFDA, and UPCItemDB. We do not sell products directly.</p>

                <h3>2. Data Accuracy</h3>
                <p>Prices displayed are fetched in real-time from external sources. We strive for accuracy but cannot guarantee that prices are current or complete. Always verify prices on the retailer's website before purchasing.</p>

                <h3>3. User Accounts</h3>
                <p>You are responsible for maintaining the confidentiality of your account credentials. Search history is stored to improve your experience and can be cleared at any time.</p>

                <h3>4. Privacy</h3>
                <p>We collect only the data necessary to provide our services: your name, email, search queries, and theme preference. We do not sell or share your personal data with third parties.</p>

                <h3>5. Fair Use</h3>
                <p>The platform is provided for personal, non-commercial use. Automated scraping or excessive API calls may result in account suspension.</p>

                <h3>6. Limitation of Liability</h3>
                <p>WebGrade is not responsible for any purchasing decisions made based on the data displayed. We are not affiliated with any of the retailers whose prices we aggregate.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
