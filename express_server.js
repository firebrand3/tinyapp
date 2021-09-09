const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");


const {
  generateRandomString,
  checkUrl,
  verifyUser,
  getUserInfo,
  createUser,
  verifyUserEmail,
  activeUser,
  urlsForUser
} = require("./helper_functions");


// ***********************************************************************************************DATABASE
const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "userRandomID"}
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1234",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "1234",
  },
};


// ***********************************************************************************************BASIC

app.get("/", (req, res) => {
  // res.send("Hello");
  res.redirect('/login');
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// ***********************************************************************************************URLS

app.get("/urls", (req, res) => {
  const user = activeUser(req.cookies.user_id, users);
  if (!user) {
    res.send("Please login or register");
  }
  let templateVars = { urls: urlDatabase, user: activeUser(req.cookies.user_id, users) };
  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6);
  const user = activeUser(req.cookies.user_id, users);
  urlDatabase[shortURL] = {longURL: req.body.longURL, id: user.userID};
  res.redirect("/urls");
  // res.redirect(`/urls/${shortURL}`);
});

// ***********************************************************************************************NEW URL

app.get("/urls/new", (req, res) => {
    const user = activeUser(req.cookies.user_id, users)
  if (!user) {
    res.send("Please login or register");
    // res.redirect('/login');
  }
  const templateVars = { user };
  res.render("urls_new", templateVars);
});

// ***********************************************************************************************SHORT URLS

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const user = activeUser(req.cookies.user_id, users);

  if (!urlDatabase[shortURL]) {
    res.send("The URL does not exist");
  } else if (user.id !== urlDatabase[shortURL].userID) {
    res.send("log in with correct ID");
    }

    if (checkUrl(shortURL, urlDatabase)) {
    let longURL = urlDatabase[shortURL].longURL;
    let templateVars = { shortURL: shortURL, longURL: longURL, user: user};
    res.render("urls_show", templateVars);
  } else {
    res.send('URL does not exist');
  }
});

app.get("/u/:shortURL", (req, res) => {
  shortURL = req.params.shortURL;
  if (checkUrl(shortURL, urlDatabase)) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404);
    res.send("URL does not exist");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newURL;
  res.redirect("/urls");
});


// ***********************************************************************************************DELETE URL

app.post("/urls/:shortURL/delete", (req, res) => {
  const user = activeUser(req.cookies.user_id, users)
  const shortURL = req.params.shortURL;

  if (user.id !== urlDatabase[shortURL].userID) {
    res.send("log in with correct ID");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// ***********************************************************************************************EDIT URL

app.post("/urls/:shortURL/edit", (req, res) => {
  const user = (activeUser(req.cookies.user_id, users).email)
  const shorturl = (req.params.shortURL)
  const urls = (urlDatabase)


  if (!urlsForUser(activeUser(req.cookies.user_id, users).id, urlDatabase)) 
  {
    res.send('This ID does not belong to you')
  }

  urlDatabase[req.params.shortURL].longURL = req.body.newURL;
  res.redirect('/urls')
});

// ***********************************************************************************************LOGIN

app.get("/login", (req, res) => {
  templateVars = { user: activeUser([req.cookies.user_id], users) };
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  const user_email = req.body.email;
  const user_pass = req.body.password;
  
  if (!verifyUserEmail(user_email, users)) {
    res.status(403).send('Error 403... Email not found')
  }

  if (verifyUserEmail (user_email, users)) {
  const id = getUserInfo(user_email, users).id;
  const pass = getUserInfo(user_email, users).password;
  
  if (pass !== user_pass) {
      res.status(403).send('Error 403... Incorrect password')
    }
  res.cookie('user_id', id);
  res.redirect('/urls');
  }
});

// ***********************************************************************************************LOGOUT

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/");
});

// ***********************************************************************************************REGISTER

app.get("/register", (req, res) => {
  templateVars = { user: activeUser([req.cookies.user_id], users) };
  res.render("urls_register", templateVars);
});


app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Email or Password not entered");
  }
  if (verifyUserEmail(req.body.email, users)) {
    res.status(400).send("This email is already registered");
  }
  const newUser = createUser(req.body, users);
  res.cookie("user_id", newUser.id);
  res.redirect("/urls");
});

// ***********************************************************************************************LISTEN
console.log(urlsForUser("user2RandomID", urlDatabase));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});