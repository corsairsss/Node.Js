const express = require('express');

const {
  getContact,
  getContactById,
  deleteContact,
  addNewContact,
  updateContact,
  validateCreateContact,
  validateChangeFieldContact,
  validateId,
} = require('./contact.controller.js');

const userRouter = express.Router();

userRouter.get('/', getContact);
userRouter.get('/:id',validateId, getContactById);
userRouter.delete('/:id',validateId, deleteContact);
userRouter.post('/', validateCreateContact, addNewContact);
userRouter.put('/:id', validateChangeFieldContact, updateContact);

module.exports = userRouter;
