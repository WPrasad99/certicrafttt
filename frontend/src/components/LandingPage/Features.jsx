
import { Link } from "react-router-dom";
import {
  FaCertificate,
  FaQrcode,
  FaEnvelope,
  FaCloudUploadAlt,
  FaShieldAlt,
  FaLayerGroup,
} from "react-icons/fa";

import "./Features.css";

export default function Features() {
  return (
    <section 
    id="features"
    className="bg-[#fafafa] py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-semibold uppercase tracking-[4px] text-blue-700">
            Features
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Everything You Need to Manage
            <br />
           <span className="text-blue-700">Digital Certificates</span> 
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-gray-600">
            From certificate creation to secure verification,
            CertiCraft provides everything organizations need
            to issue professional certificates in minutes.
          </p>

        </div>

        {/* Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          <div className="feature-card">
            <div className="feature-icon">
              <FaCertificate />
            </div>

            <h3>Create Certificates</h3>

            <p>
              Design beautiful professional certificates using
              customizable templates.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaQrcode />
            </div>

            <h3>QR Verification</h3>

            <p>
              Every certificate includes a unique QR code
              for instant verification.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaEnvelope />
            </div>

            <h3>Email Delivery</h3>

            <p>
              Automatically send certificates directly
              to recipients by email.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaCloudUploadAlt />
            </div>

            <h3>Cloud Storage</h3>

            <p>
              Store certificates securely and access them
              anytime from anywhere.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaShieldAlt />
            </div>

            <h3>Secure Platform</h3>

            <p>
              Built with modern security to keep certificates
              protected against tampering.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              <FaLayerGroup />
            </div>

            <h3>Bulk Issuing</h3>

            <p>
              Generate hundreds of certificates
              in just a few clicks.
            </p>
          </div>

        </div>

      </div>

    </section>
  );
}