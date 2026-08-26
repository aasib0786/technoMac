const { Client } = require('../models/Client');
const cloudinary = require('../config/cloudinary');

// ─────────────────────────────────────────────────────────────
// Helper: upload buffer to Cloudinary
// ─────────────────────────────────────────────────────────────
const uploadToCloudinary = (buffer) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader
            .upload_stream({ folder: 'clients', quality: 'auto', fetch_format: 'auto' }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            })
            .end(buffer);
    });
};

// ─────────────────────────────────────────────────────────────
// CREATE  →  POST /api/client/create
// ─────────────────────────────────────────────────────────────
exports.createClient = async (req, res) => {
    try {
        const { name, description, order } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'Client name is required' });
        }
        if (!description) {
            return res.status(400).json({ success: false, message: 'Client description is required' });
        }

        // Upload image to Cloudinary if provided
        let imageUrl = '';
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }

        const client = await Client.create({
            name,
            description,
            image: imageUrl,
            order: order ? Number(order) : 0,
        });

        res.status(201).json({
            success: true,
            message: 'Client created successfully',
            data: client
        });
    } catch (error) {
        console.error('createClient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET ALL (active only)  →  GET /api/client/all
// ─────────────────────────────────────────────────────────────
exports.getAllClients = async (req, res) => {
    try {
        const clients = await Client.find({ isActive: true }).sort({ order: 1, createdAt: 1 }).lean();

        res.status(200).json({
            success: true,
            count: clients.length,
            data: clients
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET ALL (including inactive)  →  GET /api/client/admin/all
// ─────────────────────────────────────────────────────────────
exports.getAllClientsAdmin = async (req, res) => {
    try {
        const clients = await Client.find().sort({ order: 1, createdAt: 1 }).lean();

        res.status(200).json({
            success: true,
            count: clients.length,
            data: clients
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE  →  GET /api/client/:id
// ─────────────────────────────────────────────────────────────
exports.getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id).lean();
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        res.status(200).json({ success: true, data: client });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// UPDATE  →  PUT /api/client/update/:id
// ─────────────────────────────────────────────────────────────
exports.updateClient = async (req, res) => {
    try {
        const { name, description, order, isActive } = req.body;

        const updateData = {};
        if (name !== undefined)        updateData.name        = name;
        if (description !== undefined) updateData.description = description;
        if (order !== undefined)       updateData.order       = Number(order);
        if (isActive !== undefined)    updateData.isActive    = isActive === 'true' || isActive === true;

        // If a new image is uploaded, push it to Cloudinary
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            updateData.image = result.secure_url;
        }

        const client = await Client.findByIdAndUpdate(req.params.id, updateData, { returnDocument: 'after' });
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Client updated successfully',
            data: client
        });
    } catch (error) {
        console.error('updateClient error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// DELETE  →  DELETE /api/client/delete/:id
// ─────────────────────────────────────────────────────────────
exports.deleteClient = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        res.status(200).json({
            success: true,
            message: 'Client deleted successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ─────────────────────────────────────────────────────────────
// TOGGLE ACTIVE  →  PATCH /api/client/toggle/:id
// Quick way to show/hide a client without deleting
// ─────────────────────────────────────────────────────────────
exports.toggleClientStatus = async (req, res) => {
    try {
        console.log("TOGLES===>",req.params)
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }

        client.isActive = !client.isActive;
        await client.save();

        res.status(200).json({
            success: true,
            message: `Client ${client.isActive ? 'activated' : 'deactivated'} successfully`,
            data: client
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
