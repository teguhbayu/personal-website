import Section from "./global/Wrapper";
import { RiNextjsFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import {
  SiAmazonaws,
  SiPrisma,
  SiTypescript,
  SiMysql,
  SiMongodb,
  SiExpress,
  SiExpo,
} from "react-icons/si";
import { FaGolang } from "react-icons/fa6";
import React from "react";

const skills = [
  <RiNextjsFill />,
  <SiAmazonaws />,
  <SiTypescript />,
  <SiPrisma />,
  <SiMysql />,
  <BiLogoPostgresql />,
  <SiMongodb />,
  <SiExpress />,
  <SiExpo />,
  <FaGolang />,
];

export default function Skills() {
  return (
    <Section id="skills" className="flex flex-col items-center gap-7 pt-0">
      <h1 className="text-center text-white font-semibold text-2xl lg:text-4xl">
        Skills
      </h1>
      <div className="flex gap-5 lg:gap-7 text-2xl md:text-4xl text-white flex-wrap items-center justify-center">
        {skills.map((skill, i) => (
          <React.Fragment key={i}>{skill}</React.Fragment>
        ))}
      </div>
    </Section>
  );
}
