import { motion } from "framer-motion";
import { FaLeaf } from "react-icons/fa";
import { GiFarmer } from "react-icons/gi";
import { TbTractor } from "react-icons/tb";

export default function BenefitsSection({ currentTheme }) {
  const bgClass = currentTheme?.bg || "bg-gray-50";
const textPrimary = "text-gray-900";
const accent = "text-green-600";
const cardBg = "bg-white";
const cardBorder = "border-gray-200";
const goldColor = currentTheme?.gold || "text-yellow-500";

  const benefits = [
    {
      title: "Empowering Local Farmers",
      description:
        "Every order helps uplift Kenyan farmers by providing fair income and stable livelihoods.",
      icon: <GiFarmer className="w-10 h-10" />,
    },
    {
      title: "Farm-to-Table Freshness",
      description:
        "Handpicked produce delivered quickly to retain maximum nutrition and flavor.",
      icon: <TbTractor className="w-10 h-10" />,
    },
    {
      title: "Sustainable & Eco-Friendly",
      description:
        "Committed to green farming methods that protect and nourish Kenya’s land.",
      icon: <FaLeaf className="w-10 h-10" />,
    },
  ];

  return (
    <section className={`${bgClass} py-20`}>
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <h2 className={`text-4xl font-extrabold tracking-tight ${goldColor} mb-4`}>
            Why <span className={`${accent}`}>Choose Agricart</span> ?
          </h2>
          <p className="text-lg text-gray-700 max-w-xl mx-auto">
            Proudly supporting Kenyan farmers while bringing you fresh, healthy,
            and sustainable produce — directly from the farm to your table.
          </p>
        </motion.div>

        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-3">
          {benefits.map(({ title, description, icon }, idx) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: idx * 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05, y: -10, boxShadow: "0 10px 20px rgba(72, 187, 120, 0.3)" }}
              className={`${cardBg} border ${cardBorder} rounded-3xl p-8 flex flex-col items-center text-center shadow-md cursor-pointer`}
            >
              <div className={`mb-6 ${accent}`}>{icon}</div>
              <h3 className={`text-xl font-semibold mb-3 ${textPrimary}`}>{title}</h3>
              <p className="text-gray-600">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
