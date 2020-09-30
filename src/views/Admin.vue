<!-- Marc Millar - S1828600 -->
<template>
  <div id="admin">
    <div class="row">
      <div class="card w-100">
        <div class="card-title">
          <h4>Create Class</h4>
        </div>
        <form @submit.prevent="createClass()">
          <div class="card-body">
            <div class="input-field">
              <input type="text" id="className" v-model="className" />
              <label class="black-text" for="className">Class Name</label>
            </div>
            <div class="input-field">
              <input type="text" id="level" v-model="level" />
              <label class="black-text" for="level">Level</label>
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
    <div class="row">
      <div class="card w-100">
        <div class="card-title">
          <h4>Classes</h4>
        </div>
        <div class="card-body">
          <input type="text" v-model="search" placeholder="find classes" />
          <div v-for="aClass in filteredClasses" v-bind:key="aClass.id">
            <router-link
              v-bind:to="{
                name: 'module-dash',
                params: { class_id: aClass.id }
              }"
            >
              <h5>{{ aClass.class_name }}</h5>
            </router-link>
          </div>
        </div>
      </div>
    </div>
    <!-- list of all users -->
    <div class="row">
      <div class="card w-100">
        <div class="card-title">Reports</div>
        <div class="card-body">
          <button class="collapsible" type="button">Reports and Banned users</button>
          <div class="content">
            <div class="row">
              <div class="col-6">
                <button class="collapsible" type="button">Reports</button>
                <div class="content">
                  <button class="collapsible" type="button">Unresolved Reports</button>
                  <div class="content">
                    <div class="col-12">
                      <ul class="collection">
                        <li
                          v-for="unresReport in unresReports"
                          v-bind:key="unresReport.id"
                          class="collection-item"
                        >
                          <p>Report Made By: {{ unresReport.report_by }}</p>
                          <p>Reporting: {{ unresReport.reporting }}</p>
                          <p>Report Description: {{ unresReport.report_reason }}</p>
                          <p>Type: {{ unresReport.report_type }}</p>
                          <!-- <p>Date of Report: {{ unresReport.report_made }}</p> -->
                          <button
                            v-on:click="resolveReport(unresReport.id)"
                            class="btn btn-outline-success"
                          >Resolve Report</button>
                          <button
                            v-on:click="banPost(unresReport.reporting)"
                            class="btn btn-outline-primary"
                          >Ban From Posting</button>
                          <button
                            v-on:click="banMsg(unresReport.reporting)"
                            class="btn btn-outline-primary"
                          >Ban From Messaging</button>
                          <button
                            v-on:click="banReq(unresReport.reporting)"
                            class="btn btn-outline-primary"
                          >Ban From Friend Requests</button>
                          <button
                            v-on:click="remRights(unresReport.reporting)"
                            class="btn btn-outline-danger"
                          >Remove All Rights</button>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <button class="collapsible" type="button">Resolved Reports</button>
                  <div class="content">
                    <div class="col-12">
                      <ul class="collection">
                        <li
                          v-for="resReport in resReports"
                          v-bind:key="resReport.id"
                          class="collection-item"
                        >
                          <p>Report Made By: {{ resReport.report_by }}</p>
                          <p>Reporting: {{ resReport.reporting }}</p>
                          <p>Report Description: {{ resReport.report_reason }}</p>
                          <p>Type: {{ resReport.report_type }}</p>
                          <!-- <p>Date of Report: {{ resReport.report_made }}</p> -->
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <button class="collapsible" type="button">Restricted Users</button>
                <div class="content">
                  <div class="col-12">
                    <ul class="collection">
                      <li v-for="user in users" v-bind:key="user.id" class="collection-item">
                        <router-link
                          v-bind:to="{
                            name: 'view-profile',
                            params: { user_id: user.id }
                          }"
                        >
                          {{ user.first_name }}
                          {{ user.last_name }}
                        </router-link>
                        <p>Restrictions:</p>
                        <div v-for="ban in user.bans" v-bind:key="ban.id">
                          <ul class="a">
                            <li>{{ ban }}</li>
                          </ul>
                        </div>
                      </li>
                    </ul>
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
import firebase from "firebase";
import db from "../components/firebaseInit";

export default {
  name: "admin",
  data() {
    return {
      isLoggedIn: false,
      currentUser: false,
      className: "",
      level: "",
      aClasses: [],
      search: "",
      resReports: [],
      unresReports: [],
      users: []
    };
  },
  //called when an instance of the component is created
  created() {
    //check user is signed in
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }
    //get the details required for this page
    this.getClasses();
    this.getReports();
    this.getUsers();
  },
  //called when the instance is mounted to the app router
  mounted() {
    //allows access to SweetAlert2
    let alerts = document.createElement("script");
    alerts.setAttribute("src", "https://cdn.jsdelivr.net/npm/sweetalert2@9");
    document.head.appendChild(alerts);

    //allows access to the materialize icons
    let icons = document.createElement("link");
    icons.setAttribute(
      "stylesheet",
      "https://fonts.googleapis.com/icon?family=Material+Icons"
    );
    document.head.appendChild(icons);

    //for the collapsible elements within the web app - used in viewing the reports
    var coll = document.getElementsByClassName("collapsible");
    var i;
    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
          content.style.display = "none";
        } else {
          content.style.display = "block";
        }
      });
    }
  },
  computed: {
    //filters through all the classes in the db using the search
    filteredClasses: function() {
      return this.aClasses.filter(aClass => {
        let lookFor = aClass.class_name;
        return aClass.class_name.match(this.search);
      });
    }
  },
  methods: {
    //on-click: Creates a class using the details entered in the form
    createClass: function() {
      //add these details to the classes collection
      db.collection("classes").add({
        class_name: this.className,
        class_lecturers: [],
        class_members: [],
        level: this.level
      });
      //clear the form fields
      this.className = null;
      this.level = null;
    },
    //on-click: bans the reported user from posting statuses
    banPost(email) {
      let ban = "posting";
      //updates the reported user's document with the intended 'ban'
      let banPosts = db.collection("profiles").doc(email);
      banPosts.update({
        bans: firebase.firestore.FieldValue.arrayUnion(ban)
      });
      //alert user the process is complete
      Swal.fire({
        icon: "success",
        title: "User is banned from " + ban
      });
    },
    //on-click: bans the reported user from sending or receiving messages
    banMsg(email) {
      let ban = "messaging";
      //updates the reported user's document with the intended 'ban'
      let banPosts = db.collection("profiles").doc(email);
      banPosts.update({
        bans: firebase.firestore.FieldValue.arrayUnion(ban)
      });
      //alert user the process is complete
      Swal.fire({
        icon: "success",
        title: "User is banned from " + ban
      });
    },
    //on-click: bans the reported user from sending friend requests
    banReq(email) {
      let ban = "making friend requests";
      //updates the reported user's document with the intended 'ban'
      let banPosts = db.collection("profiles").doc(email);
      banPosts.update({
        bans: firebase.firestore.FieldValue.arrayUnion(ban)
      });
      //alert user the process is complete
      Swal.fire({
        icon: "success",
        title: "User is banned from " + ban
      });
    },
    //on-click: bans the reported user from all features on the site
    remRights(email) {
      let ban = "total";
      //updates the reported user's document with the intended 'ban'
      let banPosts = db.collection("profiles").doc(email);
      banPosts.update({
        bans: firebase.firestore.FieldValue.arrayUnion(ban)
      });
      //alert user the process is complete
      Swal.fire({
        icon: "success",
        title: "User's rights removed"
      });
    },
    //on-click: resolves the report
    resolveReport(id) {
      //marks the 'resolved' field is true for this report
      let banPosts = db.collection("reports").doc(id);
      banPosts.update({
        resolved: true
      });
      //alert user the process is complete
      Swal.fire({
        icon: "success",
        title: "Resolved"
      });
    },
    //loads all the reports from the db ordered by date
    getReports() {
      db.collection("reports")
        .orderBy("report_made", "desc")
        .get()
        .then(querySnapshot => {
          let allReports = [];
          querySnapshot.forEach(doc => {
            const data = {
              id: doc.id,
              report_by: doc.data().report_by,
              reporting: doc.data().reporting,
              report_reason: doc.data().report_reason,
              report_type: doc.data().report_type,
              resolved: doc.data().resolved,
              report_made: doc.data().report_made
            };
            //push the report to the appropriate array
            if (data.resolved == true) {
              this.resReports.push(data);
            } else {
              this.unresReports.push(data);
            }
          });
        });
    },
    //loads all the classes and their details from the db - alphabetically
    getClasses() {
      db.collection("classes")
        .orderBy("class_name", "asc")
        .onSnapshot(querySnapshot => {
          let allClasses = [];
          querySnapshot.forEach(doc => {
            const data = {
              id: doc.id,
              class_name: doc.data().class_name,
              class_lecturers: doc.data().class_lecturers,
              class_members: doc.data().class_members,
              level: doc.data().level
            };
            allClasses.push(data);
          });
          //puts all the classes data into the 'aClasses' array
          this.aClasses = allClasses;
        });
    },
    //gets the users in each class
    getUsers() {
      db.collection("profiles")
        .get()
        .then(querySnapshot => {
          let bannedUsers = [];
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
              bans: doc.data().bans
            };
            //if the user is banned from any using any features within the app, they are added to the banned list
            if (data.bans.length > 0) {
              bannedUsers.push(data);
            }
          });
          this.users = bannedUsers;
          console.log(this.users);
        });
    }
  }
};
</script>

<style scoped>
.collapsible {
  background-color: #777;
  color: white;
  cursor: pointer;
  padding: 18px;
  width: 100%;
  border: none;
  text-align: left;
  outline: none;
  font-size: 15px;
}
.active,
.collapsible:hover {
  background-color: #555;
}
.collapsible:after {
  content: "\002B";
  color: white;
  font-weight: bold;
  float: right;
  margin-left: 5px;
}
.active:after {
  content: "\2212";
}
.content {
  padding: 0 18px;
  display: none;
  overflow: hidden;
  background-color: #f1f1f1;
}
</style>
