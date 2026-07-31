import { Link } from "react-router-dom";

export default function MenuDrawer({ menuOpen, setMenuOpen }) {
  return (
    <div
      className={`
        lg:hidden
        overflow-hidden
        transition-all
        duration-300
        ${menuOpen ? "max-h-[700px] opacity-100 mt-4" : "max-h-0 opacity-0"}
      `}
    >
      <div className="rounded-3xl bg-white shadow-2xl p-6">

        <nav className="flex flex-col gap-5 text-sm font-bold">

          <a
            href="#home"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Home
          </a>

          <a
            href="#trusted"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Trusted By
          </a>

          <a
            href="#features"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Features
          </a>

          <a
            href="#templates"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Templates
          </a>

          <a
            href="#how-it-works"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            How It Works
          </a>

          <a
            href="#pricing"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Pricing
          </a>

          <a
            href="#testimonials"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Testimonials
          </a>

          <a
            href="#faq"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            FAQ
          </a>

          <a
            href="#contact"
            className="mobile-nav-link"
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </a>

        </nav>

        <div className="mt-8 flex flex-col gap-3">

          <Link
            to="/login"
            onClick={() => setMenuOpen(false)}
            className="rounded-full border border-gray-300 py-3 text-center font-semibold hover:bg-gray-100 transition"
          >
            Sign In
          </Link>

          <Link
            to="/register"
            onClick={() => setMenuOpen(false)}
            className="rounded-full bg-black py-3 text-center font-semibold text-white hover:bg-blue-600 transition"
          >
            Get Started
          </Link>

        </div>

      </div>
    </div>
  );
}