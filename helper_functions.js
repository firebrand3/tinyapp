const generateRandomString = function (length) {
  return Math.random().toString(20).substr(2, length);
};

const checkUrl = (url) => {
  return urlDatabase[url];
};


const verifyUser = (input, database) => {

  // for (let user in database) {
  //   if (database[user].email === input.email && database[user].password === input.password) {
  //     return database[user];
  //   }
  let user;
  for (item in database) {
    if (database[item].email === input.email) {
      user = item
      return false
    }
  }

  return database[user];
}


const getUserInfo = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user]
    }
  }
}


const createUser = (user, database) => {
  const user_id = generateRandomString(4); 
  const newUser = {
    id: user_id,
    email: user.email,
    password: user.password,
  };
  database[user_id] = newUser;
  return newUser;
}

const verifyUserEmail = (input, database) => {
  for (user in database) {
    if (database[user].email === input.email) {
      return true;
    }
  }
  return false;
}

module.exports = { generateRandomString, checkUrl, verifyUser, getUserInfo, createUser, verifyUserEmail }