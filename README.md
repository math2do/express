## Run Project
After cloning the project, install all node depedencies using
```sh
npm install
```

Run the project using
```sh
npm run start:dev
```

## Express Framework
Init this project as node module.
```sh
npm init -y
```
Install `express` module.
```sh
npm install express
```
Install `nodemon` as dev dependency module. With this, the process will automatically restart when file change is detected.
```sh
npm install -D nodemon
```
Install Express Validator
```sh
npm i express-validator
```

### Cookies
Cookies are small data that web server sends to clients/web-browsers

server --> browser

After that, browser can send back the cookies in subsequent http calls. This helps the server to remember something about client. The server can set timeout to cookie after which client will not send the cookie to server. Use following node package to easily use/parse cookies.

Install Cookie Parser
```sh
npm i cookie-parser
```

### Sessions
Session is used to track each users. Server generates some session for the requesting user, and set the session_id in cookie for subsequent requests.

Install express-session module
```sh
npm i express-session
```

### Authentication with Passport.js
Install `passport` and `passoport-local`
```sh
npm i passport passport-local
```

## MongoDB and Mongoose
Install `mongoose` using
```sh
npm i mongoose
```