import {
  FaCertificate,
  FaCheckCircle,
  FaUsers,
  FaCloud,
} from "react-icons/fa";

import {
  FaUniversity,
  FaBuilding,
  FaGraduationCap,
  FaBriefcase,
  FaAward,

} from "react-icons/fa";

import "./Trusted.css"


export default function Trusted() {
  return (
    <section 
      id="trusted"
    className="bg-white py-24">

      <div className="mx-auto max-w-7xl px-6">

        {/* Heading */}

        <div className="text-center">

          <p className="text-blue-700 font-semibold uppercase tracking-[4px] font-bold">

            Trusted Worldwide

          </p>

          <h2 className="mt-4 text-4xl font-bold">

            Trusted <span className="text-blue-700"> by</span> Organizations

          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-gray-600 text-sm font-semibold">

            Schools, universities, companies and event organizers
            trust CertiCraft to issue secure digital <span className="text-blue-700">certificates.</span> 

          </p>

        </div>

      
<div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">

  <div className="company-card">
    <FaUniversity className="company-icon" />
    <span>Universities</span>
  </div>

  <div className="company-card">
    <FaGraduationCap className="company-icon" />
    <span>Schools</span>
  </div>

  <div className="company-card">
    <FaBuilding className="company-icon" />
    <span>Businesses</span>
  </div>

  <div className="company-card">
    <FaBriefcase className="company-icon" />
    <span>Bootcamps</span>
  </div>

  <div className="company-card">
    <FaAward className="company-icon" />
    <span>Events</span>
  </div>

  <div className="company-card">
    <FaUsers className="company-icon" />
    <span>Organizations</span>
  </div>

</div>



        {/* Stats */}

        <div className="mt-20 grid grid-cols-2 gap-6 lg:grid-cols-4">

          <div className="stat-card">

            <FaCertificate className="stat-icon" />

            <h3>25K+</h3>

            <p>Certificates Issued</p>

          </div>

          <div className="stat-card">

            <FaCheckCircle className="stat-icon" />

            <h3>99.9%</h3>

            <p>Verification Success</p>

          </div>

          <div className="stat-card">

            <FaUsers className="stat-icon" />

            <h3>500+</h3>

            <p>Organizations</p>

          </div>

          <div className="stat-card">

            <FaCloud className="stat-icon" />

            <h3>24/7</h3>

            <p>Cloud Platform</p>

          </div>

        </div>

      </div>

    </section>
  );
}