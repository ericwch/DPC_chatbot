module.exports = 

  {

    "\\b(membership|join|member|sign up|form|joining|signing up|register)": { "text":'You can always sign up in our events. We currently do not support online sign up unfortunately.'},
    "\\b(membership|how much|fee)": { "text": "The joinning fee is 5 dollars per semester."},
    "\\b(this club|info)": {"text": "We organise workshops and causal meeting for art enthusiast."},
    "\\b(place|venue|where)": {"text": "for workshops and meetups they usually take place in old arts or art lab in union house."},
    "\\b(timetable|schedule|time|when)": {
                  "text":"Here's the 2020 sem 1 timetable. And we will also post the time and details on the facebook page before the events.",
                  "attachment": {
                    "type": "template",
                    "payload": {
                      "template_type": "generic",
                      "elements": [{
                        "image_url": "https://cdn.glitch.com/0894bffb-63f3-4f3b-af65-0acd959582c3%2FDPC_timetable.jpg?v=1582870104467",
                        "title": "2020 Sem 1 timetable"
                      }]
                    }
                  }
                },
  "\\b(bring|materials)": {"text": "We will provide paint and other basic stuff. But you can always bring your own gears. "}
  
  }


