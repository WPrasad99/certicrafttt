import Navbar from "./Navbar";
import Hero from "./Hero";
import Trusted from "./Trusted By";
import Features from "./Features";

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
 
    </main>
  );
}

export default Landing;
