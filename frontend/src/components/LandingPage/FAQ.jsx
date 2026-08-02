import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./FAQ.css";

export default function FAQ() {
  const faqs = [
    {
      question: "How do I create a certificate?",
      answer:
        "Simply choose a template, customize it with recipient details and branding, then generate your certificate in seconds.",
    },
    {
      question: "Can certificates be verified?",
      answer:
        "Yes. Every certificate includes a secure QR code that allows anyone to verify its authenticity instantly.",
    },
    {
      question: "Can I issue certificates in bulk?",
      answer:
        "Absolutely. CertiCraft allows you to generate and send hundreds or thousands of certificates at once.",
    },
    {
      question: "Do recipients receive certificates by email?",
      answer:
        "Yes. Certificates can be delivered automatically to recipients via email immediately after generation.",
    },
    {
      question: "Can I customize certificate templates?",
      answer:
        "Yes. You can add your logo, colors, signatures, text and branding to create unique certificates.",
    },
  ];

  const [active, setActive] = useState(0);

  return (
    <section
      id="faq"
      className="bg-[#fafafa] py-24"
    >
      <div className="mx-auto max-w-4xl px-6">

        <div className="text-center">

          <p className="font-bold uppercase tracking-[4px] text-blue-700">
            FAQ
          </p>

          <h2 className="mt-4 text-4xl font-bold text-gray-900">
            Frequently Asked
            <span className="text-blue-700"> Questions</span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-sm font-semibold text-gray-600">
            Everything you <span className="text-blue-700">need</span> to know about using CertiCraft.
          </p>

        </div>

        <div className="mt-16 space-y-5">

          {faqs.map((faq, index) => (
            <div
              key={index}
              className="faq-card"
            >
              <button
                className="faq-question"
                onClick={() =>
                  setActive(active === index ? -1 : index)
                }
              >
                <span>{faq.question}</span>

                {active === index ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>

              <div
                className={`faq-answer ${
                  active === index ? "show" : ""
                }`}
              >
                <p>{faq.answer}</p>
              </div>

            </div>
          ))}

        </div>

      </div>
    </section>
  );
}