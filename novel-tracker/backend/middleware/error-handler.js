const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || "Internal Server Error";

  // Log the error for debugging purposes
  console.error(`[Error] ${status}: ${message}`);

  // Send the error response
  res.status(status).json({
    status,
    message,
  });
};

export default errorHandler;
