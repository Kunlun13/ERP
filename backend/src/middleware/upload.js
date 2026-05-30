// import multer from 'multer';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const ensureDir = (dir) => {
//   if (!fs.existsSync(dir)) {
//     fs.mkdirSync(dir, { recursive: true });
//   }
// };

// const storage = (folder) =>
//   multer.diskStorage({
//     destination: (req, file, cb) => {
//       const uploadPath = path.join(__dirname, '../../uploads', folder);
//       ensureDir(uploadPath);
//       cb(null, uploadPath);
//     },
//     filename: (req, file, cb) => {
//       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
//       cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
//     },
//   });

// const fileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|gif|webp/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   const mime = allowed.test(file.mimetype);
//   if (ext && mime) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image files are allowed'), false);
//   }
// };

// const documentFileFilter = (req, file, cb) => {
//   const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt/;
//   const ext = allowed.test(path.extname(file.originalname).toLowerCase());
//   const allowedMimes = /image\/|application\/pdf|application\/msword|application\/vnd\.|text\/plain/;
//   const mime = allowedMimes.test(file.mimetype);
//   if (ext && mime) {
//     cb(null, true);
//   } else {
//     cb(new Error('Only image and document files are allowed'), false);
//   }
// };

// const maxSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;
// const maxDocSize = parseInt(process.env.MAX_DOC_SIZE, 10) || 10 * 1024 * 1024;

// export const uploadProfile = multer({
//   storage: storage('profiles'),
//   limits: { fileSize: maxSize },
//   fileFilter,
// }).single('profilePhoto');

// export const uploadStudentPhoto = multer({
//   storage: storage('students'),
//   limits: { fileSize: maxSize },
//   fileFilter,
// }).fields([
//   { name: 'photo', maxCount: 1 },
//   { name: 'aadhaarCard', maxCount: 1 },
//   { name: 'birthCertificate', maxCount: 1 },
//   { name: 'casteCertificate', maxCount: 1 },
//   { name: 'incomeCertificate', maxCount: 1 },
//   { name: 'domicileCertificate', maxCount: 1 },
//   { name: 'otherDocument', maxCount: 5 },
// ]);

// export const uploadLogo = multer({
//   storage: storage('logos'),
//   limits: { fileSize: maxSize },
//   fileFilter,
// }).single('logo');

// export const uploadStudentDocument = multer({
//   storage: storage('documents'),
//   limits: { fileSize: maxDocSize },
//   fileFilter: documentFileFilter,
// }).single('document');





import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../../uploads', folder);
      ensureDir(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const documentFileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp|pdf|doc|docx|xls|xlsx|txt/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = /image\/|application\/pdf|application\/msword|application\/vnd\.|text\/plain/;
  const mime = allowedMimes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only image and document files are allowed'), false);
  }
};

const maxSize = parseInt(process.env.MAX_FILE_SIZE, 10) || 5 * 1024 * 1024;
const maxDocSize = parseInt(process.env.MAX_DOC_SIZE, 10) || 10 * 1024 * 1024;

export const uploadProfile = multer({
  storage: storage('profiles'),
  limits: { fileSize: maxSize },
  fileFilter,
}).single('profilePhoto');

// ✅ Changed from .fields([...]) to .any() so dynamic image fields from
// custom templates are accepted regardless of their field name.
export const uploadStudentPhoto = multer({
  storage: storage('students'),
  limits: { fileSize: maxSize },
  fileFilter,
}).any();

export const uploadLogo = multer({
  storage: storage('logos'),
  limits: { fileSize: maxSize },
  fileFilter,
}).single('logo');

export const uploadStudentDocument = multer({
  storage: storage('documents'),
  limits: { fileSize: maxDocSize },
  fileFilter: documentFileFilter,
}).single('document');
