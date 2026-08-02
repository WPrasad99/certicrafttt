import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaMoon, FaTimes, FaUser } from "react-icons/fa";
import MenuDrawer from "./MenuDrawer";

import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Navbar */}
      <header
        className={`fixed left-1/2 -translate-x-1/2 z-50
        w-[95%] max-w-7xl
        bg-white
        rounded-full
        border border-gray-200
        transition-all duration-500 ease-in-out
        ${scrolled ? "top-0 shadow-xl" : "top-5"}`}
      >
        <div className="flex items-center justify-between px-5 py-3">

          {/* Logo */}
          <a
            href="#home"
            onClick={() => setMenuOpen(false)}
            className="flex items-center"
          >
            <img
              src="/bv_full_logo_v2.png"
              alt="LOGO"
              className="h-8 w-auto sm:h-10 md:h-12 lg:h-14 object-contain"
            />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8 font-bold text-xs">

            <a
              href="#home"
              className={`nav-link ${
                activeSection === "home" ? "active-link" : ""
              }`}
            >
              Home
            </a>

            <a
              href="#trusted"
              className={`nav-link ${
                activeSection === "trusted" ? "active-link" : ""
              }`}
            >
              Trusted By
            </a>

            <a
              href="#features"
              className={`nav-link ${
                activeSection === "features" ? "active-link" : ""
              }`}
            >
              Features
            </a>

            <a
              href="#templates"
              className={`nav-link ${
                activeSection === "templates" ? "active-link" : ""
              }`}
            >
              Templates
            </a>

            <a
              href="#how-it-works"
              className={`nav-link ${
                activeSection === "how-it-works" ? "active-link" : ""
              }`}
            >
              How It Works
            </a>

            <a
              href="#pricing"
              className={`nav-link ${
                activeSection === "pricing" ? "active-link" : ""
              }`}
            >
              Pricing
            </a>

            <a
              href="#testimonials"
              className={`nav-link ${
                activeSection === "testimonials" ? "active-link" : ""
              }`}
            >
              Testimonials
            </a>

            <a
              href="#faq"
              className={`nav-link ${
                activeSection === "faq" ? "active-link" : ""
              }`}
            >
              FAQ
            </a>

            <a
              href="#contact"
              className={`nav-link ${
                activeSection === "contact" ? "active-link" : ""
              }`}
            >
              Contact
            </a>

          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-3">

            {/* Dark Mode */}
            <button className="h-11 w-11 rounded-full bg-white shadow-md flex items-center justify-center hover:scale-110 transition duration-300">
              <FaMoon />
            </button>

            {/* Login */}
            <Link
              to="/login"
              className="hidden md:flex h-11 w-11 rounded-full bg-white shadow-md items-center justify-center hover:scale-110 transition duration-300"
            >
              <FaUser />
            </Link>

            {/* Get Started */}
            <Link to="/register" className="hidden md:block">
              <button className="cta-btn group relative overflow-hidden rounded-full bg-black px-8 py-3 text-white font-semibold hover:bg-blue-700 transition-colors duration-300">
                <span className="cta-text relative z-10">
                  Get Started
                </span>

                <span
                  className="
                    absolute
                    inset-0
                    -translate-x-full
                    skew-x-12
                    bg-white/30
                    transition-all
                    duration-700
                    group-hover:translate-x-[180%]
                  "
                />
              </button>
            </Link>

            {/* Mobile Menu */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex lg:hidden h-11 w-11 rounded-full bg-black text-white items-center justify-center transition duration-300 hover:scale-105"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Drawer - OUTSIDE the header */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-7xl transition-all duration-300 ${
          scrolled ? "top-20" : "top-24"
        }`}
      >
        <MenuDrawer
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
        />
      </div>
    </>
  );
}