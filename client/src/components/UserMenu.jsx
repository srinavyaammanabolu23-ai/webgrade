import { useEffect, useRef } from 'react';
import './UserMenu.css';

export default function UserMenu({ user, onClose, onSettings, onLogout, onHome }) {
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="user-menu" ref={menuRef}>
      <div className="um-header">
        <div className="um-avatar">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" />
          ) : (
            <span>{(user?.displayName || 'U')[0].toUpperCase()}</span>
          )}
        </div>
        <div className="um-info">
          <div className="um-name">{user?.displayName || 'User'}</div>
          <div className="um-email">{user?.email || ''}</div>
        </div>
      </div>

      <div className="um-divider" />

      <button className="um-item" onClick={onHome}>
        <span className="um-icon">⚡</span> About WebGrade
      </button>

      <div className="um-divider" />

      <button className="um-item" onClick={onSettings}>
        <span className="um-icon">⚙️</span> Settings
      </button>
      <button className="um-item" onClick={onSettings}>
        <span className="um-icon">👤</span> Edit Profile
      </button>
      <button className="um-item" onClick={onSettings}>
        <span className="um-icon">📄</span> Terms & Conditions
      </button>

      <div className="um-divider" />

      <button className="um-item um-item-danger" onClick={onLogout}>
        <span className="um-icon">🚪</span> Log out
      </button>
    </div>
  );
}
