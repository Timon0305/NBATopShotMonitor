import React, { useMemo, useState, useEffect } from 'react';
import {
  Avatar,
  Button, Chip,
  Fab, IconButton, InputBase,
  makeStyles, MenuItem, Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow, TextField
} from '@material-ui/core';
import ReactLoading from 'react-loading';
// @ts-ignore
import { useTable, useFilters, useGlobalFilter, useAsyncDebounce, usePagination, useSortBy } from 'react-table';
import {
  Add, Done,
  FirstPage,
  KeyboardArrowLeft,
  KeyboardArrowRight, LastPage, PlayArrow, Stop
} from '@material-ui/icons';
import matchSorter from 'match-sorter';
import { ipcRenderer } from 'electron';

import Header, { alert } from '../common/Header';
import MomentModal from './MomentModal';
import PriceModal from './PriceModal';
// import TablePagination from '@material-ui/core/TablePagination';
import { get, set, add, update } from '../../utils/Moments';


const format = require('format-number');
const dateFormat = require('dateformat');
const initialMoments = require('./moments.json');
const CHANNELS = require('../../constants/channels.json');

const useStyles = makeStyles((theme) => ({
    root: {
      height: '100%',
      overflow: 'auto'
    },
    pagination: {
      padding: '0.5rem',
      textAlign: 'center'
    },
    table: {
      height: '74vh',
      overflow: 'auto'
    },
    margin: {
      margin: theme.spacing(1)
    },
    float: {
      position: 'absolute',
      zIndex: 2000,
      bottom: 40,
      right: 40
    },
    floatTopRight: {
      position: 'absolute',
      zIndex: 2000,
      top: 5,
      right: 40
    },
    colorWhite: {
      color: 'white'
    },
    colorRed: {
      color: 'red'
    }
  })
);

const makeData = (source: any) => {
  return source.map((item: any) => {
    return {
      // id: item.id,
      setId: item.set.id,
      playId: item.play.id,
      playerName: item.play.stats.playerName,
      playCategory: item.play.stats.playCategory,
      team: item.play.stats.teamAtMoment,
      minPrice: /*format({ prefix: '$', round: 2 })*/(item.priceRange.min),
      maxPrice: /*format({ prefix: '$', round: 2 })*/(item.priceRange.max),
      date: dateFormat(new Date(item.play.stats.dateOfMoment), 'yyyy/mm/dd HH:MM:ss'),
      buyPrice: (item.buyPrice),
      image: item.assetPathPrefix + 'Hero_2880_2880_Black.jpg?width=580',
      flowName: item.set.flowName,
      flowSeries: 'Series ' + item.set.flowSeriesNumber,
      moment: item.play.stats.playCategory + ' - ' + dateFormat(new Date(item.play.stats.dateOfMoment), 'mmm d yyyy') + ', ' + item.set.flowName + ' (Series ' + item.set.flowSeriesNumber + ')',
      boughtAt: item.boughtAt,
      boughtPrice: item.boughtPrice,
    };
  });
};

const DefaultColumnFilter = ({ column: filterValue, preFilteredRows, setFilter }) => {
  const count = preFilteredRows.length;
  return (
    <input
      value={filterValue || ''}
      onChange={e => {
        setFilter(e.target.value || undefined); // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  );
};

const fuzzyTextFilterFn = (rows, id, filterValue) => {
  return matchSorter(rows, filterValue, { keys: [row => row.values[id]] });
};

fuzzyTextFilterFn.autoRemove = val => !val;

export default function Moment() {
  const classes = useStyles();

  const [data, setData] = useState(makeData([]));
  const [origData, setOrigData] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openPriceModal, setOpenPriceModal] = useState(false);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const [updatedDate, setUpdatedDate] = useState('');
  const [activeRow, setActiveRow] = useState(null);
  const [isRunning, setRunning] = useState(false);
  const [keyword, setKeyword] = useState('');

  const columns = useMemo(
    () => [
      {
        Header: 'Moment',
        id: 'image',
        accessor: 'image',
        Cell: ({ row }) => (<Avatar variant="square" alt={row.playerName} src={row.values.image}/>)
        // Cell: ({row}) => (<code>{JSON.stringify(row.values)}</code>),
      },
      {
        Header: 'Player Name',
        accessor: 'playerName',
        canFilter: true
        // Filter: DefaultColumnFilter
      },
      /*{
        Header: 'Category',
        accessor: 'playCategory'
      },
      {
        Header: 'Flow Name',
        accessor: 'flowName'
      },
      {
        Header: 'Series',
        accessor: 'flowSeries'
      },*/
      {
        Header: 'Moment',
        accessor: 'moment'
      },
      {
        Header: 'Team',
        accessor: 'team'
      },
      /*{
        Header: 'Moment Date',
        accessor: 'date'
      },*/
      {
        Header: 'Min Price ($)',
        accessor: 'minPrice',
        Cell: ({ row }) => (<>{format({ prefix: '', round: 2 })(row.values.minPrice)}</>)
      },
      {
        Header: 'Max Price ($)',
        accessor: 'maxPrice',
        Cell: ({ row }) => (<>{format({ prefix: '', round: 2 })(row.values.maxPrice)}</>)
      },
      {
        Header: 'Buy Price ($)',
        accessor: 'buyPrice',
        id: 'buyPrice',
        Cell: ({ row }) => (<>{row.values.buyPrice ? format({
          prefix: '',
          round: 2,
          padRight: 2
        })(row.values.buyPrice) : '-'}</>)
      },
      {
        Header: 'Set/Edit',
        id: 'action',
        Cell: ({ row }) => {
          if (!row.values.buyPrice) {
            return <Button color={'primary'} variant="outlined" onClick={() => onClickPrice(row)}>Set</Button>;
          }
          return <Button color={'primary'} variant="outlined" onClick={() => onClickPrice(row)}>Edit</Button>;
        }
      },
      {
        Header: 'Status',
        accessor: 'boughtAt',
        id: 'status',
        Cell: ({ row }) => (<>
          {row.original.boughtAt ?
            <Chip
              label={'$' + row.original.boughtPrice + ' at ' + dateFormat(row.original.boughtAt, 'yy-mm-dd HH:MM:ss')}
              color={'primary'}
              onDelete={() => console.log('delete')}
              deleteIcon={<Done/>}
            />
            :
            row.original.buyPrice ?
              <Chip
                label={isRunning ? 'Monitoring' : 'Ready'}
              />
              :
              '-'
          }
        </>)
      }
    ], []
  );

  const defaultColumn = useMemo(
    () => ({
      Filter: DefaultColumnFilter
    }), []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    //rows,
    prepareRow,
    page, // Instead of using 'rows', we'll use page,
    // which has only the rows for the active page
    // The rest of these things are super handy, too ;)
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize }
  } = useTable(
    {
      columns,
      data,
      // defaultColumn,
      autoResetPage: !skipPageReset,
      initialState: { pageSize: 10, pageIndex: 0 }
    },
    useFilters,
    useSortBy,
    usePagination
  );

  console.log('page', page);

  const loadData = async (pageNum: number = 0) => {
    let db: any = await get();
    console.log('Storage data', db);
    if (!db.updatedAt) {
      await set(
        initialMoments
      );

      await loadData();
    } else {
      setOrigData(db.data);
      // setData(makeData(db.data.sort((a: any, b: any) => parseFloat(a.priceRange.min) > parseFloat(b.priceRange.min) ? 1 : -1)));
      setData(makeData(db.data));
      setUpdatedDate(db.updatedAt);

      if (pageNum > 0) {
        gotoPage(pageNum);
      }
    }

    try {
      const res = ipcRenderer.sendSync(CHANNELS.CHECK_MONITOR, {});
      console.log('monitor-running', res);
      setRunning(res);
    } catch (e) {
      console.log('monitor-checking-failed', e.message);
    }
  };

  const onClickPrice = (row: any) => {
    console.log(row);
    setActiveRow(row);
    setOpenPriceModal(true);
  };

  const handleAdd = async (payload: any) => {
    console.log(payload);
    await add(payload);
  };

  const handleUpdate = async (price: number) => {
    if (activeRow != null) {
      let moment: any = origData.find((e: any) => e.set.id == activeRow.original.setId && e.play.id == activeRow.original.playId);
      console.log(moment);
      if (moment) {
        moment.buyPrice = price;
        moment.boughtAt = null;
        await update(moment);
        await loadData(pageIndex);
      }
      setOpenPriceModal(false);
      setActiveRow(null);
    }
  };

  const start = () => {
    const res = ipcRenderer.sendSync(CHANNELS.START_MONITOR, {});
    console.log('moment-start', res);
    if (res) {
      alert('Successfully started');
    }
    setRunning(res);
  };

  const stop = () => {
    const res = ipcRenderer.sendSync(CHANNELS.STOP__MONITOR, {});
    console.log('moment-stop', res);
    if (res) {
      alert('Successfully stopped');
      setRunning(false);
    }
  };

  const onMomentsUpdated = () => {
    loadData();
  };

  ipcRenderer.removeAllListeners(CHANNELS.NOTIFY_UPDATED);
  ipcRenderer.on(CHANNELS.NOTIFY_UPDATED, onMomentsUpdated);

  useEffect(() => {
    if (keyword && keyword.length) {
      setData(makeData(origData.filter((e: any) => e.play.stats.playerName.toLowerCase().includes(keyword.toLowerCase()))));
    } else {
      setData(makeData(origData));
    }
  }, [keyword]);

  useEffect(() => {
    setSkipPageReset(false);
  }, [data]);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <>
      <Header>
        Moments
        <Chip variant="default" size="medium" color="primary"
              label={data.length + ', updated at ' + dateFormat(updatedDate, 'mmm d, HH:MM:ss')}/>

      </Header>
      <MomentModal open={openModal} handleClose={() => setOpenModal(false)} handleOk={handleAdd}/>
      <PriceModal open={openPriceModal}
                  row={activeRow}
                  handleClose={() => setOpenPriceModal(false)} handleOk={handleUpdate}/>
      <Fab color={'primary'} onClick={() => setOpenModal(true)} className={classes.float}>
        <Add/>
      </Fab>
      <div className={classes.floatTopRight}>
        <div>

        </div>
        <IconButton onClick={start} className={classes.colorWhite} disabled={isRunning}>
          {isRunning ?
            <ReactLoading type={'bars'} height={30} width={30}/> :
            <PlayArrow/>
          }
        </IconButton>
        <IconButton color='secondary' onClick={stop} className={classes.colorRed}
                    disabled={!isRunning}>
          <Stop/>
        </IconButton>
      </div>
      <TextField
        label="Search ..."
        style={{ margin: '5px 20px', width: '50%' }}
        placeholder="John Doe"
        helperText="Search moments by player's name"
        InputLabelProps={{
          shrink: true
        }}
        value={keyword}
        onChange={(e: any) => {
          setKeyword(e.target.value);
        }}
      />
      <div className={classes.table}>
        <Table {...getTableProps()}>
          <TableHead>
            {headerGroups.map((headerGroup: any) => (
              <TableRow {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column: any) => (
                  <TableCell {...column.getHeaderProps(column.getSortByToggleProps())}>
                    {column.render('Header')}
                    {/*<div>{column.canFilter ? column.render('Filter') : null}</div>*/}
                  </TableCell>)
                )}
              </TableRow>
            ))}
          </TableHead>
          <TableBody {...getTableBodyProps()}>
            {page.map((row: any) => {
              prepareRow(row);
              return (
                <TableRow {...row.getRowProps()}>
                  {row.cells.map((cell: any) => {
                    return (
                      <TableCell
                        {...cell.getCellProps()}
                      >
                        {cell.render('Cell')}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>

        </Table>

      </div>
      <div className={classes.pagination}>
        <IconButton onClick={() => gotoPage(0)} disabled={!canPreviousPage} className={classes.margin}>
          <FirstPage/>
        </IconButton>
        <IconButton onClick={() => previousPage()} disabled={!canPreviousPage} className={classes.margin}>
          <KeyboardArrowLeft/>
        </IconButton>
        Page
        <InputBase
          type='number'
          value={pageIndex + 1}
          inputProps={{ 'aria-label': 'naked' }}
          onChange={e => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            gotoPage(page);
          }}
          className={classes.margin}
          style={{ width: 50, textAlign: 'right' }}
        />
        of {pageOptions.length}
        <IconButton onClick={() => nextPage()} disabled={!canNextPage} className={classes.margin}>
          <KeyboardArrowRight/>
        </IconButton>
        <IconButton onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage} className={classes.margin}>
          <LastPage/>
        </IconButton>
        Show
        <Select
          value={pageSize}
          onChange={e => {
            setPageSize(Number(e.target.value));
          }}
          className={classes.margin}
          inputProps={{
            name: 'age',
            id: 'outlined-age-native-simple'
          }}
        >
          {[10, 20, 30, 40, 50].map(pageSize => (
            <MenuItem key={pageSize} value={pageSize}>
              {pageSize}
            </MenuItem>
          ))}
        </Select>
        Rows
      </div>
    </>
  );
};
