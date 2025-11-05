const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    // the id assigned by mongodb is treated as company id and is the primary key
    reg_no: {
        type: Number,
        required: true,
        unique: true
    },

    comp_name: {
        type: String,
        required: true
    },

    isActive: {
        type: Boolean,
        required: true,
    },

    logo: {
        type: String,
        required: true
    },

    dp_Id: {
        type: Number,
        required: true
    },

    dp_firstName :{
        type: String,
        required: true
    },
    dp_lastName :{
        type: String,
        required: true
    },
    dp_phoneNum : {
        type : String,
        required : true
    },
    dp_email: {
        type: String,
        required: true,
        unique: true
    },

    country: {
        type: String,
        required: true
    },

    state: {
        type: String,
    },

    city: {
        type: String,
    },

    zipcode: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },

    billing_address: {
        type: String,
        required: true
    },

    billing_country: {
        type: String,
        required : true
    },

    billing_state: {
        type: String,
    },

    billing_city: {
        type: String,
    },
    billing_zipcode: {
        type: Number,
        required: true
    }
});


module.exports = mongoose.model('Company', companySchema);