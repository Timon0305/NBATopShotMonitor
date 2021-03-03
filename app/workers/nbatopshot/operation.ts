// const AcceptLanguagePlugin  = require( 'puppeteer-extra-plugin-stealth/evasions/accept-language)';
const ChromeRuntimePlugin = require('puppeteer-extra-plugin-stealth/evasions/chrome.runtime');
// const ConsoleDebugPlugin  = require( 'puppeteer-extra-plugin-stealth/evasions/console.debug');
const IFrameContentWindowPlugin = require('puppeteer-extra-plugin-stealth/evasions/iframe.contentWindow');
const MediaCodecsPlugin = require('puppeteer-extra-plugin-stealth/evasions/media.codecs');
const NavigatorLanguagesPlugin = require('puppeteer-extra-plugin-stealth/evasions/navigator.languages');
const NavigatorPermissionsPlugin = require('puppeteer-extra-plugin-stealth/evasions/navigator.permissions');
const NavigatorPlugins = require('puppeteer-extra-plugin-stealth/evasions/navigator.plugins');
const WebdriverPlugin = require('puppeteer-extra-plugin-stealth/evasions/navigator.webdriver');
// const UserAgentPlugin  = require( 'puppeteer-extra-plugin-stealth/evasions/user-agent');
const WebglVendorPlugin = require('puppeteer-extra-plugin-stealth/evasions/webgl.vendor');
const WindowOuterDimensionsPlugin = require('puppeteer-extra-plugin-stealth/evasions/window.outerdimensions');

const { chrome } = require('chrome-paths');
const tag = 'OPERATION_';
const Settings = require('./settings');
const puppeteerVanilla = require('puppeteer');
const { addExtra } = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
// const puppeteer = require('puppeteer-extra');
// puppeteer.use(StealthPlugin());
// const puppeteer = require('puppeteer');
// const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const puppeteer = addExtra(puppeteerVanilla);

const plugins = [
  StealthPlugin(),
  // AcceptLanguagePlugin(),
  ChromeRuntimePlugin(),
  // ConsoleDebugPlugin(),
  IFrameContentWindowPlugin(),
  MediaCodecsPlugin(),
  NavigatorLanguagesPlugin(),
  NavigatorPermissionsPlugin(),
  NavigatorPlugins(),
  WebdriverPlugin(),
  // UserAgentPlugin(),
  WebglVendorPlugin(),
  WindowOuterDimensionsPlugin()
];

let browsers: any[] = [];

const buy = (payload: any) => {
  return new Promise(async resolve => {
    const { setId, playId, credential, ccInfo, billing } = payload;
    if (!setId || !playId) {
      return resolve({
        success: false,
        message: 'invalid parameter'
      });
    }

    let browser;
    try {
      let args = [
        // '--window-size=1920,1080',
        '--window-size=1024,960',
        '--disable-blink-features=AutomationControlled',
        '--disable-infobars',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ];

      let launchOptions = {
        ignoreHTTPSErrors: true,
        args,
        headless: false,
        // ignoreDefaultArgs: ['--enable-automation']
      };

      if (chrome) {
        launchOptions.executablePath = chrome;
      }

      browser = await puppeteer.launch(launchOptions);
      browsers.push(browser);
      for (const plugin of plugins) {
        await plugin.onBrowser(browser);
      }

      let [page] = await browser.pages();

      for (const plugin of plugins) {
        await plugin.onPageCreated(page);
      }

      const session = await page.target().createCDPSession();
      const { windowId } = await session.send('Browser.getWindowForTarget');
      await session.send('Browser.setWindowBounds', { windowId, bounds: { windowState: 'minimized' } });

      await page._client.send('Emulation.clearDeviceMetricsOverride');
      await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.146 Safari/537.36');

      await page.goto(`${Settings.Configuration.PRODUCT_URL_PREFIX}${setId}+${playId}`, {
        timeout: 0,
        waitUntil: 'load' //'networkidle0', //'domcontentloaded'
      });
      await page.cookies();

      /*await page.waitForSelector('a[data-testid="LogInButton"]');
      await page.click('a[data-testid="LogInButton"]');

      await page.waitForTimeout(1000);
      await page.waitForSelector('input#email');
      await page.type('input#email', credential.email, {delay: 90});

      await page.waitForSelector('input#password');
      await page.type('input#password', credential.password, {delay: 133});

      await page.waitForSelector('button#login');
      await page.click('button#login');*/

      const momentAvailable = await page.evaluate(() => {
        var buy_button = document.querySelector('button[data-testid="button-p2p-purchase-moment"]');
        if (buy_button !== null) {
          return true;
        }
        return false;
      });

      if (!momentAvailable) {
        return resolve({
          success: false,
          message: 'This moment is not available to buy for now'
        });
      }

      // Buy button
      await page.waitForSelector('button[data-testid="button-p2p-purchase-moment"]');
      await page.click('button[data-testid="button-p2p-purchase-moment"]');

      // Confirm modal
      await page.waitForTimeout(1000);
      await page.waitForSelector('button[data-testid="gating-dapperAccountCreationModal-confirm"]');
      await page.click('button[data-testid="gating-dapperAccountCreationModal-confirm"]');

      // Continue with Google
      await page.waitForTimeout(1000);
      await page.waitForSelector('.css-12x0iee>svg');
      await page.click('.css-12x0iee>svg');
      await page.waitForNavigation({ waitUntil: 'networkidle0' });

      await page.waitForTimeout(2000);
      await page.waitForSelector('input#identifierId');
      await page.type('input#identifierId', credential.email, { delay: 78 });
      await page.waitForSelector('button[jsname="LgbsSe"]', { timeout: 30000 });
      await page.click('button[jsname="LgbsSe"]');

      let count = 0;
      while (true) {
        count++;
        console.log('Wait for input password:', count);
        await __delayInMs(2000);
        const passwordInput = await page.evaluate(() => {
          var cancel = document.querySelector('#password input[jsname="YPqjbf"]');
          if (cancel) {
            return true;
          }
          return false;
        });
        if (passwordInput) {
          await page.waitForSelector('#password input[jsname="YPqjbf"]', { timeout: 30000 });
          // await page.type('#password input[jsname="YPqjbf"]', credential.password, {delay: 340});
          await page.$eval('#password input[jsname="YPqjbf"]', (e, pwd) => {
            if (e) {
              e.value = pwd;
            }
          }, credential.password);
          break;
        }

        if (count > 30) {
          return resolve({
            success: false,
            message: 'Timeout error'
          });
        }
      }
      await __delayInMs(2000);
      await page.waitForSelector('button[jsname="LgbsSe"]');
      await page.click('button[jsname="LgbsSe"]');
      // redirect
      await page.waitForTimeout(3000);
      // await page.waitForNavigation({ waitUntil: 'networkidle0' });

      // notification alert
      count = 0;
      while (true) {
        count++;
        console.log('Wait for notification cancel button:', count);
        await __delayInMs(1000);
        const notificationAlert = await page.evaluate(() => {
          var cancel = document.getElementById('onesignal-slidedown-cancel-button');
          if (cancel) {
            return true;
          }
          return false;
        });
        if (notificationAlert) {
          await page.waitForSelector('button#onesignal-slidedown-cancel-button');
          await page.click('button#onesignal-slidedown-cancel-button');
          break;
        }
        if (count > 60) {
          return resolve({
            success: false,
            message: 'Timeout error'
          });
        }
      }


      // buy for $...
      count = 0;
      while (true) {
        count++;
        await __delayInMs(1000);
        console.log('Wait for Buy For $... button:', count);
        const buyFor = await page.evaluate(() => {
          var elements = document.querySelectorAll('button[data-testid="button-p2p-purchase-moment"]');
          if (elements && elements.length > 1) {
            elements[elements.length - 1].click();
            return true;
          }
          return false;
        });
        if (buyFor) {
          // await page.waitForSelector('button[data-testid="button-p2p-purchase-moment"]:nth-child(' + buyFor + ')');
          // await page.click('button[data-testid="button-p2p-purchase-moment"]:nth-child(' + buyFor + ')');
        } else {
          break;
        }
        if (count > 60) {
          return resolve({
            success: false,
            message: 'Timeout error'
          });
        }
      }

      // check account balance and price
      await page.waitForTimeout(1000);
      await page.waitForSelector('div.css-xw7vib');
      let account_balance = await page.evaluate(() => {
        const e = document.querySelector('div.css-xw7vib');
        if (e) {
          return parseFloat(e.innerText);
        }
        return 0;
      });

      await page.waitForSelector('div.css-oyiipr');
      let moment_price = await page.evaluate(() => {
        const e = document.querySelector('div.css-oyiipr');
        if (e) {
          return parseFloat(e.innerText);
        }
        return 0;
      });

      console.log('Price/Balance: $', moment_price, '/', account_balance);

      let paymentMethod;
      try {
        if (account_balance > moment_price) {
          paymentMethod = 'Account Balance';
          // confirm purchase by account balance
          await page.waitForTimeout(1000);
          await page.waitForSelector('button[data-testid="button-pay-with-crypto"]');
          // await page.click('button[data-testid="button-pay-with-crypto"]');
          await page.$eval('button[data-testid="button-pay-with-crypto"]', element => {
            if (element) {
              element.innerHTML = 'Done!!!!';
              element.click();
            }
          });
        }
        else {
          // purchase by credit card
          paymentMethod = 'Credit Card';
          // click pay with credit card tab
          await page.waitForSelector('div.css-193dgel');
          await page.click('div.css-193dgel');

          // type holder name
          await page.waitForSelector('input#name');
          await page.type('input#name', ccInfo.name);

          // type card number
          await page.waitForSelector('input[data-testid="cardNumber"]');
          await page.type('input[data-testid="cardNumber"]', ccInfo.number);

          // type expiry
          const expiryMonth = ccInfo.expiry.split('/')[0].trim();
          const expiryYear = ccInfo.expiry.split('/')[1].trim();
          await page.waitForSelector('input[data-testid="cardExpiryMonth"]');
          await page.type('input[data-testid="cardExpiryMonth"]', expiryMonth);
          await page.waitForSelector('input#cardExpiryYear');
          await page.type('input#cardExpiryYear', expiryYear);

          // type security number
          await page.waitForSelector('input[data-testid="cvv"]');
          await page.type('input[data-testid="cvv"]', ccInfo.cvc);

          // click Next:
          await page.waitForSelector('button[form="add-card-form"]');
          await page.click('button[form="add-card-form"]');

          await page.waitForTimeout(1000);

          // type street, city, state, postal
          await page.waitForSelector('input#street');
          await page.type('input#street', billing.address1);

          await page.waitForSelector('input#city');
          await page.type('input#city', billing.city);

          await page.waitForSelector('select#province');
          await page.$eval('select#province', (e, value) => e.value = value, billing.state);

          await page.waitForSelector('input#zip');
          await page.type('input#zip', billing.postal);

          moment_price = await page.evaluate(() => {
            var e = document.querySelector('div.css-oyiipr');
            if (e) {
              return parseFloat(e.innerText);
            }
            return 0;
          });

          // click Confirm:
          await page.waitForSelector('button[form="add-card-form"]');
          await page.click('button[form="add-card-form"]');
        }

        // screen shot for test
        if (false) {
          await page.waitForTimeout(2000);
          let payloadElement = await page.$('body');
          if (payloadElement) {
            //let boundingBox = await payloadElement.boundingBox();
            await page._client.send('Emulation.clearDeviceMetricsOverride');
            await payloadElement.screenshot({
              path: './release/res_' + new Date().toLocaleString().replace(/[:/]/g, '-') + '.png'
              //clip: {
              //    x: boundingBox.x,
              //    y: boundingBox.y,
              //    width: Math.max(Math.ceil(boundingBox.width), initial.width),
              //    height: Math.max(Math.ceil(boundingBox.height), initial.height)
              //}
            });
          }
        }
      } catch (e) {
        return resolve({
          success: false,
          momentPrice: moment_price,
          paymentMethod: paymentMethod,
          error: e.message
        });
      }

      resolve({
        success: true,
        message: 'success to buy item',
        momentPrice: moment_price,
        paymentMethod: paymentMethod
      });
    } catch (e) {
      console.log(tag, 'MONITOR_ERR', e.message);
      resolve({
        success: false,
        message: e.message
      });
    } finally {
      if (browser) {
        closeBrowsers()
      }
    }
  });

};

const closeBrowsers = async () => {
  for (let browser of browsers) {
    try {
      await browser.close()
    } catch (e) {

    }
  }
  browsers = [];
};

const __delayInMs = async (duration: number) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(true);
    }, duration);
  });
};

const testBuy = async () => {
  return await buy({
    setId: '208ae30a-a4fe-42d4-9e51-e6fd1ad2a7a9',
    playId: 'dd736f1f-1dc9-4114-b73e-32d8cc680933',
    credential: {
      email: 'brandenmasks@gmail.com',
      password: 'Tsbot123@'
    },
    ccInfo: {
      name: 'Branden Garza',
      number: '4767 7182 7671 4385',
      expiry: '09 / 26',
      cvc: '084'
    },
    billing: {
      address1: '701 Boardwalk',
      city: 'Edinburg',
      state: 'TX',
      postal: '78539'
    }
  });
};

(async () => {
  // const res = await testBuy();
  // console.log(res);
})();

module.exports = {
  buy,
  closeBrowsers
};
