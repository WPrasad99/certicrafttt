import Navbar from "./Navbar";
import Hero from "./Hero";
import Trusted from "./Trusted By";

function Landing() {
  return (
    <main className="">
      <div className="mt-2 md:mt-8">
        <Navbar />
      </div>

<div>
         <Hero />
</div>

<div>
    <Trusted />
</div>
 
    </main>
  );
}

export default Landing;
