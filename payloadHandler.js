const quickReplies = require("./quickReplies");
const APIUtil = require("./APIUtil");

//ENUMS and handeler functions for each payload

// handle payload
module.exports = {
  payloads: { START: "START", TO_MANUAL: "TO_MANUAL" },
  toManualHandler: async function(sender_psid) {
    let resText =
      "Please leave your message. They will soon get back to you. Ciao :)";
    let resAttach = {
      type: "image",
      payload: {
        url:
          "https://cdn.glitch.com/0894bffb-63f3-4f3b-af65-0acd959582c3%2Frobot.gif?v=1582981704530"
      }
    };

    APIUtil.callSendAPI(sender_psid, { text: resText });
    APIUtil.callSendAPI(sender_psid, { attachment: resAttach });

    // pass thread control to chatbot when a new conversation starts
    APIUtil.passThreadControl(sender_psid, process.env.INBOX_ID);
    return;
  },

  startHandler: async function(sender_psid) {
    let resText = [
      "Hey I'm Bot :) What can i help you?",
      "You can ask me questions or use the buttons below :)"
    ];
    APIUtil.takeThreadControl(sender_psid);
    await APIUtil.callSendAPI(sender_psid, {
      text: resText[0]
    });
    await APIUtil.callSendAPI(sender_psid, {
      text: resText[1],
      quick_replies: quickReplies
    });
  }
};
