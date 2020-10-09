const express = require('express');


const {
  getNewAvatar,
  getUsers,
  getUserById,
  deleteUser,
  addNewUser,
  updateUser,
  validateCreateUser,
  validateChangeFieldUser,
  validateId,
  validateSignIn,
  signIn,
  authorize,
  logout,
  getCurrentUser,
} = require('./user.controller.js');

const userRouter = express.Router();

userRouter.post('/auth/register', validateCreateUser, addNewUser);
userRouter.get('/', getUsers);
userRouter.delete('/:id', validateId, deleteUser);
userRouter.get('/current', authorize, getCurrentUser);
userRouter.get('/:id', validateId, getUserById);
userRouter.post('/login', validateSignIn, signIn);
userRouter.post('/auth/logout', authorize, logout);
userRouter.patch('/avatars',authorize, validateChangeFieldUser, getNewAvatar().single('avatar'), updateUser);

module.exports = userRouter;
