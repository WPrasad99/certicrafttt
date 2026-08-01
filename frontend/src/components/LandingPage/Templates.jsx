import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import "./Templates.css";

export default function Templates() {
  return (
    <section
      id="templates"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-semibold uppercase tracking-[4px] text-blue-700">
            Templates
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Beautiful Certificate
            <br />
            Templates For Every Occasion
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-gray-600">
            Choose from professionally designed templates for
            schools, universities, workshops, online courses,
            conferences and corporate recognition.
          </p>

        </div>

        {/* Template Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* Education */}

          <div className="template-card">

            <div className="template-image">
              <img
                src="/images/template1.png"
                alt="Education Certificate"
              />
            </div>

            <div className="template-content">

              <h3>Education</h3>

              <p>
                Perfect for schools, universities and training academies.
              </p>

              <div className="mt-6 flex gap-3">

                <Link
                  to="/templates/education"
                  className="template-btn"
                >
                  Preview
                  <FaArrowRight />
                </Link>

                <Link
                  to="/register"
                  className="template-btn-secondary"
                >
                  Use Template
                </Link>

              </div>

            </div>

          </div>

          {/* Corporate */}

          <div className="template-card">

            <div className="template-image">
              <img
                src="/images/template2.png"
                alt="Corporate Certificate"
              />
            </div>

            <div className="template-content">

              <h3>Corporate</h3>

              <p>
                Employee recognition, awards and professional achievements.
              </p>

              <div className="mt-6 flex gap-3">

                <Link
                  to="/templates/corporate"
                  className="template-btn"
                >
                  Preview
                  <FaArrowRight />
                </Link>

                <Link
                  to="/register"
                  className="template-btn-secondary"
                >
                  Use Template
                </Link>

              </div>

            </div>

          </div>

          {/* Events */}

          <div className="template-card">

            <div className="template-image">
              <img
                src="/images/template3.png"
                alt="Event Certificate"
              />
            </div>

            <div className="template-content">

              <h3>Events</h3>

              <p>
                Workshops, conferences, hackathons and seminars.
              </p>

              <div className="mt-6 flex gap-3">

                <Link
                  to="/templates/events"
                  className="template-btn"
                >
                  Preview
                  <FaArrowRight />
                </Link>

                <Link
                  to="/register"
                  className="template-btn-secondary"
                >
                  Use Template
                </Link>

              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}