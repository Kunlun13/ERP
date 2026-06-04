import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import path from 'path';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export { cloudinary };

// ── Cloudinary storage factories ─────────────────────────────────────────────

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'school_erp/profiles',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill' }],
  },
});

const studentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => ({
    folder: 'school_erp/students',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 600, height: 600, crop: 'limit' }],
    public_id: `${Date.now()}-${file.fieldname}`,
  }),
});

const logoStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'school_erp/logos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 300, height: 300, crop: 'limit' }],
  },
});

const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const isImage = /image\//.test(file.mimetype);
    return {
      folder: 'school_erp/documents',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf'],
      resource_type: isImage ? 'image' : 'raw',
      public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`,
    };
  },
});

// ── File filters ──────────────────────────────────────────────────────────────

const imageFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = /image\//.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowedExt = /jpeg|jpg|png|gif|webp|pdf/;
  const ext = allowedExt.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = /image\/|application\/pdf/;
  const mime = allowedMimes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image and PDF files are allowed'), false);
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;
const maxDocSize = 10 * 1024 * 1024;

// ── Exported multer instances ─────────────────────────────────────────────────

export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: maxSize },
  fileFilter: imageFileFilter,
}).single('profilePhoto');

export const uploadStudentPhoto = multer({
  storage: studentStorage,
  limits: { fileSize: maxSize },
  fileFilter: imageFileFilter,
}).any();

export const uploadLogo = multer({
  storage: logoStorage,
  limits: { fileSize: maxSize },
  fileFilter: imageFileFilter,
}).single('logo');

export const uploadStudentDocument = multer({
  storage: documentStorage,
  limits: { fileSize: maxDocSize },
  fileFilter: documentFileFilter,
}).single('document');
