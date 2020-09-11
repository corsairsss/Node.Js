const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const userRouter = require('./api/users/user.routes');
require('dotenv').config();

module.exports = class UsersServer {
  constructor() {
    this.server = null;
  }

  start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    this.startListening();
  }

  initServer() {
    this.server = express();
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(cors({ origin: 'http://localhost:3000' }));
    this.server.use(morgan('dev'));
  }
  initRoutes() {
    this.server.use('/users', userRouter);
  }
  startListening() {
    this.server.listen(process.env.PORT, () => {
      console.log('server start listening!!!!');
    });
  }
};
