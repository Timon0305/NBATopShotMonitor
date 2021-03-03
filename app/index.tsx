import React, { Fragment } from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import { history, configuredStore } from './store';
import './app.global.css';
import { ipcRenderer } from 'electron';
import UIfx from 'uifx';
import { CssBaseline } from '@material-ui/core';

const store = configuredStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;
const CHANNELS = require('./constants/channels.json');

document.addEventListener('DOMContentLoaded', () => {
  const sound = new UIfx(
    './assets/music/toast-appear.mp3',
    {
      volume: 1,
      throttleMs: 50
    }
  );

  const playSound = (event: any, args: any) => {
    console.log('play-sound', event, args);
    sound.play();
  };

  ipcRenderer.removeAllListeners(CHANNELS.PLAY_SOUND);
  ipcRenderer.on(CHANNELS.PLAY_SOUND, playSound);
  // Receive Task status from Main
  // eslint-disable-next-line global-require
  const Root = require('./containers/Root').default;
  render(
    <AppContainer>
      <Root store={store} history={history}/>
    </AppContainer>,
    document.getElementById('root')
  );
});
