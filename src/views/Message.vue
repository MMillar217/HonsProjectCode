<!-- Marc Millar - S1828600 -->
<template>
  <div id="message">
    <div v-if="checkCurRightsBan()">You are banned from this site - contact admin to appeal ban</div>
    <div v-if="!checkCurRightsBan()">
      <div v-if="checkRightsBan()">This user has been banned</div>
      <div v-if="!checkRightsBan()">
        <div v-if="checkCurMsgBan()">You are banned from sending messages</div>
        <div v-if="!checkCurMsgBan()">
          <div v-if="checkMsgBan()">This user has been banned from receiving messages</div>
          <div v-if="!checkMsgBan()">
            <h4>Message</h4>
            <h5>
              Currently chatting to:
              <router-link
                v-bind:to="{
                  name: 'view-profile',
                  params: { user_id: email }
                }"
              >{{ first_name }} {{ last_name }}</router-link>
            </h5>
            <div class="row">
              <div class="col-3">
                <div class="card" style="overflow:auto; height:385px;">
                  <div class="list-group">
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
                        <br />
                        {{ user.bio }}
                        <br />
                        {{ user.gender }}
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <!-- End of friends list -->
              <!-- Messages with this user -->
              <div class="col-9">
                <div v-if="checkBlocked()">Communication Blocked</div>

                <div v-if="!checkBlocked()">
                  <div v-if="!checkFriends()">You are not friends</div>
                  <div v-if="checkFriends()">
                    <div class="card" style="overflow:auto; height:385px;">
                      <div class="card-header">
                        <h4>
                          <router-link
                            v-bind:to="{
                              name: 'view-profile',
                              params: { user_id: email }
                            }"
                          >{{ first_name }} {{ last_name }}</router-link>
                        </h4>
                      </div>
                      <div class="card-body">
                        <div class="msg_history">
                          <div v-if="checkEmpty">
                            <p>
                              You do not have any messages with this user, say
                              hi!
                            </p>
                          </div>
                          <div
                            v-for="message in messages"
                            v-bind:key="message.id"
                            class="incoming_msg"
                          >
                            <div v-if="!checkViolations(message.violations)">
                              <div v-if="!checkSender(message.sender)">
                                <div class="received_msg">
                                  <div class="received_withd_msg">
                                    <p>{{ message.message }}</p>
                                    <span class="time_date">
                                      {{ message.sender }}14:07 |
                                      03/03/2020
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div v-if="checkViolations(message.violations)">
                              <div v-if="!checkSender(message.sender)">
                                <div class="received_msg">
                                  <div class="received_withd_msg">
                                    <p>{{ message.message }}</p>
                                    <span class="time_date">{{ message.sender }} | toxic!</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div v-if="checkSender(message.sender)">
                              <div class="outgoing_msg">
                                <div class="sent_msg">
                                  <p>{{ message.message }}</p>
                                  <span class="time_date">
                                    {{ message.sender }}14:07 |
                                    03/03/2020
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div class="card-footer">
                        <form @submit.prevent="sendMessage()">
                          <input type="text" placeholder="Aa" v-model="sendMsg" />
                          <ul class="right">
                            <li>
                              <button type="submit" class="btn btn-primary">
                                <i class="material-icons">send</i>
                              </button>
                            </li>
                          </ul>
                        </form>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- <form @submit.prevent="sendMessage(sendMsg)">
          <input type="text" placeholder="Aa" v-model="sendMsg"/>
          <ul class="right">
            <button type="submit" class="btn btn-primary">Send</button>
          </ul>
          <button/>
                </form>-->
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
  name: "message",
  data() {
    return {
      user_id: null,
      first_name: null,
      last_name: null,
      gender: null,
      bio: null,
      email: null,
      friends: [],
      pending: [],
      requests: [],
      blocked: [],
      blocked_by: [],
      bans: [],
      curUbans: [],
      isLoggedIn: false,
      currentUser: false,
      users: [],
      sendMsg: "",
      msg: "",
      messages: [],
      violations: []
    };
  },
  //called when the instance is mounted to the app component - used to get access to CDN content
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
  },
  //instance created
  created() {
    //get current user
    if (firebase.auth().currentUser) {
      this.isLoggedIn = true;
      this.currentUser = firebase.auth().currentUser.email;
    }
    //load friends list
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
          //if the logged in user is friends with the user, push to the array
          if (doc.data().friends.includes(this.currentUser)) {
            this.users.push(data);
          }
          //check if the current user is banned
          if (data.id == this.currentUser) {
            this.curUbans = data.bans;
          }
        });
      });
    this.fetchMessages();
  },
  computed: {
    //checks that the message being sent is not empty
    checkEmpty: function() {
      if (this.messages.length == 0 || this.messages == []) {
        return true;
      } else {
        return false;
      }
    }
  },
  methods: {
    //checks who the sender of a message is
    checkSender: function(msg) {
      if (msg == this.currentUser) {
        return true;
      } else {
        return false;
      }
    },
    //check if any of the rendered messages contain any toxicity
    checkViolations: function(violations) {
      if (violations.length >= 1) {
        return true;
      } else {
        return false;
      }
    },
    //check if the current user is blocked by the user they are trying to message
    checkBlocked: function() {
      if (
        this.blocked.includes(this.currentUser) ||
        this.blocked_by.includes(this.currentUser)
      ) {
        return true;
      } else {
        return false;
      }
    },
    //check if the user is friends with the logged in user
    checkFriends: function() {
      if (this.friends.includes(this.currentUser)) {
        return true;
      } else {
        return false;
      }
    },
    //the remaining functions up until checkTox check if the user has any bans
    checkRightsBan: function() {
      if (this.bans.includes("total")) {
        return true;
      } else {
        return false;
      }
    },
    checkCurRightsBan: function() {
      if (this.curUbans.includes("total")) {
        return true;
      } else {
        return false;
      }
    },
    checkMsgBan: function() {
      if (this.bans.includes("messaging")) {
        return true;
      } else {
        return false;
      }
    },
    checkCurMsgBan: function() {
      if (this.curUbans.includes("messaging")) {
        return true;
      } else {
        return false;
      }
    },
    //send message in the text box
    sendMessage() {
      /*threshold is the confidence required for the model to determine a message's
      toxicity is true or false - if lower than threshold, then the result is null */
      const threshold = 0.5;
      let checker = this.sendMsg;
      //load the message into the model
      toxicity.load(threshold).then(model => {
        const sentences = [checker];

        //classify the message
        model.classify(sentences).then(predictions => {
          let tox = [];
          for (var i = 0; i < 7; i++) {
            //if the prediction finds the message to be violating any toxicity rules, this is noted
            if (predictions[i].results[0].match == true) {
              console.log("in violation of: ", predictions[i].label);
              tox.push(predictions[i].label.toString());
            } else {
              console.log("does not violate: ", predictions[i].label);
            }
          }
          console.log(tox);
          this.violations = tox;

          console.log("violations: ", this.violations);
        });
      });

      addToDB(this.sendMsg, this.email, this.currentUser, this.violations);
      //adds the message to the database
      function addToDB(sm, em, cu, vios) {
        db.collection("chat").add({
          message: sm,
          receiver: em,
          sender: cu,
          time_sent: new Date(),
          violations: vios
        });
      }

      // .then(() => {
      //   this.scrollToBottom();
      // });

      this.sendMsg = null;
    },

    //gets all messaged
    fetchMessages() {
      db.collection("chat")
        .orderBy("time_sent", "asc")
        .onSnapshot(querySnapshot => {
          let allMessages = [];
          querySnapshot.forEach(doc => {
            const data = {
              id: doc.id,
              message: doc.data().message,
              receiver: doc.data().receiver,
              sender: doc.data().sender,
              time_sent: doc.data().time_sent,
              violations: doc.data().violations
            };
            //if the current user is the sender or receiver of any messages
            if (
              doc.data().sender == this.currentUser ||
              doc.data().receiver == this.currentUser
            ) {
              //nested if: if the receiver or sender is the user being viewed by the current user
              if (
                doc.data().sender == this.email ||
                doc.data().receiver == this.email
              ) {
                allMessages.push(data);
              }
            }
          });
          this.messages = allMessages;
          //after 1 second of the page being opened, scroll to the bottom of the messaging card
          setTimeout(() => {
            this.scrollToBottom();
          }, 1000);
        });
    },
    scrollToBottom() {
      let box = document.querySelector(".msg_history");
      box.scrollTop = box.scrollHeight;
    }
  },
  //get the details of the user being viewed
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
          });
        });
      });
  }
};
</script>

<style scoped>
.container {
  max-width: 1170px;
  margin: auto;
}
img {
  max-width: 100%;
}
.inbox_people {
  background: #f8f8f8 none repeat scroll 0 0;
  float: left;
  overflow: hidden;
  width: 40%;
  border-right: 1px solid #c4c4c4;
}
.inbox_msg {
  border: 1px solid #c4c4c4;
  clear: both;
  overflow: hidden;
}
.top_spac {
  margin: 20px 0 0;
}

.recent_heading {
  float: left;
  width: 40%;
}

.headind_srch {
  padding: 10px 29px 10px 20px;
  overflow: hidden;
  border-bottom: 1px solid #c4c4c4;
}

.recent_heading h4 {
  color: #05728f;
  font-size: 21px;
  margin: auto;
}
.srch_bar input {
  border: 1px solid #cdcdcd;
  border-width: 0 0 1px 0;
  width: 80%;
  padding: 2px 0 4px 6px;
  background: none;
}
.srch_bar .input-group-addon button {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  padding: 0;
  color: #707070;
  font-size: 18px;
}
.srch_bar .input-group-addon {
  margin: 0 0 0 -27px;
}

.chat_ib h5 {
  font-size: 15px;
  color: #464646;
  margin: 0 0 8px 0;
}
.chat_ib h5 span {
  font-size: 13px;
  float: right;
}
.chat_ib p {
  font-size: 14px;
  color: #989898;
  margin: auto;
}
.chat_img {
  float: left;
  width: 11%;
}
.chat_ib {
  float: left;
  padding: 0 0 0 15px;
  width: 88%;
}

.chat_people {
  overflow: hidden;
  clear: both;
}
.chat_list {
  border-bottom: 1px solid #c4c4c4;
  margin: 0;
  padding: 18px 16px 10px;
}
.inbox_chat {
  height: 550px;
  overflow-y: scroll;
}

.active_chat {
  background: #ebebeb;
}

.incoming_msg_img {
  display: inline-block;
  width: 6%;
}
.received_msg {
  display: inline-block;
  padding: 0 0 0 10px;
  vertical-align: top;
  width: 92%;
}
.received_withd_msg p {
  background: #ebebeb none repeat scroll 0 0;
  border-radius: 3px;
  color: #646464;
  font-size: 14px;
  margin: 0;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.time_date {
  color: #747474;
  display: block;
  font-size: 12px;
  margin: 8px 0 0;
}
.received_withd_msg {
  width: 57%;
}
.mesgs {
  float: left;
  padding: 30px 15px 0 25px;
  width: 60%;
}

.sent_msg p {
  background: #05728f none repeat scroll 0 0;
  border-radius: 3px;
  font-size: 14px;
  margin: 0;
  color: #fff;
  padding: 5px 10px 5px 12px;
  width: 100%;
}
.outgoing_msg {
  overflow: hidden;
  margin: 26px 0 26px;
}
.sent_msg {
  float: right;
  width: 46%;
}
.input_msg_write input {
  background: rgba(0, 0, 0, 0) none repeat scroll 0 0;
  border: medium none;
  color: #4c4c4c;
  font-size: 15px;
  min-height: 48px;
  width: 100%;
}

.type_msg {
  border-top: 1px solid #c4c4c4;
  position: relative;
}
.msg_send_btn {
  background: #05728f none repeat scroll 0 0;
  border: medium none;
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  font-size: 17px;
  height: 33px;
  position: absolute;
  right: 0;
  top: 11px;
  width: 33px;
}
.messaging {
  padding: 0 0 50px 0;
}
.msg_history {
  height: 516px;
  overflow-y: auto;
}
</style>
