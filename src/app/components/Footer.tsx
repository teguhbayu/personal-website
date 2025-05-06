export default function Footer() {
  return (
    <footer className="px-[30px] lg:px-[100px] py-[42px] flex justify-between items-center flex-col lg:flex-row">
      <p className="text-start text-white font-medium text-base sm:text-xl md:text-3xl">
        teguhbayupratama@gmail.com
      </p>
      <p className="text-end text-white">
        &copy; {new Date().getFullYear()} Teguh Bayu Pratama
      </p>
    </footer>
  );
}
