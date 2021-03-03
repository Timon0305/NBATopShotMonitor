import React, { useEffect, useState } from 'react';
import {
  Backdrop, Button, createStyles, Fade, FormControl, Input, InputAdornment, InputLabel, makeStyles,
  Modal, Theme
} from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '0px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    },
    margin: {
      margin: theme.spacing(1)
    }
  })
);

export default function PriceModal(props: any) {
  const { open, handleClose, handleOk, row } = props;
  const initBuyPrice = row ? row.original.buyPrice : 0;
  console.log('initBuyPrice', initBuyPrice);
  const [value, setValue] = useState(initBuyPrice);
  const classes = useStyles();

  useEffect(() => {
    setValue(initBuyPrice);
  }, [open]);

  return (
    <Modal aria-labelledby="transition-modal-title"
           aria-describedby="transition-modal-description"
           className={classes.modal}
           open={open}
           onClose={handleClose}
           closeAfterTransition
           BackdropComponent={Backdrop}
           BackdropProps={{
             timeout: 500
           }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          <h2 id="transition-modal-title" style={{ color: 'darkblue' }}>Buy Price</h2>
          <FormControl className={classes.margin}>
            <Input
              id="input-with-icon-adornment"
              type={'number'}
              value={value}
              onChange={(e: any) => {
                setValue(e.target.value);
              }}
              startAdornment={
                <InputAdornment position="start">
                  $
                </InputAdornment>
              }
            />
          </FormControl>
          <Button variant="contained" color="primary" onClick={() => {
            if (handleOk) {
              if (value > 0) {
                handleOk(value);
              } else {
                handleOk(null);
              }
            }
          }}>
            Save
          </Button>
        </div>
      </Fade>
    </Modal>
  );
}
