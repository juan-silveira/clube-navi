// Logger utility com controle de verbosidade
const logger = {
  debug: (...args) => {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG_AVATAR !== 'false') {
      console.log(...args);
    }
  },
  
  info: (...args) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args);
    }
  },
  
  warn: (...args) => {
    console.warn(...args);
  },
  
  error: (...args) => {
    console.error(...args);
  }
};

export default logger;