DPC facebook chatbot

Chatbot for Unimelb Drawing and Painting Club facebook page. 

The chatbot uses regex to identify keywords and the facebook implemented nlp to identify meaning
in the recieved message. Concat the corresponding responses for the identified keywords or
meanings and send it to the client.

response.js - an object of regex of keywords and their corresponding response text/attachment
quickReplies.js - Define quickReplies buttons sent with each response. See SendAPI doc
payloadHandler.js - Payload enums and handler functions of each payload
nlpUtil.js - 
          nlp entities and velue enums
          util functions for handling the nlp field in the recieved message. See facebook nlp doc
    

