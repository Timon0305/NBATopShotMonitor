//@ts-ignore-next-line
import storage from 'electron-json-storage';
// import Moments from '../models/moments';
import { uuid } from 'uuidv4';

export async function get() {
  return new Promise((res, rej) => {
    storage.get('Moments', (err: any, data: any) => {
      if (err) rej(err);
      // console.log(data);
      res(data);
    });
  });
}

export async function set(data: any) {
  return new Promise((res, rej) => {
    storage.set('Moments', data, (err: any) => {
      if (err) rej(err);
      res(data);
    });
  });
}

export async function add(moment: any) {
  let model_Moment: any = await get();

  let _moment = model_Moment.data.find((e: any) => e.set.id == moment.set.id && e.play.id == moment.play.id);
  if (_moment) {
    return await update(moment);
  }
  model_Moment.data.push({
    ...moment,
    ...{
      id: uuid()
    }
  });
  model_Moment.updatedAt = new Date();

  return await set(model_Moment);
}

export async function update(moment: any) {
  let model_Moment: any = await get();

  for (let key = 0; key < model_Moment.data.length; key++) {
    if (model_Moment.data[key].set.id == moment.set.id && model_Moment.data[key].play.id == moment.play.id) {
      model_Moment.data[key] = moment;
      break;
    }
  }
  model_Moment.updatedAt = new Date();
  return await set(model_Moment);
}

export async function remove(moment: any) {
  let model_Moment: any = await get();
  let new_Moment = {
    updatedAt: new Date(),
    data: model_Moment.data.filter((e: any) => e.set.id != moment.set.id && e.play.id != moment.play.id)
  };
  return await set(new_Moment);
}

export async function getByIds(setId: string, playId: string) {
  let model_Moment: any = await get();
  return model_Moment.data.find((e: any) => e.set.id == setId && e.play.id == playId);
}

export default {
  get, set, add, update, remove, getByIds,
};
