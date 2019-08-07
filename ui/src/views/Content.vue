<template>
  <div class="window">
    <div class="header">Content page</div>
    <div class="info">
      <div class="err" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="label" v-if="!post & !errorMessage">Getting the data...</div>
      <div class="content">
        <div class="content_heading">{{ post.title }}</div>
        <div class="content_created_at">
          {{ post.createdAt ? "Posted: " + formatDate(post.createdAt) : undefined }}
          {{ post.createdBy ? " by " + post.createdBy : undefined }}
        </div>
        <div class="content_text">{{ post.text }}</div>
      </div>
      <div class="buttons">
        <button @click="$router.push('/')">Go to feed</button>
        <button @click="$router.push('/profile')">Profile</button>
        <button @click="go($event)">Logout</button>
      </div>
    </div>
    <router-view />
  </div>
</template>

<script>
import axios from "axios";
import { formatDate } from "../parsers";

export default {
  name: "content",
  data() {
    return {
      post: {},
      errorMessage: ""
    };
  },
  methods: {
    formatDate,
    go: async function(event) {
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
  created: function() {
    axios
      .get("/api/content/" + this.$route.params.id)
      .then(res => (this.post = res.data))
      .catch(err => (this.errorMessage = err.response.data.reason))
      .catch(() => (this.errorMessage = "Unknown error"));
  }
};
</script>
