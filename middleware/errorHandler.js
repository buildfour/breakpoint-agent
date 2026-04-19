export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  res.status(status).json({
    success: false,
    error: {
      message,
      status,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  })
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      status: 404,
      path: req.originalUrl
    }
  })
}
