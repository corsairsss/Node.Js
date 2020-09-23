
const Joi = require('joi');
const { ObjectId } = require('mongodb');
const contactsModel=require('./contact.model.js')

async function getContact(req, res, next) {
  try{
    const contacts=await contactsModel.find();
    return res.status(200).json(contacts);
  }
  catch(err){
    next(err);
  }
}

async function getContactById(req, res, next) {
  try{
      const contactId=req.params.id;
      const contact=await contactsModel.findOne({_id:contactId});
      !contact?res.status(404).send():res.status(200).json(contact);
  }
  catch(err){
    next(err);
  }
}

async function deleteContact(req, res, next) {
 try{
  const contactId=req.params.id;
  const contact=await contactsModel.findByIdAndDelete({_id:contactId});
  !contact?res.status(404).send():res.status(200).json();
 }
 catch(err){
   next();
 }
}
async function addNewContact(req, res, next) {
  try{
        const contact=await contactsModel.create(req.body);
        return res.status(201).json(contact)
  }
  catch(err){
    next(err);
  }
  
}

async function updateContact(req, res, next) {
  try {
    const contactId=req.params.id;

    const contactToUpdate = await contactsModel.findUserByIdAndUpdate(
      contactId,
      req.body
    );
    if (!contactToUpdate) {
      return res.status(404).send();
    }

    return res.status(200).send(contactToUpdate);
  } catch (err) {
    next(err);
  }
  
}

function validateCreateContact(req, res, next) {
  const createUserRules = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    phone: Joi.string().required(),
    subscription: Joi.string().required(),
    password: Joi.string().required(),
    token: Joi.string().required(),

  });
  const result = createUserRules.validate(req.body);
  if (result.error)
    return res.status(400).send({ message: 'missing required name field' });

  next();
}

function validateChangeFieldContact(req, res, next) {
  const createUserRules = Joi.object({
    name: Joi.string(),
    email: Joi.string(),
    phone: Joi.string(),
    subscription: Joi.string(),
    password: Joi.string(),
    token: Joi.string(),
  });
  const result = createUserRules.validate(req.body);
  if (result.error)
    return res.status(400).send({ message: 'missing required name field' });

  next();
}

function validateId(req, res, next) {
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send();
  }

  next();
}

module.exports = {
  addNewContact,
  getContact,
  getContactById,
  deleteContact,
  updateContact,
  validateCreateContact,
  validateChangeFieldContact,
  validateId,
};
