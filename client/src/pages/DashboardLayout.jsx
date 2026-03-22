import { useState, useCallback } from 'react';
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
  const { cycleTheme, theme } = useTheme();
  const { history, addSearch, clearHistory } = useSearchHistory();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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

  const handleSearch = useCallback(async (query) => {
    setState(prev => ({
      ...prev, status: 'loading', query,
      products: [], suggestions: [], error: null, selectedProduct: null,
    }));

    const result = await searchProducts(query);

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

    // Save to history
    const topResult = result.products?.[0]?.productTitle || '';
    addSearch(query, result.totalResults || 0, topResult);
  }, [addSearch]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate('/');
  }, [logout, navigate]);

  const themeIcon = theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '💻';

  return (
    <div className={`dashboard ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* ── Sidebar ── */}
      <aside className="dash-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} title="Go to About WebGrade">
            <span>⚡</span>
            <span className="sidebar-logo-text">WebGrade</span>
          </div>
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        <button className="new-search-btn" onClick={() => setState(prev => ({ ...prev, status: 'idle', query: '', products: [], suggestions: [] }))}>
          <span>+</span> New Search
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
              <div className="history-empty">No searches yet</div>
            ) : (
              history.map(h => (
                <button key={h.id} className="history-item" onClick={() => handleSearch(h.query)}>
                  <span className="history-icon">🔍</span>
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
          <button className="sidebar-footer-btn" onClick={cycleTheme}>
            <span>{themeIcon}</span>
            <span>{theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System'}</span>
          </button>
          <button className="sidebar-footer-btn" onClick={() => navigate('/app/settings')}>
            <span>⚙️</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="dash-main">
        {/* Top Bar */}
        <header className="dash-topbar">
          <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
          <div className="topbar-spacer" />
          <div className="topbar-right">
            <button className="theme-btn" onClick={cycleTheme} title={`Theme: ${theme}`}>
              {themeIcon}
            </button>
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
              <h2>Hello, {user?.displayName || 'there'} 👋</h2>
              <p>Search any product to compare prices across India's top platforms.</p>
            </div>
          )}

          <div className="dash-search-area">
            <SearchBar onSearch={handleSearch} isLoading={state.status === 'loading'} />
            {state.status === 'idle' && (
              <div className="quick-searches fade-in" style={{ animationDelay: '200ms' }}>
                <span className="quick-label">Try:</span>
                {['nutella 750g', 'paracetamol 500mg', 'samsung galaxy s24', 'iphone 15'].map(term => (
                  <button key={term} className="quick-chip" onClick={() => handleSearch(term)}>
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
            <SuggestionsPanel suggestions={state.suggestions} query={state.query} onSuggestionClick={handleSearch} />
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
              {state.products.length > 0 ? (
                <div className="products-grid">
                  {state.products.map((product, i) => (
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
    </div>
  );
}
