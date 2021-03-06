require('dotenv').config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const indexRouter = require('./api/index');
const { ConnectionManager } = require('./integrations/ConnectionManager')
const bodyParser = require('body-parser');

const { db } = require('./db/db');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'client/build')));


io.on('connection', client => {
  console.log("Connection", client.id);
  const markets = ['BTC-ETH']
  const exchanges = ['bittrex', 'poloniex']


  const registerOrderBookInit = msg => {
    client.emit('ORDER_BOOK_INIT', msg);
  };

  const registerEngineEvents = msg => {
    client.emit('MARKET_UPDATE', msg)
  }

  const registerOrderActions = msg => {
    client.emit('ORDER_ACTION', msg)
  }

  const cbs = {
    registerOrderBookInit,
    registerEngineEvents,
    registerOrderActions
  }



  const connection = new ConnectionManager()
  connection.startWebsockets(markets, exchanges, cbs)

  // client.on('startEngine', req => {
  //   console.log("What is the req from start engine: ", req)
  //   const markets = ['BTC-ETH', 'BTC-LTC', 'BTC-XMR', 'BTC-DGB']
  //   const exchanges = ['bittrex', 'poloniex']
  //   start(markets, exchanges, tradeEngineCallback, orderActionCallback)
  // })

  client.on('stopEngine', req => {
    stop()
  })

  client.on('disconnect', req => {
    console.log("Websocket closing");
    // exchangeAggregator.removeAllSubscriptions();
    client.disconnect(true);
  });

  client.on('error', error => {
    if(error != null) {
        console.log('error: %s', error);
    };
  });

  client.on('end', () => {
    console.log("Websocket closing");
    // exchangeAggregator.removeAllSubscriptions();
    client.disconnect(true);
  });
});


app.use('/api', indexRouter);

app.get('/test', (req, res) => {
  res.json({
    test: 'test'
  })
})

app.get('initialize', (req, res) => {
  initialize()
})


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'../client/build/index.html'));
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({ error: 'error'});
});




module.exports = {app, server, io};
