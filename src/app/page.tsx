import Image from "next/image";
import Hero from "./components/Hero";
import About from "./components/About";
import Projects from "./components/Projects";
import Certificates from "./components/Certificates";
import Skills from "./components/Skills";

export default function Home() {
  return (
    <main className="">
      <Hero />
      <About />
      <Projects />
      <Skills />
      <Certificates />
    </main>
  );
}
