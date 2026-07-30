import React from "react";
import { Link } from "react-router-dom";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center gap-16 px-6 py-16 lg:flex-row lg:justify-between">

      {/* LEFT SIDE */}
      <div className="max-w-xl text-center lg:text-left">
        <p className="font-semibold uppercase tracking-widest text-orange-500">
          Trusted Certificate Automation
        </p>

        <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl lg:text-7xl">
          Create Digital
          <br />
          Certificates
          <br />
          In Seconds.
        </h1>

        <p className="mt-6 text-base text-gray-600 sm:text-lg">
          Generate beautiful certificates, email recipients automatically,
          and verify authenticity using QR codes.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
          <Link to="/register">
            <button className="rounded-full bg-black px-8 py-4 text-white transition hover:bg-orange-500">
              Get Started
            </button>
          </Link>

          <Link to="/login">
            <button className="rounded-full border border-black px-8 py-4 transition hover:bg-gray-100">
              Sign In
            </button>
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="relative flex items-center justify-center
                      w-[280px] h-[280px]
                      sm:w-[340px] sm:h-[340px]
                      md:w-[420px] md:h-[420px]
                      lg:w-[520px] lg:h-[520px]">

        {/* Center Circle */}
        <div className="absolute z-10 flex
                        h-24 w-24
                        sm:h-32 sm:w-32
                        md:h-36 md:w-36
                        lg:h-44 lg:w-44
                        items-center justify-center
                        rounded-full bg-black
                        text-white
                        font-bold
                        text-sm sm:text-lg md:text-xl lg:text-2xl
                        shadow-2xl">
          CertiCraft
        </div>

        {/* Orbit */}
        <div className="orbit">

          <div className="planet planet-1">📜</div>
          <div className="planet planet-2">🎓</div>
          <div className="planet planet-3">🔒</div>
          <div className="planet planet-4">✅</div>
          <div className="planet planet-5">⭐</div>
          <div className="planet planet-6">🏆</div>

        </div>

      </div>

    </section>
  );
}