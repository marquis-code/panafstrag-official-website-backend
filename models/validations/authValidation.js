const Joi = require("@hapi/joi");

const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(3).max(64).required(),
  lastName: Joi.string().trim().min(3).max(64).required(),
  email: Joi.string()
    .email()
    .trim()
    .required()
    .regex(
      /(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@[*[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+]*/
    ),

  password: Joi.string()
    .min(8)
    .max(250)
    .required()
    .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/),
});

module.exports = { registerSchema };


