class ErrorResponse extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
<<<<<<< HEAD
=======

>>>>>>> c0d53f25993c5b4353596b92ebec198443884b7d
export default ErrorResponse;
