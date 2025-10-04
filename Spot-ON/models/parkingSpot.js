// a schema for all the parking spots in the space (as there can be parking on different floors also)
// here all the incoming data of parking changes would be stored

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parkingSpotSchema = new Schema({
    mallId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Mall',
        required: true 
    }, // Link to the Mall

    spotNumber: { 
        type: String,
        required: true
    }, 

    isAvailable: {
        type: Boolean,
        default: true 
    }, // Availability status

    type: { 
        type: String,
        enum: ['compact', 'regular', 'large'],
        default: 'regular'
    }, // Type of parking spot
    
    level: {
        type: String,
        required: false }, // Floor/level information

    reservedFor: {
        type: String,
        enum: ['general', 'handicapped', 'electric'],
        default: 'general'
    }, // Restrictions
    
    lastUpdated: {
        type: Date, default: Date.now 
    } // Last availability update

}, 
    { timestamps: true }
);


const ParkingSpot = mongoose.model("ParkingSpot", parkingSpotSchema);
module.exports = ParkingSpot;
