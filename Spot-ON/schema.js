const Joi = require('joi');

module.exports.spaceSchema = Joi.object({
    space : Joi.object({

        name: Joi.string().required(),
        address: Joi.string().required(),
        city: Joi.string().required(),
        state: Joi.string().required(),
        pincode: Joi.string().required(),
        totalParkingSpots: Joi.number().required(),
        type: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().allow(" ", null),

    }).required()
});

// this is currently not in use and would be available with th functionality of adding new parking spaces