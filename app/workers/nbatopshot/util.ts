const dateFormat = require('dateformat');
const { Constants } = require('./settings');

const log = (tag, data, type = Constants.LOG_TYPES.LOG) => {
  if (Constants.DEBUG === true) {
    const now = new Date();
    const time = dateFormat(now, 'yy-mm-dd HH:MM:ss');
    let fn;

    switch (type) {
      case Constants.LOG_TYPES.INFO:
        fn = console.info;
        break;
      case Constants.LOG_TYPES.WARN:
        fn = console.warn;
        break;
      case Constants.LOG_TYPES.ERROR:
        fn = console.error;
        break;
      default:
        fn = console.log;
        break;
    }

    fn(`✨ ${time}`, `[${tag}]`, data);
  }
};

module.exports = {
  log
};
