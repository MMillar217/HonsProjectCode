import Vue from "vue";
import Router from "vue-router";
import Dashboard from "@/views/Dashboard";
import Register from "@/views/Register";
import ViewProfile from "@/views/ViewProfile";
import EditProfile from "@/views/EditProfile";
import Login from "@/views/Login";
import FindFriends from "@/views/FindFriends.vue";
import StatUpdate from "@/views/StatUpdate.vue";
import Message from "@/views/Message.vue";
import Admin from "../views/Admin.vue";
import ManageClasses from "@/views/ManageClasses.vue";
import ModuleDash from "@/views/ModuleDash.vue";
import firebase from "firebase";

Vue.use(Router);

let router = new Router({
  routes: [
    {
      path: "/",
      name: "dashboard",
      component: Dashboard,
      meta: {
        requiresAuth: true
      }
    },
    // {
    //   path: "/manageclasses",
    //   name: "manage-classes",
    //   component: ManageClasses,
    //   meta: {
    //     requiresAuth: true
    //   }
    // },
    {
      path: "/moduledash/:class_id",
      name: "module-dash",
      component: ModuleDash,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: "/register",
      name: "register",
      component: Register,
      meta: {
        requiresGuest: true
      }
    },
    {
      path: "/edit/:user_id",
      name: "edit-profile",
      component: EditProfile,
      meta: {
        requiresAuth: true
      }
    },
    // {
    //   path: "/newstatus",
    //   name: "stat-update",
    //   component: StatUpdate,
    //   meta: {
    //     requiresAuth: true
    //   }
    // },
    {
      path: "/findFriends",
      name: "find-friends",
      component: FindFriends,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/admin",
      name: "admin",
      component: Admin,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/:user_id",
      name: "view-profile",
      component: ViewProfile,
      meta: {
        requiresAuth: true
      }
    },
    {
      path: "/messages/:user_id",
      name: "message",
      component: Message,
      meta: {
        requiresAuth: true
      }
    }
  ]
});

//nav guards
router.beforeEach((to, from, next) => {
  //check auth guard
  if (to.matched.some(record => record.meta.requiresAuth)) {
    //check if not logged in
    if (!firebase.auth().currentUser) {
      //go to login page
      next({
        path: "/login",
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      //proceed to route
      next();
    }
  } else if (to.matched.some(record => record.meta.requiresGuest)) {
    //check if logged in
    if (firebase.auth().currentUser) {
      //go to login page
      next({
        path: "/",
        query: {
          redirect: to.fullPath
        }
      });
    } else {
      //proceed to route
      next();
    }
  } else {
    //proceed to route
    next();
  }
});

export default router;
