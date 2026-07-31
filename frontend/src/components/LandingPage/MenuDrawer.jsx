import { Link } from "react-router-dom";

export default function MenuDrawer({
  menuOpen,
  setMenuOpen,
}) {
  return (
    <div
      className={`lg:hidden
      absolute
      right-0
      top-20
      w-72
      rounded-3xl
      bg-white
      shadow-2xl
      transition-all
      duration-300
      ${
        menuOpen
          ? "opacity-100 translate-y-0"
          : "pointer-events-none opacity-0 -translate-y-5"
      }`}
    >
      <div className="flex flex-col gap-6 p-6">

        <a href="#features" onClick={() => setMenuOpen(false)}>
          Features
        </a>

        <a href="#templates" onClick={() => setMenuOpen(false)}>
          Templates
        </a>

        <a href="#pricing" onClick={() => setMenuOpen(false)}>
          Pricing
        </a>

        <a href="#faq" onClick={() => setMenuOpen(false)}>
          FAQ
        </a>

        <Link
          to="/register"
          onClick={() => setMenuOpen(false)}
          className="rounded-full bg-black py-3 text-center text-white"
        >
          Get Started
        </Link>

      </div>
    </div>
  );
}