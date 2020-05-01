<!-- Marc Millar - S1828600 -->
<template>
  <div id="find-friends">
    <div v-if="checkRightsBan()">
      you are banned from viewing this content - contact admin if you wish to
      appeal
    </div>
    <div v-if="!checkRightsBan()">
      <h1>Find Friends</h1>
      <input type="text" v-model="search" placeholder="search..." />
      <div v-for="user in filteredUsers" v-bind:key="user.id">
        <h5>
          <router-link
            v-bind:to="{ name: 'view-profile', params: { user_id: user.id } }"
          >{{ user.first_name }} {{ user.last_name }}</router-link>
        </h5>
        <article>{{ user.bio }}</article>
      </div>
    </div>
  </div>
</template>

<script>
import firebase, { firestore } from "firebase";
import db from "../components/firebaseInit";

export default {
  name: "find-friends",
  data() {
    return {
      isLoggedIn: false,
      currentUser: false,
      users: [],
      search: "",
      bans: []
    };
  },
  //called when an instance of the component is created
  created() {
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }

    //gets all rhe profiles
    db.collection("profiles")
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
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
            bans: doc.data().bans
          };
          this.users.push(data);
          if (data.id == this.currentUser) {
            this.bans = data.bans;
          }
        });
      });
  },
  computed: {
    //filters the users out so only users matching the search bar appear
    filteredUsers: function() {
      return this.users.filter(user => {
        let lookFor = user.first_name + user.last_name;
        return user.email.match(this.search);
      });
    }
  },
  methods: {
    //check user is allowed to access page
    checkRightsBan: function() {
      if (this.bans.includes("total")) {
        return true;
      } else {
        return false;
      }
    }
  }
};
</script>

<style></style>
