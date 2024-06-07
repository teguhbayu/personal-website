import Section from "./global/Wrapper";
import { RiNextjsFill } from "react-icons/ri";
import { BiLogoPostgresql } from "react-icons/bi";
import { SiAwsamplify, SiPrisma, SiTypescript, SiMysql } from "react-icons/si";
import { ProjectCard } from "./parts/Card";

const projects = [
  {
    name: "Moklet.org",
    image: "mokletorg.png",
    href: "https://moklet.org",
    stack: [
      <RiNextjsFill />,
      <SiTypescript />,
      <SiMysql />,
      <SiAwsamplify />,
      <SiPrisma />,
    ],
  },
  {
    name: "Antareja",
    image: "antareja.png",
    href: "https://antareja.smktelkom-mlg.sch.id",
    stack: [
      <RiNextjsFill />,
      <SiTypescript />,
      <BiLogoPostgresql />,
      <SiPrisma />,
    ],
  },
];

export default function Projects() {
  return (
    <Section id="projects" className="flex flex-col items-center gap-10">
      <h1 className="text-center text-white font-semibold text-2xl md:text-4xl">
        Featured Projects
      </h1>
      <div className="w-full flex flex-wrap gap-4 items-center justify-center">
        {projects.map((project) => (
          <ProjectCard {...project} />
        ))}
      </div>
    </Section>
  );
}
