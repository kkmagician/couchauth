<template>
  <div class="window">
    <div class="header">Profile</div>
    <div class="info">
      <div class="err" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="label" v-if="!profile && !errorMessage">Getting the data...</div>
      <div v-if="avatar">
        <img :src="avatar" class="avatar" />
      </div>
      <div class="label" v-for="(value, key) in profile" :key="key">
        <b>{{ profileKeysMapping[key] ? profileKeysMapping[key] : key }}:</b>
        {{ value }}
      </div>
      <div class="buttons">
        <button @click="$router.push('/')">Go to feed</button>
        <button @click="go($event)">Logout</button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "profile",
  data() {
    return {
      errorMessage: "",
      profile: {},
      avatar: "",
      profileKeysMapping: {
        name: "Username",
        firstName: "First name",
        lastName: "Last name"
      }
    };
  },
  methods: {
    async go(event) {
      if (event) event.preventDefault();
      const pushLogin = () => {
        this.$router.push("/login");
      };
      await axios
        .delete("/api/logout")
        .then(pushLogin)
        .catch(pushLogin);
    }
  },
  created: async function() {
    axios.get("/api/profile").then(resp => {
      this.profile = resp.data.profile;
      this.avatar = resp.data.avatar
        ? "data:image/jpeg;base64," + resp.data.avatar
        : "";
    });
  }
};
</script>
