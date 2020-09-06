const yargs = require('yargs');

const {
  listContacts,
  getContactById,
  removeContact,
  addContact,
} = require('./contacts.js');

const argv = yargs
  .string('action')
  .number('id')
  .string('name')
  .string('email')
  .string('phone').argv;

function invokeAction({ action, id, name, email, phone }) {
  switch (action) {
    case 'list':
      listContacts();

      break;

    case 'get':
      getContactById(id);

      break;

    case 'add':
      addContact(name, email, phone);

      break;

    case 'remove':
      removeContact(id);

      break;

    default:
      console.warn('\x1B[31m Unknown action type!');
  }
}

invokeAction(argv);
