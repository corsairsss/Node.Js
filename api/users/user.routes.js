const express = require('express');

const {
  getUsers,
  getUserById,
  deleteContact,
  addNewUser,
  validateUser,
  changeFieldUser,
  validateChangeFieldUser,
} = require('./user.Controller.js');

const userRouter = express.Router();

userRouter.get('/', getUsers);
userRouter.get('/:id', getUserById);
userRouter.delete('/:id', deleteContact);
userRouter.post('/', validateUser, addNewUser);
userRouter.put('/:id', validateChangeFieldUser, changeFieldUser);

module.exports = userRouter;
