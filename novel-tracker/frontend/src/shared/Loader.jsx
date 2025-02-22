import { motion } from "framer-motion";

const loaderVariants = {
  initial: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const dotVariants = (delay) => ({
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.8, 1, 0.8],
    transition: {
      repeat: Infinity,
      duration: 1.2,
      delay: delay, // Stagger the animation start for each dot
      ease: "easeInOut",
    },
  },
});

const Loader = () => {
  return (
    <motion.div
      variants={loaderVariants}
      initial="initial"
      animate="visible"
      exit="exit"
      className="min-h-[70vh] bg-opacity-90 flex items-center justify-center"
    >
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="flex justify-center items-center space-x-4">
            <motion.div
              className="w-6 h-6 bg-orange-600 rounded-full"
              variants={dotVariants(0)}
              animate="animate"
            ></motion.div>
            <motion.div
              className="w-6 h-6 bg-orange-600 rounded-full"
              variants={dotVariants(0.3)}
              animate="animate"
            ></motion.div>
            <motion.div
              className="w-6 h-6 bg-orange-600 rounded-full"
              variants={dotVariants(0.6)}
              animate="animate"
            ></motion.div>
          </div>
          <motion.p
            className="text-xl text-center font-semibold text-orange-600"
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: "easeInOut",
            }}
          >
            Loading...
          </motion.p>
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
