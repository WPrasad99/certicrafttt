import {
  FaFileAlt,
  FaEdit,
  FaPaperPlane,
  FaQrcode,
} from "react-icons/fa";

import "./How.css";

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="bg-[#fafafa] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-bold uppercase tracking-[4px] text-blue-700">
            How It Works
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Issue Certificates
            <br />
            In <span className="text-blue-700">Four Simple</span> Steps
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-gray-600 text-sm font-semibold">
            Create, customize, issue and verify certificates with an
            intuitive <span className="text-blue-700">workflow built</span> for schools, organizations and businesses.
          </p>

        </div>

        {/* Steps */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-4">

          {/* Step 1 */}

          <div className="step-card">

            <span className="step-number">01</span>

            <div className="step-icon">
              <FaFileAlt />
            </div>

            <h3 className="font-bold">Create</h3>

            <p className="text-sm font-semibold">
              Choose a professional certificate template or create your own design.
            </p>

          </div>

          {/* Step 2 */}

          <div className="step-card">

            <span className="step-number">02</span>

            <div className="step-icon">
              <FaEdit />
            </div>

            <h3 className="font-bold">Customize</h3>

            <p className="text-sm font-semibold">
              Add recipient information, logos, signatures and branding.
            </p>

          </div>

          {/* Step 3 */}

          <div className="step-card">

            <span className="step-number">03</span>

            <div className="step-icon">
              <FaPaperPlane />
            </div>

            <h3 className="font-bold">Issue</h3>

            <p className="text-sm font-semibold">
              Generate certificates instantly and deliver them by email.
            </p>

          </div>

          {/* Step 4 */}

          <div className="step-card">

            <span className="step-number">04</span>

            <div className="step-icon">
              <FaQrcode />
            </div>

            <h3 className="font-bold">Verify</h3>

            <p className="text-sm font-semibold">
              Every certificate includes a secure QR code for instant verification.
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}