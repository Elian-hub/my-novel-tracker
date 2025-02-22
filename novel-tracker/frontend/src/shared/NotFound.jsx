import React from "react";
import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center"
    >
      <Result
        status="404"
        title={
          <motion.h1
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-bold text-gray-800"
          >
            404
          </motion.h1>
        }
        subTitle={
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            Sorry, the page you visited does not exist.
          </motion.p>
        }
        extra={
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <Button
              type="primary"
              onClick={() => navigate(-1)}
              className="shadow-none"
            >
              Go Back
            </Button>
          </motion.div>
        }
      />
    </motion.div>
  );
};

export default NotFound;
