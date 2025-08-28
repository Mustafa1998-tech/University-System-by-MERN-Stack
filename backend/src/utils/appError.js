class AppError extends Error {
  constructor(message, statusCode) {
    // Handle multilingual messages
    if (typeof message === 'object' && message.en) {
      super(message.en);
      this.messageAr = message.ar;
      this.messages = message;
    } else {
      super(message);
      this.messages = { en: message };
    }
    
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  // Get message based on language preference
  getMessage(language = 'en') {
    if (this.messages && this.messages[language]) {
      return this.messages[language];
    }
    return this.message;
  }
}

module.exports = AppError;