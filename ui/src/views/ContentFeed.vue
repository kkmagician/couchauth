<template>
  <div class="window">
    <div class="header">Content feed page</div>
    <div class="info">
      <div class="err" v-if="errorMessage">{{ errorMessage }}</div>
      <div class="label" v-if="!content & !errorMessage">Getting the data...</div>
      <div class="content" v-for="post in content" :key="post.title">
        <div class="content_heading">
          <router-link :to="`/content/${post.id}`">{{ post.title }}</router-link>
        </div>
        <div class="content_created_at">
          {{ post.createdAt ? "Posted: " + formatDate(post.createdAt) : undefined }}
          {{ post.createdBy ? " by " + post.createdBy : undefined }}
        </div>
        <div class="content_text">{{ post.text }}</div>
        <hr />
      </div>
      <div class="buttons">
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
      content: [],
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
      .get("/api/content")
      .then(res => (this.content = res.data.docs))
      .catch(err => (this.errorMessage = err.response.data.reason))
      .catch(() => (this.errorMessage = "Unknown error"));
  }
};
</script>
