// import ApiError from '../utils/ApiError.js';

// const errorHandler = (err, req, res, next) => {
//   let statusCode = err.statusCode || 500;
//   let message = err.message || 'Internal Server Error';
//   const errors = err.errors || [];

//   if (err.name === 'ValidationError') {
//     statusCode = 400;
//     message = 'Validation Error';
//     errors.push(...Object.values(err.errors).map((e) => e.message));
//   }

//   if (err.code === 11000) {
//     statusCode = 400;
//     const keyValue = err.keyValue || {};
//     if (keyValue.rollNo) {
//       message = `Roll number ${keyValue.rollNo} already exists in class ${keyValue.class || ''} for this session`;
//     } else if (keyValue.sessionId && keyValue.class) {
//       message = `A student with this roll number already exists in class ${keyValue.class}`;
//     } else {
//       const field = Object.keys(keyValue)[0];
//       message = `Duplicate value for ${field}`;
//     }
//   }

//   if (err.name === 'CastError') {
//     statusCode = 400;
//     message = 'Invalid ID format';
//   }

//   if (err.name === 'JsonWebTokenError') {
//     statusCode = 401;
//     message = 'Invalid token';
//   }

//   if (err.name === 'TokenExpiredError') {
//     statusCode = 401;
//     message = 'Token expired';
//   }

//   if (err instanceof ApiError) {
//     statusCode = err.statusCode;
//     message = err.message;
//   }

//   console.error(`[${req.method}] ${req.originalUrl} - ${message}`);

//   res.status(statusCode).json({
//     success: false,
//     message,
//     errors,
//     ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
//   });
// };

// export default errorHandler;



import ApiError from '../utils/ApiError.js';

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // err.errors from Mongoose ValidationError is a keyed object, not an array
  const errors = Array.isArray(err.errors) ? [...err.errors] : [];

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    errors.push(...Object.values(err.errors).map((e) => e.message));
  }

  if (err.code === 11000) {
    statusCode = 400;
    const keyValue = err.keyValue || {};
    if (keyValue.rollNo) {
      message = `Roll number ${keyValue.rollNo} already exists in class ${keyValue.class || ''} for this session`;
    } else if (keyValue.sessionId && keyValue.class) {
      message = `A student with this roll number already exists in class ${keyValue.class}`;
    } else {
      const field = Object.keys(keyValue)[0];
      message = `Duplicate value for ${field}`;
    }
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  console.error(`[${req.method}] ${req.originalUrl} - ${message}`);

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;