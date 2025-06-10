import { motion } from 'framer-motion';
import { FaLeaf } from 'react-icons/fa';
import { GiFarmer } from 'react-icons/gi';
import { TbTractor } from 'react-icons/tb';

export default function BenefitsSection({ currentTheme }) {
  return (
    <section className={`py-16 ${currentTheme.bg}`}>
      <div className="container mx-auto px-4">
        <div className={`rounded-3xl p-8 md:p-12 text-white overflow-hidden relative ${currentTheme.primary}`}>
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80')] bg-cover bg-center"></div>
          <div className="relative z-10">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Why Choose <span className="text-yellow-300">Agricart</span>
              </h2>
              <p className="text-green-100 max-w-2xl mx-auto text-lg">
                Supporting Kenya's agricultural heritage while bringing you the freshest produce
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Support Kenyan Farmers",
                  description: "Your purchase directly supports Kenyan farming families",
                  icon: <GiFarmer className="text-4xl" />
                },
                {
                  title: "Fresh from Kenyan Soil",
                  description: "Produce harvested at peak freshness from Kenyan farms",
                  icon: <TbTractor className="text-4xl" />
                },
                {
                  title: "Sustainable Practices",
                  description: "Eco-friendly farming that preserves Kenya's land",
                  icon: <FaLeaf className="text-4xl" />
                }
              ].map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 * index }}
                  whileHover={{ 
                    y: -5,
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20"
                >
                  <div className="flex justify-center mb-4 text-yellow-300">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-center">{benefit.title}</h3>
                  <p className="text-green-100 text-center">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}