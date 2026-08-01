import Navbar from "./Navbar";
import Hero from "./Hero";
import Trusted from "./Trusted By";
import Features from "./Features";
import Templates from "./Templates";

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
 
    </main>
  );
}

export default Landing;
