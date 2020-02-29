/*
 * Starter Project for Messenger Platform Quick Start Tutorial
 *
 * Remix this as the starting point for following the Messenger Platform
 * quick start tutorial.
 *
 * https://developers.facebook.com/docs/messenger-platform/getting-started/quick-start/
 *
 */

'use strict';


// Imports dependencies and set up http server
const response =  require("./reponse")
const quickReplies = require("./quickReplies")
const
  express = require('express'),
  axios = require('axios'),
  
  app = express() // creates express http server
  
app.use(express.json())

const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;



// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

// Accepts POST requests at /webhook endpoint
app.post('/webhook', (req, res) => {  

  // Parse the request body from the POST
  let body = req.body;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {

    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(function(entry) {

      // Get the webhook event. entry.messaging is an array, but 
      // will only ever contain one event, so we get index 0
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
      
      // Get the sender PSID
      let sender_psid = webhook_event.sender.id;
      console.log('Sender PSID: ' + sender_psid);
      
      // Check if the event is a message or postback and
      // pass the event to the appropriate handler function
      if (webhook_event.message) {
        handleMessage(sender_psid, webhook_event.message);        
      } else if (webhook_event.postback) {
        handlePostback(sender_psid, webhook_event.postback);
      }
        });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');

  } else {
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }

});

// Accepts GET requests at the /webhook endpoint
app.get('/webhook', (req, res) => {
  
  /** UPDATE YOUR VERIFY TOKEN **/
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
  
  // Parse params from the webhook verification request
  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];
    
  // Check if a token and mode were sent
  if (mode && token) {
  
    // Check the mode and token sent are correct
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      
      // Respond with 200 OK and challenge token from the request
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    
    } else {
      // Responds with '403 Forbidden' if verify tokens do not match
      res.sendStatus(403);      
    }
  }
});



// Handles messages events
async function handleMessage(sender_psid, received_message) {
  
  if (received_message.text == "Talk to commeitee"){
    callSendAPI(sender_psid, {"text": "Please leave your message. They will soon get back to you. Ciao :)"})
    callSendAPI(sender_psid, {"attachment": {
                    "type": "image",
                    "payload": {
                        "url": "https://cdn.glitch.com/0894bffb-63f3-4f3b-af65-0acd959582c3%2Frobot.gif?v=1582981704530",
                      }
                  }})
    passThreadControl(sender_psid, process.env.BOT_ID)
    return
  }
  
  let generatedText = ""
  let generatedAttachment 
  
  const greeting = getFirstEntity(received_message.nlp, 'greetings');
  const thanks = getFirstEntity(received_message.nlp, "thanks")
  const bye = getFirstEntity(received_message.nlp, "bye")
  const sentiment = getFirstEntity(received_message.nlp, "sentiment")
  
  if (greeting && greeting.confidence > 0.8) {
    generatedText = generatedText + "Hi there :D. "
  }
  
  if (thanks && thanks.confidence > 0.8){
    generatedText = generatedText + "No problems. "
  }
  
  if (bye && bye.confidence > 0.8){
    generatedText = generatedText + "See you soon. "
  }
  
  Object.keys(response).forEach( (reqPattern => {
    
    if(new RegExp(reqPattern,"i").test(received_message.text)){
      
      if (response[reqPattern].text){
        generatedText = generatedText + response[reqPattern].text + " "
      }
      if (response[reqPattern].attachment){
        generatedAttachment = response[reqPattern].attachment
      }
    }
  })
  )
  
  if(!(generatedText||generatedAttachment)){
    
    console.log(sentiment)
    if(sentiment && sentiment.confidence > 0.6){
      
      switch(sentiment.value){
        case "positive": generatedText = "Hope to see you soon <3";break;
        case "neutral": generatedText = "Alright";break;
        case "negative": generatedText = "Please dont be mean :(. I'm so sorry :(:(";break;
      }
    }else{
      generatedText =  "I dont understand :( I'm retarded :("
    }
  
  }
  
  
  
  
  
  // Sends the response message
  if(generatedText){
    await callSendAPI(sender_psid, {"text": generatedText, "quick_replies":quickReplies})
  }
  if(generatedAttachment){
    await callSendAPI(sender_psid, {"attachment": generatedAttachment, "quick_replies":quickReplies})
  }
  
  
    
  
  console.log(generatedAttachment)
}

// Handles messaging_postbacks events
async function handlePostback(sender_psid, received_postback) {
  let response;
  
  let payload = received_postback.payload;
  
  
  if (payload === "START"){
    takeThreadControl(sender_psid)
    
    console.log(response)
    await callSendAPI( sender_psid, {"text": "Hey I'm Bot :) What can i help you?"})
    await callSendAPI( sender_psid, {"text": "You can ask me questions or use the buttons below :)", 
                                     "quick_replies": quickReplies})
  }
}

// Sends response messages via the Send API
function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response,
    
  }
  
  return (axios({
    url: "https://graph.facebook.com/v2.6/me/messages",
    method: 'post',
    params:{ access_token: PAGE_ACCESS_TOKEN },
    data: request_body,
    headers: {
      "Content-Type": "application/json"
    }
    
  }).catch((error) => {
    if(!error){
      console.log('message sent!')
    } else{
      console.error("Unable to send message:" + error)
    }
  }))
  
}
const takeThreadControl = function(sender_psid){
  axios(
        {
        url: "https://graph.facebook.com/v2.6/me/take_thread_control",
        method: 'post',
        params:{ access_token: PAGE_ACCESS_TOKEN },
        data: {"recipient": {"id": sender_psid}},
        headers: {
          "Content-Type": "application/json"
          }
        })
        .then((res)=>{console.log(res.data)})
        .catch((err)=> {
        console.log(err)
        }
      )
}
const passThreadControl= function(sender_psid, appId){
  axios(
        {
        url: "https://graph.facebook.com/v2.6/me/pass_thread_control",
        method: 'post',
        params:{ access_token: PAGE_ACCESS_TOKEN },
        data: {"recipient": {"id": sender_psid}, "target_app_id": appId},
        headers: {
          "Content-Type": "application/json"
          }
        })
        .then((res)=>{console.log(res.data)})
        .catch((err)=> {
        console.log(err)
        }
      )
}

const getFirstEntity = function(nlp, name){
  return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
}

