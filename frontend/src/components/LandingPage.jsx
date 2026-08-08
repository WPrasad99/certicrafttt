import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

/* ───────────────────────────────────────────────────────────
   Scroll-reveal hook — fade-in elements as they enter viewport
─────────────────────────────────────────────────────────── */
function useReveal(rootRef) {
  useEffect(() => {
    if (!rootRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    const els = rootRef.current.querySelectorAll('[data-reveal]');
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [rootRef]);
}



/* ───────────────────────────────────────────────────────────
   Main Landing Page Component
─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const rootRef = useRef(null);
  const [navScrolled, setNavScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  // How It Works Animation State
  const [activeHiwStep, setActiveHiwStep] = useState(0);

  useReveal(rootRef);

  /* Scroll-back navbar: hide on scroll down, show on scroll up */
  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setNavScrolled(currentY > 12);
    if (currentY > 200) {
      setNavHidden(currentY > lastScrollY.current);
    } else {
      setNavHidden(false);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  /* ── Data ─────────────────────────────────── */
  const features = [
    {
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>,
      title: 'Beautiful Templates',
      desc: 'Professionally designed certificate templates for every occasion — academic, professional, and custom.',
    },
    {
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
      title: 'Bulk Generation',
      desc: 'Upload a CSV and generate hundreds of personalized certificates in seconds. No manual work required.',
    },
    {
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></svg>,
      title: 'Verified & Tamper-proof',
      desc: 'Each certificate gets a unique ID. Instantly verifiable by anyone via a secure public URL.',
    },
    {
      icon: <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>,
      title: 'Automated Email Delivery',
      desc: 'Send certificates directly to recipients with your custom branding. No third-party tools needed.',
    },
  ];


  /* ── Render ───────────────────────────────── */
  return (
    <div className="lp" ref={rootRef}>
      <style>{`
        /* ══════════════════════════════════════════════════════════════
           OUR VISION (About Us)
        ══════════════════════════════════════════════════════════════ */
        .lp-about {
          padding: 80px 0 120px;
          background: var(--c-white);
          overflow: hidden;
        }

        .lp-about__top-word {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: clamp(80px, 15vw, 220px);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -6px;
          color: var(--c-black);
          margin-bottom: 0;
          margin-left: -8px; /* Optical alignment */
        }

        .lp-about__bottom-word {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: clamp(80px, 15vw, 220px);
          font-weight: 800;
          line-height: 0.9;
          letter-spacing: -6px;
          color: var(--c-black);
          margin-bottom: 24px;
          margin-left: -8px; /* Optical alignment */
        }

        .lp-about__grid {
          display: grid;
          grid-template-columns: 1fr 1.6fr 1.2fr;
          gap: 40px;
          align-items: start;
        }

        .lp-about__left {
          display: flex;
          flex-direction: column;
        }

        .lp-about__subtitle {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: var(--c-black);
          margin-bottom: 16px;
          letter-spacing: 0px;
        }

        .lp-about__desc {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #666;
        }

        .lp-about__main-image {
          border-radius: 24px;
          overflow: hidden;
          height: 310px;
          width: 100%;
        }

        .lp-about__main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: bottom;
        }

        .lp-about__right {
          display: flex;
          flex-direction: column;
        }

        .lp-about__small-image {
          border-radius: 24px;
          overflow: hidden;
          height: 160px;
          width: 100%;
          margin-bottom: 24px;
        }

        .lp-about__small-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .lp-about__philosophy-title {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: var(--c-black);
          margin-bottom: 16px;
          letter-spacing: -0.5px;
        }

        @media (max-width: 1024px) {
          .lp-about__grid {
            grid-template-columns: 1fr;
            gap: 40px;
          }
          .lp-about__main-image {
            height: 400px;
          }
          .lp-about__bottom-word {
            margin-bottom: 24px;
          }
          .lp-about__top-word, .lp-about__bottom-word {
            margin-left: 0;
            letter-spacing: -2px;
          }
        }

        /* ══════════════════════════════════════════════════════════════
           HOW IT WORKS (Interactive Animated)
        ══════════════════════════════════════════════════════════════ */
        .lp-hiw {
          padding: 100px 0;
          background: transparent;
        }

        .lp-hiw-header {
          text-align: center;
          margin-bottom: 64px;
        }

        .lp-hiw-grid {
          display: flex;
          gap: 24px;
          justify-content: center;
          align-items: stretch;
          height: 500px;
        }

        .lp-hiw-card {
          flex: 1;
          background: var(--c-white);
          border-radius: 24px;
          padding: 32px 32px 0 32px;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          transition: flex 0.6s cubic-bezier(0.25, 1, 0.5, 1), background-color 0.4s ease;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .lp-hiw-card.is-active {
          flex: 1.4;
          background: #efe9fc; /* Soft purple */
          border-color: transparent;
        }

        .lp-hiw-card__top {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
          color: var(--c-black);
        }

        .lp-hiw-card__icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.4s ease, color 0.4s ease;
        }

        .lp-hiw-card.is-active .lp-hiw-card__icon {
          background: var(--c-accent);
          color: var(--c-white);
        }

        .lp-hiw-card__title {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 20px;
          transition: transform 0.4s ease;
        }

        .lp-hiw-card__desc {
          font-family: var(--font-body);
          font-size: 15px;
          line-height: 1.6;
          color: #4a5568;
          opacity: 0;
          max-height: 0;
          overflow: hidden;
          transition: opacity 0.4s ease, max-height 0.6s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .lp-hiw-card.is-active .lp-hiw-card__desc {
          opacity: 1;
          max-height: 120px;
          margin-bottom: 24px;
        }

        .lp-hiw-mockup {
          margin-top: auto;
          background: var(--c-white);
          border-radius: 12px 12px 0 0;
          border: 1px solid rgba(0,0,0,0.08);
          border-bottom: none;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
          height: 300px;
          width: 100%;
          transform: translateY(140px);
          transition: transform 0.6s cubic-bezier(0.25, 1, 0.5, 1);
          display: flex;
          flex-direction: column;
        }

        .lp-hiw-card.is-active .lp-hiw-mockup {
          transform: translateY(0);
        }

        .lp-hiw-mockup-header {
          display: flex;
          gap: 6px;
          padding: 12px 16px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        
        .lp-hiw-mockup-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e2e8f0;
        }

        .lp-hiw-mockup-body {
          padding: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        /* Mockup specific designs */
        .mockup-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .mockup-label {
          width: 70px;
          font-size: 11px;
          color: #64748b;
          font-weight: 500;
        }
        .mockup-field {
          flex: 1;
          height: 32px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          display: flex;
          align-items: center;
          padding: 0 12px;
          font-size: 12px;
          color: #334155;
          font-weight: 500;
        }
        .mockup-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: 600;
        }
        .mockup-cert {
          margin: auto;
          width: 80%;
          height: 140px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          position: relative;
        }
        .mockup-cert-seal {
          position: absolute;
          bottom: 16px;
          right: 16px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--c-accent);
        }

        @media (max-width: 768px) {
          .lp-hiw-grid {
            flex-direction: column;
            height: auto;
          }
          .lp-hiw-card {
            height: 400px;
          }
        }

        /* ══════════════════════════════════════════════════════════════
           WHY CHOOSE US (Bento Box)
        ══════════════════════════════════════════════════════════════ */
        .lp-bento {
          padding: 100px 0;
          background: transparent;
        }

        .lp-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, 320px);
          gap: 24px;
        }

        .lp-bento-card {
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
          border: 1px solid rgba(0,0,0,0.05);
        }

        .lp-bento-card__title {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: 24px;
          color: var(--c-black);
          z-index: 2;
        }

        .lp-bento-card__desc {
          font-family: var(--font-body);
          font-size: 16px;
          line-height: 1.5;
          color: #4a5568;
          z-index: 2;
        }

        /* Specific Cards */
        .lp-bento-header-card {
          background: transparent;
          box-shadow: none;
          border: none;
          padding: 0;
          padding-right: 24px;
          justify-content: center;
        }
        
        .lp-bento-header-card h2 {
          font-family: var(--font-heading);
          font-size: clamp(32px, 4vw, 48px);
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -1px;
          color: #0f172a;
          margin-bottom: 16px;
        }
        
        .lp-bento-header-card p {
          font-size: 18px;
          color: #64748b;
          line-height: 1.5;
        }

        .lp-bento-card-1 {
          background: #fdfbf7; /* Light beige */
        }

        .lp-bento-card-2 {
          background: #f8fafc; /* Light grey */
        }

        .lp-bento-card-3 {
          grid-column: span 2;
          background-image: url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          color: white;
          border: none;
        }

        .lp-bento-card-4 {
          background-image: url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2670&auto=format&fit=crop');
          background-size: cover;
          background-position: center;
          color: white;
          border: none;
        }

        /* Overlay for image cards */
        .lp-bento-card-3::before, .lp-bento-card-4::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%);
          z-index: 1;
        }

        .lp-bento-card-3 .lp-bento-card__title, .lp-bento-card-4 .lp-bento-card__title {
          color: white;
        }
        .lp-bento-card-3 .lp-bento-card__desc, .lp-bento-card-4 .lp-bento-card__desc {
          color: rgba(255,255,255,0.9);
        }

        @media (max-width: 1024px) {
          .lp-bento-grid {
            grid-template-columns: 1fr;
            grid-template-rows: auto;
          }
          .lp-bento-card {
            height: 300px;
          }
          .lp-bento-card-3 {
            grid-column: span 1;
          }
          .lp-bento-header-card {
            height: auto;
            padding: 32px 0;
            text-align: center;
          }
        }
      `}</style>
      {/* ════════════════ NAVIGATION ════════════════ */}
      <header className={`lp-nav${navScrolled ? ' scrolled' : ''}${navHidden ? ' nav-hidden' : ''}`}>
        <div className="lp-nav__inner">
          <Link to="/" className="lp-logo">
            <img src="/assets/logo.png" alt="CertiCraft" height="40" />
          </Link>

          <nav className={`lp-nav__links${menuOpen ? ' is-open' : ''}`}>
            <a href="#products" onClick={() => setMenuOpen(false)}>Product <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></a>
            <a href="#serve" onClick={() => setMenuOpen(false)}>Who We Serve <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></a>
            <a href="#partnerships" onClick={() => setMenuOpen(false)}>Partnerships</a>
            <a href="#resources" onClick={() => setMenuOpen(false)}>Resources <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m6 9 6 6 6-6" /></svg></a>
            <Link to="/login" className="lp-nav__login">Login</Link>
          </nav>

          <button
            className={`lp-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            <span /><span /><span />
          </button>
        </div>
      </header>


      {/* ════════════════ HERO ════════════════ */}
      <section className="lp-hero">
        <div className="lp-hero__inner" style={{ backgroundImage: 'url(/assets/hero.jpg)' }}>
          <div className="lp-hero__overlay"></div>
          <div className="lp-hero__content-wrap">
            <div className="lp-hero__center" data-reveal>
              <h1 className="lp-hero__h1">
                Make everyone a<br />certification champion
              </h1>
              <p className="lp-hero__sub">
                The next generation automated <u>system of action</u><br />for credential delivery and verification.
              </p>

              <div className="lp-hero__actions">
                <Link to="/login" className="lp-btn-hero-primary">Login</Link>
                <Link to="/contact" className="lp-btn-hero-secondary">Contact us</Link>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════ SEPARATOR ════════════════ */}
      <hr className="lp-hr" />


      {/* ════════════════ OUR VISION (About Us) ════════════════ */}
      <section className="lp-section lp-about" id="about">
        <div className="lp-container">
          <div className="lp-about__top-word" data-reveal>ABOUT</div>

          <div className="lp-about__grid">

            <div className="lp-about__left" data-reveal>
              <div className="lp-about__bottom-word">US</div>
              <div className="lp-about__text">
                <h4 className="lp-about__subtitle">Next Generation Credentialing</h4>
                <p className="lp-about__desc">
                  Digital Trust: Empowering educators and organizers to issue verifiable certificates with zero friction and absolute security.
                </p>
              </div>
            </div>

            <div className="lp-about__center" data-reveal style={{ transitionDelay: '100ms' }}>
              <div className="lp-about__main-image">
                <img src="/assets/hero.jpg" alt="Platform" />
              </div>
            </div>

            <div className="lp-about__right" data-reveal style={{ transitionDelay: '200ms' }}>
              <div className="lp-about__small-image">
                <img src="/assets/hero.jpg" alt="Detail" />
              </div>
              <div className="lp-about__text">
                <h3 className="lp-about__philosophy-title">Our Philosophy</h3>
                <p className="lp-about__desc">
                  At CertiCraft, we believe in creating seamless, automated environments that reflect the true value of every credential earned.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════ SEPARATOR ════════════════ */}
      <hr className="lp-hr" />


      {/* ════════════════ TRUSTED BY ════════════════ */}
      <section className="lp-section lp-trusted" data-reveal>
        <div className="lp-container">
          <div className="lp-trusted__row">
            {['IIT Hyderabad', 'BITS Pilani', 'NIT Warangal', 'TechFest', 'DevAcademy', 'GrowthCamp', 'HackIndia'].map((n) => (
              <span key={n} className="lp-trusted__item">{n}</span>
            ))}
          </div>
        </div>
      </section>


      {/* ════════════════ SEPARATOR ════════════════ */}
      <hr className="lp-hr" />


      {/* ════════════════ FEATURES (2×2 Grid) ════════════════ */}
      <section className="lp-section" id="features">
        <div className="lp-container">
          <div data-reveal>
            <h2 className="lp-section__h2" style={{ marginBottom: 64 }}>
              Everything You Need<br />to Certify at Scale
            </h2>
          </div>

          <div className="lp-features-grid">
            {features.map((f, i) => (
              <div key={i} className="lp-feature-card" data-reveal style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="lp-feature-card__icon">{f.icon}</div>
                <div className="lp-feature-card__title">{f.title}</div>
                <div className="lp-feature-card__desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="lp-hiw" id="how-it-works">
        <div className="lp-container">
          <div className="lp-hiw-header" data-reveal>
            <h2 className="lp-section__h2" style={{ marginBottom: '16px' }}>How CertiCraft Works</h2>
            <p className="lp-hero__sub" style={{ fontSize: '18px', maxWidth: '700px', margin: '0 auto', color: 'var(--c-text-muted)' }}>
              A high-performance, professional-grade pipeline designed to automate the creation, distribution, and verification of digital certificates.
            </p>
          </div>

          <div className="lp-hiw-grid" data-reveal>
            
            {/* STEP 1 */}
            <div className={`lp-hiw-card ${activeHiwStep === 0 ? 'is-active' : ''}`} onMouseEnter={() => setActiveHiwStep(0)}>
              <div className="lp-hiw-card__top">
                <div className="lp-hiw-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                </div>
                <div className="lp-hiw-card__title">Interactive Designer</div>
              </div>
              <div className="lp-hiw-card__desc">
                Upload a high-fidelity PNG template. Use our interactive designer for click-to-place name positioning with elegant typography. Manage multiple events and templates in one place.
              </div>
              <div className="lp-hiw-mockup">
                <div className="lp-hiw-mockup-header">
                  <div className="lp-hiw-mockup-dot"></div><div className="lp-hiw-mockup-dot"></div><div className="lp-hiw-mockup-dot"></div>
                </div>
                <div className="lp-hiw-mockup-body" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px' }}>Event Template Settings</div>
                  <div className="mockup-row"><div className="mockup-label">Event Name</div><div className="mockup-field">Global Tech Summit</div></div>
                  <div className="mockup-row"><div className="mockup-label">Date</div><div className="mockup-field">Oct 15, 2026</div></div>
                  <div className="mockup-row"><div className="mockup-label">Template</div><div className="mockup-field" style={{background: '#efe9fc', borderColor: 'var(--c-accent)', color: 'var(--c-accent)'}}>Modern_Dark.png</div></div>
                </div>
              </div>
            </div>

            {/* STEP 2 */}
            <div className={`lp-hiw-card ${activeHiwStep === 1 ? 'is-active' : ''}`} onMouseEnter={() => setActiveHiwStep(1)}>
              <div className="lp-hiw-card__top">
                <div className="lp-hiw-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div className="lp-hiw-card__title">Bulk Processing</div>
              </div>
              <div className="lp-hiw-card__desc">
                Solves the bottleneck of event management. Upload a CSV or Excel file and generate hundreds of personalized, pixel-perfect certificates instantly in seconds.
              </div>
              <div className="lp-hiw-mockup">
                <div className="lp-hiw-mockup-header">
                  <div className="lp-hiw-mockup-dot"></div><div className="lp-hiw-mockup-dot"></div><div className="lp-hiw-mockup-dot"></div>
                </div>
                <div className="lp-hiw-mockup-body" style={{ padding: '20px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}><span>Participants</span> <span style={{color: 'var(--c-text-muted)'}}>850</span></div>
                  <div className="mockup-row"><div className="mockup-avatar" style={{background: 'var(--c-accent)'}}>JD</div><div style={{fontSize: '13px', fontWeight: 500}}>John Doe <br/><span style={{fontSize: '11px', color: '#666', fontWeight: 400}}>john@example.com</span></div></div>
                  <div className="mockup-row"><div className="mockup-avatar" style={{background: '#cbd5e1'}}>AS</div><div style={{fontSize: '13px', fontWeight: 500}}>Alice Smith <br/><span style={{fontSize: '11px', color: '#666', fontWeight: 400}}>alice@example.com</span></div></div>
                  <div className="mockup-row"><div className="mockup-avatar" style={{background: '#94a3b8'}}>RJ</div><div style={{fontSize: '13px', fontWeight: 500}}>Robert Jones <br/><span style={{fontSize: '11px', color: '#666', fontWeight: 400}}>robert@example.com</span></div></div>
                </div>
              </div>
            </div>

            {/* STEP 3 */}
            <div className={`lp-hiw-card ${activeHiwStep === 2 ? 'is-active' : ''}`} onMouseEnter={() => setActiveHiwStep(2)}>
              <div className="lp-hiw-card__top">
                <div className="lp-hiw-card__icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div className="lp-hiw-card__title">Smart Verification</div>
              </div>
              <div className="lp-hiw-card__desc">
                Automated SMTP integration for direct delivery. Every certificate receives an industry-standard QR code linked to our secure portal, ensuring zero fraud and maximum trust.
              </div>
              <div className="lp-hiw-mockup">
                <div className="lp-hiw-mockup-header">
                  <div className="lp-hiw-mockup-dot"></div><div className="lp-hiw-mockup-dot"></div><div className="lp-hiw-mockup-dot"></div>
                </div>
                <div className="lp-hiw-mockup-body" style={{justifyContent: 'center', alignItems: 'center'}}>
                  <div style={{ width: '120px', height: '120px', background: '#fff', padding: '8px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
                    <svg viewBox="0 0 100 100" fill="var(--c-accent)">
                      <rect x="10" y="10" width="25" height="25" fill="none" stroke="var(--c-accent)" strokeWidth="5"/>
                      <rect x="65" y="10" width="25" height="25" fill="none" stroke="var(--c-accent)" strokeWidth="5"/>
                      <rect x="10" y="65" width="25" height="25" fill="none" stroke="var(--c-accent)" strokeWidth="5"/>
                      <rect x="17" y="17" width="11" height="11" />
                      <rect x="72" y="17" width="11" height="11" />
                      <rect x="17" y="72" width="11" height="11" />
                      <rect x="45" y="10" width="10" height="10" />
                      <rect x="45" y="25" width="10" height="20" />
                      <rect x="65" y="45" width="25" height="10" />
                      <rect x="10" y="45" width="25" height="10" />
                      <rect x="45" y="55" width="45" height="10" />
                      <rect x="45" y="75" width="10" height="15" />
                      <rect x="65" y="75" width="25" height="15" />
                    </svg>
                  </div>
                  <div style={{marginTop: '16px', fontSize: '13px', fontWeight: 600, color: 'var(--c-accent)'}}>Verified Credential</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════ WHY CHOOSE US (Bento Box) ════════════════ */}
      <section className="lp-bento" id="why-choose-us">
        <div className="lp-container">
          <div className="lp-bento-grid" data-reveal>
            
            <div className="lp-bento-header-card lp-bento-card">
              <h2>Why<br/>Choose<br/>CertiCraft</h2>
              <p>Built for organizers who demand speed, reliability, and ultimate security.</p>
            </div>

            <div className="lp-bento-card lp-bento-card-1">
              <div className="lp-bento-card__title">Instant Bulk<br/>Generation</div>
              <div className="lp-bento-card__desc">Upload your CSV and our engine processes hundreds of credentials instantly in a single batch.</div>
            </div>

            <div className="lp-bento-card lp-bento-card-2">
              <div className="lp-bento-card__title">Industry Standard<br/>QR Security</div>
              <div className="lp-bento-card__desc">Every certificate gets a unique cryptographic UUID, ensuring zero fraud and verifiable digital trust.</div>
            </div>

            <div className="lp-bento-card lp-bento-card-3">
              <div className="lp-bento-card__title">Pixel-Perfect<br/>Fidelity</div>
              <div className="lp-bento-card__desc">Retain full control of your design. Upload high-res PNG templates and let our system render beautiful typography that matches your exact brand guidelines.</div>
            </div>

            <div className="lp-bento-card lp-bento-card-4">
              <div className="lp-bento-card__title">Zero Friction<br/>Delivery</div>
              <div className="lp-bento-card__desc">Automated SMTP integration sends secure credentials directly to your participants' inboxes the moment they are generated.</div>
            </div>

          </div>
        </div>
      </section>








      {/* ════════════════ FOOTER ════════════════ */}
      <footer className="lp-footer">
        <div className="lp-footer__inner">
          <div className="lp-footer__top">

            <div className="lp-footer__signup">
              <h3>Sign up for exclusive updates</h3>
              <p>Be the first to know about new features, special offers, and everything happening in our vibrant community.</p>
              <div className="lp-footer__form">
                <input type="email" placeholder="johndoe@gmail.com" className="lp-footer__input" />
                <button className="lp-btn-footer">Sign up &rarr;</button>
              </div>
            </div>

            <div className="lp-footer__links-grid">
              <div className="lp-footer__link-col">
                <a href="#features">Features</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#">Pricing</a>
                <a href="#">API Docs</a>
              </div>
              <div className="lp-footer__link-col">
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Contact</a>
              </div>
              <div className="lp-footer__contact">
                <div className="lp-footer__contact-block">
                  <strong>Email</strong>
                  <span>hello@certicraft.com</span>
                </div>
                <div className="lp-footer__contact-block">
                  <strong>Instagram</strong>
                  <span>@certicraft</span>
                </div>
                <Link to="/register" className="lp-btn-footer" style={{ marginTop: '24px' }}>Get Started &rarr;</Link>
              </div>
            </div>

          </div>

          <div className="lp-footer__huge-text">
            CERTICRAFT
          </div>

          <div className="lp-footer__bottom">
            <div className="lp-footer__logos">
              <img src="/assets/bharti_logo.png" alt="Bharati Vidyapeeth" />
              <img src="/assets/csbs_logo.png" alt="CSBS" />
            </div>
            <div className="lp-footer__author">
              <span>Designed by Prasad Wadkar</span>
              <a href="https://www.linkedin.com/in/pprasadwadkar/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noreferrer" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
