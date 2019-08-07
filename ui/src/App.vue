<template>
  <div id="app">
    <div class="header" id="nav" @click="$router.push('/')">Couch auth</div>
    <router-view />
  </div>
</template>

<style>
a {
  text-decoration: none;
  color: #305274;
}

a:visited {
  color: #305274;
}

body {
  background: #f9fafa;
  margin: 0;
}

button {
  padding: 10px 15px;
  border: 0;
  background: #fefefe;
  box-shadow: none;
  border-radius: 0px;
  outline: none;
  cursor: pointer;
  margin-right: 5px;
}

button:after {
  background: #d7d7d7;
  transition: all 0.5s;
}

hr {
  height: 1px;
  border: none;
  color: #f05050;
  background-color: #f05050;
}

.avatar {
  vertical-align: middle;
  width: 200px;
  height: 200px;
  border: 1px solid #454545;
  border-radius: 50%;
}

.err {
  color: #f05050;
  margin-top: 5px;
  margin-left: 5px;
}

.buttons {
  margin-top: 12px;
  display: flex;
}

.window {
  max-width: 600px;
}

.header {
  margin-left: 10px;
  padding: 10px;
  background: #ff8a65;
  font-size: 130%;
}

.info {
  margin-left: 10px;
  padding: 10px;
  background: #ffccbc;
  font-size: 110%;
}

.content {
  margin-bottom: 15px;
}

.content_created_at {
  font-size: 80%;
  font-style: italic;
  margin-bottom: 5px;
}

.content_heading {
  font-size: 140%;
  font-weight: bold;
  margin-bottom: 5px;
}

.content_text {
  font-size: 90%;
}

.label {
  margin-top: 5px;
}

.form {
  size: 140%;
  border: none;
  outline: none;
  padding: 8px;
  width: 50%;
  margin-top: 5px;
  background: #fefefe;
}

#nav {
  margin-left: 0px;
  margin-bottom: 10px;
  padding: 15px 10px;
  cursor: pointer;
}

#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 0px;
}
</style>
