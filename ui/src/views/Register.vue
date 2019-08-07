<template>
  <div class="window" @keyup.enter="go($event)">
    <div class="header">Registration form</div>
    <div class="info">
      <form>
        <div class="label">Login</div>
        <input class="form" type="text" v-model="login" />
        <div class="label">First name</div>
        <input class="form" type="text" v-model="firstName" />
        <div class="label">Last name</div>
        <input class="form" type="text" v-model="lastName" />
        <div class="label">Password</div>
        <input class="form" type="password" v-model="password" />
        <div class="label">Repeat password</div>
        <input class="form" type="password" v-model="repassword" />
        <div class="label">Avatar (optional)</div>
        <div class="file_input">
          <input
            type="file"
            id="avatar"
            name="avatar"
            ref="avatar"
            accept="image/png, image/jpeg"
            @change="handleAvatar"
          />
          {{ avatar.size ? "Ready!" : undefined }}
        </div>
        <div class="buttons">
          <button @click="go($event)">Submit</button>
          <button @click="goLogin($event)">Back to login</button>
          <div class="err" v-if="errorMessage">{{ errorMessage }}</div>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "Register",
  data() {
    return {
      login: "",
      password: "",
      firstName: "",
      lastName: "",
      repassword: "",
      registrationFailed: false,
      errorMessage: "",
      avatar: {}
    };
  },
  methods: {
    handleAvatar: function(event) {
      this.avatar = event.target.files[0];
    },
    goLogin: function() {
      if (event) event.preventDefault();
      this.$router.push("login");
    },
    go: async function(event) {
      if (event) event.preventDefault();
      if (
        [
          this.login,
          this.password,
          this.repassword,
          this.firstName,
          this.lastName
        ]
          .map(el => el.length)
          .includes(0)
      ) {
        this.registrationFailed = true;
        this.errorMessage = "Not all fields are filled";
        return;
      }

      if (this.password !== this.repassword) {
        this.registrationFailed = true;
        this.errorMessage = "Passwords do not match";
        return;
      }

      if (this.avatar.size > 10 * 1024 * 1024) {
        this.errorMessage = "Avatar image is too large!";
        return;
      }

      const profile = {
        name: this.login,
        password: this.password,
        firstName: this.firstName,
        lastName: this.lastName
      };

      const resp = await axios({
        method: "put",
        url: "/api/register",
        data: profile
      })
        .then(resp => resp.data)
        .catch(err => (this.errorMessage = err.response.data.reason || "Unexpected error"))

      if (resp.ok && this.avatar.type) {
        const processError = () =>
          (this.errorMessage = "Could not process the avatar");

        axios
          .put("/api/avatar/" + resp.id, this.avatar, {
            headers: {
              "if-match": resp.rev,
              "content-type": this.avatar.type
            }
          })
          .then(() => this.$router.push("/login"))
          .catch(processError);
      } else this.$router.push("/login");
    }
  }
};
</script>