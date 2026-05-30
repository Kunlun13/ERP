export const percentageToGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  if (percentage >= 33) return 'E';
  return 'F';
};

export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (!apiUrl || apiUrl.startsWith('/')) {
    return path;
  }
  
  const base = apiUrl.replace('/api', '');
  return `${base}${path}`;
};

export const getFileUrl = (path) => {
  return getImageUrl(path);
};

export const isImageFile = (mimeType) => {
  return mimeType?.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp)$/i.test(mimeType);
};

export const getFileExtension = (fileName) => {
  return fileName?.split('.').pop()?.toUpperCase() || 'FILE';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

export const GRADES = ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F'];

export const EXAM_TYPES = ['MARKS', 'GRADE', 'Unit Test', 'Half Yearly', 'Annual', 'Pre-Board', 'Practice Test', 'Other'];

export const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'image', label: 'Image' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'date', label: 'Date' },
];

export const DOCUMENT_TYPES = [
  'Aadhar Card',
  'Birth Certificate',
  'Medical Report',
  'ID Proof',
  'Transfer Certificate',
  'Passport',
  'Vaccination Certificate',
  'Other',
];
