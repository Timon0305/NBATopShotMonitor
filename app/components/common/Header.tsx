import React from 'react';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { toast } from 'react-toastify';

export function alert(content: string, type: string = '') {
  let func: any;
  switch (type) {
    default:
      func = toast.info;
  }

  func(content, {
    position: 'bottom-left',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
  })
}

export default function Header({ children }) {
  return (
    <AppBar position={'static'}>
      <Toolbar>
        <Typography variant={'h6'}>
          {children}
        </Typography>
      </Toolbar>
    </AppBar>
  );
}
