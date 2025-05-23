import Link from "next/link";
import Image from "next/image";
import { ReactNode } from "react";
import React from "react";

interface cardProps {
  name: string;
  image: string;
  pos?: string;
  href: string;
}

interface projectProps {
  name: string;
  image: string;
  href: string;
  stack: ReactNode[];
}

export default function CertCard(props: cardProps) {
  return (
    <Link
      href={props.href}
      target="_blank"
      key={props.name}
      className="block h-[220px] w-[90%] md:w-[40%] xl:w-[30%] rounded-xl overflow-hidden relative group"
    >
      <div className="bg-black absolute w-full h-full -z-20 bg-opacity-0 duration-500 transition-all group-hover:bg-opacity-20 backdrop-blur-0 group-hover:backdrop-blur-[1px   ]"></div>
      <div className="w-full h-full block transition-all duration-300 z-[999] py-3 px-4">
        {props.pos && (
          <p className="text-white font-light text-lg md:text-xl absolute -bottom-36 duration-300 transition-all delay-[125] group-hover:bottom-9 md:group-hover:bottom-12">
            {props.pos}
          </p>
        )}
        <h3 className="text-white font-semibold text-xl md:text-3xl absolute -bottom-36 duration-300 transition-all delay-[50] group-hover:bottom-3">
          {props.name}
        </h3>
      </div>
      <Image
        src={"/certs/" + props.image}
        className="w-full h-full object-cover group-hover:scale-110 duration-300 transition-all -z-40 absolute left-0 top-0"
        alt="waw"
        width={300}
        height={175}
      />
    </Link>
  );
}

export function ProjectCard(props: projectProps) {
  return (
    <Link
      href={props.href}
      target="_blank"
      key={props.href}
      className="block h-[225px] w-[90%] md:w-[40%] xl:w-1/3 rounded-xl overflow-hidden relative group"
    >
      <div className="bg-black absolute w-full h-full -z-20 bg-opacity-0 duration-500 transition-all group-hover:bg-opacity-30"></div>
      <div className="w-full h-full block transition-all duration-300 z-[999] py-3 px-4">
        {props.stack && (
          <div className="text-white font-light text-xl absolute -bottom-10 duration-300 transition-all delay-[125] flex gap-2 group-hover:bottom-12">
            {props.stack &&
              props.stack.map((tech, i) => (
                <React.Fragment key={i.toString()}>{tech}</React.Fragment>
              ))}
          </div>
        )}
        <h3 className="text-white font-semibold text-2xl md:text-3xl absolute -bottom-10 duration-300 transition-all delay-[50] group-hover:bottom-3">
          {props.name}
        </h3>
      </div>
      <Image
        src={"/projects/" + props.image}
        className="w-full h-full object-cover group-hover:scale-110 duration-300 transition-all -z-40 absolute left-0 top-0"
        alt="waw"
        width={400}
        key={props.image}
        height={225}
      />
    </Link>
  );
}
