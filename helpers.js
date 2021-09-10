//************************************************Generate random string used to declare shortURL and user ID
const generateRandomString = (length) => {
  return Math.random().toString(20).substr(2, length);
};

//************************************************Find user by email address and return user object otherwise return undefined
const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return undefined;
};

//************************************************Verify if user email exist and return boolean value
const verifyUserEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return true;
    }
  }
  return false;
};

//************************************************Create new user
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

//************************************************Verify active user
const activeUser = (cookie, database) => {
  for (let user in database) {
    if (cookie === user) {
      return database[user];
    }
  }
};

//************************************************Identify url profile of a user
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

//************************************************Export helper functions
module.exports = { generateRandomString, getUserByEmail, createUser, verifyUserEmail, activeUser, urlsForUser };