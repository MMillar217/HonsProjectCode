<!-- Marc Millar - S1828600 -->
<template>
  <div id="login">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h3>Login</h3>
            </div>
            <form>
              <div class="card-body">
                <div class="input-field">
                  <input type="text" id="email" v-model="email" />
                  <label for="email">Email</label>
                </div>
                <div class="input-field">
                  <input type="password" id="password" v-model="password" />
                  <label for="password">Password</label>
                </div>
              </div>
              <div class="card-footer">
                <button v-on:click="login" class="btn btn-success">Login</button>
                <div class="float-right">
                  Don't have an account?
                  <router-link to="/register">Register</router-link>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">Site Information</div>
            <div class="card-body">info about the site and project</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import firebase from "firebase";
export default {
  name: "login",
  data() {
    return {
      email: "",
      password: ""
    };
  },
  methods: {
    //calls the login function to authorise a user based on their details - uses firebase authentication
    login: function(e) {
      firebase
        .auth()
        .signInWithEmailAndPassword(this.email, this.password)
        .then(
          user => {
            alert(`${this.email} logged in`);
            this.$router.go({ path: this.$router.path });
          },
          err => {
            //message tells user why they have not been logged in correctly
            alert(err.message);
          }
        );
      e.preventDefault();
    }
  }
};
</script>

<style>
</style>
