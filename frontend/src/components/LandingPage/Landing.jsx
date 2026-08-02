import Navbar from "./Navbar";
import Hero from "./Hero";
import Trusted from "./Trusted By";
import Features from "./Features";
import Templates from "./Templates";
import HowItWorks from "./How";
import Pricing from "./Pricing";
import Testimonials from "./Testimoinals";
import FAQ from "./FAQ";
import Contact from "./Contact";
import Footer from "./Footer";

function Landing() {
  return (
    <main className="">
      <div className="mt-2 md:mt-3">
        <Navbar />
      </div>

<div>
         <Hero />
</div>

<div>
    <Trusted />
</div>

<div>
<Features />
</div>

<div>
    <Templates />
</div>

<div>
  <HowItWorks />
</div>

<div>
  <Pricing />
</div>

<div>
  <Testimonials />
</div>

<div>
  <FAQ />
</div>
 
 <div>
  <Contact />
 </div>

 <div>
  <Footer />
 </div>
    </main>
  );
}

export default Landing;
