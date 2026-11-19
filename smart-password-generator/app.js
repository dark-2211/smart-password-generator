'use strict';

const characterSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.?/~'
};

const get = (id) => document.getElementById(id);
const password = get('password');
const length = get('length');
const lengthValue = get('length-value');
const copy = get('copy');
const generate = get('generate');
const error = get('error');
const toast = get('toast');
const filters = [...document.querySelectorAll('fieldset input')];

const buffer = new Uint32Array(128);
let nextWord = buffer.length;
let toastTimer;

function randomIndex(size) {
  // Discard the partial interval so every index has the same probability.
  const limit = 2 ** 32 - (2 ** 32 % size);
  let word;
  do {
    if (nextWord === buffer.length) {
      globalThis.crypto.getRandomValues(buffer);
      nextWord = 0;
    }
    word = buffer[nextWord++];
  } while (word >= limit);
  return word % size;
}

function generatePassword(size, groups) {
  const alphabet = groups.join('');
  // Retrying the entire candidate keeps valid passwords equally likely.
  let candidate;
  do {
    candidate = '';
    for (let position = 0; position < size; position++) {
      candidate += alphabet[randomIndex(alphabet.length)];
    }
  } while (!groups.every((group) => [...candidate].some((char) => group.includes(char))));
  return candidate;
}

function updatePassword() {
  const groups = filters.filter((filter) => filter.checked)
    .map((filter) => characterSets[filter.value]);
  lengthValue.value = length.value;
  generate.disabled = groups.length === 0;
  copy.disabled = true;
  error.textContent = '';

  if (groups.length === 0) {
    password.value = '';
    error.textContent = 'Choose at least one character set.';
    return;
  }

  try {
    password.value = generatePassword(Number(length.value), groups);
    password.scrollTop = 0;
    copy.disabled = false;
  } catch {
    password.value = '';
    error.textContent = 'Secure randomness is unavailable in this browser.';
  }
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('visible');
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
    toast.textContent = '';
  }, 3600);
}

function copyWithSelection(value) {
  const focused = document.activeElement;
  const field = document.createElement('textarea');
  field.value = value;
  field.readOnly = true;
  field.style.cssText = 'position:fixed;left:-9999px;top:0;font-size:16px';
  document.body.append(field);
  field.select();
  field.setSelectionRange(0, value.length);
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    field.remove();
    focused?.focus({ preventScroll: true });
  }
}

async function copyPassword() {
  const value = password.value;
  if (!value) return;
  try {
    await navigator.clipboard.writeText(value);
    showToast('Password copied.');
  } catch {
    if (copyWithSelection(value)) {
      showToast('Password copied.');
    } else {
      if (password.value === value) {
        password.focus();
        password.select();
      }
      showToast('Copy blocked. Select the password and copy it manually.');
    }
  }
}

length.addEventListener('input', updatePassword);
filters.forEach((filter) => filter.addEventListener('change', updatePassword));
generate.addEventListener('click', updatePassword);
copy.addEventListener('click', copyPassword);
updatePassword();
