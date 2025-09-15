// src/app.js
import { signIn, getUser, signOut} from './auth';

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

}

addEventListener('DOMContentLoaded', init);
