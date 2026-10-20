import Joi from 'joi';

const commentValidationSchema = Joi.object({
    content: Joi.string().trim().required().max(1000)
});

export default commentValidationSchema;