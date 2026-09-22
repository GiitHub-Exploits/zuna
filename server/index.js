import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || '';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'zustang';

// Cloudinary Configuration
const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET &&
  process.env.CLOUDINARY_CLOUD_NAME.trim() !== '' &&
  process.env.CLOUDINARY_API_KEY.trim() !== '' &&
  process.env.CLOUDINARY_API_SECRET.trim() !== ''
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME.trim(),
    api_key: process.env.CLOUDINARY_API_KEY.trim(),
    api_secret: process.env.CLOUDINARY_API_SECRET.trim(),
    secure: true
  });
  console.log('✅ Cloudinary initialized successfully!');
} else {
  console.log('ℹ️  Cloudinary credentials not provided in server/.env (fill CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)');
}

const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for work gallery uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `work-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // up to 15MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(UPLOADS_DIR));

// -------------------------------------------------------------
// Pure MongoDB Mongoose Connection & Schemas
// -------------------------------------------------------------
let isMongoConnected = false;

const OrderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  userId: { type: String, default: "", index: true },
  clothCategory: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  materialProvision: { type: String, default: "Customer Provided" },
  materialType: { type: String, default: "" },
  customizationNote: { type: String, default: "" },
  measurementType: { type: String, default: "HOME SERVICE" },
  customMeasurements: { type: String, default: "" },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  altPhone: { type: String, default: "" },
  address: { type: String, default: "" },
  preferredDate: { type: String, default: "" },
  preferredTimeSlot: { type: String, default: "Morning (10 AM – 1 PM)" },
  status: { type: String, default: "RECEIVED" },
  contactChannels: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now }
});

const WorkSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, default: "" },
  details: { type: String, default: "" },
  aspectRatio: { type: String, default: "portrait" },
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const OrderModel = mongoose.model('Order', OrderSchema);
const WorkModel = mongoose.model('Work', WorkSchema);

const connectMongoDB = async () => {
  if (!MONGODB_URI || MONGODB_URI.trim() === '') {
    console.warn('⚠️  MONGODB_URI is not set in server/.env!');
    console.warn('⚠️  PURE MONGODB MODE: Orders & uploads will be rejected until MONGODB_URI is configured.');
    isMongoConnected = false;
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isMongoConnected = true;
    console.log('✅ Connected to MongoDB successfully!');
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    isMongoConnected = false;
  }
};

connectMongoDB();

const generateOrderId = () => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `ZN-${year}-${randomNum}`;
};

// -------------------------------------------------------------
// API Routes
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'ZUNA TAILORS',
    masterTailor: 'Sultan Baig',
    location: '12 & 31, Bashiruddin Munshi Lane, Howrah',
    phones: ['8910763123', '628942663'],
    pureMongoDB: true,
    mongoConnected: isMongoConnected,
    cloudinaryConfigured: isCloudinaryConfigured,
    cloudinaryCloud: isCloudinaryConfigured ? process.env.CLOUDINARY_CLOUD_NAME : null,
    timestamp: new Date().toISOString()
  });
});

// Admin Password Login Verification (Password is "zustang")
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, message: 'Password is required' });
  }

  if (password.trim() === ADMIN_PASSWORD) {
    return res.json({
      success: true,
      message: 'Admin access granted',
      role: 'admin'
    });
  } else {
    return res.status(401).json({
      success: false,
      message: 'Incorrect password. Access denied.'
    });
  }
});

// POST /api/upload - Upload image to Cloudinary (returns Cloudinary HTTPS URL)
app.post('/api/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file uploaded' });
  }

  if (!isCloudinaryConfigured) {
    // Delete local temporary file
    if (fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(400).json({
      success: false,
      message: 'Cloudinary is not configured yet in server/.env. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET, or use an image URL directly.'
    });
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'zuna_tailors/work',
      resource_type: 'image'
    });

    // Remove local temp file immediately after Cloudinary upload
    if (fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }

    return res.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      message: 'Image uploaded to Cloudinary successfully'
    });
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(500).json({
      success: false,
      message: `Failed to upload image to Cloudinary: ${err.message}`
    });
  }
});

// GET /api/work - Public gallery items (Pure MongoDB)
app.get('/api/work', async (req, res) => {
  if (!isMongoConnected) {
    return res.json({
      success: true,
      count: 0,
      items: [],
      warning: 'MongoDB not connected. Please set MONGODB_URI in server/.env'
    });
  }

  try {
    const { category } = req.query;
    const query = category && category !== 'All' 
      ? { category: new RegExp(`^${category}$`, 'i') } 
      : {};
    
    const items = await WorkModel.find(query).sort({ createdAt: -1 });
    res.json({
      success: true,
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching work from MongoDB:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve portfolio from MongoDB' });
  }
});

// POST /api/work - Upload work (Pure MongoDB, Cloudinary for images)
app.post('/api/work', upload.single('image'), async (req, res) => {
  if (!isMongoConnected) {
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not connected. Please configure MONGODB_URI in server/.env to upload work.'
    });
  }

  try {
    const { title, category, description, details, imageUrl: providedUrl, aspectRatio } = req.body;

    if (!title || !category) {
      if (req.file && fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({ success: false, message: 'Garment title and category are required' });
    }

    let finalImageUrl = providedUrl ? providedUrl.trim() : '';

    // If an image file was submitted, upload it to Cloudinary
    if (req.file) {
      if (!isCloudinaryConfigured) {
        if (fs.existsSync(req.file.path)) {
          try { fs.unlinkSync(req.file.path); } catch (e) {}
        }
        return res.status(400).json({
          success: false,
          message: 'Cloudinary credentials are not set in server/.env. Please add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env, or enter an image URL directly.'
        });
      }

      const cResult = await cloudinary.uploader.upload(req.file.path, {
        folder: 'zuna_tailors/work',
        resource_type: 'image'
      });
      finalImageUrl = cResult.secure_url;

      // Clean up local temp file immediately
      if (fs.existsSync(req.file.path)) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
    }

    if (!finalImageUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please select an image file to upload to Cloudinary or provide an image URL.' 
      });
    }

    // STRICTLY store ONLY the image URL in MongoDB
    const newItem = {
      id: `work-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      description: description ? description.trim() : '',
      details: details ? details.trim() : '',
      aspectRatio: aspectRatio || 'portrait',
      imageUrl: finalImageUrl,
      createdAt: new Date()
    };

    const saved = await WorkModel.create(newItem);
    console.log(`[MONGODB WORK CREATED] ${saved.title} (${saved.category}) - Cloudinary/Image URL: ${saved.imageUrl}`);

    res.status(201).json({
      success: true,
      message: 'Work piece saved to MongoDB successfully',
      item: saved
    });
  } catch (err) {
    console.error('Error saving work to MongoDB:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (e) {}
    }
    res.status(500).json({ success: false, message: 'Server error saving work piece to MongoDB: ' + err.message });
  }
});

// DELETE /api/work/:id - Delete work item from MongoDB (and Cloudinary if applicable)
app.delete('/api/work/:id', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected' });
  }

  try {
    const { id } = req.params;
    const work = await WorkModel.findOne({ id });

    if (!work) {
      return res.status(404).json({ success: false, message: 'Work piece not found in MongoDB' });
    }

    // If it's a Cloudinary image, delete from Cloudinary as well
    if (isCloudinaryConfigured && work.imageUrl && work.imageUrl.includes('cloudinary.com')) {
      try {
        const parts = work.imageUrl.split('/');
        const uploadIdx = parts.indexOf('upload');
        if (uploadIdx !== -1) {
          const publicIdWithExt = parts.slice(uploadIdx + 2).join('/');
          const publicId = publicIdWithExt.replace(/\.[^/.]+$/, "");
          if (publicId) {
            await cloudinary.uploader.destroy(publicId);
          }
        }
      } catch (cErr) {
        console.warn('Could not delete image from Cloudinary:', cErr.message);
      }
    }

    await WorkModel.deleteOne({ id });
    console.log(`[MONGODB WORK DELETED] ${id}`);
    res.json({ success: true, message: 'Post deleted successfully from MongoDB', id });
  } catch (err) {
    console.error('Error deleting work from MongoDB:', err);
    res.status(500).json({ success: false, message: 'Failed to delete item from MongoDB' });
  }
});

// GET /api/orders - Get orders (Pure MongoDB, supports ?userId=...)
app.get('/api/orders', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({
      success: false,
      message: 'MongoDB is not connected. Please set MONGODB_URI in server/.env to view orders.',
      orders: []
    });
  }

  try {
    const { userId } = req.query;
    const query = userId && userId.trim() !== '' ? { userId: userId.trim() } : {};
    const orders = await OrderModel.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (err) {
    console.error('Error fetching orders from MongoDB:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch orders from MongoDB' });
  }
});

// GET /api/orders/:id - Get single order from MongoDB
app.get('/api/orders/:id', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected' });
  }

  try {
    const { id } = req.params;
    const order = await OrderModel.findOne({ id: new RegExp(`^${id}$`, 'i') });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found in MongoDB' });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('Error getting order from MongoDB:', err);
    res.status(500).json({ success: false, message: 'Error retrieving order' });
  }
});

// POST /api/orders - Create bespoke order (PURE MONGODB - Rejects if MongoDB not connected)
app.post('/api/orders', async (req, res) => {
  // STRICT REJECTION IF NO MONGODB CONFIGURED
  if (!isMongoConnected) {
    return res.status(503).json({
      success: false,
      message: 'Database connection is not configured. Please add MONGODB_URI to server/.env to place and store orders.'
    });
  }

  try {
    const data = req.body;

    if (!data.customerName || !data.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.'
      });
    }

    if (!data.clothCategory && !data.garment) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the cloth category or garment name.'
      });
    }

    const orderId = generateOrderId();
    const newOrder = {
      id: orderId,
      userId: (data.userId || '').trim(),
      status: 'RECEIVED',
      createdAt: new Date(),

      clothCategory: (data.clothCategory || data.garment || 'Custom Garment').trim(),
      quantity: Number(data.quantity) || 1,
      materialProvision: data.materialProvision || "Customer Provided",
      materialType: (data.materialType || '').trim(),
      customizationNote: (data.customizationNote || data.notes || '').trim(),
      measurementType: data.measurementType || 'HOME SERVICE',
      customMeasurements: (data.customMeasurements || '').trim(),

      customerName: data.customerName.trim(),
      phone: data.phone.trim(),
      altPhone: data.altPhone ? data.altPhone.trim() : '',
      address: data.address ? data.address.trim() : '',
      preferredDate: data.preferredDate || '',
      preferredTimeSlot: data.preferredTimeSlot || 'Morning (10 AM – 1 PM)',

      contactChannels: {
        primaryCall: '8910763123',
        secondaryCall: '628942663',
        whatsapp: '918910763123',
        address: '12, Bashiruddin Munshi Lane, Howrah',
        workshop: '31, Bashiruddin Munshi Lane'
      }
    };

    const savedOrder = await OrderModel.create(newOrder);
    console.log(`[MONGODB ORDER SAVED] ${savedOrder.id} for ${savedOrder.customerName} (User: ${savedOrder.userId || 'guest'})`);

    res.status(201).json({
      success: true,
      message: 'Order saved to MongoDB successfully',
      order: savedOrder
    });
  } catch (err) {
    console.error('Error creating order in MongoDB:', err);
    res.status(500).json({ success: false, message: 'Server error saving order to MongoDB: ' + err.message });
  }
});

// PATCH /api/orders/:id - Update order status in MongoDB
app.patch('/api/orders/:id', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected' });
  }

  try {
    const { id } = req.params;
    const { status, internalNotes } = req.body;

    const updated = await OrderModel.findOneAndUpdate(
      { id },
      { 
        ...(status && { status }),
        ...(internalNotes && { internalNotes }),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found in MongoDB' });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error('Error updating order in MongoDB:', err);
    res.status(500).json({ success: false, message: 'Error updating order' });
  }
});

// DELETE /api/orders/:id - Delete order (Admin)
app.delete('/api/orders/:id', async (req, res) => {
  if (!isMongoConnected) {
    return res.status(503).json({ success: false, message: 'MongoDB is not connected' });
  }

  try {
    const { id } = req.params;
    await OrderModel.deleteOne({ id });
    res.json({ success: true, message: 'Order deleted from MongoDB' });
  } catch (err) {
    console.error('Error deleting order from MongoDB:', err);
    res.status(500).json({ success: false, message: 'Failed to delete order' });
  }
});

// Serve built frontend if available
const CLIENT_DIST = path.join(__dirname, '../client/dist');
if (fs.existsSync(CLIENT_DIST)) {
  app.use(express.static(CLIENT_DIST));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(CLIENT_DIST, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`========================================`);
  console.log(`  ZUNA TAILORS Backend running on port ${PORT}`);
  console.log(`  Master Tailor: Sultan Baig`);
  console.log(`  Howrah Workshop & Studio`);
  console.log(`  Database: PURE MONGODB`);
  console.log(`  MongoDB Status: ${isMongoConnected ? 'CONNECTED' : 'AWAITING MONGODB_URI IN .ENV'}`);
  console.log(`========================================`);
});
