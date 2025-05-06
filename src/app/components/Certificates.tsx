"use client";
import { useEffect, useState } from "react";
import Section from "./global/Wrapper";
import CertCard from "./parts/Card";

const certs = {
  lang: [
    {
      name: "TOEIC",
      image: "toeic.jpg",
      href: "https://drive.google.com/file/d/1krU69GNOAml_z_kjTGNAgvBYQc1YmfvQ/view?usp=sharing",
      pos: "English",
    },
    {
      name: "UKBI",
      image: "ukbi.jpg",
      href: "https://drive.google.com/file/d/1dpf2oxp_coJIG46-WQKD8M6Uv8zDT_fh/view?usp=sharing",
      pos: "Indonesian",
    },
  ],
  comp: [
    {
      name: "LKS Cloud Malang",
      image: "lksk.jpg",
      href: "https://drive.google.com/file/d/1X6u90-sGYHoBLOEgmC7MJXk2Ub2iPBut/view?usp=sharing",
      pos: "1st place",
    },
    {
      name: "LKS Cloud Jatim",
      image: "lks.jpg",
      href: "https://drive.google.com/file/d/1CNey9DvBIxqnGQtyA5YNqdqtOgywVdGx/view?usp=sharing",
      pos: "1st place",
    },
    {
      name: "LKSN Cloud Computing",
      image: "lksn.jpg",
      href: "https://drive.google.com/file/d/15lP-HQjh1Qi8uymXCU3fvCBttRb2L6aC/view?usp=sharing",
      pos: "1st place",
    },
  ],
};

export default function Certificates() {
  const [index, setIndex] = useState<number>(0 | 1);

  useEffect(() => {
    setIndex(0);
  }, []);

  return (
    <Section
      id="Certificates"
      className="flex justify-center flex-col items-center gap-10 overflow-hidden bg-white"
    >
      <h1 className="text-center text-primary font-semibold text-2xl md:text-4xl">
        Certificates
      </h1>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => setIndex(0)}
          className={`border border-primary px-4 py-2 rounded-xl ${
            index === 0
              ? "bg-primary text-white"
              : "bg-transparent text-primary"
          } hover:bg-primary hover:text-white transition-all duration-300`}
        >
          Competition
        </button>
        <button
          onClick={() => setIndex(1)}
          className={`border border-primary px-4 py-2 rounded-xl ${
            index === 1
              ? "bg-primary text-white"
              : "bg-transparent text-primary"
          } hover:bg-primary hover:text-white transition-all duration-300`}
        >
          Language
        </button>
      </div>
      <div
        className={`w-full flex-wrap justify-center gap-4 z-30 duration-300 transition-all ${
          index === 1 ? "flex" : "hidden"
        }`}
      >
        {certs.lang.map((cert) => (
          <CertCard {...cert} />
        ))}
      </div>
      <div
        className={`w-full flex-wrap justify-center gap-4 z-30 duration-300 transition-all ${
          index === 0 ? "flex" : "hidden"
        }`}
      >
        {certs.comp.map((cert) => (
          <CertCard {...cert} />
        ))}
      </div>
    </Section>
  );
}
