const Joi = require('@hapi/joi');

// Schema:
const schema = Joi.object().keys({
  comment: Joi.string()
    .required(),
    // .pattern(new RegExp('^[a-zA-Z0-9]{3,255}$')),
  author: Joi.string()
    .optional()
    .allow('')
    .strip()
    .max(255),
  tweet_account: Joi.string()
    .optional()
    .allow('')
    .email({ tlds: { allow: ['com', 'il', 'co.il'] } }),
  isPending: Joi.valid(0)
    .valid(1)
    .valid(false)
    .valid(true)
    .default(1)
    .required(),
  createdAt: Joi.date().required(),
  updatedAt: Joi.date()
    .min('now')
    .optional()
});

module.exports = schema;
