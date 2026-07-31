import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaMoon, FaTimes, FaUser } from "react-icons/fa";
import MenuDrawer from "./MenuDrawer";
import "./Navbar.css";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
   <header
  className={`fixed left-1/2 top-5 -translate-x-1/2 z-50
  w-[95%] max-w-6xl rounded-full
  bg-white
  border border-gray-200
  transition-all duration-300
  ${scrolled ? "shadow-xl" : ""}`}
>
    
      <div className=" flex items-center justify-between px-5 py-3">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight"
        >
          Certi<span className="text-blue-700">Craft</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-10 font-medium">
          <a href="#features" className="nav-link">
            Features
          </a>

          <a href="#templates" className="nav-link">
            Templates
          </a>

          <a href="#pricing" className="nav-link">
            Pricing
          </a>

          <a href="#faq" className="nav-link">
            FAQ
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

              {/* Shine Effect */}
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
            className="flex lg:hidden h-11 w-11 rounded-full bg-black text-white items-center justify-center"
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>

        </div>
      </div>

      <MenuDrawer
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
      />
    </header>
  );
}