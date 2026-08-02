import { Link } from "react-router-dom";
import { FaCheck, FaCrown } from "react-icons/fa";
import "./Pricing.css";

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-bold uppercase tracking-[4px] text-blue-700">
            Pricing
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Simple Pricing
            <br />
            <span className="text-blue-700">For Every </span>Organization
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-sm font-semibold text-gray-600">
            Start <span className="text-blue-700">free and upgrade</span>{" "}
            whenever your organization grows.
          </p>

        </div>

        {/* Pricing Cards */}

        <div className="mt-20 grid gap-8 lg:grid-cols-3">

          {/* Starter */}

          <div className="price-card">

            <h3>Starter</h3>

            <h2>
              $0
              <span>/month</span>
            </h2>

            <p>
              Perfect for individuals and small clubs.
            </p>

            <ul>
              <li><FaCheck /> 50 Certificates</li>
              <li><FaCheck /> QR Verification</li>
              <li><FaCheck /> Email Delivery</li>
              <li><FaCheck /> Basic Templates</li>
            </ul>

            <Link to="/register">
              <button className="price-btn">
                Get Started
              </button>
            </Link>

          </div>

          {/* Professional */}

          <div className="price-card featured">

            <div className="popular-badge">
              <FaCrown />
              Most Popular
            </div>

            <h3>Professional</h3>

            <h2>
              $19
              <span>/month</span>
            </h2>

            <p>
              Ideal for schools, training organizations and businesses.
            </p>

            <ul>
              <li><FaCheck /> Unlimited Certificates</li>
              <li><FaCheck /> Premium Templates</li>
              <li><FaCheck /> Bulk Generation</li>
              <li><FaCheck /> Email Automation</li>
              <li><FaCheck /> Analytics Dashboard</li>
            </ul>

            <Link to="/register">
              <button className="price-btn featured-btn">
                Choose Plan
              </button>
            </Link>

          </div>

          {/* Enterprise */}

          <div className="price-card">

            <h3>Enterprise</h3>

            <h2>
              Custom
            </h2>

            <p>
              Built for universities, enterprises and large organizations.
            </p>

            <ul>
              <li><FaCheck /> Everything in Professional</li>
              <li><FaCheck /> Custom Branding</li>
              <li><FaCheck /> API Access</li>
              <li><FaCheck /> Dedicated Support</li>
            </ul>

            <a href="#contact">
              <button className="price-btn">
                Contact Sales
              </button>
            </a>

          </div>

        </div>

      </div>
    </section>
  );
}