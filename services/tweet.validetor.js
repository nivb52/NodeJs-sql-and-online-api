const Joi = require("@hapi/joi");
const bools = ["TRUE", "true", "FALSE", "false"];
const logger = (...txt) => console.log(...txt);

// Schema:
const schema = Joi.object().keys({
  comment: Joi.string()
    .required()
    .pattern(new RegExp("^[a-zA-Z0-9]{3,255}$")),
  author: Joi.string()
    .optional()
    .allow("")
    .strip()
    .max(255),
  tweet_account: Joi.string()
    .optional()
    .allow("")
    .email({ tlds: { allow: ["com", "il", "co.il"] } }),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date()
    .min("now")
    .optional()
});


module.exports =  schema ;
