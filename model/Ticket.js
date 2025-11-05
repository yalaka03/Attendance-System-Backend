const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TicketSchema = new Schema({
    e_id: { type: Number, required: true },
    e_company_reg: { type: Number, required: true },
    camera_id: { type: String, required: true },
    timestamp: { type: Date, required: true },
    requestedDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    note: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);


