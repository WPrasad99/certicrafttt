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

          <p className="font-bold uppercase tracking-[4px] text-blue-700">
            Templates
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Beautiful Certificate
            <br />
            Templates For <span className="text-blue-700"> Every Occasion</span>
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-gray-600 text-sm font-semibold">
            Choose from professionally designed templates for
            schools, universities, workshops, online courses,
            <span className="text-blue-700">conferences and corporate</span> recognition. 
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

              <h3 className="font-bold">Education</h3>

              <p className="text-sm font-semibold md:text-[15px]">
                Perfect for schools, universities and training academies.
              </p>

              <div className="mt-6 flex flex-wrap sm:flex-nowrap md:flex-nowrap gap-3">

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

              <h3 className="font-bold">Corporate</h3>

              <p className="text-sm font-semibold md:text-[15px]">
                Employee recognition, awards and professional achievements.
              </p>

              <div className="mt-6 flex flex-wrap sm:flex-nowrap md:flex-nowrap gap-3">

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

              <h3 className="font-bold">Events</h3>

              <p className="text-sm font-semibold md:text-[15px]">
                Workshops, conferences, hackathons and seminars.
              </p>

              <div className="mt-6 flex flex-wrap sm:flex-nowrap md:flex-nowrap gap-3">

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