<!-- Marc Millar - S1828600 -->
<template>
  <div id="edit-profile">
    <div v-if="isAdmin || isYou(email)">
      <div class="col-12">
        <div class="card w-100">
          <form @submit.prevent="detsEdit(email)">
            <div class="card-header">
              <h4>{{ first_name }} {{ last_name }}</h4>
            </div>
            <div class="card-body">
              <div class="input-field">
                <input type="text" id="first_name" disabled="true" v-model="first_name" />
                <label class="black-text" for="first_name"></label>
              </div>
              <div class="input-field">
                <input type="text" id="last_name" disabled="true" v-model="last_name" />
                <label class="black-text" for="last_name"></label>
              </div>
              <div class="input-field">
                <input type="text" id="email" disabled="true" v-model="email" />
                <label class="black-text" for="email"></label>
              </div>
              <div class="input-field">
                <input type="text" id="gender" v-model="gender" />
                <label class="black-text" for="gender"></label>
              </div>
              <div class="input-field">
                <textarea type="text" id="bio" v-model="bio" />
                <label class="black-text" for="bio"></label>
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

    <div v-if="isAdmin">
      <button class="btn btn-warning right" v-on:click="changeRole(email)">Change Role</button>
    </div>
    <div v-if="!isYou(email) && !isAdmin">not your profile</div>
  </div>
</template>

<script>
import firebase from "firebase";
import db from "../components/firebaseInit";
export default {
  name: "edit-profile",
  data() {
    return {
      selected: "",
      isLoggedIn: false,
      currentUser: false,
      isAdmin: false,
      user_id: "",
      first_name: "",
      last_name: "",
      gender: "",
      bio: "",
      email: "",
      bans: "",
      muted: []
    };
  },
  //called when an instance of the component is created
  created() {
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }
    this.getCurDetails();
  },
  //called when the instance is mounted to the app
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
  methods: {
    //sends any changes made to the database
    detsEdit(email) {
      //validation
      if (this.bio == "" || this.gender == "") {
        Swal.fire({
          title: "Failed",
          icon: "error",
          text: "Please complete all fields"
        }).then(val => {
          return;
        });
      } else {
        //find the appropriate documents
        let updateBio = db.collection("profiles").doc(email);
        let updateGender = db.collection("profiles").doc(email);

        //updates the fields
        updateBio.update({
          bio: this.bio
        });
        updateGender.update({
          gender: this.gender
        });
        Swal.fire({
          title: "Success!",
          icon: "success",
          text: "Details updated"
        });
        this.$router.push("/" + email);
      }
    },
    //sweet alert 2 - allows the admin to change the user's role
    changeRole(email) {
      Swal.fire({
        title: "Change User's Role",
        input: "select",
        showCancelButton: true,
        inputOptions: {
          student: "Student",
          lecturer: "Lecturer",
          admin: "Admin"
        }
      }).then(answer => {
        if (answer.value) {
          let updateRole = db.collection("profiles").doc(email);
          updateRole.update({
            role: answer.value
          });
          Swal.fire(
            "Role Updated",
            this.first_name + " " + this.last_name + "'s role has been updated",
            "success"
          );
        } else {
          Swal.fire("Cancelled", "No changes to the role made", "info");
        }
      });
    },
    //checks that the profile being edited belongs to the current user
    isYou: function(email) {
      if (email == this.currentUser) {
        return true;
      } else {
        return false;
      }
    },
    //gets the details of the current user
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
            //gives admin the right to edit any profile
            if (this.curRole === "admin" && this.isLoggedIn == true) {
              this.isAdmin = true;
            } else {
              this.isAdmin = false;
            }
          });
        });
    }
  },
  //gets the details of the profile being edited
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
            vm.bans = doc.data().bans;
            vm.muted = doc.data().muted;
          });
        });
      });
  }
};
</script>

<style></style>
