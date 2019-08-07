<template>
  <div class="window" @keyup.enter="go($event)">
    <div id="login_items">
      <div class="header">Login form</div>
      <div class="info">
        <form>
          <div class="label">Login</div>
          <input class="form" type="text" v-model="login" />
          <div class="label">Password</div>
          <input class="form" type="password" v-model="password" />
          <div class="buttons">
            <button id="go" v-on:click="go($event)">Go</button>
            <router-link to="register">
              <button id="register_btn">Register</button>
            </router-link>
            <div class="err" v-if="errorMessage">{{ errorMessage }}</div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "login",
  data() {
    return {
      login: "",
      password: "",
      errorMessage: ""
    };
  },
  methods: {
    async go(event) {
      if (event) event.preventDefault();
      await axios({
        url: "/api/login",
        method: "post",
        data: {
          username: this.login,
          password: this.password
        }
      })
        .then(() => this.$router.push("/profile"))
        .catch(err => {
          this.errorMessage =
            err.response.status === 401 ? "Wrong credentials" : "Unknown error";
        });
    }
  }
};
</script>
