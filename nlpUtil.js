//ENUMS and helper functions for nlp

module.exports = {
  entities: {
    GREETINGS: "greetings",
    THANKS: "thanks",
    SENTIMENT: "sentiment",

    BYE: "bye"
  },

  values: {
    sentiment: {
      POSITIVE: "positive",
      NEGATIVE: "negative",
      NEUTRAL: "neutral"
    }
  },

  getFirstEntity: function(nlp, name) {
    return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
  },

  checkEntity: function(nlp, name, confidence) {
    let entity = this.getFirstEntity(nlp, name);
    if (entity && entity.confidence > confidence) {
      return true;
    }
  }
};
