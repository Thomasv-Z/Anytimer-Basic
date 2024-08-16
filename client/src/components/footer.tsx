import { Typography } from "@material-tailwind/react";

const CURRENT_YEAR = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 w-full px-8 pt-8 pb-8 bg-white shadow-lg">
      <div className="container max-w-6xl mx-auto flex justify-center">
        <Typography
          color="blue-gray"
          className="text-center font-normal text-gray-700"
        >
          &copy; {CURRENT_YEAR} Made with{" "}
          <a href="https://www.material-tailwind.com" target="_blank" rel="noopener noreferrer">
            Material Tailwind
          </a>{" "}
          by{" "}
          <a href="https://www.thomasvanz.nl" target="_blank" rel="noopener noreferrer">
            Thomas van Zuilen
          </a>{" "}
          and{" "}
          <a href="https://www.creative-tim.com" target="_blank" rel="noopener noreferrer">
            Creative Tim
          </a>
          .
        </Typography>
      </div>
    </footer>
  );
}

export default Footer;
