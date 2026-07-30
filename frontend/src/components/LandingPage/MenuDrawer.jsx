

import React from "react";
import { Link } from "react-router-dom";

function MenuDrawer({ menuOpen, setMenuOpen }) {
  if (!menuOpen) return null;

  return (
    <div className="absolute -top-10 mt-[10vh] right-[-8px] z-50  md:right-[-10px] md:-top-8">
     <div className="w-[16rem] rounded-3xl bg-gray-300 p-8 text-black shadow-2xl">
        
        {/* Menu links go here */}
        <nav className="mt-8 space-y-8">
  <Link
    to="/"
    onClick={() => setMenuOpen(false)}
    className="block text-sm font-semibold hover:text-gray-800 cursor-pointer"
  >
    Home
  </Link>

  <a
    href="#features"
    onClick={() => setMenuOpen(false)}
    className="block text-sm font-semibold hover:text-gray-800"
  >
    Features
  </a>

  <a
    href="#how-it-works"
    onClick={() => setMenuOpen(false)}
    className="block text-sm font-semibold hover:text-gray-800"
  >
    How It Works
  </a>

  <a
    href="#verification"
    onClick={() => setMenuOpen(false)}
    className="block text-sm font-semibold hover:text-gray-800"
  >
    Verification
  </a>
</nav>


<div className="my-8 border-t border-gray-700"></div>

<div className="flex space-y-8 md:hidden">
  <Link
    to="/login"
    onClick={() => setMenuOpen(false)}
    className="block text-lg"
  >
    Sign In
  </Link>

  <Link
    to="/register"
    onClick={() => setMenuOpen(false)}
    className="block rounded-full bg-white px-5 py-3 text-center text-black font-semibold"
  >
    Get Started
  </Link>
</div>
      </div>
    </div>
  );
}

export default MenuDrawer;