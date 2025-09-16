// src/app.js
import { signIn, getUser, signOut} from './auth';
import { getUserFragments } from './api';

async function init() {
  const userSection = document.querySelector('#user');
  const loginBtn = document.querySelector('#login');
  const logoutBtn = document.querySelector('#logout')

  loginBtn.onclick = () => {
    signIn();
  };
  logoutBtn.onclick = () => {
    signOut();
  };

  const user = await getUser();
  if (!user) return;

  userSection.hidden = false;
  userSection.querySelector('.username').innerText = user.username;
  loginBtn.disabled = true;
  logoutBtn.disabled = false;
  if (logoutBtn.hasAttribute('hidden')) logoutBtn.hidden = false;

  const result = await getUserFragments(user);
  console.log('User fragments:', result);
}

addEventListener('DOMContentLoaded', init);
