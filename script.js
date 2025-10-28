'use strict';
// Описаний у документації
// import iziToast from './node_modules/izitoast';
// // Додатковий імпорт стилів
// import './node_modules/izitoast/dist/css/iziToast.min.css';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Sarah Smith',
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];
let loginAcc;

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const loginForm = document.querySelector('.login');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
const displayMovements = function (movements) {
  containerMovements.innerHTML = '';
  movements.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const html = `<div class="movements__row">
          <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
          <div class="movements__value">${mov}€</div>
        </div>`;
    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsernames = function (accounts) {
  accounts.forEach(function (account) {
    account.username = account.owner
      .toLowerCase()
      .split(' ')
      .map(name => name.at(0))
      .join('');
  });
  return accounts;
};

console.log(createUsernames(accounts));

const calcDisplayTotalBalance = function (account) {
  const balance = account.movements.reduce((acc, curr) => {
    return acc + curr;
  }, 0);
  labelBalance.textContent = `${balance} €`;
  account.balance = balance;
};

const updateUI = function (account) {
  displayMovements(account.movements);

  calcDisplayTotalBalance(account);

  calcDisplaySummary(account);
};

const calcDisplaySummary = function (account) {
  const income = account.movements
    .filter(mov => mov > 0)
    .reduce((acc, curr) => {
      return acc + curr;
    }, 0);
  labelSumIn.textContent = `${income} €`;

  const outcome = account.movements
    .filter(mov => mov < 0)
    .reduce((acc, curr) => {
      return acc + curr;
    }, 0);
  labelSumOut.textContent = `${Math.abs(outcome)} €`;

  const interest = account.movements
    .filter(mov => mov > 0)
    .map(mov => (mov * account.interestRate) / 100)
    .reduce((acc, curr) => {
      return acc + curr;
    }, 0);

  labelSumInterest.textContent = `${interest} €`;
};

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  if (
    inputLoginUsername?.value.trim() !== '' &&
    inputLoginPin?.value.trim() !== ''
  ) {
    loginAcc = accounts.find(
      account =>
        account.username === inputLoginUsername.value &&
        account.pin === Number(inputLoginPin.value)
    );
    if (loginAcc) {
      labelWelcome.textContent = `Welcome back, ${
        loginAcc.owner.split(' ')[0]
      }`;
      loginForm.reset();
      inputLoginPin.blur();
      inputLoginUsername.blur();
      updateUI(loginAcc);
      containerApp.style.opacity = 100;
    } else {
      containerApp.style.opacity = 0;
      iziToast.error({
        message: 'Wrong username or/and PIN',
      });
    }
  } else {
    iziToast.warning({
      message: 'Please, fill in login and pin',
    });
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const transferAmount = Number(inputTransferAmount.value);
  const transferTo = inputTransferTo.value;

  const transferAcc = accounts.find(acc => acc.username === transferTo);

  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    transferAcc &&
    transferAmount > 0 &&
    transferAmount <= loginAcc.balance &&
    loginAcc.username !== transferAcc.username
  ) {
    loginAcc.movements.push(-transferAmount);
    transferAcc.movements.push(transferAmount);

    updateUI(loginAcc);
  } else {
    iziToast.warning({
      message:
        'You do NOT have enough money or account you want transfer to does NOT exist',
    });
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const closeUsername = inputCloseUsername.value;
  const closePin = Number(inputClosePin.value);

  if (closeUsername === loginAcc.username && closePin === loginAcc.pin) {
    const index = accounts.findIndex(acc => acc.username === closeUsername);
    accounts.splice(index, 1);
    containerApp.style.opacity = 0;
    labelWelcome.textContent = `Log in to get started`;
  } else {
    iziToast.warning({
      message: 'Wrong credentials',
    });
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amountLoan = Number(inputLoanAmount.value);
  inputLoanAmount.value = '';
  if (
    amountLoan &&
    amountLoan > 0 &&
    loginAcc.movements.some(mov => mov >= amountLoan * 0.1)
  ) {
    loginAcc.movements.push(amountLoan);
    updateUI(loginAcc);
  }
});
