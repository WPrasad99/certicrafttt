import {
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "./Contact.css";

export default function Contact() {
  return (
    <section
      id="contact"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-bold uppercase tracking-[4px] text-blue-700">
            Contact
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Let's Build Something
            <span className="text-blue-700"> Great Together</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-sm font-semibold text-gray-600">
            Have questions about CertiCraft? We'd love to hear from you.
            Send us a message and we'll get back to you as soon as possible.
          </p>

        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-2">

          {/* Contact Info */}

          <div className="contact-info">

            <div className="contact-card">

              <div className="contact-icon">
                <FaEnvelope />
              </div>

              <div>
                <h3>Email</h3>
                <p>support@certicraft.com</p>
              </div>

            </div>

            <div className="contact-card">

              <div className="contact-icon">
                <FaPhoneAlt />
              </div>

              <div>
                <h3>Phone</h3>
                <p>+1 (234) 567-8900</p>
              </div>

            </div>

            <div className="contact-card">

              <div className="contact-icon">
                <FaMapMarkerAlt />
              </div>

              <div>
                <h3>Office</h3>
                <p>123 Innovation Street, San Francisco, CA</p>
              </div>

            </div>

          </div>

          {/* Contact Form */}

          <form className="contact-form">

            <input
              type="text"
              placeholder="Full Name"
            />

            <input
              type="email"
              placeholder="Email Address"
            />

            <input
              type="text"
              placeholder="Subject"
            />

            <textarea
              rows="6"
              placeholder="Your Message"
            ></textarea>

            <button type="submit">
              Send Message
            </button>

          </form>

        </div>

      </div>
    </section>
  );
}