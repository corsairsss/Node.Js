const Joi = require('joi');
const { ObjectId } = require('mongodb');
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {
  UnauthorizedError,
  NotFoundError,
} = require("../helpers/error.js");

const usersModel = require('./user.model.js');

async function getUsers(req, res, next) {
  try {
    const users = await usersModel.find();
    return res.status(200).json(users);
  } catch (err) {
    next(err);
  }
}

async function getContactById(req, res, next) {
  try {
    const contactId = req.params.id;
    const contact = await contactsModel.findOne({ _id: contactId });
    !contact ? res.status(404).send() : res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
}

async function deleteContact(req, res, next) {
  try {
    const contactId = req.params.id;
    const contact = await contactsModel.findByIdAndDelete({ _id: contactId });
    !contact ? res.status(404).send() : res.status(200).json();
  } catch (err) {
    next();
  }
}
async function addNewUser(req, res, next) {
  try {

    const {email,password}=req.body;
    const passwordHash = await bcryptjs.hash(password, 4);

      const isEmailExist=await usersModel.findUserByEmail(email);

      if (isEmailExist) return res.status(409).json({"message": "Email in use"})

    const user = await usersModel.create({
      email,
      password:passwordHash,
    });

    return res.status(201).json({
      email: user.email,
      subscription:user.subscription

    });
  } catch (err) {
    next(err);
  }
}


async function checkUser(email, password) {
  const user = await usersModel.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError('Authentication failed');
  }
  
  const isPasswordValid = await bcryptjs.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Authentication failed');
  }
  
  const token = await jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: 10000000, 
  });
  await usersModel.updateToken(user._id, token);
  
  return token;
}


async function signIn(req, res, next) {
  try {
    const { email, password } = req.body;

    const token = await checkUser(email, password);

    return res.status(200).json({ token });
  } catch (err) {
    next(err);
  }
}



async function updateContact(req, res, next) {
  try {
    const contactId = req.params.id;

    const contactToUpdate = await contactsModel.findUserByIdAndUpdate(
      contactId,
      req.body,
    );
    if (!contactToUpdate) {
      return res.status(404).send();
    }

    return res.status(200).send(contactToUpdate);
  } catch (err) {
    next(err);
  }
}

async function authorize(req, res, next) {
  try {
    // 1. витягнути токен користувача з заголовка Authorization
    const authorizationHeader = req.get("Authorization") || "";
    const token = authorizationHeader.replace("Bearer ", "");

    // 2. витягнути id користувача з пейлоада або вернути користувачу
    // помилку зі статус кодом 401
    let userId;
    try {
      userId = await jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (err) {
      next(new UnauthorizedError("User not authorized"));
    }

    // 3. витягнути відповідного користувача. Якщо такого немає - викинути
    // помилку зі статус кодом 401
    // userModel - модель користувача в нашій системі
    const user = await usersModel.findById(userId);

    if (!user || user.token !== token) {
      throw new UnauthorizedError("User not authorized");
    }

    // 4. Якщо все пройшло успішно - передати запис користувача і токен в req
    // і передати обробку запиту на наступний middleware
    req.user = user;
    req.token = token;

    next();
  } catch (err) {
    next(err);
  }
}

async function logout(req,res,next) {
  try{
    const user = req.user;
    await usersModel.updateToken(user._id, null);

    return res.status(204).send();
  }
  catch(err){
    next(err)
  }
  
}

function validateCreateUser(req, res, next) {
  const createUserRules = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
    subscription: Joi.string(),
    token: Joi.string(),
  });
  const result = createUserRules.validate(req.body);
  if (result.error)
    return res.status(400).send({ message: 'missing required name field' });

  next();
}


function validateSignIn(req, res, next) {
  const signInRules = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });

  const validationResult = signInRules.validate(req.body);
  if (validationResult.error) {
    return res.status(400).send(validationResult.error);
  }

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
  addNewUser,
  getUsers,
  getContactById,
  deleteContact,
  updateContact,
  validateCreateUser,
  validateChangeFieldContact,
  validateId,
  ///////
  signIn,
  validateSignIn,
  authorize,
  logout
};
