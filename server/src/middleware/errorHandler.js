export function notFound(request, response) {
  response.status(404).json({ message: `Route not found: ${request.method} ${request.originalUrl}` });
}

export function errorHandler(error, _request, response, _next) {
  const status = error.name === "ValidationError" || error.name === "ZodError" ? 400 : error.status || 500;
  const message = status === 500 && process.env.NODE_ENV === "production" ? "Something went wrong." : error.message;
  response.status(status).json({ message, details: error.errors || undefined });
}

