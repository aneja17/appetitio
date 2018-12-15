const winston = require('winston');
const path = require('path');

var options = {
    file: {
      level: 'info',
      filename: path.resolve(__dirname, '../logs/app.log'),
      handleExceptions: true,
      json: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      colorize: false,
    },
    console: {
      level: 'debug',
      handleExceptions: true,
      json: false,
      colorize: true,
    },
  };

  var logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.label({ label: 'Appetito logs' }),
      winston.format.timestamp(),
      winston.format.prettyPrint()
    ),
    transports: [
        new winston.transports.File(options.file)
      ],
      exitOnError: false, // do not exit on handled exceptions
  });

  if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.Console(options.console));
  }

global.logger = logger;