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
          grid-template-columns: 1.3fr 1.6fr 1fr;
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
           WHY CHOOSE US
        ══════════════════════════════════════════════════════════════ */
        .lp-features-new {
          padding: 100px 0;
          background: var(--c-white);
          display: flex;
          justify-content: center;
        }



        .lp-features-new-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .lp-features-new-card {
          grid-column: span 2;
          background: #fff;
          border: 1px solid #1e6e43;
          border-radius: 32px 8px 32px 8px; /* Asymmetric leaf shape */
          padding: 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 30px rgba(0,0,0,0.02);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .lp-features-new-card:nth-child(4) {
          grid-column: 2 / 4;
        }

        .lp-features-new-card:nth-child(5) {
          grid-column: 4 / 6;
        }

        .lp-features-new-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.06);
        }

        .lp-features-new-card-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .lp-features-new-card-top h3 {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 20px;
          font-weight: 600;
          color: #111;
          line-height: 1.3;
          margin: 0;
        }

        .lp-features-new-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid #eaeaea;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e6e43;
          flex-shrink: 0;
          margin-left: 12px;
        }

        .lp-features-new-desc {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #555;
          margin-bottom: 24px;
        }

        .lp-features-new-list-title {
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #222;
          margin-bottom: 12px;
        }

        .lp-features-new-list {
          list-style: none;
          padding: 0;
          margin: 0 0 32px 0;
          flex-grow: 1;
        }

        .lp-features-new-list li {
          position: relative;
          padding-left: 16px;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 13px;
          color: #444;
          margin-bottom: 8px;
          line-height: 1.4;
        }

        .lp-features-new-list li::before {
          content: '•';
          position: absolute;
          left: 0;
          top: 0;
          color: #111;
          font-weight: bold;
        }

        .lp-features-new-btn {
          display: block;
          text-align: center;
          background: #1a1a1a;
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px;
          border-radius: 9999px;
          font-family: "Inter", system-ui, -apple-system, sans-serif;
          font-size: 14px;
          font-weight: 600;
          transition: background 0.2s;
        }

        .lp-features-new-btn:hover {
          background: #000;
        }

        @media (max-width: 1024px) {
          .lp-features-new-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lp-features-new-card {
            grid-column: span 1 !important;
          }
        }

        @media (max-width: 640px) {
          .lp-features-new-grid {
            grid-template-columns: 1fr;
          }
        }

      `}</style>

      {/* ════════════════ NAVIGATION ════════════════ */}
      <header className={`lp-nav${navScrolled ? ' scrolled' : ''}${navHidden ? ' nav-hidden' : ''}`}>
        <div className="lp-nav__inner">
          <div className="lp-nav__left">
            <Link to="/" className="lp-logo">
              <img src="/assets/landing_logo.png" alt="CertiCraft" height="40" />
            </Link>

            <nav className={`lp-nav__links${menuOpen ? ' is-open' : ''}`}>
              <a href="#about" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('about')?.scrollIntoView({behavior:'smooth'}); }}>About Us</a>
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('how-it-works')?.scrollIntoView({behavior:'smooth'}); }}>How It Works</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('features')?.scrollIntoView({behavior:'smooth'}); }}>Features</a>
              <a href="#capabilities" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('capabilities')?.scrollIntoView({behavior:'smooth'}); }}>Capabilities</a>
            </nav>
          </div>

          <div className="lp-nav__right">
            <div className="lp-nav__globe">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            </div>
            <div className="lp-nav__divider"></div>
            <Link to="/login" className="lp-nav__login">Log in</Link>
            <Link to="/register" className="lp-nav__btn-solid">Sign Up Free</Link>
            <a href="#demo" className="lp-nav__btn-outline" onClick={(e) => { e.preventDefault(); setMenuOpen(false); document.getElementById('demo')?.scrollIntoView({behavior:'smooth'}); }}>Get a demo</a>
          </div>

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
          <div className="lp-trusted__inner">
            <div className="lp-trusted__text">
              Join 10,000+ organizations around the world who trust CertiCraft
            </div>
            <div className="lp-trusted__logos">
              <div className="lp-trusted__logo" style={{fontFamily: 'serif', fontStyle: 'italic', fontSize: '24px'}}>IIT Hyderabad</div>
              <div className="lp-trusted__logo" style={{fontFamily: 'var(--font-body)', fontWeight: 800, fontSize: '20px', letterSpacing: '-1px'}}>BITS Pilani</div>
              <div className="lp-trusted__logo" style={{fontFamily: 'var(--font-heading)', textTransform: 'uppercase', fontSize: '22px'}}>NIT Warangal</div>
              <div className="lp-trusted__logo" style={{fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '26px', letterSpacing: '-1.5px'}}>TechFest</div>
              <div className="lp-trusted__logo" style={{fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: '18px'}}>DevAcademy</div>
            </div>
          </div>
        </div>
      </section>


      {/* ════════════════ SEPARATOR ════════════════ */}
      <hr className="lp-hr" />

      {/* ════════════════ HOW IT WORKS ════════════════ */}
      <section className="lp-section lp-how" id="how-it-works">
        <div className="lp-container">
          <div className="lp-how__inner" data-reveal>
            <h2 className="lp-how__title">The Complete Credential Pipeline</h2>
            <div className="lp-how__image">
              <img src="/assets/how.png" alt="How CertiCraft Works" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ SEPARATOR REMOVED ════════════════ */}

      {/* ════════════════ NEW FEATURES SECTION (5-Card Grid) ════════════════ */}
      <section className="lp-features-new" id="features">
        <div className="lp-container" data-reveal>
          <div className="lp-features-new-header" style={{ marginBottom: '64px', textAlign: 'center' }}>
            <h2 className="lp-section__h2" style={{ marginBottom: 0 }}>
              Everything You Need<br />to Certify at Scale
            </h2>
          </div>

          <div className="lp-features-new-grid">
            
            {/* Card 1 */}
            <div className="lp-features-new-card">
              <div className="lp-features-new-card-top">
                <h3>Instant Bulk Generation</h3>
                <div className="lp-features-new-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
              </div>
              <p className="lp-features-new-desc">Upload your CSV and our engine processes hundreds of credentials instantly in a single batch.</p>
              <div className="lp-features-new-list-title">Top features:</div>
              <ul className="lp-features-new-list">
                <li>CSV & Excel data support</li>
                <li>Instant processing engine</li>
                <li>Smart error handling</li>
              </ul>
              <Link to="/register" className="lp-features-new-btn">Find out more</Link>
            </div>

            {/* Card 2 */}
            <div className="lp-features-new-card">
              <div className="lp-features-new-card-top">
                <h3>Smart Verification</h3>
                <div className="lp-features-new-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
              </div>
              <p className="lp-features-new-desc">Every certificate gets a unique cryptographic UUID, ensuring zero fraud and verifiable digital trust.</p>
              <div className="lp-features-new-list-title">Top features:</div>
              <ul className="lp-features-new-list">
                <li>QR Code generation</li>
                <li>Unique cryptographic UUIDs</li>
                <li>Public verification portal</li>
              </ul>
              <Link to="/register" className="lp-features-new-btn">Find out more</Link>
            </div>

            {/* Card 3 */}
            <div className="lp-features-new-card">
              <div className="lp-features-new-card-top">
                <h3>Pixel-Perfect Fidelity</h3>
                <div className="lp-features-new-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>
              <p className="lp-features-new-desc">Retain full control of your design. Upload high-res PNG templates and let our system render beautiful typography.</p>
              <div className="lp-features-new-list-title">Top features:</div>
              <ul className="lp-features-new-list">
                <li>Custom fonts & typography</li>
                <li>Drag & drop positioning</li>
                <li>High-res PNG & PDF export</li>
              </ul>
              <Link to="/register" className="lp-features-new-btn">Find out more</Link>
            </div>

            {/* Card 4 */}
            <div className="lp-features-new-card lp-features-new-card-bottom">
              <div className="lp-features-new-card-top">
                <h3>Zero Friction Delivery</h3>
                <div className="lp-features-new-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
              </div>
              <p className="lp-features-new-desc">Automated SMTP integration sends secure credentials directly to your participants' inboxes.</p>
              <div className="lp-features-new-list-title">Top features:</div>
              <ul className="lp-features-new-list">
                <li>Custom SMTP integration</li>
                <li>Automated delivery system</li>
                <li>Real-time tracking</li>
              </ul>
              <Link to="/register" className="lp-features-new-btn">Find out more</Link>
            </div>

            {/* Card 5 */}
            <div className="lp-features-new-card lp-features-new-card-bottom">
              <div className="lp-features-new-card-top">
                <h3>Team Collaboration</h3>
                <div className="lp-features-new-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
              </div>
              <p className="lp-features-new-desc">Work together with your event organizers. Share roles and manage certificates as a unified team.</p>
              <div className="lp-features-new-list-title">Top features:</div>
              <ul className="lp-features-new-list">
                <li>Role-based access control</li>
                <li>Real-time collaboration</li>
                <li>Team activity tracking</li>
              </ul>
              <Link to="/register" className="lp-features-new-btn">Find out more</Link>
            </div>

          </div>
        </div>
      </section>

      {/* ════════════════ SHOWCASE SECTION ════════════════ */}
      <section className="lp-section lp-showcase" id="capabilities">
        <div className="lp-container">
          
          {/* Row 1: Image Left, Text Right */}
          <div className="lp-showcase__row" data-reveal>
            <div className="lp-showcase__image">
              <img src="/assets/1.webp" alt="Bulk Generation" />
            </div>
            <div className="lp-showcase__content">
              <div className="lp-showcase__subtitle">BUILT FOR BULK GENERATION</div>
              <h2 className="lp-showcase__title">Generate bulk credentials easily</h2>
              <p className="lp-showcase__desc">
                Standard design tools aren't built for generating mass certificates or handling large volumes of dynamic data. Trust a specialized engine that's built for scale.
              </p>
              <ul className="lp-showcase__list">
                <li>Specially configured rendering pipelines support high-volume generation instantly.</li>
                <li>CertiCraft is built on highly reliable infrastructure for maximum uptime.</li>
                <li>We generate thousands of credentials for top institutions every day.</li>
              </ul>
            </div>
          </div>

          {/* Row 2: Text Left, Image Right */}
          <div className="lp-showcase__row lp-showcase__row--reverse" data-reveal>
            <div className="lp-showcase__content">
              <div className="lp-showcase__subtitle">RELIABLE VERIFICATION</div>
              <h2 className="lp-showcase__title">Deliver trust straight to the source</h2>
              <p className="lp-showcase__desc">
                CertiCraft's secure infrastructure is backed by dedicated cryptographic validation to make sure your credentials are 100% verifiable and tamper-proof.
              </p>
              <ul className="lp-showcase__list">
                <li>Closely monitored verification endpoints.</li>
                <li>A team of experienced data security experts.</li>
                <li>Rigorous validation process to eliminate fraudulent certificates.</li>
              </ul>
            </div>
            <div className="lp-showcase__image">
              <img src="/assets/2.webp" alt="Reliable Verification" />
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════ DEMO SECTION ════════════════ */}
      <section className="lp-demo" id="demo">
        <div className="lp-container">
          <div className="lp-demo-grid">
            <div className="lp-demo-left" data-reveal>
              <div className="lp-demo-subtitle">CERTICRAFT PRO & ENTERPRISE</div>
              <h2 className="lp-demo-title">Get a free CertiCraft demo</h2>
              <p className="lp-demo-desc">
                See how CertiCraft brings your credentialing, events, and verifications together—so your team turns every achievement into measurable growth.
              </p>
              <img src="/assets/demo.webp" alt="CertiCraft Workflow" className="lp-demo-img" />
            </div>
            
            <div className="lp-demo-right" data-reveal style={{ transitionDelay: '100ms' }}>
              <div className="lp-demo-form-header">
                Already a customer? <Link to="/login">Get account support here</Link>
              </div>
              <form className="lp-demo-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Work Email*" required className="lp-demo-input" />
                
                <div className="lp-demo-row">
                  <select className="lp-demo-input lp-demo-select" defaultValue="India (+91)">
                    <option value="India (+91)">India (+91)</option>
                    <option value="United States (+1)">United States (+1)</option>
                    <option value="United Kingdom (+44)">United Kingdom (+44)</option>
                  </select>
                  <input type="tel" placeholder="Phone Number*" required className="lp-demo-input" />
                </div>
                
                <div className="lp-demo-row">
                  <input type="text" placeholder="First Name*" required className="lp-demo-input" />
                  <input type="text" placeholder="Last Name*" required className="lp-demo-input" />
                </div>
                
                <input type="text" placeholder="Company*" required className="lp-demo-input" />
                
                <select className="lp-demo-input lp-demo-select" defaultValue="" required>
                  <option value="" disabled>How many certificates do you issue?*</option>
                  <option value="1 - 500">1 - 500</option>
                  <option value="501 - 5000">501 - 5,000</option>
                  <option value="5000+">5,000+</option>
                </select>
                
                <select className="lp-demo-input lp-demo-select" defaultValue="" required>
                  <option value="" disabled>Your organization's annual revenue*</option>
                  <option value="< $1M">&lt; $1M</option>
                  <option value="$1M - $10M">$1M - $10M</option>
                  <option value="$10M+">$10M+</option>
                </select>
                
                <select className="lp-demo-input lp-demo-select" defaultValue="Preferred language: English">
                  <option value="Preferred language: English">Preferred language: English</option>
                  <option value="Preferred language: Spanish">Preferred language: Spanish</option>
                  <option value="Preferred language: French">Preferred language: French</option>
                </select>
                
                <button type="submit" className="lp-demo-submit">Get a demo</button>
              </form>
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
                <a href="#about">About Us</a>
                <a href="#how-it-works">How It Works</a>
                <a href="#features">Features</a>
                <a href="#capabilities">Capabilities</a>
              </div>
              <div className="lp-footer__link-col">
                <a href="#">Blog</a>
                <a href="#">Careers</a>
                <a href="#">Pricing</a>
                <a href="#">Contact</a>
              </div>
              <div className="lp-footer__contact">
                <div className="lp-footer__socials" style={{ display: 'flex', gap: '20px', fontSize: '24px', marginBottom: '24px' }}>
                  <a href="#" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><i className="fab fa-instagram"></i></a>
                  <a href="#" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><i className="fab fa-linkedin"></i></a>
                  <a href="#" target="_blank" rel="noopener noreferrer" style={{ transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}><i className="fab fa-x-twitter"></i></a>
                </div>
                <div className="lp-footer__contact-block">
                  <strong>Email</strong>
                  <a href="mailto:hello@certicraft.com" style={{ textDecoration: 'underline', transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>hello@certicraft.com</a>
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
