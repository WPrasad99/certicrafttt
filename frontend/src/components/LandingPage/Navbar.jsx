import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaBars, FaMoon, FaUser, FaTimes } from "react-icons/fa";
import MenuDrawer from "./MenuDrawer";

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="flex justify-between items-center px-6 py-5">
        {/* Logo */}
        <div className="text-2xl font-bold">
          <h1>
            Certi<span className="text-orange-500">Craft</span>
          </h1>
        </div>

        {/* Menu */}
        <div className="relative z-50 inline-flex items-center gap-4 bg-[#0B0B14] rounded-full px-6 py-1">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex items-center gap-2 text-white"
          >
            {menuOpen ? (
              <>
                <FaTimes />
                <span>Close</span>
              </>
            ) : (
              <>
                <FaBars />
                <span>Menu</span>
              </>
            )}
          </button>

          <button className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-600">
            <FaMoon className="text-white" />
          </button>

          <div className="rounded-full bg-gray-700 px-3 py-1 text-sm font-semibold text-white">
            0%
          </div>

          <MenuDrawer
            menuOpen={menuOpen}
            setMenuOpen={setMenuOpen}
          />
        </div>

        {/* Right */}
        <div className="hidden items-center gap-4 md:flex">
          <Link to="/login">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-white">
              <FaUser className="text-black" />
            </div>
          </Link>

          <Link to="/register">
            <button className="rounded-full bg-black px-6 py-3 text-white hover:bg-orange-500">
              Get Started
            </button>
          </Link>
        </div>
      </header>
    </>
  );
}

export default Navbar;