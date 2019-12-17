import './assets/scss/main.scss';
import PubNub from 'pubnub';

const userNameInput = $('.name-input');
const messageInput = $('.message-input');
const messagePlace = document.getElementById('message-place');
const userList = document.getElementsByClassName('list')[0];
const users = [];
const pubKey = 'pub-c-a3d794fc-411a-41c2-b67d-8534a21c99e0';
const subKey = 'sub-c-59ca500a-1cba-11ea-ac22-ea7c703d46e3';
let myUUID = localStorage.getItem(subKey + 'uuid')

if (myUUID = null) {
  myUUID = pubnub.uuid();
}

let userName = null;

const pubnub = new PubNub({
  publishKey: pubKey,
  subscribeKey: subKey,
  uuid: myUUID
});

messageInput.on('change', (event) => {
  sendMessage(event.target.value);
  createMyMessage(event.target.value);
  messageInput.val('');
});

userNameInput.on('change', ((event) => {
  if (!event.target.value) {
    return false;
  }
  addUserName(event.target.value);
  return false;
}));

function addUserName(name) {
  userName = name;
  userNameInput.val('');
  userNameInput.addClass('invisible');
  addUser(name + ' (you)');
  messageInput.prop('disabled', false);
  messageInput.focus();
  connect();
}

function connect() {
  pubnub.addListener({
    message(message) {
      if (message.message.userName === userName) {
        return false;
      }
      if (!message.message.text) {
        addUser(message.message.userName);
        return false;
      }
      if (!users.find(item => item === message.message.userName)) {
        addUser(message.message.userName);
      }
      createImportMessage(message);
      return false;
    },
  });

  pubnub.subscribe({
    channels: ['wallguardChanel'],
    restore: true,
  });

  pubnub.publish({
    message: {
      userName,
    },
    channel: 'wallguardChanel',
  });
}


function addUser(name) {
  const newLi = document.createElement('li');
  newLi.innerHTML = name;
  userList.append(newLi);
  users.push(name);
}

function createMyMessage(text) {
  const item = document.getElementById('my-message').content.cloneNode(true);
  item.querySelector('.message-text > span').innerHTML = text;
  messagePlace.append(item);
  messagePlace.scrollTop = 9999;
}

function createImportMessage(event) {
  if (event.message.userName === userName) {
    return false;
  }
  const item = document.getElementById('import-message').content.cloneNode(true);
  item.querySelector('.message-text > span').innerHTML = event.message.text;
  item.querySelector('.user-name > span').innerHTML = event.message.userName;
  messagePlace.append(item);
  messagePlace.scrollTop = 9999;
  return false;
}

function sendMessage(text) {
  pubnub.publish({
    message: {
      userName,
      text,
    },
    channel: 'wallguardChanel',
  });
}
