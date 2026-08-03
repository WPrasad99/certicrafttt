import {
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaGithub,
  FaEnvelope,
  FaPhoneAlt,
  FaMapMarkerAlt,
} from "react-icons/fa";

import "./Footer.css";

export default function Footer() {
  return (
    <footer className="bg-[#0f172a] text-white">

      <div className="mx-auto max-w-7xl px-6 py-20">

        <div className="grid gap-12 lg:grid-cols-5">

          {/* Company */}

          <div className="lg:col-span-2">

            {/* Replace with your logo later */}
  <div className=" bg-white w-fit py-1 px-4 rounded-full">
  <img
              src="/bv_full_logo_v2.png"
              alt="LOGO"
              className="h-8 w-auto sm:h-10 md:h-12 lg:h-14 object-contain"
            />
            </div>
            
            <p className="mt-6 max-w-md leading-8 text-gray-400">
              CertiCraft helps schools, organizations and businesses
              create, issue and verify secure digital certificates
              within minutes.
            </p>

            <div className="footer-social">

              <a href="#">
                <FaFacebookF />
              </a>

              <a href="#">
                <FaTwitter />
              </a>

              <a href="#">
                <FaLinkedinIn />
              </a>

              <a href="#">
                <FaGithub />
              </a>

            </div>

          </div>

          {/* Quick Links */}

          <div>

            <h3>Quick Links</h3>

            <ul>

              <li><a href="#home">Home</a></li>

              <li><a href="#features">Features</a></li>

              <li><a href="#templates">Templates</a></li>

              <li><a href="#pricing">Pricing</a></li>

              <li><a href="#contact">Contact</a></li>

            </ul>

          </div>

          {/* Resources */}

          <div>

            <h3>Resources</h3>

            <ul>

              <li><a href="#faq">FAQ</a></li>

              <li><a href="#testimonials">Testimonials</a></li>

              <li><a href="#">Documentation</a></li>

              <li><a href="#">Support</a></li>

              <li><a href="#">API</a></li>

            </ul>

          </div>

          {/* Contact */}

          <div>

            <h3>Contact</h3>

            <div className="footer-contact">

              <p>
                <FaEnvelope />
                support@certicraft.com
              </p>

              <p>
                <FaPhoneAlt />
                +1 (234) 567-8900
              </p>

              <p>
                <FaMapMarkerAlt />
                San Francisco, California
              </p>

            </div>

          </div>

        </div>

        {/* Newsletter */}

        <div className="newsletter">

          <div>

            <h3>Stay Updated</h3>

            <p>
              Subscribe to receive product updates and announcements.
            </p>

          </div>

          <div className="newsletter-form">

            <input
              type="email"
              placeholder="Enter your email"
            />

            <button>
              Subscribe
            </button>

          </div>

        </div>

        {/* Bottom */}

        <div className="footer-bottom">

          <p>
            © {new Date().getFullYear()} CertiCraft.
            All rights reserved.
          </p>

          <div>

            <a href="#">Privacy Policy</a>

            <a href="#">Terms of Service</a>

            <a href="#">Cookies</a>

          </div>

        </div>

      </div>

    </footer>
  );
}