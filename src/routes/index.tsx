import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/components/portfolio/SmoothScroll";
import { Navbar } from "@/components/portfolio/Navbar";
import { Hero } from "@/components/portfolio/Hero";
import { Marquee } from "@/components/portfolio/Marquee";
import { About } from "@/components/portfolio/About";
import { Stats } from "@/components/portfolio/Stats";
import { Services } from "@/components/portfolio/Services";
import { Works } from "@/components/portfolio/Works";
import { Experience } from "@/components/portfolio/Experience";
import { FooterMarquee } from "@/components/portfolio/FooterMarquee";
import { Footer } from "@/components/portfolio/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aziz — Full-Stack Developer & UI/UX Designer" },
      {
        name: "description",
        content:
          "Portfolio of Aziz, a Full-Stack Developer crafting fast, scalable and immersive digital experiences with Next.js, Node.js and Three.js.",
      },
      { property: "og:title", content: "Aziz — Full-Stack Developer & UI/UX Designer" },
      {
        property: "og:description",
        content: "Selected works, services and experience.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap",
      },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <SmoothScroll>
      <main className="relative">
        <Navbar />
        <Hero />
        <Marquee />
        <About />
        <Stats />
        <Services />
        <Works />
        <Experience />
        <FooterMarquee />
        <Footer />
      </main>
    </SmoothScroll>
  );
}
