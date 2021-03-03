const BASE_URL = 'https://www.nbatopshot.com';
const API_ENDPOINT = 'https://api.nba.dapperlabs.com';
const Configuration = {
  BASE_URL,
  API_ENDPOINT,
  API_SEARCH_MOMENT_LISTINGS: `${API_ENDPOINT}/marketplace/graphql?SearchMomentListings`,
  API_GET_MINTED_MOMENT: `${API_ENDPOINT}/marketplace/graphql?GetMintedMoment`,
  API_GET_MOMENT_DEDICATED: `${API_ENDPOINT}/marketplace/graphql?GetUserMomentListingsDedicated`,
  PRODUCT_URL_PREFIX: 'https://www.nbatopshot.com/listings/p2p/',
};

const Constants = {
  LOG_TYPES: {
    LOG: 0,
    INFO: 1,
    WARN: 5,
    ERROR: 10
  },
  DEBUG: true,
  UPDATE_DELAY: 30 * 60 * 1000,
  MONITOR_DELAY: 5 * 1000
};

module.exports = {
  Configuration,
  Constants
};
