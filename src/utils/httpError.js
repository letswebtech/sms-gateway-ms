class HttpError extends Error {
  constructor(statusCode, message, code = null) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

function createError(statusCode, message, code = null) {
  return new HttpError(statusCode, message, code);
}

module.exports = { HttpError, createError };
