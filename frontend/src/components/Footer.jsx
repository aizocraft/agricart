import { FaFacebook, FaTwitter, FaInstagram } from "react-icons/fa";
import { motion } from "framer-motion";

const SOCIALS = [
  {
    name: "Facebook",
    href: "https://facebook.com",
    Icon: FaFacebook,
    color: "#1877F2",
  },
  {
    name: "Twitter",
    href: "https://twitter.com",
    Icon: FaTwitter,
    color: "#1DA1F2",
  },
  {
    name: "Instagram",
    href: "https://instagram.com",
    Icon: FaInstagram,
    color:
      "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
    isGradient: true,
  },
];

export default function Footer() {
  const iconVariants = {
    rest: { scale: 1, rotate: 0 },
    hover: {
      scale: 1.15,
      rotate: 15,
      transition: { type: "spring", stiffness: 300, damping: 15 },
    },
  };

  return (
    <footer
      className="bg-gray-900 text-gray-300 py-12 select-none"
      aria-label="Site Footer"
    >
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 sm:gap-10">
          {/* Brand Info */}
          <div>
            <h3 className="text-3xl font-extrabold mb-6 text-white select-text tracking-wide">
              AgriCart
            </h3>
            <p className="max-w-xs leading-relaxed text-gray-400 select-text tracking-wide">
              Connecting farmers directly with consumers for fresh, local produce.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Quick Links">
            <h4 className="font-semibold mb-6 text-white tracking-wide text-lg">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {[
                { name: "Home", href: "/" },
                { name: "Products", href: "/products" },
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
              ].map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 py-0.5 inline-block"
                    tabIndex={0}
                    aria-label={`Go to ${name} page`}
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Customer Service */}
          <nav aria-label="Customer Service">
            <h4 className="font-semibold mb-6 text-white tracking-wide text-lg">
              Customer Service
            </h4>
            <ul className="space-y-3">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Shipping Policy", href: "/shipping" },
                { name: "Returns & Refunds", href: "/returns" },
              ].map(({ name, href }) => (
                <li key={name}>
                  <a
                    href={href}
                    className="text-gray-400 hover:text-green-400 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 py-0.5 inline-block"
                    tabIndex={0}
                    aria-label={`Read about ${name}`}
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Social Icons */}
          <section aria-label="Connect With Us" className="flex flex-col">
            <h4 className="font-semibold mb-6 text-white tracking-wide text-lg">
              Connect With Us
            </h4>
            <div className="flex space-x-6">
              {SOCIALS.map(({ Icon, href, name, color, isGradient }) => (
                <motion.a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit our ${name} page`}
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 p-2 text-current flex items-center justify-center"
                  initial="rest"
                  whileHover="hover"
                  whileFocus="hover"
                  variants={iconVariants}
                  style={{
                    width: 44,
                    height: 44,
                    fontSize: 24,
                    userSelect: "none",
                    transition: "all 0.3s ease-in-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (isGradient) {
                      e.currentTarget.style.background = color;
                      e.currentTarget.style.color = "#fff";
                      e.currentTarget.style.backgroundClip = "text";
                      e.currentTarget.style.webkitBackgroundClip = "text";
                      e.currentTarget.style.webkitTextFillColor = "transparent";
                    } else {
                      e.currentTarget.style.color = color;
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "";
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.backgroundClip = "";
                    e.currentTarget.style.webkitBackgroundClip = "";
                    e.currentTarget.style.webkitTextFillColor = "";
                  }}
                >
                  <Icon />
                </motion.a>
              ))}
            </div>

            {/* Newsletter Signup */}
            <form
              className="mt-8 flex flex-col sm:flex-row sm:items-center max-w-sm"
              onSubmit={(e) => e.preventDefault()}
              aria-label="Subscribe to newsletter"
            >
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="Your email address"
                required
                className="flex-grow px-4 py-3 rounded-l-md border border-gray-700 bg-gray-800 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                className="mt-3 sm:mt-0 sm:ml-2 px-6 py-3 rounded-md bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 text-white font-semibold transition"
              >
                Subscribe
              </button>
            </form>
          </section>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-6 text-center text-gray-500 select-text text-sm sm:text-base">
          <p>
            &copy; {new Date().getFullYear()} AgriCart. All rights reserved.
          </p>
          <p className="mt-1 text-gray-400 text-xs sm:text-sm">
            Crafted with <span aria-label="love">❤️</span> by AizoCraft
          </p>
        </div>
      </div>
    </footer>
  );
}
