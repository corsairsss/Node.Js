const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  changeFieldContactById,
} = require('./contacts.js');

async function getUsers(req, res, next) {
  const users = await listContacts();
  res.status(200).send(users);
}

async function getUserById(req, res, next) {
  const userId = Number(req.params.id);
  const userById = await getContactById(userId);
  if (!userById) return res.status(404).send({ message: 'User not found' });
  res.status(200).send(userById);
}

async function deleteContact(req, res, next) {
  const userId = Number(req.params.id);
  const isUser = await getContactById(userId);
  if (!isUser) return res.status(404).send({ message: ' User not found' });
  await removeContact(userId);
  res.status(200).send({ message: 'Contact deleted' });
}
function addNewUser(req, res, next) {
  const newContact = {
    id: uuidv4(),
    ...req.body,
  };

  addContact(newContact);
  res.status(201).send(newContact);
}

async function changeFieldUser(req, res, next) {
  const userId = Number(req.params.id);
  const isUser = await getContactById(userId);
  if (!isUser) return res.status(404).send({ message: 'User not found' });

  const changedContact = await changeFieldContactById(userId, req.body);
  res.status(202).send(changedContact);
}

function validateUser(req, res, next) {
  const createUserRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
  });
  const result = createUserRules.validate(req.body);
  if (result.error)
    return res.status(400).send({ message: 'missing required name field' });

  next();
}

function validateChangeFieldUser(req, res, next) {
  const createUserRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
  });
  const result = createUserRules.validate(req.body);
  if (Object.keys(result.value).length === 0)
    return res.status(400).send({ message: 'missing fields' });
  if (result.error)
    return res.status(400).send({ message: 'missing required name field' });

  next();
}

async function get(params) {}

module.exports = {
  getUsers,
  getUserById,
  deleteContact,
  addNewUser,
  validateUser,
  changeFieldUser,
  validateChangeFieldUser,
};
