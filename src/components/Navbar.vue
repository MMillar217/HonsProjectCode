<!-- Marc Millar - S1828600 -->
<template>
  <div id="navbar">
    <div class="navbar fixed">
      <nav class="nav-wrapper indigo">
        <div class="container">
          <a href="#" class="sidenav-trigger" data-target="mobile-links">
            <i class="material-icons">menu</i>
          </a>
          <ul class="left hide-on-med-and-down">
            <li>
              <router-link to="/">
                <i class="material-icons">home</i>
              </router-link>
            </li>
            <li v-if="isLoggedIn">
              <router-link to="/findfriends">
                <i class="material-icons left">people</i> Find Friends
              </router-link>
            </li>
            <!-- <li v-if="isLoggedIn" style="display: flex;">
            <router-link to="/newstatus">
              <i class="material-icons left">create</i> Post
            </router-link>
            </li>-->
            <li v-if="isLoggedIn">
              <router-link
                v-bind:to="{
                  name: 'view-profile',
                  params: { user_id: currentUser }
                }"
              >
                <i class="material-icons left">person</i> View Profile
              </router-link>
            </li>
            <li v-if="isLecturer || isAdmin">
              <router-link to="/manageclasses">
                <i class="material-icons left">tab</i> Manage Classes
              </router-link>
            </li>

            <li v-if="isAdmin">
              <router-link to="/admin">
                <i class="material-icons left">insert_chart</i> Admin
              </router-link>
            </li>
          </ul>

          <ul class="right hide-on-med-and-down">
            <li v-if="!isLoggedIn">
              <router-link to="/login">Login</router-link>
            </li>
            <li v-if="!isLoggedIn">
              <router-link to="/register">Register</router-link>
            </li>
            <li v-if="isLoggedIn">
              <button v-on:click="logout" class="btn btn-outline-primary">Logout</button>
            </li>
          </ul>
        </div>
      </nav>
      <ul class="sidenav" id="mobile-links">
        <li>
          <router-link to="/">
            <i class="material-icons">home</i> Home
          </router-link>
        </li>
        <li v-if="isLoggedIn">
          <router-link to="/findfriends">
            <i class="material-icons">people</i> Find Friends
          </router-link>
        </li>
        <!-- <li v-if="isLoggedIn">
        <router-link to="/newstatus">
          <i class="material-icons">create</i> Post
        </router-link>
        </li>-->
        <li v-if="isLoggedIn">
          <router-link
            v-bind:to="{
              name: 'view-profile',
              params: { user_id: currentUser }
            }"
          >
            <i class="material-icons">person</i> View Profile
          </router-link>
        </li>
        <li v-if="isLecturer || isAdmin">
          <router-link to="/">
            <i class="material-icons">tab</i> Manage Classes
          </router-link>
        </li>
        <li v-if="isAdmin">
          <router-link to="/admin">
            <i class="material-icons">insert_chart</i> Admin
          </router-link>
        </li>
        <li v-if="!isLoggedIn">
          <router-link to="/login">Login</router-link>
        </li>
        <li v-if="!isLoggedIn">
          <router-link to="/register">Register</router-link>
        </li>
        <li v-if="isLoggedIn" class="centre">
          <button v-on:click="logout" class="btn btn-outline-primary">Logout</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
import db from "../components/firebaseInit";
export default {
  name: "navbar",
  data() {
    return {
      isLoggedIn: false,
      currentUser: false,
      curRole: "",
      classes: [],
      isLecturer: false,
      isAdmin: false,
    };
  },
  created() {
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }
    this.fetchUserDetails();
  },
  mounted() {
    let jq = document.createElement("script");
    jq.setAttribute(
      "src",
      "https://ajax.googleapis.com/ajax/libs/jquery/3.2.0/jquery.min.js"
    );
    document.head.appendChild(jq);

    let icons = document.createElement("link");
    icons.setAttribute(
      "stylesheet",
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    document.head.appendChild(icons);

    let vjq = document.createElement("script");
    vjq.setAttribute(
      "src",
      "https://cdnjs.cloudflare.com/ajax/libs/vue/2.5.17/vue.js"
    );
    document.head.appendChild(vjq);
    $(document).ready(function () {
      $(".sidenav").sidenav();
    });
  },
  methods: {
    logout: function () {
      firebase
        .auth()
        .signOut()
        .then(() => {
          this.$router.go({ path: this.$router.path });
        });
    },
    fetchUserDetails() {
      db.collection("profiles")
        .where("email", "==", this.currentUser)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            const data = {
              id: doc.id,
              bio: doc.data().bio,
              email: doc.data().email,
              first_name: doc.data().first_name,
              gender: doc.data().gender,
              last_name: doc.data().last_name,
              friends: doc.data().friends,
              pending: doc.data().pending,
              requests: doc.data().requests,
              classes: doc.data().classes,
              role: doc.data().role,
            };
            this.curRole = data.role;
            console.log(this.curRole);
            if (this.curRole === "admin" && this.isLoggedIn == true) {
              this.isAdmin = true;
            } else {
              this.isAdmin = false;
            }
            if (this.curRole === "lecturer" && this.isLoggedIn == true) {
              this.isLecturer = true;
            } else {
              this.isLecturer = false;
            }
          });
        });
    },
    checkAdmin() {
      console.log("this.curRole = ", this.curRole);
      if (this.curRole === "admin") {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    },
    checkLecturer() {
      if (this.curRole === "lecturer") {
        this.isLecturer = true;
      } else {
        this.isLecturer = false;
      }
    },
    checkInClass() {
      if (this.classes.length > 0) {
        console.log(this.classes);
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>

<style scoped>
.email {
  padding-right: 10px;
}
</style>
