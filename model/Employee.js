const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
    {
        // the id assigned by mongo is treated as the employee id and is the primary key
        e_fname: {
            type: String,
            required: true
        },
        e_gender: {
            type: String,
            enum : ["Male","Female","Other"]
        },

        e_lname: {
            type: String
        },

        // check the foreign key thingy
        e_company_reg: {
            type: Number,
            required: true
        },

        e_company_name: {
            type: String,
            required: true
        },

        e_id: {
            type: Number,
            required: true,
            // unique :true `
        },

        e_building: {
            type: String,
            required: true
        },

        e_contact: {
            type: String,
            required: true,
            unique: true
        },

        // linked application user
        e_username: {
            type: String,
            required: true,
            unique: true
        },
        user_ref: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },


        e_designation: {
            type: String,
            required: true,
            // enum: ["Dir", "CEO", "CFO", "CGM", "GM", "Associate", "Intern"]
        },


        e_dob: {
            type: Date,
            required: true
        },


        e_face: {
            type: String,
            required: true
        },

        isActive: {
            type: Boolean,
            required: true
        },

        e_present: {
            type: Array,
        }
        ,
        attendance: [
            {
                date: { type: Date, required: true },
                status: { type: String, enum: ['Present', 'Absent'], required: true }
            }
        ]
    });
// Ensure employee id is unique within a company
EmployeeSchema.index({ e_company_reg: 1, e_id: 1 }, { unique: true });
// Ensure username is globally unique across employees
EmployeeSchema.index({ e_username: 1 }, { unique: true });
module.exports = mongoose.model('Employee', EmployeeSchema);;
