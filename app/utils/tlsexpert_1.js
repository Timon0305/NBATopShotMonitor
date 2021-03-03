
const got = require('got');

const IsJsonString = (str) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

const tlsExpert = async(apiKey, options) => {
  const {
    url,
    proxy,
    method,
    body,
    headers
  } = options;

  if (!url) throw new Error('Missing url field.');
  if (!proxy) throw new Error('Missing proxy field.');
  if (!method) throw new Error('Missing method field.');

  const res = await got.post(`http://old.tls.expert/v1/chrome/${apiKey}`, {
    https: {
      rejectUnauthorized: false,
    },
    body: JSON.stringify({
      url,
      proxy,
      method,
      body: body || '',
      headers: headers || null,
    }),
  });
  return IsJsonString(res.body) ? JSON.parse(res.body) : res.body;
};

module.exports = tlsExpert;
