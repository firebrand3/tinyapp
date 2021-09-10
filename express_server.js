//************************************************Declare modules and middleware
const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["alive", "and", "kicking"],
  maxAge: 24 * 60 * 60 * 1000
}));

app.set("view engine", "ejs");

//************************************************Import helper functions
const {
  generateRandomString,
  getUserByEmail,
  createUser,
  verifyUserEmail,
  activeUser,
  urlsForUser
} = require("./helpers");

// ***********************************************************************************************DATABASES
const urlDatabase = {
  // "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
};

const users = {
  // userRandomID: { id: "userRandomID", email: "user@example.com", password: "1234",
};

// ***********************************************************************************************BASIC
app.get("/", (req, res) => {
  const user = activeUser(req.session.user_id, users);
  if (!user) {
    return res.redirect("/login");
  }
  res.redirect("/urls");
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// ***********************************************************************************************REGISTER
app.get("/register", (req, res) => {
  const templateVars = { user: activeUser(req.session.user_id, users) };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or Password not entered");
  }
  if (verifyUserEmail(req.body.email, users)) {
    res.status(400).send("This email is already registered");
  }
  req.body.password = hashedPassword;
  const newUser = createUser(req.body, users);
  req.session.user_id =  newUser.id;
  res.redirect("/urls");
});

// ***********************************************************************************************LOGIN
app.get("/login", (req, res) => {
  const templateVars = { user: activeUser([req.session.user_id], users) };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPass = req.body.password;
  if (!verifyUserEmail(userEmail, users)) {
    res.status(403).send('Error 403... Email not found, Please register');
  }
  if (verifyUserEmail(userEmail, users)) {
    const id = getUserByEmail(userEmail, users).id;
    const pass = getUserByEmail(userEmail, users).password;
  
    if (!bcrypt.compareSync(userPass, pass)) {
      res.status(403).send('Error 403... Incorrect password');
    }
    req.session.user_id = id;
    res.redirect('/urls');
  }
});

// ***********************************************************************************************URLS
app.get("/urls", (req, res) => {
  const user = activeUser(req.session.user_id, users);
  if (!user) {
    return res.redirect("/login");
  }
  const urls = urlsForUser(user.id, urlDatabase);
  const templateVars = { urls, user: activeUser(req.session.user_id, users) };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const user = activeUser(req.session.user_id, users);
  urlDatabase[shortURL] = {longURL: req.body.longURL, userID: user.id};
  res.redirect("/urls");
});

// ***********************************************************************************************NEW URL
app.get("/urls/new", (req, res) => {
  const user = activeUser(req.session.user_id, users);
  if (!user) {
    return res.send("Please login or register");
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// ***********************************************************************************************SHORT URLS
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = activeUser(req.session.user_id, users);
  
  if (!urlDatabase[shortURL]) {
    return res.send("The URL does not exist");

  } else if (user.id !== urlDatabase[shortURL].userID) {
    return res.send("log in with correct ID");

  } else if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    const templateVars = { shortURL, longURL, user};
    return res.render("urls_show", templateVars);

  } else {
    return res.send('URL does not exist');
  }
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const long = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) {
    res.status(404).send("URL does not exist");
  } else {
    res.redirect(`https://${long}`);
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});

// ***********************************************************************************************DELETE URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = activeUser(req.session.user_id, users);
  const shortURL = req.params.shortURL;

  if (user.id !== urlDatabase[shortURL].userID) {
    return res.status(401).send("log in with correct ID");
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// ***********************************************************************************************EDIT URL
app.post("/urls/:shortURL/edit", (req, res) => {
  if (!urlsForUser(activeUser(req.session.user_id, users).id, urlDatabase)) {
    res.send('This ID does not belong to you');
  }
  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect('/urls');
});


// ***********************************************************************************************LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/");
});


// ***********************************************************************************************LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});