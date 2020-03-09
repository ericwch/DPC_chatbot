/* 
09/03/2020
Author: Eric Wong 
Email: bbbaba1997@gmail.com
Description: 

    Chatbot for Unimelb Drawing and Painting Club facebook page. The chatbot uses
    regex to identify keywords and the facebook implemented nlp to identify meaning 
    in the recieved message. Concat the corresponding responses for the identified keywords or 
    meanings and send it to the client.
    
    response.js - an object of regex of keywords and their corresponding response text/attachment
    quickReplies.js - Define quickReplies buttons sent with each response. See SendAPI doc
    payloadHandler.js - Payload enums and handler functions of each payload
    nlpUtil.js - 
          nlp entities and velue enums
          util functions for handling the nlp field in the recieved message. See facebook nlp doc
    
    *The handling of how to response to payloads is done in the corresonding payloadHandler function.
    The handling of how to response to keywords or meaning is done in function handleMessage() below
    
*/

"use strict";

// Imports dependencies and set up http server
const APIUtil = require("./APIUtil");
const response = require("./response");
const quickReplies = require("./quickReplies");
const nlpUtil = require("./nlpUtil");
const payloadHandler = require("./payloadHandler");
const express = require("express");

const app = express(); // creates express http server

app.use(express.json());

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === "page") {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {
      // Get the webhook event. entry.messaging is an array, but
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);

      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log("Sender PSID: " + sender_psid);

      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
    });

    // Return a '200 OK' response to all events
    res.status(200).send("EVENT_RECEIVED");
  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
});

// Accepts GET requests at the /webhook endpoint
app.get("/webhook", (req, res) => {
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;

  // Parse params from the webhook verification request
  let mode = req.query["hub.mode"];
  let token = req.query["hub.verify_token"];
  let challenge = req.query["hub.challenge"];

  // Check if a token and mode were sent
  if (mode && token) {
    // Check the mode and token sent are correct
    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      // Respond with 200 OK and challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      res.status(200).send(challenge);
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);
    }
  }
});

// Handles messages events
async function handleMessage(sender_psid, received_message) {
  

  // When receive the payload "TO_MANUAL", pass control to inbox and terminate the handle function
  if (
    received_message.quick_reply &&
    received_message.quick_reply.payload == payloadHandler.payloads.TO_MANUAL
  ) {
    payloadHandler.toManualHandler(sender_psid);
    return;
  }

    
  // The following code handles nlp and keyword matching
  let generatedRes = { text: "", attachment: new Array() };
  let nlpEntites = nlpUtil.entities;
  
  
  // handle greetings
  if (nlpUtil.checkEntity(received_message.nlp, nlpEntites.GREETINGS, 0.8)) {
    generatedRes.text = generatedRes.text + "Hi there :D ";
  }

  // handle keyword matching with regex
  Object.keys(response).forEach(reqPattern => {
    if (new RegExp(reqPattern, "i").test(received_message.text)) {
      generatedRes.text = generatedRes.text + response[reqPattern].text + " ";
      
      // if the corresponding response has an attachement
      if (response[reqPattern].attachment){
        generatedRes.attachment.push(response[reqPattern].attachment);
      }
      
    }
  });

  // handle thanks
  if (nlpUtil.checkEntity(received_message.nlp, nlpEntites.THANKS, 0.8)) {
    generatedRes.text = generatedRes.text + "No problems. ";
  }

  //handle bye
  if (nlpUtil.checkEntity(received_message.nlp, nlpEntites.BYE, 0.8)) {
    generatedRes.text = generatedRes.text + "See you soon. ";
  }

  // When non of the above match the recieved message
  if (!(generatedRes.text || generatedRes.attachment)) {
    //check sentiment
    if (nlpUtil.checkEntity(received_message.nlp, nlpEntites.SENTIMENT, 0.6)) {
      let sentiment = nlpUtil.getFirstEntity(
        received_message.nlp,
        nlpEntites.SENTIMENT
      );
      let sentimentValues = nlpUtil.values.sentiment;

      if (sentiment.value == sentimentValues.POSITIVE) {
        generatedRes.text = generatedRes.text + "Hope to see you soon <3";
      } else if (sentiment.value == sentimentValues.NEGATIVE) {
        generatedRes.text =
          generatedRes.text + "I'm sorry :( plz dont be mean :(";
      } else if (sentiment.value == sentimentValues.NEUTRAL) {
        generatedRes.text = generatedRes.text + "Alright";
      }
    } else {
      generatedRes.text = "I dont understand :( I'm retarded :(";
    }
  }

  // Sends the concated response message
  if (generatedRes.text) {
    await APIUtil.callSendAPI(sender_psid, {
      text: generatedRes.text,
      quick_replies: quickReplies
    });
  }
  
  // Sends the response attachment
  if (generatedRes.attachment) {
    generatedRes.attachment.forEach( async attachment => {
      await APIUtil.callSendAPI(sender_psid, {
      attachment: attachment,
      quick_replies: quickReplies
    })
      
    })
    
  }
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;

  let payload = received_postback.payload;
  let payloadValues = payloadHandler.payloads;

  if (payload == payloadValues.START) {
    payloadHandler.startHandler(sender_psid);
    return;
  }
}
