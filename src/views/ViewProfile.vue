<!-- Marc Millar - S1828600 -->
<template>
  <div id="view-profile">
    <div v-if="checkRightsBan()">You are banned from viewing this content</div>
    <div v-if="!checkRightsBan()">
      <div v-if="checkBlocked(email)">
        {{ first_name }} {{ last_name }} has blocked you from viewing their
        profile!
      </div>
      <div v-if="!checkBlocked(email)">
        <div class="row">
          <div class="col-6">
            <div class="card">
              <ul class="collection with-header">
                <li class="collection-header">
                  <h4>{{ first_name }} {{ last_name }}</h4>
                </li>
                <li class="collection-item">Contact: {{ email }}</li>
                <li class="collection-item">Gender: {{ gender }}</li>
                <li class="collection-item">About Me: {{ bio }}</li>
                <li class="collection-item">Role: {{ role }}</li>
              </ul>
            </div>
            <div v-if="!isYou(email)">
              <button v-on:click="blockUser(email)" type="submit" class="btn btn-danger right">BLOCK</button>
              <button class="btn btn-danger right" v-on:click="alertDisplay(email)">Report</button>
            </div>
            <div v-if="!checkFriendStat(email)">
              <div v-if="!checkRequest(email)">
                <div v-if="!isYou(email)">
                  <div v-if="!checkRequestBan()">
                    <button v-on:click="addFriend(email)" type="submit" class="btn btn-primary">
                      <i class="material-icons">add</i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div v-if="checkRequest(email)">Request Sent</div>
            <div v-if="isYou(email) || isAdmin">
              <router-link
                v-bind:to="{
                  name: 'edit-profile',
                  params: { user_id: email }
                }"
                class="btn btn-primary"
              >Edit Profile</router-link>
              <form @submit.prevent="mutedWords(email)"></form>
            </div>
            <div v-if="checkRequestBan()">You are banned from sending friend requests</div>
            <div v-if="checkFriendStat(email)">
              <router-link v-bind:to="{ name: 'message', params: { email } }" class="btn blue">
                <i class="material-icons">message</i>
              </router-link>
              <button v-on:click="remFriend(email)" type="submit" class="btn btn-danger">
                <i class="material-icons">remove_circle</i>
              </button>
            </div>
          </div>
          <div class="col-6">
            <div class="list-group">
              <ul class="collection">
                <li v-for="post in posts" v-bind:key="post.id" class="collection-item">
                  <div v-if="checkUserPost(post.user_id)">
                    <div v-if="checkViolations(post.violations)">
                      Posted By:
                      <router-link
                        v-bind:to="{
                          name: 'view-profile',
                          params: { user_id: post.user_id }
                        }"
                      >{{ post.posted_by }}</router-link>
                      <h5 style="color: #ff0008;">Warning!</h5>
                      <p>This post violated the following rules:</p>
                      <div v-for="violation in post.violations" v-bind:key="violation.id">
                        <ul class="a">
                          <li>{{ violation }}</li>
                        </ul>
                      </div>

                      <button v-on:click="showMsg(post)" class="btn btn-outline-danger">See Post</button>
                      <hr />
                      <div v-if="isAuthorised(post.user_id)">
                        <button
                          v-on:click="deleteStatus(post.id, post.body)"
                          type="submit"
                          class="btn btn-danger"
                        >Delete</button>
                      </div>
                    </div>
                    <div v-if="!checkViolations(post.violations)">
                      Posted By:
                      <router-link
                        v-bind:to="{
                          name: 'view-profile',
                          params: { user_id: post.user_id }
                        }"
                      >{{ post.posted_by }}</router-link>
                      <br />
                      {{ post.title }}
                      <br />
                      {{ post.body }}
                      <br />
                      <!-- {{timeSince(post.posted.toDate())}} -->
                      {{ post.posted.toDate() }}
                      <hr />
                      <div v-if="isAuthorised(post.user_id)">
                        <button
                          v-on:click="deleteStatus(post.id, post.body)"
                          type="submit"
                          class="btn btn-danger"
                        >Delete</button>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
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
export default {
  name: "view-profile",
  data() {
    return {
      user_id: null,
      first_name: null,
      last_name: null,
      gender: null,
      bio: null,
      email: null,
      role: "",
      friends: [],
      pending: [],
      requests: [],
      blocked: [],
      blocked_by: [],
      posts: [],
      isLoggedIn: false,
      currentUser: false,
      isAdmin: false,
      currentUserDets: [],
      bans: []
    };
  },
  //when an instance of component is created
  created() {
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }

    //find current user details, in order to check if request has been sent
    db.collection("profiles")
      .where("email", "==", this.currentUser)
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
            bans: doc.data().bans,
            role: doc.data().role
          };
          this.friends.push(doc.data().friends);
          this.pending.push(doc.data().pending);
          this.bans = data.bans;
          if (data.role == "admin") {
            this.isAdmin = true;
          }
          console.log(this.pending);
        });
      });
    this.getPosts();
  },
  //when instance is mounted to app - gets CDN content
  mounted() {
    let icons = document.createElement("link");
    icons.setAttribute(
      "stylesheet",
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    document.head.appendChild(icons);

    let alerts = document.createElement("script");
    alerts.setAttribute("src", "https://cdn.jsdelivr.net/npm/sweetalert2@9");
    document.head.appendChild(alerts);
  },

  //gets the details of the user being viewed
  beforeRouteEnter(to, from, next) {
    db.collection("profiles")
      .where("email", "==", to.params.user_id)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          next(vm => {
            vm.user_id = doc.id;
            vm.first_name = doc.data().first_name;
            vm.last_name = doc.data().last_name;
            vm.gender = doc.data().gender;
            vm.bio = doc.data().bio;
            vm.email = doc.data().email;
            vm.friends = doc.data().friends;
            vm.pending = doc.data().pending;
            vm.requests = doc.data().requests;
            vm.blocked = doc.data().blocked;
            vm.blocked_by = doc.data().blocked_by;
            vm.bans = doc.data().bans;
            vm.role = doc.data().role;
          });
        });
      });
  },
  // watch: {
  //   '%route': 'fetchData'
  // },
  methods: {
    //makes report - users are asked a series of questions for their report
    alertDisplay(email) {
      Swal.fire({
        title: "Report User",
        input: "select",
        showCancelButton: true,
        inputOptions: {
          spam: "Spam",
          racial: "Racial Abuse",
          threat: "Threatening",
          personal: "Personal Abuse",
          irrelevant: "Posts are not relevant",
          other: "Other"
        }
      }).then(answer => {
        if (answer.value) {
          Swal.fire({
            title: "Report User",
            input: "textarea",
            inputPlaceholder: "Describe your problem",
            text: "Reporting: " + this.first_name + " " + this.last_name,
            inputAttributes: {
              "aria-label": "Type your message here"
            },
            showCancelButton: true
          }).then(result => {
            if (result.value) {
              db.collection("reports").add({
                report_by: this.currentUser,
                reporting: this.email,
                report_reason: result.value,
                report_type: answer.value,
                resolved: false,
                report_made: new Date()
              });
              this.blockUser(this.email);
              Swal.fire(
                "Reported",
                "Report submitted successfully, this will be reviewed by an admin and this user will be blocked",
                "success"
              );
            } else {
              Swal.fire("Cancelled", "Your report has been cancelled", "info");
            }
          });
        } else {
          Swal.fire("Cancelled", "Your report has been cancelled", "info");
        }
      });
    }, //end of reporting function

    //gets any posts by the user being viewed
    getPosts() {
      db.collection("posts")
        .orderBy("posted", "desc")
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            const data = {
              id: doc.id,
              user_id: doc.data().user_id,
              posted_by: doc.data().posted_by,
              violations: doc.data().violations,
              title: doc.data().title,
              body: doc.data().body,
              posted: doc.data().posted
            };
            if (data.user_id == this.email) {
              this.posts.push(data);
            }
          });
        });
    },
    //checks if the user is authorised - basically if the post belongs to them, allow them to delete it
    isAuthorised: function(id) {
      if (id == this.currentUser) {
        return true;
      } else {
        return false;
      }
    },
    //check if post has any violations
    checkViolations: function(violations) {
      if (violations.length >= 1) {
        return true;
      } else {
        return false;
      }
    },
    //check if the current user has any bans on their accounts
    checkRightsBan: function() {
      if (this.bans.includes("total")) {
        return true;
      } else {
        return false;
      }
    },
    //check if the user is banned from making friend requests
    checkRequestBan: function() {
      if (this.bans.includes("making friend requests")) {
        return true;
      } else {
        return false;
      }
    },
    //check if the user has blocked the current user
    checkBlocked: function(email) {
      if (this.blocked.includes(this.currentUser)) {
        return true;
      } else {
        return false;
      }
    },
    //check if current user is friends with profile being viewed
    checkFriendStat: function(email) {
      if (this.friends.includes(this.currentUser)) {
        return true;
      } else {
        return false;
      }
    },
    //check if request has been sent
    checkRequest: function(email) {
      if (this.requests.includes(this.currentUser)) {
        return true;
      } else {
        return false;
      }
    },
    //check if post was made by the profile being viewed
    checkUserPost: function(email) {
      if (email == this.email) {
        return true;
      } else {
        return false;
      }
    },
    //check if the logged in user is the user being viewed
    isYou: function(email) {
      if (email == this.currentUser) {
        return true;
      } else {
        return false;
      }
    },
    //block the profile being viewed for the logged in user
    blockUser(email) {
      //block user
      let blockUser = db.collection("profiles").doc(this.currentUser);
      let blocked_byUser = db.collection("profiles").doc(email);
      blockUser.update({
        blocked: firebase.firestore.FieldValue.arrayUnion(email)
      });
      blocked_byUser.update({
        blocked_by: firebase.firestore.FieldValue.arrayUnion(this.currentUser)
      });

      if (this.friends.includes(this.currentUser)) {
        //remove friends
        this.remFriend(email);
      }
      if (this.requests.includes(this.currentUser)) {
        //remove request
        this.remRequest(email);
      }

      //push to dashboard
      //this.$router.push("/");
    },
    //remove request
    remRequest(email) {
      let removeRequest = db.collection("profiles").doc(email);
      let removePending = db.collection("profiles").doc(this.currentUser);
      removeRequest.update({
        requests: firebase.firestore.FieldValue.arrayRemove(this.currentUser)
      });
      removePending.update({
        pending: firebase.firestore.FieldValue.arrayRemove(email)
      });
    },
    //sends friend request
    addFriend(viewEmail) {
      let addToCur = db.collection("profiles").doc(this.currentUser);
      let addCurToEmail = db.collection("profiles").doc(viewEmail);

      addToCur.update({
        pending: firebase.firestore.FieldValue.arrayUnion(viewEmail)
      });
      addCurToEmail.update({
        requests: firebase.firestore.FieldValue.arrayUnion(this.currentUser)
      });
      console.log("added ", viewEmail);
      console.log("current user", this.currentUser);
      // this.$router.go({path: this.$router.path});
      this.$router.push("/");
    },
    //removes user as friend
    remFriend(viewEmail) {
      let remFromCur = db.collection("profiles").doc(this.currentUser);
      let remCurFromEmail = db.collection("profiles").doc(viewEmail);

      remFromCur.update({
        friends: firebase.firestore.FieldValue.arrayRemove(viewEmail)
      });

      remCurFromEmail.update({
        friends: firebase.firestore.FieldValue.arrayRemove(this.currentUser)
      });
      this.$router.push("/");
    }
  }
};
</script>

<style></style>
