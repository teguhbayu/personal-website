"use client";
import { useEffect } from "react";
import Section from "./global/Wrapper";
var Typewriter = require("typewriter-effect/dist/core");

export default function About() {
  useEffect(() => {
    new Typewriter("#title", {
      strings: ["Web Developer", "Cloud Engineer"],
      autoStart: true,
      loop: true,
    });
  }, []);

  return (
    <Section id="about" className="bg-white flex py-[120px]">
      <div className="flex md:items-center items-start justify-center gap-10 md:gap-0 md:justify-between flex-col md:flex-row">
        <div className="w-[40%]">
          <h3 className="text-secondary font-bold text-3xl md:text-6xl w-full">
            A Passionate
            <br />
            <span id="title"></span>
          </h3>
        </div>
        <div className="w-[85%] md:w-1/2">
          <p className="text-secondary text-sm md:text-base">
            Results-driven sophomore at SMK Telkom Malang, proficient in cloud
            engineering and front-end development. Proven track record includes
            successfully launching several websites, and providing freelance web
            development services since February 2024. Strong communication
            skills demonstrated by a TOEIC score of 935/990, and technical
            expertise recognized with a 1st Place win at National LKS Cloud
            Computing.
          </p>
        </div>
      </div>
    </Section>
  );
}
