import Vue from 'vue';
import Router from 'vue-router';
import axios from 'axios';

Vue.use(Router);

const router = new Router({
  mode: "history",
  routes: [{
      path: '/login',
      name: 'login',
      component: () => import('./views/Login.vue')
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('./views/Register.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('./views/Profile.vue')
    },
    {
      path: '/',
      name: 'content',
      component: () => import('./views/ContentFeed.vue')
    },
    {
      path: '/content/:id',
      component: () => import('./views/Content.vue')
    }
  ]
})

router.beforeEach(async function (to, from, next) {
  const isLoginPage = ["login", "register"].includes(
    to.name
  );

  await axios
    .get("/api/session")
    .then(() => isLoginPage ? next("profile") : next())
    .catch(() => isLoginPage ? next() : next("login"));
})

export default router;