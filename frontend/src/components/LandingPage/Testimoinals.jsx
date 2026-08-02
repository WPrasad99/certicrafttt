import { FaStar, FaQuoteLeft } from "react-icons/fa";
import "./Testimoinals.css";

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-[#fafafa] py-24"
    >
      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="font-bold uppercase tracking-[4px] text-blue-700">
            Testimonials
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            What Our
            <span className="text-blue-700"> Customers </span>
            Say
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-sm font-semibold text-gray-600">
            Thousands of educators, businesses and organizations trust
            CertiCraft to create and manage professional certificates.
          </p>

        </div>

        {/* Testimonial Cards */}

        <div className="mt-20 grid gap-8 md:grid-cols-2 lg:grid-cols-3">

          {/* Card 1 */}

          <div className="testimonial-card">

            <FaQuoteLeft className="quote-icon" />

            <p>
              CertiCraft transformed how we issue certificates.
              Our students now receive verified certificates instantly.
            </p>

            <div className="stars">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>

            <div className="profile">

              <img
                src="https://i.pravatar.cc/150?img=32"
                alt="Sarah Johnson"
              />

              <div>
                <h4>Sarah Johnson</h4>
                <span>Training Director</span>
              </div>

            </div>

          </div>

          {/* Card 2 */}

          <div className="testimonial-card">

            <FaQuoteLeft className="quote-icon" />

            <p>
              The QR verification feature is incredible.
              Employers can verify certificates in seconds.
            </p>

            <div className="stars">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>

            <div className="profile">

              <img
                src="https://i.pravatar.cc/150?img=15"
                alt="Michael Lee"
              />

              <div>
                <h4>Michael Lee</h4>
                <span>HR Manager</span>
              </div>

            </div>

          </div>

          {/* Card 3 */}

          <div className="testimonial-card">

            <FaQuoteLeft className="quote-icon" />

            <p>
              Beautiful templates, fast generation and excellent
              email delivery. Highly recommended.
            </p>

            <div className="stars">
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
              <FaStar />
            </div>

            <div className="profile">

              <img
                src="https://i.pravatar.cc/150?img=48"
                alt="Emily Brown"
              />

              <div>
                <h4>Emily Brown</h4>
                <span>University Coordinator</span>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}