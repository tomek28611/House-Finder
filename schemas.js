const Joi = require('joi');

module.exports.hfinderSchema = Joi.object({
        hfinder: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })


module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required(),
        body: Joi.string().required()
    }).required()
})