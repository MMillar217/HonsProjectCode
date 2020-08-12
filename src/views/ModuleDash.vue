<!-- Marc Millar - S1828600 -->
<template>
  <div id="module-dash">
    <div v-if="isAdmin">
      <div class="row">
        <div class="col-6">
          <div class="card">
            <div class="card-title">
              <h2>Students</h2>
            </div>
            <div class="card-body">
              <div class="list-group">
                <ul class="collection">
                  <li
                    v-for="classMember in classMembers"
                    v-bind:key="classMember.id"
                    class="collection-item"
                  >
                    <router-link
                      v-bind:to="{
                        name: 'view-profile',
                        params: { user_id: classMember.id }
                      }"
                    >
                      {{ classMember.first_name }}
                      {{ classMember.last_name }}
                    </router-link>
                    <p>{{ classMember.email }}</p>
                    <button
                      class="btn btn-danger"
                      type="submit"
                      v-on:click="remStudent(classMember.id)"
                    >Remove from class</button>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="col-6">
          <div class="card">
            <div class="card-title">
              <h2>Add Students</h2>
            </div>
            <div class="card-body">
              <input type="text" v-model="search" placeholder="search..." />
              <div v-for="user in filteredUsers" v-bind:key="user.id">
                <p>
                  <router-link
                    v-bind:to="{
                      name: 'view-profile',
                      params: { user_id: user.id }
                    }"
                  >{{ user.first_name }} {{ user.last_name }}</router-link>
                </p>
                <article>{{ user.email }}</article>
                <button class="btn btn-primary" type="submit" v-on:click="addStudent(user.id)">
                  <i class="material-icons">add</i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="checkRightsBan()">You do not have the right to view the information on this site</div>
    <div v-if="!checkRightsBan()">
      <div v-if="checkBanPost()">You are banned from posting updates</div>
      <div v-if="!checkBanPost()">
        <div class="row">
          <div class="col-12">
            <div class="card">
              <form @submit.prevent="savePost()">
                <div class="card-header">
                  <h4>Share a post to this module</h4>
                </div>
                <div class="card-body">
                  <div class="input-field">
                    <textarea type="text" id="body" v-model="body" />
                    <label class="black-text" for="body">Say something...</label>
                  </div>
                </div>
                <div class="card-footer">
                  <button type="submit" class="btn btn-primary float-right">
                    <i class="material-icons">create</i>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div class="row">
        <div class="col-6">
          <div class="list-group">
            <ul class="collection">
              <li v-for="post in posts" v-bind:key="post.id" class="collection-item">
                <div v-if="checkBlocked(post.user_id)"></div>
                <div v-if="!checkBlocked(post.user_id)">
                  <div v-if="checkViolations(post.violations)">
                    <h5>
                      <router-link
                        v-bind:to="{
                          name: 'view-profile',
                          params: { user_id: post.user_id }
                        }"
                      >{{ post.posted_by }}</router-link>
                    </h5>
                    <h5 style="color: #ff0008;">Warning!</h5>
                    <p>This post violated the following rules:</p>
                    <div v-for="violation in post.violations" v-bind:key="violation.id">
                      <ul class="a">
                        <li>{{ violation }}</li>
                      </ul>
                    </div>
                    <button v-on:click="showMsg(post)" class="btn btn-outline-danger">See Post</button>
                    <hr />
                    <div v-if="isAuthorised(post.user_id) || isAdmin">
                      <button
                        v-on:click="deleteStatus(post.id, post.body)"
                        type="submit"
                        class="btn btn-danger"
                      >Delete</button>
                    </div>
                  </div>
                  <div v-if="!checkViolations(post.violations)">
                    <div v-if="checkMuted(post.body)">
                      <h5>Warning!</h5>
                      <p>Post made by {{ post.posted_by }} contains at least one of your muted words</p>
                      <br />
                      <button v-on:click="showMsg(post)" class="btn btn-outline-danger">See Post</button>
                    </div>
                    <div v-if="!checkMuted(post.body)">
                      <h5>
                        <router-link
                          v-bind:to="{
                          name: 'view-profile',
                          params: { user_id: post.user_id }
                        }"
                        >{{ post.posted_by }}</router-link>
                      </h5>

                      <br />
                      {{ post.body }}
                      <br />
                      <!-- {{timeSince(post.posted.toDate())}} -->
                      {{ post.posted.toDate() }}
                      <hr />
                      <div v-if="isAuthorised(post.user_id) || isAdmin">
                        <button
                          v-on:click="deleteStatus(post.id, post.body)"
                          type="submit"
                          class="btn btn-danger"
                        >Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <div class="col-6">
          <div class="list-group">
            <ul class="collection">
              <li v-for="lecPost in lecPosts" v-bind:key="lecPost.id" class="collection-item">
                <div v-if="checkViolations(lecPost.violations)">
                  <h5>
                    <router-link
                      v-bind:to="{
                        name: 'view-profile',
                        params: { user_id: lecPost.user_id }
                      }"
                    >{{ lecPost.posted_by }}</router-link>
                  </h5>
                  <h5 style="color: #ff0008;">Warning!</h5>
                  <p>This post violated the following rules:</p>
                  <div v-for="violation in lecPost.violations" v-bind:key="violation.id">
                    <ul class="a">
                      <li>{{ violation }}</li>
                    </ul>
                  </div>

                  <button v-on:click="showMsg(lecPost)" class="btn btn-outline-danger">See Post</button>
                  <hr />
                  <div v-if="isAuthorised(lecPost.user_id) || isAdmin">
                    <button
                      v-on:click="deleteStatus(lecPost.id, lecPost.body)"
                      type="submit"
                      class="btn btn-danger"
                    >Delete</button>
                  </div>
                </div>
                <div v-if="!checkViolations(lecPost.violations)">
                  <h5>
                    <router-link
                      v-bind:to="{
                        name: 'view-profile',
                        params: { user_id: lecPost.user_id }
                      }"
                    >{{ lecPost.posted_by }}</router-link>
                  </h5>

                  <br />
                  {{ lecPost.body }}
                  <br />
                  <!-- {{timeSince(post.posted.toDate())}} -->
                  {{ lecPost.posted.toDate() }}
                  <hr />
                  <div v-if="isAuthorised(lecPost.user_id) || isAdmin">
                    <button
                      v-on:click="deleteStatus(lecPost.id, lecPost.body)"
                      type="submit"
                      class="btn btn-danger"
                    >Delete</button>
                  </div>
                </div>
              </li>
            </ul>
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
  name: "module-dash",
  data() {
    return {
      isLoggedIn: false,
      currentUser: false,
      posts: [],
      lecPosts: [],
      body: "",
      currentUName: "",
      curClass: "",
      classMembers: [],
      search: "",
      users: [],
      isAdmin: false,
      curRole: "",
      blocked: [],
      blocked_by: [],
      bans: [],
      muted: []
    };
  },
  //when the instance is mounted to the app
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

    let icons = document.createElement("link");
    icons.setAttribute(
      "stylesheet",
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    document.head.appendChild(icons);
  },
  computed: {
    //filters user list for admin control - list will only contain users who match their search
    filteredUsers: function() {
      return this.users.filter(user => {
        let lookFor = user.first_name + user.last_name;
        return user.email.match(this.search);
      });
    }
  },
  methods: {
    //loads the module's posts into an array
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
              body: doc.data().body,
              posted: doc.data().posted,
              module: doc.data().module
            };

            //getting role
            db.collection("profiles")
              .where("email", "==", data.user_id)
              .get()
              .then(querySnapshot => {
                querySnapshot.forEach(doc => {
                  const dataUser = {
                    id: doc.id,
                    bio: doc.data().bio,
                    email: doc.data().email,
                    first_name: doc.data().first_name,
                    gender: doc.data().gender,
                    last_name: doc.data().last_name,
                    friends: doc.data().friends,
                    pending: doc.data().pending,
                    requests: doc.data().requests,
                    role: doc.data().role,
                    blocked: doc.data().blocked,
                    blocked_by: doc.data().blocked_by
                  };
                  //getting the logged in user's rights based on their role
                  if (
                    data.module == this.$route.params.class_id &&
                    dataUser.role == "lecturer"
                  ) {
                    this.lecPosts.push(data);
                    console.log(this.lecPosts);
                  }
                  if (
                    data.module == this.$route.params.class_id &&
                    dataUser.role != "lecturer"
                  ) {
                    //users can't see posts from people they are blocked by - or people they have blocked
                    if (
                      !dataUser.blocked.includes(data.user_id) ||
                      !dataUser.blocked_by.includes(data.user_id)
                    ) {
                      this.posts.push(data);
                    }
                  }
                });
              });
          });
        });
    },
    //add student to class
    addStudent(studentId) {
      let classId = this.curClass;
      let addStudentToClass = db.collection("classes").doc(classId);
      let addClassToStudent = db.collection("profiles").doc(studentId);
      addStudentToClass.update({
        class_members: firebase.firestore.FieldValue.arrayUnion(studentId)
      });
      addClassToStudent.update({
        classes: firebase.firestore.FieldValue.arrayUnion(classId)
      });
      //alert
      Swal.fire({
        icon: "success",
        title: "student added"
      });
    },
    //remove student from class
    remStudent(studentId) {
      console.log("called rem student ", studentId);
      let classId = this.curClass;
      let remStudentFromClass = db.collection("classes").doc(classId);
      let remClassFromStudent = db.collection("profiles").doc(studentId);
      remStudentFromClass.update({
        class_members: firebase.firestore.FieldValue.arrayRemove(studentId)
      });
      remClassFromStudent.update({
        classes: firebase.firestore.FieldValue.arrayRemove(classId)
      });
      //alert
      Swal.fire({
        icon: "success",
        title: "Student removed"
      });
    },
    //gets the profiles
    getClassMembers() {
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
            //if the user belongs to the particular module being viewed
            if (
              doc.data().classes.includes(this.curClass) &&
              data.role == "student"
            ) {
              this.classMembers.push(data);
            } else if (data.role == "student") {
              this.users.push(data);
            }
          });
        });
      console.log("users ", this.users);
    },
    //checks if the user is an admin
    checkAdmin() {
      if (this.curRole === "admin") {
        this.isAdmin = true;
      } else {
        this.isAdmin = false;
      }
    },
    //checks for muted words in post
    checkMuted: function(post) {
      let words = this.muted;
      let sep = post.split(" ");

      //loops through each word in the post to determine if the post contains any of the user's muted words
      for (let i = 0; i < sep.length; i++) {
        if (words.includes(sep[i])) {
          return true;
        }
      }
      return false;
    },
    savePost() {
      const threshold = 0.5;
      toxicity.load(threshold).then(model => {
        const sentences = [this.body];
        //classify post - checks the toxicity
        model.classify(sentences).then(predictions => {
          let tox = [];
          for (var i = 0; i < 7; i++) {
            //if the post contains toxicity, this is noted
            if (predictions[i].results[0].match == true) {
              tox.push(predictions[i].label.toString());
            }
          }
          makePost(
            this.body,
            this.currentUName,
            this.currentUser,
            this.curClass
          );
          //saves the post to the database
          function makePost(bod, curUName, cu, cc) {
            db.collection("posts")
              .add({
                body: bod,
                posted: new Date(),
                posted_by: curUName,
                user_id: cu,
                violations: tox,
                module: cc
              })
              .then(
                Swal.fire({
                  icon: "success",
                  title: "Your post has been submitted"
                })
              )
              .catch(error => console.log(error));
          }
        });
      });
    },

    //any offensive posts are hidden - this is used to show an offensive post if the user clicks 'view post'
    showMsg(post) {
      // alert(`${post.title}\n${post.body}\nposted by: ${post.posted_by}`);
      // Swal.fire(post.title, post.body, "warning");
      Swal.fire({
        icon: "warning",
        title: post.title,
        text: post.body,
        footer: "Posted by: " + post.posted_by
      });
    },
    //checks if the post belongs to the user - if so then they will be allowed to delete it
    isAuthorised: function(id) {
      if (id == this.currentUser) {
        return true;
      } else {
        return false;
      }
    },
    //checks if the user is blocked by anyone or has anyone blocked - stops each other from seeing posts
    checkBlocked: function(user_id) {
      if (this.blocked.includes(user_id) || this.blocked_by.includes(user_id)) {
        return true;
      } else {
        return false;
      }
    },
    //check if post contains violations - if it does then it is displayed with a warning
    checkViolations: function(violations) {
      if (violations.length >= 1) {
        return true;
      } else {
        return false;
      }
    },
    //check if user is banned from posting
    checkBanPost: function() {
      if (this.bans.includes("posting")) {
        return true;
      } else {
        return false;
      }
    },
    //check if the user is banned from site
    checkRightsBan: function() {
      if (this.bans.includes("total")) {
        return true;
      } else {
        return false;
      }
    },
    //deletes posts
    deleteStatus(id, body) {
      db.collection("posts")
        .where("body", "==", body)
        .get()
        .then(querySnapshot => {
          querySnapshot.forEach(doc => {
            doc.ref.delete();
            alert(`status deleted ${id}`);
            console.log("hi");
            this.$router.go({ path: this.$router.path });
            // this.$router.push("/");
          });
        });
    },
    //get logged in user's details
    getCurDetails() {
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
              classes: doc.data().classes,
              role: doc.data().role,
              blocked: doc.data().blocked,
              blocked_by: doc.data().blocked_by,
              bans: doc.data().bans,
              muted: doc.data().muted
            };
            this.curRole = data.role;
            this.blocked = data.blocked;
            this.blocked_by = data.blocked_by;
            this.bans = data.bans;
            this.muted = data.muted;
            if (this.curRole === "admin" && this.isLoggedIn == true) {
              this.isAdmin = true;
            } else {
              this.isAdmin = false;
            }
          });
        });
    }
  },
  //instance of component is created
  created() {
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }
    this.getCurDetails();
    this.getPosts();

    this.curClass = this.$route.params.class_id;
    this.getClassMembers();

    //gets current user's name
    db.collection("profiles")
      .where("email", "==", this.currentUser)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(doc => {
          console.log(
            doc.id,
            " => ",
            doc.data().first_name + " " + doc.data().last_name
          );

          this.currentUName =
            doc.data().first_name + " " + doc.data().last_name;
          console.log("current: ", this.currentUName);
        });
      })
      .catch(function(err) {
        console.log("Error getting docs: ", err);
      });
    //
  }
};
</script>

<style></style>
