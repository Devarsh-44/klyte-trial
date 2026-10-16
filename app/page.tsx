import { Nav } from "@/components/sections/nav";
import { Hero } from "@/components/sections/hero";
import { Manifesto } from "@/components/sections/manifesto";
import { Bento } from "@/components/sections/bento";
import { Ritual } from "@/components/sections/ritual";
import { Lineup } from "@/components/sections/lineup";
import { Buy } from "@/components/sections/buy";
import { Nutrition } from "@/components/sections/nutrition";
import { Faq } from "@/components/sections/faq";
import { Footer } from "@/components/sections/footer";

export default function Home() {
  return (
    <>
      <Nav />
      {/* overflow-x: clip (not hidden) so the sticky lineup keeps working. */}
      <main className="relative w-full max-w-full [overflow-x:clip]">
        <Hero />
        <Manifesto />
        <Ritual />
        <Bento />
        <Lineup />
        <Buy />
        <Nutrition />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
