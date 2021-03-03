import React, { useEffect, useState } from 'react';
import {
  Backdrop,
  Button,
  Chip,
  CircularProgress,
  createStyles,
  Fade,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputAdornment,
  makeStyles,
  Modal,
  Theme,
  Typography
} from '@material-ui/core';
// import { ipcRenderer } from 'electron';

const format = require('format-number');
const dateFormat = require('dateformat');
const worker = require('../../workers/nbatopshot');
// const CHANNELS = require('../../constants/channels.json');

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
    },
    input: {
      fontSize: 10,
      width: 600
    }
  })
);

// const mockMoment = {
//   'id': '97461c94-94fe-4a27-bd02-c5759b1b302b',
//   'set': {
//     'id': 'c561f66b-5bd8-451c-8686-156073c3fb69',
//     'flowName': 'Cosmic',
//     'setVisualId': 'SET_VISUAL_LEGENDARY',
//     'flowSeriesNumber': 1,
//     '__typename': 'Set'
//   },
//   'play': {
//     'description': 'Los Angeles Lakers superstar LeBron James drives the lane and throws down a wicked one-handed slam against Western Conference rivals the Sacramento Kings on November 15, 2019.',
//     'id': 'de32d3fb-0e6a-447e-b42a-08bbf1607b7d',
//     'stats': {
//       'playerName': 'LeBron James',
//       'dateOfMoment': '2019-11-16T03:30:00Z',
//       'playCategory': 'Dunk',
//       'teamAtMomentNbaId': '1610612747',
//       'teamAtMoment': 'Los Angeles Lakers',
//       '__typename': 'PlayStats'
//     },
//     '__typename': 'Play'
//   },
//   'assetPathPrefix': 'https://assets.nbatopshot.com/editions/1_cosmic_legendary/de32d3fb-0e6a-447e-b42a-08bbf1607b7d/play_de32d3fb-0e6a-447e-b42a-08bbf1607b7d_1_cosmic_legendary_capture_',
//   'priceRange': {
//     'min': '250000.00000000',
//     'max': '250000.00000000',
//     '__typename': 'PriceRange'
//   }
// };

export default function MomentModal(props: any) {
  const { open, handleClose, handleOk } = props;
  const classes = useStyles();
  const [value, setValue] = useState('');
  const [isFetching, setFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [moment, setMoment] = useState(null);
  const [price, setPrice] = useState(0);

  const fetchMoment = async () => {
    setFetching(true);
    try {
      // const res: any = ipcRenderer.sendSync(CHANNELS.FETCH__MOMENT, { url: value });
      const res = await worker.fetchMomentFromUrl(value);
      console.log('fetch_moment_result', res);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setMoment(res.data);
      }
      // setMoment(mockMoment);

    } catch (e) {
      console.log('error:', e.message);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = () => {
    let data: any = moment;
    if (data && price > 0) {
      data.buyPrice = price;
    }
    if (handleOk)
      handleOk(data);
  };

  useEffect(() => {
    setFetching(false);
    setMoment(null);
    setErrorMessage('');
    setPrice(0);
  }, [value, open]);

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
          <h2 id="transition-modal-title" style={{ color: '#222' }}>Add moment</h2>
          <FormControl className={classes.margin} error={errorMessage != ''}>
            <Input
              className={classes.input}
              value={value}
              onChange={(e: any) => {
                setValue(e.target.value);
              }}
              disabled={isFetching}
            />
            <FormHelperText>{errorMessage}</FormHelperText>
          </FormControl>
          <Button variant="contained" color="primary" onClick={fetchMoment} disabled={isFetching}>
            Fetch
          </Button>
          <Grid container spacing={2}>
            <Grid item xs={12} style={{ textAlign: 'center' }}>
              {isFetching && <CircularProgress color="primary"/>}
            </Grid>
            {moment && <>
              <Grid item xs={4}>
                <img alt={moment.play.stats.playerName}
                     src={moment.assetPathPrefix + 'Hero_2880_2880_Black.jpg?width=580'}
                     style={{ width: 200, height: 200 }}/>
              </Grid>
              <Grid item xs={8}>
                <Typography variant="h4" component="h2" color={'primary'}>
                  {moment.play.stats.playerName}
                </Typography>
                <Typography variant="h5" component="span">
                  {moment.play.stats.playCategory + ' - ' + dateFormat(new Date(moment.play.stats.dateOfMoment), 'mmm d yyyy') + ', ' + moment.set.flowName + ' (Series ' + moment.set.flowSeriesNumber + ')'}
                </Typography>
                <Typography variant="h6" component="h6">
                  {moment.play.stats.teamAtMoment}
                </Typography>
                <Typography variant="h6" component="h6">
                  <Chip
                    label={'USD $ ' + format({ round: 2 })(moment.priceRange.min) + ' - ' + format({ round: 2 })(moment.priceRange.max)}/>
                </Typography>
                <hr/>
                <Typography variant="h6" component="h6" color={'primary'}>
                  {'buy at '}
                  <Input
                    value={price}
                    onChange={(e: any) => {
                      setPrice(e.target.value);
                    }}
                    type={'number'}
                    startAdornment={
                      <InputAdornment position="start">
                        USD $
                      </InputAdornment>
                    }
                  />
                  {' '}
                  <Button variant="contained" color="primary" onClick={handleSubmit}>
                    Add
                  </Button>
                </Typography>
              </Grid>
            </>}
          </Grid>
        </div>
      </Fade>
    </Modal>
  );
}
