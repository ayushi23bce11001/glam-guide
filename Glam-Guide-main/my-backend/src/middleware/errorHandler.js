/**
 * Centralized production error-handling middleware
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Unhandled Application Error:', {
        message: err.message,
        code: err.code,
        name: err.name,
        path: req.originalUrl,
        method: req.method
    });

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Mongoose duplicate key error (e.g. duplicate email)
    if (err.code === 11000) {
        statusCode = 409;
        const field = Object.keys(err.keyValue || {})[0] || 'field';
        message = `An account with this ${field} already exists.`;
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(', ');
    }

    // Mongoose bad ObjectId / CastError
    if (err.name === 'CastError') {
        statusCode = 400;
        message = `Resource not found with invalid ID format: ${err.value}`;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid authentication token.';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Authentication token has expired.';
    }

    // AI Service not configured
    if (err.code === 'AI_NOT_CONFIGURED') {
        statusCode = 503;
        message = 'AI service is currently not configured on this server. Please set AI_API_KEY.';
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};

export default errorHandler;
