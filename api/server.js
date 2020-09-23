const express = require('express');
const mongoose=require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRouter = require('./contacts/contact.router');


mongoose.set('debug',true);

module.exports = class ContactServer {
  constructor() {
    this.server = null;
  }

  async start() {
    this.initServer();
    this.initMiddlewares();
    this.initRoutes();
    await this.initDatabase();
    return this.startListening();
  }

  initServer() {
    this.server = express();
  }
  initMiddlewares() {
    this.server.use(express.json());
    this.server.use(express.urlencoded());
    this.server.use(cors({ origin: 'http://localhost:3000' }));

  }
  initRoutes() {
    this.server.use('/contact', contactRouter);
  }

  async initDatabase() {
    await mongoose.connect(process.env.MONGODB_URL);
  }

  startListening() {
    try{
      return this.server.listen(process.env.PORT, () => {
        console.log('Database connection successful',process.env.PORT);
      })}

      catch(err){
        console.log("error" ,err);
        process.exit(1);
      }
    }
     
};
