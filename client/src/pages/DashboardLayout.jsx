import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useSearchHistory } from '../hooks/useSearchHistory';
import SearchBar from '../components/SearchBar';
import SuggestionsPanel from '../components/SuggestionsPanel';
import ProductCard from '../components/ProductCard';
import ProductDetail from '../components/ProductDetail';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import UserMenu from '../components/UserMenu';
import { searchProducts } from '../utils/api';
import './DashboardLayout.css';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { theme, setTheme, THEMES } = useTheme();
  const { history, addSearch, clearHistory } = useSearchHistory();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 768);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const themeDropdownRef = useRef(null);
  const themeTimeoutRef = useRef(null);

  const [state, setState] = useState({
    status: 'idle',
    query: '',
    products: [],
    suggestions: [],
    error: null,
    intent: null,
    message: '',
    selectedProduct: null,
    totalResults: 0,
    fetchTimeMs: 0,
    sources: [],
  });

  const sortedProducts = useMemo(() => {
    if (sortBy === 'relevance') return state.products;
    const arr = [...state.products];
    if (sortBy === 'price-low') {
      return arr.sort((a, b) => (a.convertedPriceINR || 999999) - (b.convertedPriceINR || 999999));
    }
    if (sortBy === 'price-high') {
      return arr.sort((a, b) => (b.convertedPriceINR || 0) - (a.convertedPriceINR || 0));
    }
    if (sortBy === 'rating') {
      return arr.sort((a, b) => (b.ratingStars || 0) - (a.ratingStars || 0));
    }
    return arr;
  }, [state.products, sortBy]);

  // Custom cursor (desktop only)
  const cursorDotRef = useRef(null);

  useEffect(() => {
    if (window.innerWidth <= 1024 || 'ontouchstart' in window) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);
    cursorDotRef.current = dot;

    const handleMove = (e) => {
      dot.style.left = e.clientX + 'px';
      dot.style.top = e.clientY + 'px';
    };

    const handleOver = (e) => {
      const target = e.target;
      if (target.closest('button, a, input, select, [role="button"], .product-card, .history-item, .quick-chip')) {
        dot.classList.add('hovering');
      }
    };

    const handleOut = () => {
      dot.classList.remove('hovering');
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
      dot.remove();
    };
  }, []);

  // Keyboard shortcut: Ctrl+K to focus search
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close theme dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target)) {
        setThemeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSearch = useCallback(async (query, options = {}) => {
    setState(prev => ({
      ...prev, status: 'loading', query,
      products: [], suggestions: [], error: null, selectedProduct: null,
    }));

    const result = await searchProducts(query, options);

    if (!result.success) {
      setState(prev => ({ ...prev, status: 'error', error: result.error }));
      return;
    }

    if (result.mode === 'suggestions') {
      setState(prev => ({
        ...prev, status: 'suggestions',
        suggestions: result.suggestions || [], intent: result.intent, message: result.message,
      }));
      return;
    }

    setState(prev => ({
      ...prev, status: 'results',
      products: result.products || [], intent: result.intent, message: result.message,
      totalResults: result.totalResults || 0, fetchTimeMs: result.fetchTimeMs || 0,
      sources: result.sources || [],
    }));

    // Save to history immediately
    const topResult = result.products?.[0]?.productTitle || '';
    addSearch(query, result.totalResults || 0, topResult);
  }, [addSearch]);

  const handleForceSearch = useCallback((query) => {
    handleSearch(query, { force: true });
  }, [handleSearch]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  const handleNewSearch = () => {
    setState(prev => ({ ...prev, status: 'idle', query: '', products: [], suggestions: [] }));
  };

  const themeIcons = { dark: '🌙', light: '☀️', system: '💻' };
  const themeLabels = { dark: 'Dark', light: 'Light', system: 'System' };

  const handleThemeHover = () => {
    clearTimeout(themeTimeoutRef.current);
    setThemeDropdownOpen(true);
  };

  const handleThemeLeave = () => {
    themeTimeoutRef.current = setTimeout(() => setThemeDropdownOpen(false), 300);
  };

  return (
    <div className={`dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Go to About WebGrade">
            <span className="sidebar-logo-icon">⚡</span>
            <span className="sidebar-logo-text">WebGrade</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(false)} title="Collapse sidebar">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M10 4L6 8L10 12" />
            </svg>
          </button>
        </div>

        <button className="new-search-btn" onClick={handleNewSearch}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v10M3 8h10" />
          </svg>
          New Search
        </button>

        <div className="sidebar-history">
          <div className="history-header">
            <span className="history-title">Recent Searches</span>
            {history.length > 0 && (
              <button className="history-clear" onClick={clearHistory}>Clear</button>
            )}
          </div>
          <div className="history-list">
            {history.length === 0 ? (
              <div className="history-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.3">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <span>No searches yet</span>
              </div>
            ) : (
              history.map((h, idx) => (
                <button key={h.id} className="history-item" onClick={() => handleSearch(h.query)}
                  style={{ animationDelay: `${idx * 40}ms` }}>
                  <span className="history-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                    </svg>
                  </span>
                  <div className="history-info">
                    <span className="history-query">{h.query}</span>
                    <span className="history-meta">{h.resultCount} results</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          {/* Theme in sidebar */}
          <div className="sidebar-theme-section"
            ref={themeDropdownRef}
            onMouseEnter={handleThemeHover}
            onMouseLeave={handleThemeLeave}>
            <button className="sidebar-footer-btn">
              <span>{themeIcons[theme]}</span>
              <span>Theme</span>
              <svg className="theme-chevron" width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5l3 3 3-3" />
              </svg>
            </button>
            {themeDropdownOpen && (
              <div className="theme-dropdown">
                {THEMES.map(t => (
                  <button key={t}
                    className={`theme-dropdown-item ${theme === t ? 'active' : ''}`}
                    onClick={() => { setTheme(t); setThemeDropdownOpen(false); }}>
                    <span className="theme-dropdown-icon">{themeIcons[t]}</span>
                    <span>{themeLabels[t]}</span>
                    {theme === t && <span className="theme-check">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="sidebar-footer-btn" onClick={() => navigate('/app/settings')}>
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ── Sidebar expand button (visible when collapsed) ── */}
      {!sidebarOpen && (
        <button className="sidebar-expand-btn" onClick={() => setSidebarOpen(true)} title="Open sidebar">
          <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 4l4 4-4 4" />
          </svg>
        </button>
      )}

      {/* ── Main Content ── */}
      <div className="dash-main">
        {/* Top Bar */}
        <header className="dash-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7h18M3 12h18M3 17h18" />
            </svg>
          </button>
          <div className="topbar-spacer" />
          <div className="topbar-right">
            <div className="user-menu-wrapper">
              {user ? (
                <>
                  <button className="avatar-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="" className="avatar-img" />
                    ) : (
                      <span className="avatar-letter">{(user.displayName || 'U')[0].toUpperCase()}</span>
                    )}
                  </button>
                  {userMenuOpen && (
                    <UserMenu
                      user={user}
                      onClose={() => setUserMenuOpen(false)}
                      onSettings={() => { setUserMenuOpen(false); navigate('/app/settings'); }}
                      onLogout={() => { setUserMenuOpen(false); handleLogout(); }}
                      onHome={() => { setUserMenuOpen(false); navigate('/'); }}
                    />
                  )}
                </>
              ) : (
                <div className="dash-auth-buttons">
                  <button className="dash-btn-ghost" onClick={() => navigate('/login')}>Sign In</button>
                  <button className="dash-btn-primary" onClick={() => navigate('/register')}>Register</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="dash-content">
          {/* Idle State */}
          {state.status === 'idle' && (
            <div className="dash-welcome fade-in">
              <div className="welcome-glow" />
              <h2>Hello, {user?.displayName || 'there'} <span className="wave">👋</span></h2>
              <p>Search any product to compare prices across India's top platforms.</p>
              <span className="shortcut-hint">
                <kbd>Ctrl</kbd> + <kbd>K</kbd> to search
              </span>
            </div>
          )}

          <div className="dash-search-area">
            <SearchBar onSearch={handleSearch} isLoading={state.status === 'loading'} />
            {state.status === 'idle' && (
              <div className="quick-searches fade-in" style={{ animationDelay: '200ms' }}>
                <span className="quick-label">Try:</span>
                {['nutella 750g', 'paracetamol 500mg', 'samsung galaxy s24', 'iphone 15'].map(term => (
                  <button key={term} className="quick-chip" onClick={() => handleForceSearch(term)}>
                    {term}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Loading */}
          {state.status === 'loading' && <LoadingState />}
          {/* Error */}
          {state.status === 'error' && (
            <ErrorState message={state.error} onRetry={() => state.query && handleSearch(state.query)} />
          )}
          {/* Suggestions */}
          {state.status === 'suggestions' && (
            <SuggestionsPanel
              suggestions={state.suggestions}
              query={state.query}
              onSuggestionClick={handleSearch}
              onForceSearch={() => handleForceSearch(state.query)}
            />
          )}
          {/* Results */}
          {state.status === 'results' && (
            <div className="results-section fade-in">
              <div className="results-header">
                <div className="results-info">
                  <h3 className="results-title">
                    {state.totalResults > 0 ? `${state.totalResults} verified results` : 'No results found'}
                  </h3>
                  <p className="results-meta">
                    {state.message}
                    {state.fetchTimeMs > 0 && <span className="results-time"> · {state.fetchTimeMs}ms</span>}
                  </p>
                </div>
                {state.sources?.length > 0 && (
                  <div className="results-sources">
                    {state.sources.map(s => <span key={s} className="source-tag">{s}</span>)}
                  </div>
                )}
              </div>
              
              <div className="results-controls">
                <span className="sort-label">Sort by:</span>
                <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Rating: High to Low</option>
                </select>
              </div>

              {sortedProducts.length > 0 ? (
                <div className="products-grid">
                  {sortedProducts.map((product, i) => (
                    <ProductCard key={`${product.sourceName}-${i}`} product={product}
                      onClick={(p) => setState(prev => ({ ...prev, selectedProduct: p }))} index={i} />
                  ))}
                </div>
              ) : (
                <div className="no-results fade-in">
                  <div className="no-results-icon">🔍</div>
                  <h3>No verified results found</h3>
                  <p>Try a more specific search term.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Detail Modal */}
      {state.selectedProduct && (
        <ProductDetail product={state.selectedProduct} onClose={() => setState(prev => ({ ...prev, selectedProduct: null }))} />
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* ── Mobile Bottom Nav ── */}
      <nav className="mobile-bottom-nav">
        <button className={`bottom-nav-item ${state.status === 'idle' ? 'active' : ''}`} onClick={handleNewSearch}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path d="M9 22V12h6v10" />
          </svg>
          <span>Home</span>
        </button>
        <button className="bottom-nav-item" onClick={() => document.getElementById('search-input')?.focus()}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <span>Search</span>
        </button>
        <button className="bottom-nav-item" onClick={() => setSidebarOpen(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>History</span>
        </button>
        <button className="bottom-nav-item" onClick={() => navigate(user ? '/app/settings' : '/login')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{user ? 'Profile' : 'Sign In'}</span>
        </button>
      </nav>
    </div>
  );
}
