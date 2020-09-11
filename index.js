const yargs = require('yargs');
const switchAction = require('./switchAction1.js');

const UserServer = require('./server.js');

new UserServer().start();
