import { SPONSORS } from "@/data/sponsors";
import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { CtaBand } from "@/components/sections/CtaBand";
import { LogoMarquee } from "@/components/sections/LogoMarquee";
import { Story } from "@/components/sections/Story";
import { Profile } from "@/components/sections/Profile";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero />
        <CtaBand />
        <LogoMarquee sponsors={SPONSORS} />
        <Story />
        <Profile />
      </main>
      <Footer />
    </>
  );
}
