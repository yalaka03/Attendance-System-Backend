const Ticket = require('../model/Ticket');
const Employee = require('../model/Employee');

// User: create a ticket
const createTicket = async (req, res) => {
    if (!req?.user) return res.status(401).json({ message: 'Unauthorized' });
    const username = req.user;
    const companyReg = req.companyId;
    if (!companyReg) return res.status(403).json({ message: 'No company access assigned' });
    const { camera_id, timestamp, requestedDate, note } = req.body;
    if (!camera_id || !timestamp || !requestedDate) return res.status(400).json({ message: 'camera_id, timestamp and requestedDate are required' });
    try {
        const emp = await Employee.findOne({ e_username: username, e_company_reg: companyReg }, { e_id: 1, _id: 0 }).lean();
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        const ticket = await Ticket.create({
            e_id: emp.e_id,
            e_company_reg: companyReg,
            camera_id,
            timestamp: new Date(timestamp),
            requestedDate: new Date(requestedDate),
            note: note || ''
        });
        return res.status(200).json({ message: 'Ticket created', data: ticket });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to create ticket' });
    }
}

// Editor/Admin: list tickets (optionally by status)
const listTickets = async (req, res) => {
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    const { status = 'pending' } = req.query;
    try {
        const tickets = await Ticket.find({ e_company_reg: req.companyId, ...(status ? { status } : {}) }).sort({ createdAt: -1 }).lean();
        return res.status(200).json(tickets);
    } catch (err) {
        return res.status(400).json({ message: 'Failed to list tickets' });
    }
}

// Editor/Admin: act on a ticket (accept/reject)
const actOnTicket = async (req, res) => {
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    const { ticket_id, action } = req.body;
    if (!ticket_id || !['accepted', 'rejected'].includes(action)) return res.status(400).json({ message: 'ticket_id and valid action required' });
    try {
        const ticket = await Ticket.findOne({ _id: ticket_id, e_company_reg: req.companyId });
        if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
        ticket.status = action;
        await ticket.save();
        if (action === 'accepted') {
            // add attendance to employee
            await Employee.updateOne(
                { e_id: ticket.e_id, e_company_reg: ticket.e_company_reg },
                { $push: { attendance: { date: new Date(ticket.requestedDate), status: 'Present' } } }
            );
        }
        return res.status(200).json({ message: 'Updated' });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to update ticket' });
    }
}

// User: list own tickets
const listMyTickets = async (req, res) => {
    if (!req?.user) return res.status(401).json({ message: 'Unauthorized' });
    const username = req.user;
    if (!req?.companyId) return res.status(403).json({ message: 'No company access assigned' });
    try {
        const emp = await Employee.findOne({ e_username: username, e_company_reg: req.companyId }, { e_id: 1, _id: 0 }).lean();
        if (!emp) return res.status(404).json({ message: 'Employee not found' });
        const tickets = await Ticket.find({ e_company_reg: req.companyId, e_id: emp.e_id }).sort({ createdAt: -1 }).lean();
        return res.status(200).json(tickets);
    } catch (err) {
        return res.status(400).json({ message: 'Failed to list tickets' });
    }
}

module.exports = { createTicket, listTickets, actOnTicket, listMyTickets };


