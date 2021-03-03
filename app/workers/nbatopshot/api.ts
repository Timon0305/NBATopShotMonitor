const axios = require('axios');
// const fs = require('fs');
const { Configuration } = require('./settings');
const { log } = require('./util');
const TAG = 'API';
const MomentModel = require('../../utils/Moments');
const AccountModel = require('../../utils/Account');


const searchMoments = async (payload) => {
  const category = 'SEARCH_MOMENTS';
  return new Promise(async resolve => {
    try {
      const { status, data } = await axios.post(Configuration.API_SEARCH_MOMENT_LISTINGS, payload);
      if (status === 200) {
        if (data.errors) {
          resolve({
            success: false,
            message: data.errors[0].message
          });
        } else {
          const size = data.data.searchMomentListings.data.searchSummary.data.size;
          const moments = data.data.searchMomentListings.data.searchSummary.data.data;
          const pagination = data.data.searchMomentListings.data.searchSummary.pagination;
          let res_data = [];
          for (let moment of moments) {
            const { id, set, play, assetPathPrefix, priceRange } = moment;
            // log(`${TAG}_${category}_SUCCESS`, { id, set, play, assetPathPrefix, priceRange });
            // break;
            res_data.push({
              id,
              set,
              play,
              assetPathPrefix,
              priceRange
            });
          }
          // log(`${TAG}_${category}_SUCCESS`, moments);
          resolve({
            success: true,
            data: {
              size,
              pagination,
              moments: res_data
            }
          });
        }
      } else {
        log(`${TAG}_${category}_FAILURE`, status);
        resolve({
          success: false,
          message: 'Api call failed with code: ' + status
        });
      }
    } catch (e) {
      log(`${TAG}_${category}_FAILURE`, e.message);
      resolve({
        success: false,
        message: e.message
      });
    }
  });
};

const fetchMomentFromUrl = async (url: string) => {
  let res = {
    success: false,
    message: 'Invalid Url',
    data: null
  };
  try {
    if (url.startsWith(Configuration.PRODUCT_URL_PREFIX) && url.indexOf('+') > 0) {
      const temp1 = url.split(Configuration.PRODUCT_URL_PREFIX)[1];
      const temp2 = temp1.split('+');
      const setID = temp2[0];
      const playID = temp2[1];
      if (setID && playID) {
        const dbData = await MomentModel.getByIds(setID, playID);
        if (!dbData) {

          const requestData = {
            'operationName': 'GetUserMomentListingsDedicated',
            'variables': { 'input': { 'setID': setID, 'playID': playID } },
            'query': 'query GetUserMomentListingsDedicated($input: GetUserMomentListingsInput!) {\n  getUserMomentListings(input: $input) {\n    data {\n      circulationCount\n      flowRetired\n      version\n      set {\n        id\n        flowName\n        flowSeriesNumber\n        __typename\n      }\n      play {\n        ... on Play {\n          ...PlayDetails\n          __typename\n        }\n        __typename\n      }\n      assetPathPrefix\n      priceRange {\n        min\n        max\n        __typename\n      }\n      momentListings {\n        id\n        moment {\n          id\n          price\n          flowSerialNumber\n          owner {\n            dapperID\n            username\n            profileImageUrl\n            __typename\n          }\n          setPlay {\n            ID\n            flowRetired\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      momentListingCount\n      __typename\n    }\n    __typename\n  }\n}\n\nfragment PlayDetails on Play {\n  id\n  description\n  stats {\n    playerID\n    playerName\n    primaryPosition\n    currentTeamId\n    dateOfMoment\n    jerseyNumber\n    awayTeamName\n    awayTeamScore\n    teamAtMoment\n    homeTeamName\n    homeTeamScore\n    totalYearsExperience\n    teamAtMomentNbaId\n    height\n    weight\n    currentTeam\n    birthplace\n    birthdate\n    awayTeamNbaId\n    draftYear\n    nbaSeason\n    draftRound\n    draftSelection\n    homeTeamNbaId\n    draftTeam\n    draftTeamNbaId\n    playCategory\n    homeTeamScoresByQuarter {\n      quarterScores {\n        type\n        number\n        sequence\n        points\n        __typename\n      }\n      __typename\n    }\n    awayTeamScoresByQuarter {\n      quarterScores {\n        type\n        number\n        sequence\n        points\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  statsPlayerGameScores {\n    blocks\n    points\n    steals\n    assists\n    minutes\n    rebounds\n    turnovers\n    plusMinus\n    flagrantFouls\n    personalFouls\n    playerPosition\n    technicalFouls\n    twoPointsMade\n    blockedAttempts\n    fieldGoalsMade\n    freeThrowsMade\n    threePointsMade\n    defensiveRebounds\n    offensiveRebounds\n    pointsOffTurnovers\n    twoPointsAttempted\n    assistTurnoverRatio\n    fieldGoalsAttempted\n    freeThrowsAttempted\n    twoPointsPercentage\n    fieldGoalsPercentage\n    freeThrowsPercentage\n    threePointsAttempted\n    threePointsPercentage\n    __typename\n  }\n  statsPlayerSeasonAverageScores {\n    minutes\n    blocks\n    points\n    steals\n    assists\n    rebounds\n    turnovers\n    plusMinus\n    flagrantFouls\n    personalFouls\n    technicalFouls\n    twoPointsMade\n    blockedAttempts\n    fieldGoalsMade\n    freeThrowsMade\n    threePointsMade\n    defensiveRebounds\n    offensiveRebounds\n    pointsOffTurnovers\n    twoPointsAttempted\n    assistTurnoverRatio\n    fieldGoalsAttempted\n    freeThrowsAttempted\n    twoPointsPercentage\n    fieldGoalsPercentage\n    freeThrowsPercentage\n    threePointsAttempted\n    threePointsPercentage\n    __typename\n  }\n  __typename\n}\n'
          };

          const { status, data } = await axios.post(Configuration.API_GET_MOMENT_DEDICATED, requestData);
          if (status === 200 && data.data && data.data.getUserMomentListings && data.data.getUserMomentListings.data) {
            const moment = data.data.getUserMomentListings.data;
            // const __moment = moment.momentListings.find(e => e.moment.id === "a9fca970-354d-4858-a9dc-dcc22a311990");

            res.success = true;
            res.message = 'Success';
            res.data = {
              assetPathPrefix: moment.assetPathPrefix,
              priceRange: moment.priceRange,
              flowRetired: moment.flowRetired,
              circulationCount: moment.circulationCount,
              set: moment.set,
              play: {
                id: moment.play.id,
                description: moment.play.description,
                stats: {
                  playerName: moment.play.stats.playerName,
                  dateOfMoment: moment.play.stats.dateOfMoment,
                  playCategory: moment.play.stats.playCategory,
                  teamAtMomentNbaId: moment.play.stats.teamAtMomentNbaId,
                  teamAtMoment: moment.play.stats.teamAtMoment
                }
              }
            };
          } else {
            res.message = 'Can not get moment data';
          }
        } else {
          res.message = 'This moment already exists';
        }
      }
    }
  } catch
    (e) {
    log(`${TAG}_FETCH_MOMENT_FAILED`, e.message);
    res.message = e.message;
  }
  return res;
};

const fetchMomentPrice = async (payload: any) => {
  const { setId, playId } = payload;
  let res = {
    success: false,
    message: 'Invalid ids',
    data: null
  };
  try {
    if (setId && playId) {
      const requestData = {
        'operationName': 'GetUserMomentListingsDedicated',
        'variables': {
          'input': {
            'setID': setId,
            'playID': playId
          }
        },
        'query': 'query GetUserMomentListingsDedicated($input: GetUserMomentListingsInput!) {\n  getUserMomentListings(input: $input) {\n    data {\n      priceRange {\n        min\n        max\n        }\n      }\n    }\n  }\n'
      };

      const { status, data } = await axios.post(Configuration.API_GET_MOMENT_DEDICATED, requestData);
      if (status === 200 && data.data && data.data.getUserMomentListings && data.data.getUserMomentListings.data) {
        const moment = data.data.getUserMomentListings.data;
        // const __moment = moment.momentListings.find(e => e.moment.id === "a9fca970-354d-4858-a9dc-dcc22a311990");

        res.success = true;
        res.message = 'Success';
        res.data = {
          priceRange: moment.priceRange
        };
      } else {
        res.message = 'Can not get moment data';
      }
    }
  } catch
    (e) {
    log(`${TAG}_FETCH_MOMENT_FAILED`, e.message);
    res.message = e.message;
  }
  return res;
};

module.exports = {
  searchMoments,
  fetchMomentFromUrl,
  fetchMomentPrice
};
