exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://admin:sundogg33@ds153851.mlab.com:53851/connect-four-trivia';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'mongodb://admin:sundogg33@ds153851.mlab.com:53851/connect-four-trivia';
exports.PORT = process.env.PORT || 8080;