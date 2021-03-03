const apiAgent = require('./api');
const automationAgent = require('./operation');
const Settings = require('./settings');
const util = require('./util');

const MomentModel = require('../../utils/Moments');
const AccountModel = require('../../utils/Account');
const ActivityModel = require('../../utils/Activity');

const TAG = 'NBAWorker';
let MonitorData = {
  bContinue: false,
  notifyUpdated: null
};

const updateMomentsData = async () => {
  try {
    let cursor = '';
    let direction = 'RIGHT';
    let limit = 12;
    let momentListings: any[] = [];
    let completed = false;
    while (true) {
      if (!MonitorData.bContinue) {
        util.log(`${TAG}_MONITOR`, 'CANCELLED');
        return;
      }

      let { success, data, message } = await apiAgent.searchMoments({
        'operationName': 'SearchMomentListings',
        'variables': {
          'byPlayers': [],
          'byTagNames': [],
          'byTeams': [],
          'bySets': [],
          'bySeries': [],
          'bySetVisuals': [],
          'byGameDate': {
            'start': null,
            'end': null
          },
          'byCreatedAt': {
            'start': null,
            'end': null
          },
          'byPower': { 'min': null, 'max': null },
          'byPrice': { 'min': null, 'max': null },
          'byListingType': ['BY_USERS'],
          'byPlayStyle': [],
          'bySkill': [],
          'byPrimaryPlayerPosition': [],
          'bySerialNumber': { 'min': null, 'max': null },
          'searchInput': {
            'pagination': { 'cursor': cursor, 'direction': direction, 'limit': limit }
          },
          'orderBy': 'PRICE_USD_DESC'
        },
        'query': 'query SearchMomentListings($byPlayers: [ID], $byTagNames: [String!], $byTeams: [ID], $byPrice: PriceRangeFilterInput, $orderBy: MomentListingSortType, $byGameDate: DateRangeFilterInput, $byCreatedAt: DateRangeFilterInput, $byListingType: [MomentListingType], $bySets: [ID], $bySeries: [ID], $bySetVisuals: [VisualIdType], $byPrimaryPlayerPosition: [PlayerPosition], $bySerialNumber: IntegerRangeFilterInput, $searchInput: BaseSearchInput!, $userDapperID: ID) {\n  searchMomentListings(input: {filters: {byPlayers: $byPlayers, byTagNames: $byTagNames, byGameDate: $byGameDate, byCreatedAt: $byCreatedAt, byTeams: $byTeams, byPrice: $byPrice, byListingType: $byListingType, byPrimaryPlayerPosition: $byPrimaryPlayerPosition, bySets: $bySets, bySeries: $bySeries, bySetVisuals: $bySetVisuals, bySerialNumber: $bySerialNumber}, sortBy: $orderBy, searchInput: $searchInput, userDapperID: $userDapperID}) {\n    data {\n      filters {\n        byPlayers\n        byTagNames\n        byTeams\n        byPrimaryPlayerPosition\n        byGameDate {\n          start\n          end\n          __typename\n        }\n        byCreatedAt {\n          start\n          end\n          __typename\n        }\n        byPrice {\n          min\n          max\n          __typename\n        }\n        bySerialNumber {\n          min\n          max\n          __typename\n        }\n        bySets\n        bySeries\n        bySetVisuals\n        __typename\n      }\n      searchSummary {\n        count {\n          count\n          __typename\n        }\n        pagination {\n          leftCursor\n          rightCursor\n          __typename\n        }\n        data {\n          ... on MomentListings {\n            size\n            data {\n              ... on MomentListing {\n                id\n                version\n                circulationCount\n                flowRetired\n                set {\n                  id\n                  flowName\n                  setVisualId\n                  flowSeriesNumber\n                  __typename\n                }\n                play {\n                  description\n                  id\n                  stats {\n                    playerName\n                    dateOfMoment\n                    playCategory\n                    teamAtMomentNbaId\n                    teamAtMoment\n                    __typename\n                  }\n                  __typename\n                }\n                assetPathPrefix\n                priceRange {\n                  min\n                  max\n                  __typename\n                }\n                momentListings {\n                  id\n                  moment {\n                    id\n                    owner {\n                      dapperID\n                      username\n                      __typename\n                    }\n                    __typename\n                  }\n                  __typename\n                }\n                listingType\n                userOwnedSetPlayCount\n                __typename\n              }\n              __typename\n            }\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n'
      });

      if (!success) {
        notifyUpdated({
          title: 'Monitor failed',
          content: message
        });
        break;
      }

      let { size, pagination, moments } = data;
      util.log(`${TAG}_INDEX_DATA_SIZE`, moments.length);
      momentListings = momentListings.concat(moments);
      cursor = pagination.rightCursor;
      if (size < 1) {
        completed = true;
        break;
      }
    }
    // await fs.writeFileSync('moments.json', JSON.stringify(__data, null, 2), 'utf8');
    util.log(`${TAG}_FETCH_MOMENTS`, `${momentListings.length} moments found`);

    if (completed) {
      const dbMoments = await MomentModel.get();
      for (let moment of momentListings) {
        const dbMoment = dbMoments.data.find((e: any) => e.set.id === moment.set.id && e.play.id === moment.play.id);
        if (dbMoment && dbMoment.buyPrice) {
          moment.buyPrice = dbMoment.buyPrice;
          moment.boughtAt = dbMoment.boughtAt;
        }
      }
      const __data = {
        updatedAt: new Date(),
        data: momentListings
      };
      await MomentModel.set(__data);
      await ActivityModel.add({
        at: new Date(),
        type: 'MOMENTS',
        result: 'UPDATED',
        data: momentListings.length + ' moments were found'
      });
      notifyUpdated({
        title: 'Moments updated',
        content: momentListings.length + ' moments are found'
      });
    }
  } catch (e) {
    util.log(`${TAG}_UPDATE_MOMENTS_FAILURE`, e.message);
  } finally {
    setTimeout(updateMomentsData, Settings.Constants.UPDATE_DELAY);
  }
};


const doMonitor = async () => {
  if (!MonitorData.bContinue) {
    util.log(`${TAG}_MONITOR`, 'FINISHED');
    return;
  }
  util.log(`${TAG}_MONITOR`, 'STARTED');

  try {
    if (!MonitorData.bContinue) {
      util.log(`${TAG}_MONITOR`, 'CANCELLED');
      return;
    }

    const dbMoments = await MomentModel.get();
    const dbAccount = await AccountModel.get();
    const { ccInfo, credential, billing } = dbAccount;
    const momentListings = dbMoments.data.filter((e: any) => e.buyPrice && e.buyPrice > 0 && !e.boughtAt);

    console.log('monitor-moments-count', momentListings.length);

    for (let moment of momentListings) {
      let { success, data, message } = await apiAgent.fetchMomentPrice({
        setId: moment.set.id,
        playId: moment.play.id
      });

      if (!success) {
        console.log('fetch-price-fail', message);
        continue;
      }

      moment.priceRange = data.priceRange;
      try {
        console.log('fetch-price-done', moment.priceRange.min, moment.priceRange.max);
        await MomentModel.update(moment);
      } catch (e) {

      }

      if (parseFloat(moment.buyPrice.toString()) >= parseFloat(data.priceRange.min.toString()) && (moment.boughtAt == null || moment.boughtAt == undefined)) {
        console.log('moment-detected', moment);
        notifyUpdated({
          title: 'Moment detected',
          content: `This moment(${Settings.Configuration.PRODUCT_URL_PREFIX}${moment.set.id}+${moment.play.id}) was got the same or lower than $ ${moment.buyPrice}.`
        });
        await ActivityModel.add({
          at: new Date(),
          type: 'MOMENT',
          result: 'DETECTED',
          data: `${moment.set.id}+${moment.play.id} [MIN_PRICE: ${moment.priceRange.min}]`
        });

        if (!MonitorData.bContinue) {
          util.log(`${TAG}_MONITOR`, 'CANCELLED');
          return;
        }

        const { success, message, momentPrice, paymentMethod } = await automationAgent.buy({
          setId: moment.set.id,
          playId: moment.play.id,
          credential,
          ccInfo,
          billing
        });

        if (success) {
          moment.boughtAt = new Date();
          moment.boughtPrice = momentPrice;

          await MomentModel.update(moment);
          await ActivityModel.add({
            at: moment.boughtAt,
            type: 'PURCHASE',
            result: 'SUCCESS',
            data: `${moment.set.id}+${moment.play.id} [$ ${momentPrice} by ${paymentMethod}]`
          });
          notifyUpdated({
            title: 'Moment purchased',
            content: `This moment(${Settings.Configuration.PRODUCT_URL_PREFIX}${moment.set.id}+${moment.play.id}) was bought at $ ${momentPrice} from your ${paymentMethod}]`
          });
        } else {
          await ActivityModel.add({
            at: new Date(),
            type: 'PURCHASE',
            result: 'FAILED',
            data: `${moment.set.id}+${moment.play.id} [reason: ${message}]`
          });
          notifyUpdated({
            title: 'Purchasing failed',
            content: `Purchase was failed due to ${message}`
          });
        }
      }
    }
  } catch (e) {
    util.log(`${TAG}_MONITOR_FAILURE`, e.message);
  } finally {
    util.log(`${TAG}_MONITOR_FINISHED`, '');
    if (MonitorData.bContinue) {
      setTimeout(doMonitor, Settings.Constants.MONITOR_DELAY);
    }
  }
};

const start = async () => {
  MonitorData.bContinue = true;
  // setTimeout(doMonitor, Settings.Constants.MONITOR_DELAY);
  setTimeout(updateMomentsData, 1);
  setTimeout(doMonitor, 1);
  await ActivityModel.add({
    at: new Date(),
    type: 'MONITOR',
    result: 'STARTED',
    data: ''
  });
  util.log(`${TAG}_START_MONITOR`, 'SUCCESS');
  return true;
};

const stopMonitor = async () => {
  MonitorData.bContinue = false;
  await automationAgent.closeBrowsers();
  await ActivityModel.add({
    at: new Date(),
    type: 'MONITOR',
    result: 'STOPPED',
    data: ''
  });
  util.log(`${TAG}_STOP_MONITOR`, 'SUCCESS');
  return true;
};

const checkIfRunning = () => {
  return MonitorData.bContinue;
};

const notifyUpdated = (data: any, playSound: boolean = true) => {
  if (MonitorData.notifyUpdated != null) {
    // @ts-ignore
    MonitorData.notifyUpdated(data, playSound);
  }
};

const setNotifyUpdated = (fn: any) => {
  MonitorData.notifyUpdated = fn;
};

// start();

module.exports = {
  fetchMomentFromUrl: apiAgent.fetchMomentFromUrl,
  start,
  stop: stopMonitor,
  checkIfRunning,
  setNotifyUpdated
};
