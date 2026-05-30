// import { useEffect, useState } from 'react';
// import { useParams, Link } from 'react-router-dom';
// import { ArrowLeft, Upload } from 'lucide-react';
// import {
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
//   RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
// } from 'recharts';
// import api from '../utils/api';
// import Card from '../components/ui/Card';
// import LoadingSpinner from '../components/ui/LoadingSpinner';
// import SessionGuard from '../components/SessionGuard';
// import DocumentGallery from '../components/ui/DocumentGallery';
// import DocumentUploadModal from '../components/ui/DocumentUploadModal';
// import { getImageUrl, formatDate } from '../utils/helpers';

// export default function StudentProfilePage() {
//   const { id } = useParams();
//   const [data, setData] = useState(null);
//   const [documents, setDocuments] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [documentsLoading, setDocumentsLoading] = useState(false);
//   const [showUploadModal, setShowUploadModal] = useState(false);
//   const [viewMode, setViewMode] = useState('gallery');
//   const [deleteConfirm, setDeleteConfirm] = useState(null);

//   useEffect(() => {
//     Promise.all([
//       api.get(`/students/${id}`).then(({ data }) => setData(data.data)),
//       fetchDocuments(),
//     ]).finally(() => setLoading(false));
//   }, [id]);

//   const fetchDocuments = async () => {
//     setDocumentsLoading(true);
//     try {
//       const { data } = await api.get(`/students/${id}/documents`);
//       setDocuments(data.data || []);
//     } catch (err) {
//       console.error('Failed to fetch documents:', err);
//       setDocuments([]);
//     } finally {
//       setDocumentsLoading(false);
//     }
//   };

//   const handleDeleteDocument = async (docId) => {
//     try {
//       await api.delete(`/students/${id}/documents/${docId}`);
//       setDocuments(documents.filter((d) => d._id !== docId));
//       setDeleteConfirm(null);
//     } catch (err) {
//       alert(err.response?.data?.message || 'Failed to delete document');
//     }
//   };

//   if (loading) return <LoadingSpinner />;
//   if (!data) return <p>Student not found</p>;

//   const { student, marksSummary } = data;
//   const lineData = marksSummary.map((m) => ({
//     name: m.testName,
//     percentage: m.percentage,
//   }));

//   const latestMarks = marksSummary[marksSummary.length - 1];
//   const radarData = latestMarks?.subjects
//     ?.filter((s) => s.type === 'marks')
//     .map((s) => ({ subject: s.subjectName, marks: s.marks || 0 })) || [];

//   return (
//     <SessionGuard>
//       <div className="space-y-6">
//         <Link to="/students" className="inline-flex items-center gap-2 text-primary-600 hover:underline">
//           <ArrowLeft size={16} /> Back to Students
//         </Link>

//         <div className="flex items-start gap-6">
//           {student.photo ? (
//             <img src={getImageUrl(student.photo)} alt="" className="w-24 h-24 rounded-xl object-cover" />
//           ) : (
//             <div className="w-24 h-24 rounded-xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700">
//               {student.name[0]}
//             </div>
//           )}
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
//             <p className="text-gray-500">Roll: {student.rollNo} · Class {student.class}-{student.section}</p>
//           </div>
//         </div>

//         <div className="grid md:grid-cols-2 gap-6">
//           <Card title="Personal Details">
//             <dl className="space-y-2 text-sm">
//               {[['Father', student.fatherName], ['Mother', student.motherName], ['Mobile', student.mobileNo], ['Email', student.email], ['DOB', formatDate(student.dob)], ['Address', student.address]].map(([k, v]) => (
//                 <div key={k} className="flex justify-between">
//                   <dt className="text-gray-500">{k}</dt>
//                   <dd className="font-medium">{v || '-'}</dd>
//                 </div>
//               ))}
//             </dl>
//           </Card>

//           <Card title="Performance Trend">
//             {lineData.length > 0 ? (
//               <ResponsiveContainer width="100%" height={200}>
//                 <LineChart data={lineData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="name" tick={{ fontSize: 10 }} />
//                   <YAxis domain={[0, 100]} />
//                   <Tooltip />
//                   <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} />
//                 </LineChart>
//               </ResponsiveContainer>
//             ) : (
//               <p className="text-gray-500 text-sm">No marks data yet</p>
//             )}
//           </Card>
//         </div>

//         {radarData.length > 0 && (
//           <Card title="Subject Comparison (Latest Test)">
//             <ResponsiveContainer width="100%" height={250}>
//               <RadarChart data={radarData}>
//                 <PolarGrid />
//                 <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
//                 <PolarRadiusAxis />
//                 <Radar dataKey="marks" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
//               </RadarChart>
//             </ResponsiveContainer>
//           </Card>
//         )}

//         <Card title="Marks Summary">
//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b">
//                   <th className="text-left p-2">Test</th>
//                   <th className="text-left p-2">Obtained</th>
//                   <th className="text-left p-2">Max</th>
//                   <th className="text-left p-2">%</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {marksSummary.map((m) => (
//                   <tr key={m.testId} className="border-b border-gray-100 dark:border-gray-800">
//                     <td className="p-2">{m.testName}</td>
//                     <td className="p-2">{m.totalObtained}</td>
//                     <td className="p-2">{m.totalMax}</td>
//                     <td className="p-2 font-semibold">{m.percentage}%</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </Card>

//         <Card title="Documents">
//           <div className="space-y-4">
//             <div className="flex items-center justify-between">
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setViewMode('gallery')}
//                   className={`px-4 py-2 rounded-lg transition ${
//                     viewMode === 'gallery'
//                       ? 'bg-primary-600 text-white'
//                       : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   Gallery
//                 </button>
//                 <button
//                   onClick={() => setViewMode('list')}
//                   className={`px-4 py-2 rounded-lg transition ${
//                     viewMode === 'list'
//                       ? 'bg-primary-600 text-white'
//                       : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
//                   }`}
//                 >
//                   List
//                 </button>
//               </div>
//               <button
//                 onClick={() => setShowUploadModal(true)}
//                 className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
//               >
//                 <Upload size={16} /> Upload Document
//               </button>
//             </div>

//             {documentsLoading ? (
//               <div className="py-8 text-center text-gray-500">Loading documents...</div>
//             ) : (
//               <DocumentGallery
//                 documents={documents}
//                 onDelete={(docId) => setDeleteConfirm(docId)}
//                 showAsGallery={viewMode === 'gallery'}
//               />
//             )}
//           </div>
//         </Card>

//         {showUploadModal && (
//           <DocumentUploadModal
//             studentId={id}
//             onUploadSuccess={fetchDocuments}
//             onClose={() => setShowUploadModal(false)}
//           />
//         )}

//         {deleteConfirm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
//               <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Delete Document?</h3>
//               <p className="text-gray-600 dark:text-gray-400 mb-4">
//                 This action cannot be undone. Are you sure you want to delete this document?
//               </p>
//               <div className="flex gap-3">
//                 <button
//                   onClick={() => setDeleteConfirm(null)}
//                   className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleDeleteDocument(deleteConfirm)}
//                   className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//                 >
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//     </SessionGuard>
//   );
// }



import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Upload } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import api from '../utils/api';
import Card from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import SessionGuard from '../components/SessionGuard';
import DocumentGallery from '../components/ui/DocumentGallery';
import DocumentUploadModal from '../components/ui/DocumentUploadModal';
import { getImageUrl, formatDate } from '../utils/helpers';

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve the display value of a template field from the student object.
 * Standard fields live at the top level; custom fields live in student.customFields.
 */
const STANDARD_FIELD_KEYS = new Set([
  'name', 'rollNo', 'class', 'section',
  'fatherName', 'motherName', 'mobileNo',
  'email', 'address', 'dob', 'gender',
  'bloodGroup', 'photo',
]);

function getFieldValue(student, fieldKey) {
  if (STANDARD_FIELD_KEYS.has(fieldKey)) {
    return student[fieldKey] ?? null;
  }
  // customFields is a Mongoose Map → serialised as a plain object by the API
  const custom = student.customFields;
  if (!custom) return null;
  return custom[fieldKey] ?? null;
}

/**
 * Format a raw value for display based on field type.
 */
function formatValue(value, fieldType) {
  if (value === null || value === undefined || value === '') return '—';
  if (fieldType === 'date') return formatDate(value);
  return String(value);
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function StudentProfilePage() {
  const { id } = useParams();
  const [data, setData]               = useState(null);   // { student, template, marksSummary }
  const [documents, setDocuments]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal]   = useState(false);
  const [viewMode, setViewMode]       = useState('gallery');
  const [deleteConfirm, setDeleteConfirm]       = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/students/${id}`).then(({ data }) => setData(data.data)),
      fetchDocuments(),
    ]).finally(() => setLoading(false));
  }, [id]);

  const fetchDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const { data } = await api.get(`/students/${id}/documents`);
      setDocuments(data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.delete(`/students/${id}/documents/${docId}`);
      setDocuments(documents.filter((d) => d._id !== docId));
      setDeleteConfirm(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!data)   return <p>Student not found</p>;

  const { student, template, marksSummary } = data;

  // ── Chart data ────────────────────────────────────────────────────────────
  const lineData   = marksSummary.map((m) => ({ name: m.testName, percentage: m.percentage }));
  const latestMarks = marksSummary[marksSummary.length - 1];
  const radarData  = latestMarks?.subjects
    ?.filter((s) => s.type === 'marks')
    .map((s) => ({ subject: s.subjectName, marks: s.marks || 0 })) || [];

  // ── Template-driven field list ────────────────────────────────────────────
  // Use template fields if available; fall back to a sensible default list.
  const displayFields = template?.fields
    ? template.fields
        .filter((f) => f.type !== 'image')   // images shown separately via photo
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [
        { key: 'fatherName', label: "Father's Name",  type: 'text' },
        { key: 'motherName', label: "Mother's Name",  type: 'text' },
        { key: 'mobileNo',   label: 'Mobile',          type: 'text' },
        { key: 'email',      label: 'Email',            type: 'email' },
        { key: 'dob',        label: 'Date of Birth',    type: 'date' },
        { key: 'gender',     label: 'Gender',           type: 'dropdown' },
        { key: 'bloodGroup', label: 'Blood Group',      type: 'dropdown' },
        { key: 'address',    label: 'Address',          type: 'textarea' },
      ];

  // Photo field from template (may be custom-keyed)
  const photoField = template?.fields?.find((f) => f.type === 'image' && f.key === 'photo');
  // Other image fields from template (non-photo images)
  const extraImageFields = template?.fields?.filter((f) => f.type === 'image' && f.key !== 'photo') || [];

  return (
    <SessionGuard>
      <div className="space-y-6">
        <Link to="/students" className="inline-flex items-center gap-2 text-primary-600 hover:underline">
          <ArrowLeft size={16} /> Back to Students
        </Link>

        {/* ── Header ── */}
        <div className="flex items-start gap-6">
          {student.photo ? (
            <img src={getImageUrl(student.photo)} alt="" className="w-24 h-24 rounded-xl object-cover" />
          ) : (
            <div className="w-24 h-24 rounded-xl bg-primary-100 flex items-center justify-center text-3xl font-bold text-primary-700">
              {student.name?.[0] ?? '?'}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{student.name}</h1>
            <p className="text-gray-500">
              Roll: {student.rollNo} · Class {student.class}
              {student.section ? `-${student.section}` : ''}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ── Personal Details (template-driven) ── */}
          <Card title="Personal Details">
            <dl className="space-y-2 text-sm">
              {displayFields.map((field) => {
                const rawValue = getFieldValue(student, field.key);
                // Skip system / identity fields already shown in the header
                if (['name', 'rollNo', 'class', 'section'].includes(field.key)) return null;
                return (
                  <div key={field.key} className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">{field.label}</dt>
                    <dd className="font-medium text-right break-all">
                      {formatValue(rawValue, field.type)}
                    </dd>
                  </div>
                );
              })}

              {/* Extra image fields (e.g. Aadhaar Card) displayed as links */}
              {extraImageFields.map((field) => {
                const val = getFieldValue(student, field.key);
                if (!val) return null;
                return (
                  <div key={field.key} className="flex justify-between gap-4">
                    <dt className="text-gray-500 shrink-0">{field.label}</dt>
                    <dd className="font-medium">
                      <a
                        href={getImageUrl(val)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        View
                      </a>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </Card>

          {/* ── Performance Trend ── */}
          <Card title="Performance Trend">
            {lineData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Line type="monotone" dataKey="percentage" stroke="#2563eb" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500 text-sm">No marks data yet</p>
            )}
          </Card>
        </div>

        {/* ── Radar chart ── */}
        {radarData.length > 0 && (
          <Card title="Subject Comparison (Latest Test)">
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis />
                <Radar dataKey="marks" stroke="#2563eb" fill="#2563eb" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* ── Marks Summary ── */}
        <Card title="Marks Summary">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Test</th>
                  <th className="text-left p-2">Obtained</th>
                  <th className="text-left p-2">Max</th>
                  <th className="text-left p-2">%</th>
                </tr>
              </thead>
              <tbody>
                {marksSummary.map((m) => (
                  <tr key={m.testId} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="p-2">{m.testName}</td>
                    <td className="p-2">{m.totalObtained}</td>
                    <td className="p-2">{m.totalMax}</td>
                    <td className="p-2 font-semibold">{m.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ── Documents ── */}
        <Card title="Documents">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {['gallery', 'list'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 rounded-lg transition capitalize ${
                      viewMode === mode
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowUploadModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
              >
                <Upload size={16} /> Upload Document
              </button>
            </div>

            {documentsLoading ? (
              <div className="py-8 text-center text-gray-500">Loading documents...</div>
            ) : (
              <DocumentGallery
                documents={documents}
                onDelete={(docId) => setDeleteConfirm(docId)}
                showAsGallery={viewMode === 'gallery'}
              />
            )}
          </div>
        </Card>

        {/* ── Modals ── */}
        {showUploadModal && (
          <DocumentUploadModal
            studentId={id}
            onUploadSuccess={fetchDocuments}
            onClose={() => setShowUploadModal(false)}
          />
        )}

        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Document?
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                This action cannot be undone. Are you sure you want to delete this document?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteDocument(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </SessionGuard>
  );
}