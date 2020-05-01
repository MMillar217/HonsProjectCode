<!-- Marc Millar - S1828600 -->
<template>
  <div id="dashboard">
    <div class="row">
      <div class="col-md-3">
        <div class="card" style="overflow:auto; height:450px;">
          <div class="card-header" style="text-align: center;">
            <h4>Friends</h4>
          </div>

          <div class="list-group">
            <ul class="collection">
              <li v-for="user in users" v-bind:key="user.id" class="collection-item">
                <router-link
                  v-bind:to="{
                    name: 'view-profile',
                    params: { user_id: user.id }
                  }"
                >{{ user.first_name }} {{ user.last_name }}</router-link>
                <br />
                {{ user.bio }}
                <br />
                {{ user.gender }}
              </li>
            </ul>
          </div>

          <div class="list-group">
            <ul class="collection">
              <li v-for="request in requests" v-bind:key="request.id" class="collection-item">
                <router-link
                  v-bind:to="{
                    name: 'view-profile',
                    params: { user_id: request.id }
                  }"
                >{{ request.first_name }} {{ request.last_name }}</router-link>
                <br />Friend request
                <br />
                <button
                  v-on:click="acceptRequest(request.id)"
                  type="submit"
                  class="btn btn-primary"
                >Accept</button>
                <button
                  v-on:click="rejectRequest(request.id)"
                  type="submit"
                  class="btn btn-light"
                >Decline</button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div class="card w-75">
        <div class="container-fluid">
          <div class="row">
            <div v-for="aClass in classes" v-bind:key="aClass.id" class="collection-item">
              <div class="col-auto mb-2">
                <div class="card" style="width: 16rem;">
                  <div class="card-body">
                    <h5>
                      <router-link
                        v-bind:to="{
                    name: 'module-dash',
                    params: { class_id: aClass.id }
                  }"
                      >{{aClass.class_name}}</router-link>
                    </h5>
                    <h6 class="card-text">{{aClass.lecturers}}</h6>
                    <p class="card-text">{{aClass.level}}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase, { firestore } from "firebase";
import db from "../components/firebaseInit";
import * as toxicity from "@tensorflow-models/toxicity";

export default {
  name: "dashboard",
  data() {
    return {
      posts: [],
      users: [],
      requests: [],
      cUserFriends: [],
      isLoggedIn: false,
      currentUser: false,
      currentEmail: "",
      classes: [],
      curRole: "",
      isAdmin: false,
      search: ""
    };
  },
  //called when an instance of the component is created
  created() {
    //get current user's email
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
      this.currentEmail = this.currentUser.email;
    }
    //get data required for the page
    this.getUsers();
    this.getClasses();
    //this.getPosts();
  },
  //called when the instance is mounted to the app
  mounted() {
    let aja = document.createElement("script");
    aja.setAttribute(
      "src",
      "https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"
    );
    document.head.appendChild(aja);

    let max = document.createElement("script");
    max.setAttribute(
      "src",
      "https://maxcdn.bootstrapcdn.com/bootstrap/3.4.1/js/bootstrap.min.js"
    );
    document.head.appendChild(max);

    let alerts = document.createElement("script");
    alerts.setAttribute("src", "https://cdn.jsdelivr.net/npm/sweetalert2@9");
    document.head.appendChild(alerts);
  },
  computed: {
    filteredClasses: function() {
      return this.classes.filter(aClass => {
        let lookFor = aClass.class_name;
        return aClass.class_name.match(this.search);
      });
    }
  },
  methods: {
    //on-click: accepts user as a friend
    acceptRequest(reqId) {
      /* - identify each document (profile) required for the process
         - update the current user's friends list to include the requester's email
         - update the requester's friends list to include the current user
         - remove each user from each other's requests/pending lists */

      //stores the required documents in respective variables
      let remRequest = db.collection("profiles").doc(this.currentUser);
      let remPending = db.collection("profiles").doc(reqId);
      let addFriendToCur = db.collection("profiles").doc(this.currentUser);
      let addFriendToReq = db.collection("profiles").doc(reqId);

      //update the appropriate fields
      remRequest.update({
        requests: firebase.firestore.FieldValue.arrayRemove(reqId)
      });
      remPending.update({
        pending: firebase.firestore.FieldValue.arrayRemove(this.currentUser)
      });
      addFriendToCur.update({
        friends: firebase.firestore.FieldValue.arrayUnion(reqId)
      });
      addFriendToReq.update({
        friends: firebase.firestore.FieldValue.arrayUnion(this.currentUser)
      });
    },
    //on-click: declines the user as a friend
    rejectRequest(reqId) {
      /* - identify each user needed for the process
         - update each user's request/pending list to no longer include each other */
      let remRequest = db.collection("profiles").doc(this.currentUser);
      let remPending = db.collection("profiles").doc(reqId);
      remRequest.update({
        requests: firebase.firestore.FieldValue.arrayRemove(reqId)
      });
      remPending.update({
        pending: firebase.firestore.FieldValue.arrayRemove(this.currentUser)
      });
      this.$router.go({ path: this.$router.path });
    },
    //get the friends of the current user from the db and any requests
    getUsers() {
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
              classes: doc.data().classes,
              role: doc.data().role
            };
            //if friends array contains the current user or if the current user has a request pending from a user
            if (doc.data().friends.includes(this.currentUser)) {
              //add user to the friends list
              this.users.push(data);
              this.cUserFriends.push(doc.data().user_id);
            }
            //if current user has a request from the user
            if (doc.data().pending.includes(this.currentUser)) {
              //add user to the friends list
              this.requests.push(data);
            }
            if (doc.data().email == this.currentUser) {
              this.curRole = doc.data().role;
            }
          });
        });
    },
    //get the classes of the current user
    getClasses() {
      db.collection("classes")
        .orderBy("class_name", "asc")
        .get()
        .then(querySnapshot => {
          let allClasses = [];
          querySnapshot.forEach(doc => {
            const data = {
              id: doc.id,
              class_name: doc.data().class_name,
              class_lecturers: doc.data().class_lecturers,
              class_members: doc.data().class_members,
              level: doc.data().level
            };
            if (
              doc.data().class_members.includes(this.currentUser) ||
              doc.data().class_lecturers.includes(this.currentUser) ||
              this.curRole == "admin"
            ) {
              allClasses.push(data);
            }
          });
          this.classes = allClasses;
        });
    }
    //shows the
    // showMsg(post) {
    //   // alert(`${post.title}\n${post.body}\nposted by: ${post.posted_by}`);
    //   // Swal.fire(post.title, post.body, "warning");
    //   Swal.fire({
    //     icon: "warning",
    //     title: post.title,
    //     text: post.body,
    //     footer: "Posted by: " + post.posted_by
    //   });
    // },

    // checkTox() {
    //   const threshold = 0.9;
    //   console.log(threshold);
    //   toxicity.load(threshold).then(model => {
    //     const sentences = ["I fucking love you"];
    //     console.log("testing: ", sentences);
    //     model.classify(sentences).then(predictions => {
    //       console.log(predictions);
    //     });
    //   });
    // },
    // deleteStatus(id, body) {
    //   db.collection("posts")
    //     .where("body", "==", body)
    //     .get()
    //     .then(querySnapshot => {
    //       querySnapshot.forEach(doc => {
    //         doc.ref.delete();
    //         alert(`status deleted ${id}`);
    //         console.log("hi");
    //         this.$router.go({ path: this.$router.path });
    //         // this.$router.push("/");
    //       });
    //     });
    // },

    //checks if the user is authorised
    // isAuthorised: function(id) {
    //   if (id == this.currentUser) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
    // //checks if post has any violations
    // checkViolations: function(violations) {
    //   if (violations.length >= 1) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },
    // checkAdmin() {
    //   if (this.curRole === "admin") {
    //     this.isAdmin = true;
    //   } else {
    //     this.isAdmin = false;
    //   }
    // },
    // isFriends: function(id) {
    //   if (cUserFriends.find(id)) {
    //     return true;
    //   } else {
    //     return false;
    //   }
    // },

    // getPosts(){
    //   db.collection("posts")
    //   .orderBy("posted", "desc")
    //   .get()
    //   .then(querySnapshot => {
    //     querySnapshot.forEach(doc => {
    //       const data = {
    //         id: doc.id,
    //         user_id: doc.data().user_id,
    //         posted_by: doc.data().posted_by,
    //         violations: doc.data().violations,
    //         title: doc.data().title,
    //         body: doc.data().body,
    //         posted: doc.data().posted
    //       };
    //       this.posts.push(data);
    //     });
    //   });
    // }
  }
};
</script>

<style>
.scroller {
  max-height: 50px;
}
ul.a {
  list-style-type: circle;
}
</style
