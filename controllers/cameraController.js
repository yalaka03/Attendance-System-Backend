const Camera = require('../model/Camera');

const addCamera = async (req, res) => {
    if (!req?.companyId) {
        return res.status(403).json({ message: 'No company access assigned' });
    }
    
    const newCamera = new Camera({
        camera_name: req.body.camera_name,
        camera_location: req.body.camera_location,
        video_url: req.body.video_url,
        thumbnail_url: req.body.thumbnail_url,
        company_ref: req.companyId,
        isActive: req.body.isActive !== undefined ? req.body.isActive : true
    });

    try {
        const camera = await newCamera.save();
        return res.status(200).json({ message: 'Camera added successfully', data: camera });
    } catch (err) {
        if (err?.code === 11000) {
            return res.status(409).json({ message: 'Camera name already exists for this company' });
        }
        return res.status(400).json({ message: 'Failed to add camera', error: err?.message });
    }
};

const getCameras = async (req, res) => {
    if (!req?.companyId) {
        return res.status(403).json({ message: 'No company access assigned' });
    }
    
    try {
        const cameras = await Camera.find({ company_ref: req.companyId }, {
            camera_name: 1,
            camera_location: 1,
            video_url: 1,
            thumbnail_url: 1,
            isActive: 1,
            created_at: 1
        }).sort({ created_at: -1 });
        
        return res.status(200).json(cameras);
    } catch (err) {
        return res.status(400).json({ message: 'Failed to fetch cameras', error: err?.message });
    }
};

const deleteCamera = async (req, res) => {
    if (!req?.companyId) {
        return res.status(403).json({ message: 'No company access assigned' });
    }
    
    const cameraId = req.body.camera_id;
    if (!cameraId) {
        return res.status(400).json({ message: 'Camera ID is required' });
    }
    
    try {
        const deleted = await Camera.findOneAndDelete({ 
            _id: cameraId, 
            company_ref: req.companyId 
        });
        
        if (!deleted) {
            return res.status(404).json({ message: 'Camera not found' });
        }
        
        return res.status(200).json({ message: 'Camera deleted successfully' });
    } catch (err) {
        return res.status(400).json({ message: 'Failed to delete camera', error: err?.message });
    }
};

module.exports = {
    addCamera,
    getCameras,
    deleteCamera
};
