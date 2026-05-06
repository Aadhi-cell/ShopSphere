const Ticket = require('../models/Ticket');
const Message = require('../models/Message');

let _io = null;

class SupportController {

    attachIo(io) {
        _io = io;
    }


    // ===================== TICKETS =====================

    // Admin: Get all tickets
    getTickets = async (req, res) => {
        try {
            const { status, search } = req.query;
            const query = {};
            if (status && status !== 'All') query.status = status;
            if (search) {
                query.$or = [
                    { ticketId: new RegExp(search, 'i') },
                    { subject: new RegExp(search, 'i') },
                    { senderName: new RegExp(search, 'i') },
                    { senderEmail: new RegExp(search, 'i') },
                ];
            }
            const tickets = await Ticket.find(query)
                .sort({ createdAt: -1 });
            res.json(tickets);
        } catch (err) {
            console.error('getTickets error:', err);
            res.status(500).json({ message: 'Failed to fetch tickets' });
        }
    };

    // Admin: Get single ticket
    getTicketById = async (req, res) => {
        try {
            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
            res.json(ticket);
        } catch (err) {
            console.error('getTicketById error:', err);
            res.status(500).json({ message: 'Failed to fetch ticket' });
        }
    };

    // Admin: Reply to ticket (public — user can see)
    replyToTicket = async (req, res) => {
        try {
            const { message } = req.body;
            if (!message) return res.status(400).json({ message: 'Reply message required' });

            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

            ticket.replies.push({
                sender: 'admin',
                senderName: req.user?.name || 'Admin',
                message,
                isInternal: false
            });

            if (ticket.status === 'Open') ticket.status = 'In Progress';
            await ticket.save();
            res.json({ success: true, ticket });
        } catch (err) {
            console.error('replyToTicket error:', err);
            res.status(500).json({ message: 'Failed to reply to ticket' });
        }
    };

    // Admin: Add internal note (admin ↔ seller, NOT visible to user)
    addInternalNote = async (req, res) => {
        try {
            const { message, senderName } = req.body;
            if (!message) return res.status(400).json({ message: 'Note message required' });

            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

            ticket.internalNotes.push({
                sender: 'admin',
                senderName: senderName || req.user?.name || 'Admin',
                message,
                isInternal: true
            });
            await ticket.save();
            res.json({ success: true, ticket });
        } catch (err) {
            console.error('addInternalNote error:', err);
            res.status(500).json({ message: 'Failed to add internal note' });
        }
    };

    // Admin: Set resolution action
    resolveTicket = async (req, res) => {
        try {
            const { resolution, resolutionNote } = req.body;
            const validResolutions = ['Approve Refund', 'Approve Replacement', 'Rejected', 'Need More Info'];
            if (!validResolutions.includes(resolution)) return res.status(400).json({ message: 'Invalid resolution' });

            const ticket = await Ticket.findById(req.params.id);
            if (!ticket) return res.status(404).json({ message: 'Ticket not found' });

            ticket.resolution = resolution;
            ticket.resolutionNote = resolutionNote || '';

            // Auto-update status
            if (resolution === 'Approve Refund' || resolution === 'Approve Replacement') {
                ticket.status = 'Resolved';
                ticket.resolvedAt = new Date();
            } else if (resolution === 'Rejected') {
                ticket.status = 'Closed';
            } else if (resolution === 'Need More Info') {
                ticket.status = 'In Progress';
            }

            // Auto-add a public reply informing the user
            const resolutionMessages = {
                'Approve Refund': `Your refund request has been approved. ${resolutionNote || ''}`,
                'Approve Replacement': `Your replacement request has been approved. ${resolutionNote || ''}`,
                'Rejected': `We have reviewed your request. Unfortunately, we are unable to proceed. ${resolutionNote || ''}`,
                'Need More Info': `We need more information to process your request. ${resolutionNote || ''}`
            };
            ticket.replies.push({
                sender: 'admin',
                senderName: req.user?.name || 'Support Team',
                message: resolutionMessages[resolution],
                isInternal: false
            });

            await ticket.save();
            res.json({ success: true, ticket });
        } catch (err) {
            console.error('resolveTicket error:', err);
            res.status(500).json({ message: 'Failed to resolve ticket' });
        }
    };

    // Admin: Update ticket status
    updateTicketStatus = async (req, res) => {
        try {
            const { status } = req.body;
            const validStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
            if (!validStatuses.includes(status)) return res.status(400).json({ message: 'Invalid status' });

            const ticket = await Ticket.findByIdAndUpdate(req.params.id,
                {
                    status,
                    ...(status === 'Resolved' ? { resolvedAt: new Date() } : {})
                },
                { new: true }
            );
            if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
            res.json({ success: true, ticket });
        } catch (err) {
            console.error('updateTicketStatus error:', err);
            res.status(500).json({ message: 'Failed to update ticket status' });
        }
    };

    // Public: User/Seller submit a ticket
    createTicket = async (req, res) => {
        try {
            const { subject, message, category, orderId, senderName, senderEmail, senderType } = req.body;
            if (!subject || !message) return res.status(400).json({ message: 'Subject and message required' });

            const ticket = new Ticket({
                user_id: req.user?._id,
                senderType: senderType || 'user',
                senderName: senderName || req.user?.name || 'Anonymous',
                senderEmail: senderEmail || req.user?.email || '',
                subject,
                message,
                category: category || 'Other',
                orderId: orderId || '',
            });
            await ticket.save();
            res.status(201).json({ success: true, ticket, ticketId: ticket.ticketId });
        } catch (err) {
            console.error('createTicket error:', err);
            res.status(500).json({ message: 'Failed to create ticket' });
        }
    };

    // Public: Get MY tickets by email (user can track their own tickets)
    getMyTickets = async (req, res) => {
        try {
            const { email, ticketId } = req.query;
            if (!email && !ticketId) {
                return res.status(400).json({ message: 'Email or ticketId required' });
            }
            const query = {};
            if (ticketId) query.ticketId = new RegExp(ticketId.trim(), 'i');
            else if (email) query.senderEmail = email.trim().toLowerCase();

            const tickets = await Ticket.find(query).sort({ createdAt: -1 });
            res.json(tickets);
        } catch (err) {
            console.error('getMyTickets error:', err);
            res.status(500).json({ message: 'Failed to fetch your tickets' });
        }
    };


    // Admin: Delete ticket
    deleteTicket = async (req, res) => {
        try {
            await Ticket.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Ticket deleted' });
        } catch (err) {
            console.error('deleteTicket error:', err);
            res.status(500).json({ message: 'Failed to delete ticket' });
        }
    };

    // ===================== MESSAGES =====================

    // Admin: Get all messages
    getMessages = async (req, res) => {
        try {
            const messages = await Message.find().sort({ createdAt: -1 });
            res.json(messages);
        } catch (err) {
            console.error('getMessages error:', err);
            res.status(500).json({ message: 'Failed to fetch messages' });
        }
    };

    // Admin: Get single message thread
    getMessageById = async (req, res) => {
        try {
            const msg = await Message.findById(req.params.id);
            if (!msg) return res.status(404).json({ message: 'Message not found' });
            // Auto mark as read
            if (!msg.isRead) {
                msg.isRead = true;
                await msg.save();
            }
            res.json(msg);
        } catch (err) {
            console.error('getMessageById error:', err);
            res.status(500).json({ message: 'Failed to fetch message' });
        }
    };

    // Admin: Reply to message
    replyToMessage = async (req, res) => {
        try {
            const { content } = req.body;
            if (!content) return res.status(400).json({ message: 'Reply content required' });

            const msg = await Message.findById(req.params.id);
            if (!msg) return res.status(404).json({ message: 'Message not found' });

            msg.replies.push({
                sender: 'admin',
                senderName: req.user?.name || 'Admin',
                content
            });
            await msg.save();

            // Emit real-time notification to the seller
            if (_io && msg.seller_id) {
                _io.to(msg.seller_id.toString()).emit('newAdminMessage', {
                    messageId: msg._id,
                    subject: msg.subject,
                    preview: content.length > 80 ? content.slice(0, 80) + '...' : content,
                    senderName: req.user?.name || 'Admin',
                    timestamp: new Date().toISOString()
                });
            }

            res.json({ success: true, message: msg });
        } catch (err) {
            console.error('replyToMessage error:', err);
            res.status(500).json({ message: 'Failed to reply to message' });
        }
    };

    // Admin: Mark message as read
    markMessageRead = async (req, res) => {
        try {
            const msg = await Message.findByIdAndUpdate(req.params.id, { isRead: true }, { new: true });
            res.json({ success: true, message: msg });
        } catch (err) {
            console.error('markMessageRead error:', err);
            res.status(500).json({ message: 'Failed to mark as read' });
        }
    };

    // Admin: Delete message
    deleteMessage = async (req, res) => {
        try {
            await Message.findByIdAndDelete(req.params.id);
            res.json({ success: true, message: 'Message deleted' });
        } catch (err) {
            console.error('deleteMessage error:', err);
            res.status(500).json({ message: 'Failed to delete message' });
        }
    };

    // Public: User/Seller send a message to admin
    sendMessage = async (req, res) => {
        try {
            const { subject, content, senderName, senderEmail, senderType } = req.body;
            if (!subject || !content) return res.status(400).json({ message: 'Subject and content required' });

            const msg = new Message({
                user_id: req.user?._id || null,
                seller_id: req.seller?._id || null,
                senderType: senderType || (req.seller ? 'seller' : 'user'),
                senderName: senderName || req.seller?.name || req.user?.name || 'Anonymous',
                senderEmail: senderEmail || req.seller?.email || req.user?.email || '',
                subject,
                content,
            });
            await msg.save();
            res.status(201).json({ success: true, message: msg });
        } catch (err) {
            console.error('sendMessage error:', err);
            res.status(500).json({ message: 'Failed to send message' });
        }
    };

    // Admin: Get support stats (unread count etc)
    getSupportStats = async (req, res) => {
        try {
            const [openTickets, inProgressTickets, unreadMessages] = await Promise.all([
                Ticket.countDocuments({ status: 'Open' }),
                Ticket.countDocuments({ status: 'In Progress' }),
                Message.countDocuments({ isRead: false }),
            ]);
            res.json({ openTickets, inProgressTickets, unreadMessages });
        } catch (err) {
            console.error('getSupportStats error:', err);
            res.status(500).json({ message: 'Failed to fetch support stats' });
        }
    };
}

module.exports = new SupportController();
