import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="landing">
      {/* ───── Navbar ───── */}
      <nav className="land-nav">
        <div className="land-nav-inner">
          <div className="land-logo">
            <span className="land-logo-icon">⚡</span>
            <span className="land-logo-text">Web<span className="land-accent">Grade</span></span>
          </div>
          <div className="land-nav-links">
            {user ? (
              <button className="land-btn land-btn-primary" onClick={() => navigate('/app')}>
                Open Dashboard
              </button>
            ) : (
              <>
                <button className="land-btn land-btn-ghost" onClick={() => navigate('/login')}>
                  Sign In
                </button>
                <button className="land-btn land-btn-primary" onClick={() => navigate('/register')}>
                  Get Started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ───── Hero ───── */}
      <section className="land-hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-glow hero-glow-3" />

        <div className="land-hero-content">
          <div className="hero-badge fade-up">
            <span className="badge-dot" />
            Live Price Comparison Engine
          </div>
          <h1 className="hero-headline fade-up delay-1">
            Compare prices across
            <br />
            <span className="hero-gradient-text">India's top platforms</span>
          </h1>
          <p className="hero-sub fade-up delay-2">
            Real-time prices from Flipkart, Amazon, BigBasket, eBay & 15+ sources.
            AI-powered grading. Every price verified. All in ₹.
          </p>
          <div className="hero-cta fade-up delay-3">
            <button className="land-btn land-btn-hero" onClick={() => navigate(user ? '/app' : '/register')}>
              {user ? 'Open Dashboard' : 'Start Comparing — Free'}
              <span className="btn-arrow">→</span>
            </button>
            <button className="land-btn land-btn-outline" onClick={() => navigate('/login')}>
              Watch Demo
            </button>
          </div>
          <div className="hero-stats fade-up delay-4">
            <div className="stat"><span className="stat-num">20+</span><span className="stat-label">Sources</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">₹ INR</span><span className="stat-label">All Prices</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">Real-time</span><span className="stat-label">Live Data</span></div>
          </div>
        </div>

        {/* Hero visual — floating product cards */}
        <div className="hero-visual fade-up delay-3">
          <div className="hero-card hero-card-1">
            <div className="hc-badge">Flipkart</div>
            <div className="hc-name">Nutella 750g</div>
            <div className="hc-price">₹1,338</div>
            <div className="hc-stars">★★★★★</div>
          </div>
          <div className="hero-card hero-card-2">
            <div className="hc-badge amazon">Amazon</div>
            <div className="hc-name">Nutella 750g</div>
            <div className="hc-price">₹816</div>
            <div className="hc-stars">★★★★☆</div>
          </div>
          <div className="hero-card hero-card-3">
            <div className="hc-badge bigbasket">BigBasket</div>
            <div className="hc-name">Nutella 750g</div>
            <div className="hc-price">₹899</div>
            <div className="hc-stars">★★★★☆</div>
          </div>
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="land-features">
        <div className="land-section-inner">
          <h2 className="section-title fade-up">
            Why <span className="land-accent">WebGrade</span>?
          </h2>
          <p className="section-sub fade-up">
            One search. Every platform. Real prices. Smart grades.
          </p>
          <div className="features-grid">
            <div className="feature-card glass fade-up delay-1">
              <div className="feature-icon">🔍</div>
              <h3>Smart Search</h3>
              <p>Type anything — medicine, grocery, electronics. Our AI classifies your intent and fetches from the right sources.</p>
            </div>
            <div className="feature-card glass fade-up delay-2">
              <div className="feature-icon">🇮🇳</div>
              <h3>India-First</h3>
              <p>Prices from Flipkart, Amazon India, BigBasket, Zepto, Blinkit, JioMart, PharmEasy and 15+ Indian platforms.</p>
            </div>
            <div className="feature-card glass fade-up delay-3">
              <div className="feature-icon">⭐</div>
              <h3>Grading System</h3>
              <p>Every product rated Bronze to Platinum based on data quality, price verification, and source reliability.</p>
            </div>
            <div className="feature-card glass fade-up delay-1">
              <div className="feature-icon">💰</div>
              <h3>All Prices in ₹</h3>
              <p>No guessing with USD/EUR. Every international price auto-converted to INR with live exchange rates.</p>
            </div>
            <div className="feature-card glass fade-up delay-2">
              <div className="feature-icon">🛡️</div>
              <h3>Verified Only</h3>
              <p>Zero fake prices. Zero guesswork. If a price isn't verified from the API, we show "Not available".</p>
            </div>
            <div className="feature-card glass fade-up delay-3">
              <div className="feature-icon">📊</div>
              <h3>Search History</h3>
              <p>Your searches saved securely. Re-run any comparison anytime. Track price changes over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="land-how">
        <div className="land-section-inner">
          <h2 className="section-title fade-up">How It <span className="land-accent">Works</span></h2>
          <div className="how-steps">
            <div className="how-step fade-up delay-1">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>Search</h3>
                <p>Type any product — "paracetamol 500mg", "nutella", "iPhone 15"</p>
              </div>
            </div>
            <div className="how-connector" />
            <div className="how-step fade-up delay-2">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Compare</h3>
                <p>See real-time prices from 20+ sources side-by-side with star ratings</p>
              </div>
            </div>
            <div className="how-connector" />
            <div className="how-step fade-up delay-3">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Decide</h3>
                <p>Pick the best deal with our Bronze-to-Platinum grading confidence</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Trusted Sources ───── */}
      <section className="land-sources">
        <div className="land-section-inner">
          <h2 className="section-title fade-up">Trusted <span className="land-accent">Sources</span></h2>
          <div className="sources-ribbon fade-up delay-1">
            {[
              { name: 'Flipkart', color: '#2874f0' },
              { name: 'Amazon', color: '#ff9900' },
              { name: 'BigBasket', color: '#84c225' },
              { name: 'Zepto', color: '#8b5cf6' },
              { name: 'Blinkit', color: '#f8cb46' },
              { name: 'JioMart', color: '#0078ad' },
              { name: 'eBay', color: '#e53238' },
              { name: 'openFDA', color: '#00a5e3' },
              { name: 'PharmEasy', color: '#10847e' },
              { name: 'Netmeds', color: '#24aeb1' },
            ].map(s => (
              <div key={s.name} className="source-pill" style={{ '--pill-color': s.color }}>
                <span className="pill-dot" />
                {s.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="land-cta">
        <div className="cta-glow" />
        <div className="land-section-inner">
          <h2 className="cta-title fade-up">Ready to find the best deal?</h2>
          <p className="cta-sub fade-up delay-1">
            Join WebGrade for free and start comparing prices across India's top platforms.
          </p>
          <button className="land-btn land-btn-hero fade-up delay-2" onClick={() => navigate(user ? '/app' : '/register')}>
            {user ? 'Go to Dashboard' : 'Create Free Account'}
            <span className="btn-arrow">→</span>
          </button>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="land-footer">
        <div className="land-section-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="land-logo">
                <span className="land-logo-icon">⚡</span>
                <span className="land-logo-text">Web<span className="land-accent">Grade</span></span>
              </div>
              <p>Live product comparison & grading platform. Built for India.</p>
            </div>
            <div className="footer-links">
              <h4>Product</h4>
              <a href="#features">Features</a>
              <a href="#how">How It Works</a>
              <a href="#sources">Sources</a>
            </div>
            <div className="footer-links">
              <h4>Legal</h4>
              <a href="/terms">Terms & Conditions</a>
              <a href="/privacy">Privacy Policy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 WebGrade. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
