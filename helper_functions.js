const generateRandomString = (length) => {
  return Math.random().toString(20).substr(2, length);
};

const checkUrl = (url, database) => {
  return database[url];
};


const verifyUser = (input, database) => {
  // for (let user in database) {
  //   if (database[user].email === input.email && database[user].password === input.password) {
  //     return database[user];
  //   }
  let user;
  for (let item in database) {
    if (database[item].email === input.email) {
      user = item;
      return false;
    }
  }
  return database[user];
};


const getUserInfo = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
};

const verifyUserEmail = (input, database) => {
  for (let user in database) {
    if (database[user].email === input) {
      return true;
    }
  }
  return false;
};


const createUser = (user, database) => {
  const userId = generateRandomString(4);
  const newUser = {
    id: userId,
    email: user.email,
    password: user.password,
  };
  database[userId] = newUser;
  return newUser;
};


const activeUser = (cookie, database) => {
  for (let user in database) {
    if (cookie === user) {
      // return database[user].email;
      return database[user];
    }
  }
};

const urlsForUser = (id, database) => {
  const activeUserId = id;
  const urls = {};
  for (let url in database) {
    if (database[url].userID === activeUserId) {
      urls[url] = database[url];
    }
  }
  return urls;
};

module.exports = { generateRandomString, checkUrl, verifyUser, getUserInfo, createUser, verifyUserEmail, activeUser, urlsForUser };