

// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { Plus, Search, Eye, Trash2 } from 'lucide-react';
// import toast from 'react-hot-toast';
// import api from '../utils/api';
// import SessionGuard from '../components/SessionGuard';
// import Card from '../components/ui/Card';
// import Button from '../components/ui/Button';
// import Input from '../components/ui/Input';
// import Select from '../components/ui/Select';
// import Modal from '../components/ui/Modal';
// import LoadingSpinner from '../components/ui/LoadingSpinner';
// import { getImageUrl } from '../utils/helpers';

// const DRAFT_KEY = 'studentFormDraft';

// export default function StudentsPage() {
//   const [students, setStudents] = useState([]);
//   const [classes, setClasses] = useState([]);
//   const [template, setTemplate] = useState(null);
//   const [classFilter, setClassFilter] = useState('');
//   const [search, setSearch] = useState('');
//   const [page, setPage] = useState(1);
//   const [pagination, setPagination] = useState({});
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [form, setForm] = useState({
//     name: '', rollNo: '', class: '', section: 'A', fatherName: '', motherName: '', mobileNo: '', email: '', address: '',
//   });
//   const [customFields, setCustomFields] = useState({});
//   const [photo, setPhoto] = useState(null);
//   const [loadingModal, setLoadingModal] = useState(false);

//   const resetForm = () => {
//     setForm({ name: '', rollNo: '', class: '', section: 'A', fatherName: '', motherName: '', mobileNo: '', email: '', address: '' });
//     setCustomFields({});
//     setPhoto(null);
//     localStorage.removeItem(DRAFT_KEY);
//   };

//   const handleCloseModal = () => {
//     resetForm();
//     setShowModal(false);
//   };

//   const handleOpenModal = async () => {
//     setLoadingModal(true);
//     try {
//       const { data } = await api.get('/templates');
//       setTemplate(data.data);

//       const saved = localStorage.getItem(DRAFT_KEY);
//       if (saved) {
//         const { form: savedForm, customFields: savedCustom } = JSON.parse(saved);
//         setForm(savedForm);
//         setCustomFields(savedCustom);
//         toast('Draft restored', { icon: '📝' });
//       } else {
//         resetForm();
//       }
//     } catch {
//       toast.error('Failed to load latest template');
//     } finally {
//       setLoadingModal(false);
//       setShowModal(true);
//     }
//   };

//   // Auto-save draft whenever form or customFields change while modal is open
//   useEffect(() => {
//     if (!showModal) return;
//     localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, customFields }));
//   }, [form, customFields, showModal]);

//   const fetchStudents = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/students', {
//         params: { class: classFilter, search, page, limit: 15 },
//       });
//       setStudents(data.data);
//       setPagination(data.pagination);
//     } catch {
//       toast.error('Failed to load students');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     Promise.all([
//       api.get('/students/classes'),
//       api.get('/templates'),
//     ])
//       .then(([classesRes, templateRes]) => {
//         setClasses(classesRes.data.data);
//         setTemplate(templateRes.data.data);
//       })
//       .catch(() => toast.error('Failed to load data'));
//   }, []);

//   useEffect(() => {
//     fetchStudents();
//   }, [classFilter, search, page]);

//   const handleCreate = async () => {
//     const fd = new FormData();
//     Object.entries(form).forEach(([k, v]) => fd.append(k, v));

//     Object.entries(customFields).forEach(([k, v]) => {
//       if (v !== undefined && v !== null && v !== '') {
//         fd.append(k, v);
//       }
//     });

//     if (photo) fd.append('photo', photo);
//     try {
//       await api.post('/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
//       localStorage.removeItem(DRAFT_KEY);
//       toast.success('Student added');
//       handleCloseModal();
//       fetchStudents();
//     } catch (err) {
//       toast.error(err.message || 'Failed to add student');
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this student? All marks and related data will be permanently removed.')) return;
//     const { data } = await api.delete(`/students/${id}`);
//     toast.success(data.message || 'Student deleted');
//     fetchStudents();
//   };

//   return (
//     <SessionGuard>
//       <div className="space-y-6">
//         <div className="flex flex-wrap items-center justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
//             <p className="text-gray-500">Manage students by class</p>
//           </div>
//           <Button onClick={handleOpenModal} loading={loadingModal}><Plus size={16} /> Add Student</Button>
//         </div>

//         <div className="flex flex-wrap gap-3">
//           <Select
//             value={classFilter}
//             onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
//             options={[{ value: '', label: 'All Classes' }, ...classes.map((c) => ({ value: c, label: `Class ${c}` }))]}
//             className="w-40"
//           />
//           <div className="relative flex-1 min-w-[200px]">
//             <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               value={search}
//               onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//               placeholder="Search by name or roll no..."
//               className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
//             />
//           </div>
//         </div>

//         <Card>
//           {loading ? (
//             <LoadingSpinner />
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
//                   <tr>
//                     <th className="text-left p-3">Photo</th>
//                     <th className="text-left p-3">Roll No</th>
//                     <th className="text-left p-3">Name</th>
//                     <th className="text-left p-3">Class</th>
//                     <th className="text-left p-3">Mobile</th>
//                     <th className="text-right p-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {students.map((s) => (
//                     <tr key={s._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
//                       <td className="p-3">
//                         {s.photo ? (
//                           <img src={getImageUrl(s.photo)} alt="" className="w-8 h-8 rounded-full object-cover" />
//                         ) : (
//                           <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
//                             {s.name[0]}
//                           </div>
//                         )}
//                       </td>
//                       <td className="p-3">{s.rollNo}</td>
//                       <td className="p-3 font-medium">{s.name}</td>
//                       <td className="p-3">{s.class}-{s.section}</td>
//                       <td className="p-3">{s.mobileNo || '-'}</td>
//                       <td className="p-3 text-right">
//                         <div className="flex justify-end gap-1">
//                           <Link to={`/students/${s._id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
//                             <Eye size={16} />
//                           </Link>
//                           <button onClick={() => handleDelete(s._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
//                             <Trash2 size={16} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               {students.length === 0 && <p className="text-center py-8 text-gray-500">No students found</p>}
//             </div>
//           )}
//           {pagination.pages > 1 && (
//             <div className="flex justify-center gap-2 mt-4">
//               {Array.from({ length: pagination.pages }, (_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setPage(i + 1)}
//                   className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//           )}
//         </Card>
//       </div>

//       <Modal isOpen={showModal} onClose={handleCloseModal} title="Add Student" size="lg">
//         <div className="grid grid-cols-2 gap-4">
//           {template?.fields?.map((field) => {
//             if (field.type === 'image') return null;

//             const isStandardField = ['name', 'rollNo', 'class', 'section', 'fatherName', 'motherName', 'mobileNo', 'email', 'address'].includes(field.key);
//             const value = isStandardField
//               ? (form[field.key] !== undefined ? form[field.key] : '')
//               : (customFields[field.key] || '');

//             const handleChange = (val) => {
//               if (isStandardField) {
//                 setForm((prev) => ({ ...prev, [field.key]: val }));
//               } else {
//                 setCustomFields((prev) => ({ ...prev, [field.key]: val }));
//               }
//             };

//             if (field.type === 'dropdown') {
//               return (
//                 <div key={field.key}>
//                   <Select
//                     label={field.label}
//                     value={value}
//                     onChange={(e) => handleChange(e.target.value)}
//                     options={[{ value: '', label: `Select ${field.label}` }, ...(field.options || []).map((o) => ({ value: o, label: o }))]}
//                     required={field.required}
//                   />
//                 </div>
//               );
//             }

//             if (field.type === 'textarea') {
//               return (
//                 <div key={field.key} className="col-span-2">
//                   <Input
//                     label={field.label}
//                     value={value}
//                     onChange={(e) => handleChange(e.target.value)}
//                     type="textarea"
//                     required={field.required}
//                   />
//                 </div>
//               );
//             }

//             return (
//               <Input
//                 key={field.key}
//                 label={field.label}
//                 value={value}
//                 onChange={(e) => handleChange(e.target.value)}
//                 type={field.type}
//                 required={field.required}
//               />
//             );
//           })}

//           {template?.fields?.some((f) => f.type === 'image') && (
//             <div className="col-span-2">
//               <label className="text-sm font-medium">Photo</label>
//               <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} className="mt-1 block w-full" />
//             </div>
//           )}
//         </div>
//         <Button onClick={handleCreate} className="w-full mt-4">Save Student</Button>
//       </Modal>
//     </SessionGuard>
//   );
// }




import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Eye, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getImageUrl } from '../utils/helpers';

const DRAFT_KEY = 'studentFormDraft';

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [template, setTemplate] = useState(null);
  const [classFilter, setClassFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', rollNo: '', class: '', section: 'A', fatherName: '', motherName: '', mobileNo: '', email: '', address: '',
  });
  const [customFields, setCustomFields] = useState({});
  const [photo, setPhoto] = useState(null);
  const [imageFiles, setImageFiles] = useState({}); // key → File for custom image fields
  const [loadingModal, setLoadingModal] = useState(false);

  const resetForm = () => {
    setForm({ name: '', rollNo: '', class: '', section: 'A', fatherName: '', motherName: '', mobileNo: '', email: '', address: '' });
    setCustomFields({});
    setPhoto(null);
    setImageFiles({});
    localStorage.removeItem(DRAFT_KEY);
  };

  const handleCloseModal = () => {
    resetForm();
    setShowModal(false);
  };

  const handleOpenModal = async () => {
    setLoadingModal(true);
    try {
      const { data } = await api.get('/templates');
      setTemplate(data.data);

      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const { form: savedForm, customFields: savedCustom } = JSON.parse(saved);
        setForm(savedForm);
        setCustomFields(savedCustom);
        toast('Draft restored', { icon: '📝' });
      } else {
        resetForm();
      }
    } catch {
      toast.error('Failed to load latest template');
    } finally {
      setLoadingModal(false);
      setShowModal(true);
    }
  };

  // Auto-save draft whenever form or customFields change while modal is open
  useEffect(() => {
    if (!showModal) return;
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, customFields }));
  }, [form, customFields, showModal]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/students', {
        params: { class: classFilter, search, page, limit: 15 },
      });
      setStudents(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/students/classes'),
      api.get('/templates'),
    ])
      .then(([classesRes, templateRes]) => {
        setClasses(classesRes.data.data);
        setTemplate(templateRes.data.data);
      })
      .catch(() => toast.error('Failed to load data'));
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [classFilter, search, page]);

  const handleCreate = async () => {
    // Validate required fields
    const errors = [];
    
    // Always check core required fields (rollNo, class, name)
    const coreRequiredFields = ['name', 'rollNo', 'class'];
    coreRequiredFields.forEach((fieldKey) => {
      const value = form[fieldKey];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        const fieldLabel = template?.fields?.find(f => f.key === fieldKey)?.label || fieldKey;
        errors.push(`${fieldLabel} is required`);
      }
    });
    
    // Check template-defined required fields
    template?.fields?.forEach((field) => {
      if (!field.required) return;
      
      const isStandardField = ['name', 'rollNo', 'class', 'section', 'fatherName', 'motherName', 'mobileNo', 'email', 'address'].includes(field.key);
      const value = isStandardField ? form[field.key] : customFields[field.key];
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        // Only add error if not already in errors list
        const errorMsg = `${field.label || field.key} is required`;
        if (!errors.includes(errorMsg)) {
          errors.push(errorMsg);
        }
      }
    });

    if (errors.length > 0) {
      toast.error(errors.join(', '));
      return;
    }

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));

    Object.entries(customFields).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        fd.append(k, v);
      }
    });

    if (photo) fd.append('photo', photo);
    // Append all custom image fields (e.g. aadhaarCard, etc.)
    Object.entries(imageFiles).forEach(([k, file]) => {
      if (file) fd.append(k, file);
    });
    try {
      await api.post('/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      localStorage.removeItem(DRAFT_KEY);
      toast.success('Student added successfully');
      handleCloseModal();
      fetchStudents();
    } catch (err) {
      // Extract detailed error message from API response
      const errorMessage = err.data?.message || err.message || 'Failed to add student';
      const errorDetails = err.data?.errors || [];
      
      let displayMessage = errorMessage;
      if (errorDetails && errorDetails.length > 0) {
        displayMessage = `${errorMessage} - ${errorDetails.join(', ')}`;
      }
      toast.error(displayMessage);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this student? All marks and related data will be permanently removed.')) return;
    const { data } = await api.delete(`/students/${id}`);
    toast.success(data.message || 'Student deleted');
    fetchStudents();
  };

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Management</h1>
            <p className="text-gray-500">Manage students by class</p>
          </div>
          <Button onClick={handleOpenModal} loading={loadingModal}><Plus size={16} /> Add Student</Button>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select
            value={classFilter}
            onChange={(e) => { setClassFilter(e.target.value); setPage(1); }}
            options={[{ value: '', label: 'All Classes' }, ...classes.map((c) => ({ value: c, label: `Class ${c}` }))]}
            className="w-40"
          />
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name or roll no..."
              className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
        </div>

        <Card>
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="text-left p-3">Photo</th>
                    <th className="text-left p-3">Roll No</th>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Class</th>
                    <th className="text-left p-3">Mobile</th>
                    <th className="text-right p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s._id} className="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="p-3">
                        {s.photo ? (
                          <img src={getImageUrl(s.photo)} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold">
                            {s.name[0]}
                          </div>
                        )}
                      </td>
                      <td className="p-3">{s.rollNo}</td>
                      <td className="p-3 font-medium">{s.name}</td>
                      <td className="p-3">{s.class}-{s.section}</td>
                      <td className="p-3">{s.mobileNo || '-'}</td>
                      <td className="p-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Link to={`/students/${s._id}`} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                            <Eye size={16} />
                          </Link>
                          <button onClick={() => handleDelete(s._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {students.length === 0 && <p className="text-center py-8 text-gray-500">No students found</p>}
            </div>
          )}
          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {Array.from({ length: pagination.pages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Modal isOpen={showModal} onClose={handleCloseModal} title="Add Student" size="lg">
        <div className="grid grid-cols-2 gap-4">
          {/* Always include core required fields first */}
          {[
            { key: 'name', label: 'Student Name', type: 'text', required: true },
            { key: 'rollNo', label: 'Roll Number', type: 'text', required: true },
            { key: 'class', label: 'Class', type: 'text', required: true },
          ].map((field) => {
            const value = form[field.key] || '';
            const handleChange = (val) => setForm((prev) => ({ ...prev, [field.key]: val }));

            if (field.type === 'dropdown') {
              return (
                <div key={field.key}>
                  <Select
                    label={field.label}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    options={[{ value: '', label: `Select ${field.label}` }, ...(field.options || []).map((o) => ({ value: o, label: o }))]}
                    required={field.required}
                  />
                </div>
              );
            }

            return (
              <Input
                key={field.key}
                label={field.label}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                type={field.type}
                required={field.required}
              />
            );
          })}

          {/* Then render template fields (excluding core fields already rendered) */}
          {template?.fields?.map((field) => {
            // Skip core fields that are already rendered above
            if (['name', 'rollNo', 'class'].includes(field.key)) return null;
            
            const isStandardField = ['name', 'rollNo', 'class', 'section', 'fatherName', 'motherName', 'mobileNo', 'email', 'address'].includes(field.key);
            const value = isStandardField
              ? (form[field.key] !== undefined ? form[field.key] : '')
              : (customFields[field.key] || '');

            const handleChange = (val) => {
              if (isStandardField) {
                setForm((prev) => ({ ...prev, [field.key]: val }));
              } else {
                setCustomFields((prev) => ({ ...prev, [field.key]: val }));
              }
            };

            // ✅ Image fields: render each one with its own label (Photo, Aadhaar Card, etc.)
            if (field.type === 'image') {
              const isPhotoField = field.key === 'photo';
              return (
                <div key={field.key} className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {field.label}{field.required && <span className="text-red-500 ml-1">*</span>}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (isPhotoField) {
                        setPhoto(file);
                      } else {
                        setImageFiles((prev) => ({ ...prev, [field.key]: file }));
                      }
                    }}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {/* Preview */}
                  {(isPhotoField ? photo : imageFiles[field.key]) && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={URL.createObjectURL(isPhotoField ? photo : imageFiles[field.key])}
                        alt={field.label}
                        className="h-16 w-24 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => isPhotoField ? setPhoto(null) : setImageFiles((prev) => ({ ...prev, [field.key]: null }))}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            }

            if (field.type === 'dropdown') {
              return (
                <div key={field.key}>
                  <Select
                    label={field.label}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    options={[{ value: '', label: `Select ${field.label}` }, ...(field.options || []).map((o) => ({ value: o, label: o }))]}
                    required={field.required}
                  />
                </div>
              );
            }

            if (field.type === 'textarea') {
              return (
                <div key={field.key} className="col-span-2">
                  <Input
                    label={field.label}
                    value={value}
                    onChange={(e) => handleChange(e.target.value)}
                    type="textarea"
                    required={field.required}
                  />
                </div>
              );
            }

            return (
              <Input
                key={field.key}
                label={field.label}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                type={field.type}
                required={field.required}
              />
            );
          })}
        </div>
        <Button onClick={handleCreate} className="w-full mt-4">Save Student</Button>
      </Modal>
    </SessionGuard>
  );
}