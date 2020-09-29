const express = require('express');

const {
  getUsers,
  getContactById,
  deleteContact,
  addNewUser,
  updateContact,
  validateCreateUser,
  validateChangeFieldContact,
  validateId,
  validateSignIn,
  signIn,
  authorize,
  logout
} = require('./user.controller.js');

const userRouter = express.Router();

userRouter.get('/', getUsers);
// userRouter.get('/:id',validateId, getContactById);
// userRouter.delete('/:id',validateId, deleteContact);
userRouter.post('/', validateCreateUser, addNewUser);
userRouter.put('/sign-in', validateSignIn, signIn);
userRouter.patch("/logout", authorize, logout);

// userRouter.put('/:id', validateChangeFieldContact, updateContact);

module.exports = userRouter;
