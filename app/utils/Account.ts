// @ts-ignore
import storage from 'electron-json-storage';
import Account from '../models/account';

export async function get() {
  return new Promise((res, rej) => {
    storage.get('Account', (err: any, data: Account) => {
      if (err) rej(err);
      res(data);
    });
  });
}

export async function set(data: Account) {
  return new Promise((res, rej) => {
    storage.set('Account', data, (err: any) => {
      if (err) rej(err);
      res(data);
    });
  });
}

export async function update(account: any) {
  account.updatedAt = new Date();

  return await set(account);
}


export default {
  get, set, update
}
