import { Link } from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaCertificate,
  FaEnvelope,
  FaShieldAlt,
  FaChartLine,
  FaCloud,
  FaQrcode,
} from "react-icons/fa";

import "./Hero.css";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fafafa] pt-36 pb-24">
      {/* Background Glow */}
      <div className="absolute left-1/2 top-32 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-orange-100 blur-[120px] opacity-70"></div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-20 px-6 lg:flex-row">
        {/* ================= LEFT ================= */}

        <div className="w-full lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-4 py-2 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-blue-700"></span>

            <p className="text-sm font-medium">
              Trusted Certificate{" "}
              <span className="text-blue-700"> Automation Platform</span>
            </p>
          </div>

          <h1 className="mt-8 text-5xl font-bold leading-tight text-gray-900 md:text-6xl xl:text-7xl">
            Create
            <br />
            Professional
            <br />
            <span className="text-blue-700">Digital Certificates</span>
            <br />
            In Minutes.
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-8 text-gray-600 font-semibold">
            Create, issue and verify professional digital certificates with QR
            verification, automated email delivery, secure cloud storage and
            beautiful certificate templates.
          </p>

          {/* Buttons */}

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register">
              <button className="hero-btn-primary">
                <span className="cta-text">Get Started</span>

                <FaArrowRight />
              </button>
            </Link>

            <Link to="/login">
              <button className="hero-btn-secondary">View Demo</button>
            </Link>
          </div>

          {/* Features */}

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="feature-card">
              <FaCheckCircle className="feature-icon-small" />

              <div>
                <h4>Bulk Generation</h4>

                <p>Create thousands instantly.</p>
              </div>
            </div>

            <div className="feature-card">
              <FaQrcode className="feature-icon-small" />

              <div>
                <h4>QR Verification</h4>

                <p>Verify in seconds.</p>
              </div>
            </div>

            <div className="feature-card">
              <FaEnvelope className="feature-icon-small" />

              <div>
                <h4>Email Delivery</h4>

                <p>Automatic certificate sending.</p>
              </div>
            </div>

            <div className="feature-card">
              <FaCertificate className="feature-icon-small" />

              <div>
                <h4>Templates</h4>

                <p>Ready-made professional designs.</p>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}

        <div className="relative flex w-full items-center justify-center lg:w-1/2">
          {/* Glow */}

          <div className="absolute h-[520px] w-[520px] rounded-full bg-blue-200 blur-[120px] opacity-40"></div>

          {/* Orbit */}

          <div className="orbit">
            <div className="planet planet-1">
              <FaEnvelope />
            </div>

            <div className="planet planet-2">
              <FaShieldAlt />
            </div>

            <div className="planet planet-3">
              <FaChartLine />
            </div>

            <div className="planet planet-4">
              <FaCloud />
            </div>

            <div className="planet planet-5">
              <FaCertificate />
            </div>

            <div className="planet planet-6">
              <FaQrcode />
            </div>
          </div>

          {/* Center Card */}

          <div className="center-card">
            <div className="logo-circle">
              <FaCertificate />
            </div>

            <h2>CertiCraft</h2>

            <p>Secure Certificate Platform</p>

            <button className="issue-btn">Issue Certificate</button>
          </div>
        </div>
      </div>
    </section>
  );
}
