// the schema for all the malls and workspaces 

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const spaceSchema = new Schema({
    name: {
        type: String,
        required: true
    },

    address: {
        type: String,
        required: true
     },

    city: {
        type: String,
        required: true
    }, 

    state: {
        type: String,
        required: true
    }, 

    pincode: {
        type: String,
        required: true
    }, 
    
    // in GeoJSON format for tracking
    location: {
        type: {
            type: String,
            default: "Point" 
        }, 

        coordinates: {
            type: [Number],

            // an optional validator suggested by ChatGPT
            validate: {
                validator: function (coords) {
                    const [lng, lat] = coords;
                    return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
                },
                message: "Invalid coordinates: [longitude, latitude]"
            }
        }
    },


    // Total spots in the mall
    totalParkingSpots: {
        type: Number,
        required: true
    }, 

    type: {
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    
    imageUrl: {
        type: String,
        required: true
    },

    // Contact phone number of the mall
    phone: {
        type: String,
        required: false
    }, 
    
    operatingHours: {
        type: String,
        required: false 
    }, // Example: "10:00 AM - 10:00 PM"



    createdAt: { type: Date, default: Date.now }, 
},
    
    //  timestamps adds createdAt and updatedAt automatically 
    { timestamps: true }
);


// now we add indexing a special feature to use geoSpatial indexing 
spaceSchema.index(
    
    // 2d sphere for defining the radius
    { location: "2dsphere" }
);

const Space = mongoose.model("Space", spaceSchema);

module.exports = Space;