const express = require('express');

const {
  getUsers,
  getContactById,
  deleteContact,
  addNewContact,
  updateContact,
  validateCreateContact,
  validateChangeFieldContact,
  validateId,
} = require('./user.controller.js');

const userRouter = express.Router();

userRouter.get('/', getUsers);
// userRouter.get('/:id',validateId, getContactById);
// userRouter.delete('/:id',validateId, deleteContact);
// userRouter.post('/', validateCreateContact, addNewContact);
// userRouter.put('/:id', validateChangeFieldContact, updateContact);

module.exports = userRouter;
