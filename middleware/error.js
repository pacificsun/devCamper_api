const ErrorResponse = require('../utils/errorResponse');
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  console.log('error>>', error);
  error.message = err.message; //??
  // Log to console for dev
  console.log(err.stack.red);

  // Mongoose bad and wrongly formatted ObjectID
  console.log(err.name);
  if (err.name === 'CastError') {
    const message = `Bootcamp not found with id of ${err.value}`;
    error = new ErrorResponse(message, 404);
  }
  res
    .status(error.statusCode || 500)
    .json({ success: false, error: error.message || 'server error' });
};
module.exports = errorHandler;
