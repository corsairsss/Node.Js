const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  subscription: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free',
  },
  token: { type: String, required: false },
});

userSchema.statics.findUserByIdAndUpdate = findUserByIdAndUpdate;

async function findUserByIdAndUpdate(contactId, updateParams) {
  return this.findByIdAndUpdate(
    contactId,
    {
      $set: updateParams,
    },
    {
      new: true,
    },
  );
}

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
