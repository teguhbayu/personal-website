import Image from "next/image";
import Section from "./global/Wrapper";

export default function Hero() {
  return (
    <Section
      id="hero"
      className="relative h-[100vh] flex justify-start overflow-hidden items-start md:items-end py-[72px]"
    >
      <h1 className="absolute left-1/2 -translate-x-1/2 top-[54%] sm:top-[45%] md:top-[25%] xl:top-[15%] text-transparent opacity-40 font-normal text-[55px] sm:text-[100px] md:text-[150px] xl:text-[250px] font-outline -z-10">
        Developer
      </h1>
      <Image
        src={"/bayu.png"}
        alt="bayu"
        className="absolute z-10 bottom-0 left-1/2 -translate-x-1/2 h-[60%] sm:h-[70%] md:h-[90%] w-auto translate-y-10"
        width={400}
        height={800}
        unoptimized
      />
      <div className="flex flex-col gap-3 sm:gap-7 text-white z-30 pt-[25%] sm:pt-0">
        <h2 className="font-semibold text-4xl sm:text-6xl">
          Heyya!
          <br /> I'm Bayu
        </h2>
        <div className="flex justify-center items-center px-5 py-2 rounded-full bg-[#00224D]">
          <h3 className="text-white text-xs sm:text-base font-medium">
            Web Developer & Cloud Engineer
          </h3>
        </div>
      </div>
    </Section>
  );
}
