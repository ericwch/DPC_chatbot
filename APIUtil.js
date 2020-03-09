const axios = require("axios");
const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;

module.exports = {
  callSendAPI: function(sender_psid, response) {
    // Construct the message body
    let request_body = {
      recipient: {
        id: sender_psid
      },
      message: response
    };

    return axios({
      url: "https://graph.facebook.com/v2.6/me/messages",
      method: "post",
      params: { access_token: PAGE_ACCESS_TOKEN },
      data: request_body,
      headers: {
        "Content-Type": "application/json"
      }
    }).catch(error => {
      if (!error) {
        console.log("message sent!");
      } else {
        console.error("Unable to send message:" + error);
      }
    });
  },

  //change thread control to primary app(chatbot)
  takeThreadControl: function(sender_psid) {
    axios({
      url: "https://graph.facebook.com/v2.6/me/take_thread_control",
      method: "post",
      params: { access_token: PAGE_ACCESS_TOKEN },
      data: { recipient: { id: sender_psid } },
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        console.log(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  },

  //change thread control to other app
  passThreadControl: function(sender_psid, appId) {
    axios({
      url: "https://graph.facebook.com/v2.6/me/pass_thread_control",
      method: "post",
      params: { access_token: PAGE_ACCESS_TOKEN },
      data: { recipient: { id: sender_psid }, target_app_id: appId },
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then(res => {
        console.log(res.data);
        console.log("passed control");
      })
      .catch(err => {
        console.log(err);
      });
  }
};
