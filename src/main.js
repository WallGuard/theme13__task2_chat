/* eslint-disable no-undef,no-use-before-define */

import './assets/scss/main.scss';
import PubNub from 'pubnub';

let userName = null;
const userNameInput = $('.name-input');
const messageInput = $('.message-input');
const messagePlace = document.getElementById('message-place');
const userList = document.getElementsByClassName('list')[0];

const pubnubDemo = new PubNub({
  publishKey: 'pub-c-42f772e1-293c-43ca-a5f1-6b8f14ebbea0',
  subscribeKey: 'sub-c-a07acfe6-b656-11e8-9de9-7af9a1823cc4',
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
  $('#user-name span').text(userName);
  $('#user-name').removeClass('invisible');
  messageInput.prop('disabled', false);
  messageInput.focus();
  connecting();
}

function connecting() {
  pubnubDemo.addListener({
    message(message) {
      if (!message.message.text && message.message.userName !== userName) {
        addUser(message);
        return false;
      }
      createImportMessage(message);
      return false;
    },
  });

  pubnubDemo.subscribe({
    channels: ['testChannel'],
  });

  pubnubDemo.publish({
    message: {
      userName,
    },
    channel: 'testChannel',
  });
}


function addUser(event) {
  const newLi = document.createElement('li');
  newLi.innerHTML = event.message.userName;
  userList.append(newLi);
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
  pubnubDemo.publish({
    message: {
      userName,
      text,
    },
    channel: 'testChannel',
  });
}
