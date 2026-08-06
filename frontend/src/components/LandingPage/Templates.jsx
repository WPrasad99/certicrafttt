import { useState } from "react";
import { Link } from "react-router-dom";
import { FaArrowRight, FaTimes } from "react-icons/fa";
import "./Templates.css";

export default function Templates() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <>
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
              Templates For <span className="text-blue-700">Every Occasion</span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-gray-600 text-sm font-semibold">
              Choose from professionally designed templates for
              schools, universities, workshops, online courses,
              <span className="text-blue-700">
                {" "}conferences and corporate
              </span>{" "}
              recognition.
            </p>

          </div>

          {/* Template Cards */}

          <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

            {/* Education */}

            <div className="template-card">

              <div className="template-image">
                <img
                  src="./certifcate3.png"
                  alt="Education Certificate"
                />
              </div>

              <div className="template-content">

                <h3 className="font-bold">Education</h3>

                <p className="text-sm font-semibold md:text-[15px]">
                  Perfect for schools, universities and training academies.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 md:flex-nowrap">

                  <button
                    className="template-btn"
                    onClick={() =>
                      setSelectedTemplate({
                        title: "Education",
                        image: "./certifcate3.png",
                        description:
                          "Perfect for schools, universities and training academies.",
                      })
                    }
                  >
                    Preview
                    <FaArrowRight />
                  </button>

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
                  src="./certifcate1.png"
                  alt="Corporate Certificate"
                />
              </div>

              <div className="template-content">

                <h3 className="font-bold">Corporate</h3>

                <p className="text-sm font-semibold md:text-[15px]">
                  Employee recognition, awards and professional achievements.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 md:flex-nowrap">

                  <button
                    className="template-btn"
                    onClick={() =>
                      setSelectedTemplate({
                        title: "Corporate",
                        image: "./certifcate1.png",
                        description:
                          "Employee recognition, awards and professional achievements.",
                      })
                    }
                  >
                    Preview
                    <FaArrowRight />
                  </button>

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
                  src="./certifcate2.png"
                  alt="Event Certificate"
                />
              </div>

              <div className="template-content">

                <h3 className="font-bold">Events</h3>

                <p className="text-sm font-semibold md:text-[15px]">
                  Workshops, conferences, hackathons and seminars.
                </p>

                <div className="mt-6 flex flex-wrap gap-3 md:flex-nowrap">

                  <button
                    className="template-btn"
                    onClick={() =>
                      setSelectedTemplate({
                        title: "Events",
                        image: "./certifcate2.png",
                        description:
                          "Workshops, conferences, hackathons and seminars.",
                      })
                    }
                  >
                    Preview
                    <FaArrowRight />
                  </button>

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

      {/* Preview Modal */}

      {selectedTemplate && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 p-6"
          onClick={() => setSelectedTemplate(null)}
        >
          <div
            className="relative w-full max-w-4xl rounded-3xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close */}

            <button
              onClick={() => setSelectedTemplate(null)}
              className="absolute right-6 top-6 text-2xl text-gray-600 hover:text-red-500"
            >
              <FaTimes />
            </button>

            {/* Image */}

            <img
              src={selectedTemplate.image}
              alt={selectedTemplate.title}
              className="mx-auto max-h-[500px] rounded-xl shadow-lg"
            />

            {/* Info */}

            <h2 className="mt-8 text-center text-3xl font-bold">
              {selectedTemplate.title} Certificate
            </h2>

            <p className="mt-4 text-center text-gray-600">
              {selectedTemplate.description}
            </p>

            <div className="mt-8 flex justify-center gap-4">

              <Link
                to="/register"
                className="rounded-full bg-blue-700 px-8 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Use Template
              </Link>

              <button
                onClick={() => setSelectedTemplate(null)}
                className="rounded-full border border-gray-300 px-8 py-3 font-semibold transition hover:bg-gray-100"
              >
                Close
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}