const fs = require('fs');
const path = require('path');
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, '../../db/contacts.json');

async function listContacts() {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  return data;
}

async function getContactById(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);
  const contact = contacts.find(item => item.id === contactId);
  return contact;
}

async function removeContact(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);
  const filtredContacts = contacts.filter(item => item.id !== contactId);
  const json = JSON.stringify(filtredContacts);
  await fsPromises.writeFile(contactsPath, json);
  console.dir(filtredContacts);
}

async function addContact(newContact) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);
  contacts.push(newContact);
  const json = JSON.stringify(contacts);
  await fsPromises.writeFile(contactsPath, json);
}

async function changeFieldContactById(userId, reqBody) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);

  const idx = contacts.findIndex(value => value.id === userId);
  contacts[idx] = { ...contacts[idx], ...reqBody };

  const contactsTojson = JSON.stringify(contacts);
  await fsPromises.writeFile(contactsPath, contactsTojson);
  return contacts[idx];
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  changeFieldContactById,
};
