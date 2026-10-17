import Joi from 'joi';

const postValidationSchema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required()
});

export default postValidationSchema;