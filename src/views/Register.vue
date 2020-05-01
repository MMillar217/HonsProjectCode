<!-- Marc Millar - S1828600 -->
<template>
  <div id="register">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">Register</div>
            <div class="card-body">
              <form>
                <div class="input-field">
                  <input type="text" id="email" v-model="email" />
                  <label class="black-text" for="email">Email</label>
                </div>
                <div class="input-field">
                  <input type="password" id="password" v-model="password" />
                  <label class="black-text" for="password">Password</label>
                </div>
                <div class="input-field">
                  <input type="text" id="fname" v-model="first_name" />
                  <label class="black-text" for="fname">First Name</label>
                </div>
                <div class="input-field">
                  <input type="text" id="lname" v-model="last_name" />
                  <label class="black-text" for="lname">Last Name</label>
                </div>
                <div class="input-field">
                  <input type="text" id="gender" v-model="gender" />
                  <label class="black-text" for="gender">Gender</label>
                </div>
                <!-- <select name="gender">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>-->

                <button
                  v-on:click="register"
                  class="btn btn-large green lighten-4 black-text"
                >Register</button>
              </form>
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
  name: "register",
  data() {
    return {
      email: "",
      password: "",
      //for creating profile
      first_name: "",
      last_name: "",
      gender: "",
      bio: "",
      friends: [],
      pending: [],
      requests: []
    };
  },
  methods: {
    register: function(e) {
      firebase
        .auth()
        .createUserWithEmailAndPassword(this.email.toLowerCase(), this.password)
        .then(
          user => {
            //call method to add a profile to the database for the new user with default values
            //then when the page loads, take the user to the edit profile page (createProfile)
            db.collection("profiles")
              .doc(this.email.toLowerCase())
              .set({
                bio: "about me",
                email: this.email.toLowerCase(),
                first_name: this.first_name,
                gender: this.gender,
                last_name: this.last_name,
                friends: [],
                pending: [],
                requests: [],
                classes: [],
                blocked: [],
                blocked_by: [],
                bans: [],
                muted: [],
                role: "student"
              })
              .then(
                alert(`Account created for ${this.email}`),
                this.$router.go({ path: this.$router.path })
              )
              .catch(error => console.log(error));
          },
          err => {
            alert(err.message);
          }
        );

      e.preventDefault();
    }
  }
};
</script>

<style></style>
