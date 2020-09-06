const fs = require('fs');
const path = require('path');
const { promises: fsPromises } = fs;

const contactsPath = path.join(__dirname, '/db/contacts.json');

// TODO: задокументировать каждую функцию
async function listContacts() {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  console.table(data);
}

async function getContactById(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);
  const contact = contacts.find(item => item.id === contactId);
  console.table(contact);
}

async function removeContact(contactId) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);
  const filtredContacts = contacts.filter(item => item.id !== contactId);
  const json = JSON.stringify(filtredContacts);
  await fsPromises.writeFile(contactsPath, json);
  console.dir(filtredContacts);
}

async function addContact(name, email, phone) {
  const data = await fsPromises.readFile(contactsPath, 'utf-8');
  const contacts = JSON.parse(data);
  const newContact = {
    id: Date.now(),
    name: name,
    email: email,
    phone: phone,
  };
  contacts.push(newContact);
  console.log(contacts);
  const json = JSON.stringify(contacts);
  await fsPromises.writeFile(contactsPath, json);
}

module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
};
