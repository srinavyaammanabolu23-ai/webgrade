import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import './LandingPage.css';

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !animated.current) {
        animated.current = true;
        let start = 0;
        const end = parseInt(target);
        const duration = 1500;
        const startTime = Date.now();
        const step = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.floor(eased * end));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const heroRef = useRef(null);

  // Parallax effect on hero glows
  useEffect(() => {
    const handleScroll = () => {
      if (!heroRef.current) return;
      const scrollY = window.scrollY;
      const glows = heroRef.current.querySelectorAll('.hero-glow');
      glows.forEach((glow, i) => {
        const speed = 0.3 + i * 0.15;
        glow.style.transform = `translateY(${scrollY * speed}px)`;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

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
      <section className="land-hero" ref={heroRef}>
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
            <button className="land-btn land-btn-outline" onClick={() => navigate('/app')}>
              Try it Now
            </button>
          </div>
          <div className="hero-stats fade-up delay-4">
            <div className="stat"><span className="stat-num"><AnimatedCounter target="20" suffix="+" /></span><span className="stat-label">Sources</span></div>
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
          <h2 className="section-title scroll-reveal">
            Why <span className="land-accent">WebGrade</span>?
          </h2>
          <p className="section-sub scroll-reveal">
            One search. Every platform. Real prices. Smart grades.
          </p>
          <div className="features-grid">
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Type anything — medicine, grocery, electronics. Our AI classifies your intent and fetches from the right sources.' },
              { icon: '🇮🇳', title: 'India-First', desc: 'Prices from Flipkart, Amazon India, BigBasket, Zepto, Blinkit, JioMart, PharmEasy and 15+ Indian platforms.' },
              { icon: '⭐', title: 'Grading System', desc: 'Every product rated Bronze to Platinum based on data quality, price verification, and source reliability.' },
              { icon: '💰', title: 'All Prices in ₹', desc: 'No guessing with USD/EUR. Every international price auto-converted to INR with live exchange rates.' },
              { icon: '🛡️', title: 'Verified Only', desc: 'Zero fake prices. Zero guesswork. If a price isn\'t verified from the API, we show "Not available".' },
              { icon: '📊', title: 'Search History', desc: 'Your searches saved securely. Re-run any comparison anytime. Track price changes over time.' },
            ].map((f, i) => (
              <div key={f.title} className="feature-card glass scroll-reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── How It Works ───── */}
      <section className="land-how">
        <div className="land-section-inner">
          <h2 className="section-title scroll-reveal">How It <span className="land-accent">Works</span></h2>
          <div className="how-steps">
            {[
              { num: '01', title: 'Search', desc: 'Type any product — "paracetamol 500mg", "nutella", "iPhone 15"' },
              { num: '02', title: 'Compare', desc: 'See real-time prices from 20+ sources side-by-side with star ratings' },
              { num: '03', title: 'Decide', desc: 'Pick the best deal with our Bronze-to-Platinum grading confidence' },
            ].map((step, i) => (
              <div key={step.num} className="how-step-group">
                <div className="how-step scroll-reveal" style={{ transitionDelay: `${i * 150}ms` }}>
                  <div className="step-number">{step.num}</div>
                  <div className="step-content">
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>
                  </div>
                </div>
                {i < 2 && <div className="how-connector" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Trusted Sources ───── */}
      <section className="land-sources">
        <div className="land-section-inner">
          <h2 className="section-title scroll-reveal">Trusted <span className="land-accent">Sources</span></h2>
          <div className="sources-ribbon scroll-reveal">
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
          <h2 className="cta-title scroll-reveal">Ready to find the best deal?</h2>
          <p className="cta-sub scroll-reveal">
            Join WebGrade for free and start comparing prices across India's top platforms.
          </p>
          <button className="land-btn land-btn-hero scroll-reveal" onClick={() => navigate(user ? '/app' : '/register')}>
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
