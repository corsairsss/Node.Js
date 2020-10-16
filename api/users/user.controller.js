const Joi = require('joi');
const { ObjectId } = require('mongodb');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AvatarGenerator = require('avatar-generator');
const path=require('path');
const { promises: fsPromises } = require('fs');
const fs = require('fs');
const multer = require('multer');
const url = require('url');
const uuid=require('uuid');
const sgMail = require('@sendgrid/mail')

const { UnauthorizedError } = require('../helpers/error.js');
const usersModel = require('./user.model.js');

sgMail.setApiKey(process.env.SENDGRID_API_KEY)



function getNewAvatar() {
    const storage = multer.diskStorage({
    destination: 'api/public/images',
    filename: function (req, file, cb) {
      console.log('file', file);
      const ext = path.parse(file.originalname).ext;
      cb(null, Date.now() + ext);
    }
  })
  
  const upload = multer({ storage });
  return upload;
}
  
async function createAvatar() {
  const avatar = new AvatarGenerator({
    parts: ['background', 'face', 'clothes', 'head', 'hair', 'eye', 'mouth'], //order in which sprites should be combined
    partsLocation: path.join(__dirname,'../../node_modules/avatar-generator/img'), // path to sprites
    imageExtension: '.png' // sprite file extension
});
const image = await avatar.generate('id','male');
const fileName=`${Date.now()}.png`;
await image.png().toFile(path.join(__dirname,`../tmp/${fileName}`));

// fsPromises.copyFile(`./api/tmp/${fileName}`,`./api/public/images/${fileName}`,(err)=>{if (err) throw err;});
fs.rename(`./api/tmp/${fileName}`,`./api/public/images/${fileName}`,(err)=>{if (err) throw err;});
return fileName;
}

async function createURLAvatar(FName) {
  if (!FName){
    const fileName=await createAvatar();
    return `http://localhost:3000/images/${fileName}`  
  }
  return `http://localhost:3000/images/${FName}` 
} 



async function getUsers(req, res, next) {
  try {
    const users = await usersModel.find();
    const filtredUsers = getSomeField(users);

    return res.status(200).json(filtredUsers);
  } catch (err) {
    next(err);
  }
}

async function getUserById(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await usersModel.findOne({ _id: userId });
    !user ? res.status(404).send() : res.status(200).json(user);
  } catch (err) {
    next(err);
  }
}
async function getCurrentUser(req, res, next) {
  try {
    const filtredUsers = getSomeField([req.user]);
    return res.status(200).json(filtredUsers[0]);
  } catch (err) {
    next(err);
  }
}

async function deleteUser(req, res, next) {
  try {
    const userId = req.params.id;
    const user = await usersModel.findByIdAndDelete({ _id: userId });
    !user ? res.status(404).send() : res.status(200).json();
  } catch (err) {
    next();
  }
}
async function addNewUser(req, res, next) {
  try {
    const avatarURL=await createURLAvatar();

    const { email, password } = req.body;
    const passwordHash = await bcryptjs.hash(password, 4);

    const isEmailExist = await usersModel.findUserByEmail(email);

    if (isEmailExist) return res.status(409).json({ message: 'Email in use' });

    const user = await usersModel.create({
      email,
      password: passwordHash,
      avatarURL,
    });

    sendEmailWithVerification(user);

    return res.status(201).json({
      email: user.email,
      subscription: user.subscription,
      avatarURL:user.avatarURL
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
    const userId = await jwt.verify(token, process.env.JWT_SECRET).id;
    const user = await usersModel.findOne({ _id: userId });
    if(user.verificationToken) return res.status(404).json({"mesage":"User not Found"});
    return res
      .status(200)
      .json({ token, user: { email, subscription: user.subscription } });
  } catch (err) {
    next(err);
  }
}

 async function updateUser(req, res, next) {
  try {

    const FName= req.file.filename;
    if (FName){
      const avatarURL=await createURLAvatar(FName);
      req.body.avatarURL=avatarURL;
    }
    
    const oldUrl=req.user.avatarURL; //витягуємо повний аватар - url з користувача
    const parsedUrl=url.parse(oldUrl);//отримаємо розпарсений url
    fsPromises.unlink(`api/public${parsedUrl.pathname}`);//видаляємо старий файл з аватаром
    
    const userId = req.user.id;
    const userToUpdate = await usersModel.findUserByIdAndUpdate(
      userId,
      req.body,
    );
    if (!userToUpdate) {
      return res.status(404).send();
    }

    return res.status(200).send(getSomeField([userToUpdate]));

  } catch (err) {
    next(err);
  }
}





async function authorize(req, res, next) {
  try {
    // 1. витягнути токен користувача з заголовка Authorization
    const authorizationHeader = req.get('Authorization') || '';
    const token = authorizationHeader.replace('Bearer ', '');

    // 2. витягнути id користувача з пейлоада або вернути користувачу
    // помилку зі статус кодом 401
    let userId;
    try {
      userId = await jwt.verify(token, process.env.JWT_SECRET).id;
    } catch (err) {
      next(new UnauthorizedError('User not authorized'));
    }

    // 3. витягнути відповідного користувача. Якщо такого немає - викинути
    // помилку зі статус кодом 401
    // userModel - модель користувача в нашій системі
    const user = await usersModel.findById(userId);

    if (!user || user.token !== token) {
      throw new UnauthorizedError('User not authorized');
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

async function logout(req, res, next) {
  try {
    const user = req.user;
    await usersModel.updateToken(user._id, null);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function validateCreateUser(req, res, next) {
  const createUserRules = Joi.object({
    email: Joi.string().required(),
    avatarURL:Joi.string(),
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

function validateChangeFieldUser(req, res, next) {
  const createUserRules = Joi.object({
    subscription: Joi.string(),
    avatarURL:Joi.string(),

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

function getSomeField(users) {
  const filterUsers = users.map(user => ({
    email: user.email,
    subscription: user.subscription,
    id: user._id,
    avatarURL:user.avatarURL
  }));

  return filterUsers;
}

async function sendEmailWithVerification(user) {
  const token = uuid.v4();


  await usersModel.createVerificationToken(user.id,token);
  const msg = {
    to: user.email, // Change to your recipient
    from: 'oom2212@gmail.com', // Change to your verified sender
    subject: 'Verify User',
    text: 'and easy to do anywhere, even with Node.js',
    html: `<a href='http://localhost:3000/users/auth/verify/${token}'>Click for verification</a>`,
  }
  await sgMail.send(msg);

}


async function verEmail(req,res,next) {
  try{

    const {verificationToken}=req.params;
    const user= await usersModel.findOne({verificationToken});
    if(!user) return res.status(404).json({"message" :"User not found"});

    await usersModel.createVerificationToken(user.id,null);

    return res.status(200).send();

  }
  catch(err){
    next(err);
  }

}

module.exports = {
  addNewUser,
  getUsers,
  getUserById,
  deleteUser,
  updateUser,
  validateCreateUser,
  validateChangeFieldUser,
  validateId,
  signIn,
  validateSignIn,
  authorize,
  logout,
  getCurrentUser,
  getNewAvatar,
  verEmail
};
