//@ts-ignore-next-line
import storage from 'electron-json-storage';
import { uuid } from 'uuidv4';

export async function get() {
  return new Promise((res, rej) => {
    storage.get('Activities', (err: any, data: any) => {
      if (err) rej(err);
      // console.log(data);
      res(data);
    });
  });
}

export async function set(data: any) {
  return new Promise((res, rej) => {
    storage.set('Activities', data, (err: any) => {
      if (err) rej(err);
      res(data);
    });
  });
}

export async function add(activity: any) {
  let model_Activity: any = await get();

  activity.id = uuid();
  if (!model_Activity.data) {
    model_Activity.data = [];
  }
  model_Activity.data.push(activity);
  model_Activity.updatedAt = new Date();

  return await set(model_Activity);
}

export async function update(activity: any) {
  let model_Activity: any = await get();

  for (let key = 0; key < model_Activity.data.length; key++) {
    if (model_Activity.data[key].id == activity.id) {
      model_Activity.data[key] = activity;
    }
  }
  model_Activity.updatedAt = new Date();
  return await set(model_Activity);
}

export async function remove(activity: any) {
  let model_Activity: any = await get();
  let new_Activity = {
    updatedAt: new Date(),
    data: model_Activity.data.filter((e: any) => e.id != activity.id)
  };
  return await set(new_Activity);
}

export default {
  get, set, add, update, remove
};
