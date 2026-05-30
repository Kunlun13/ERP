import { useEffect, useState, useRef } from 'react';
import { Download, Printer, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StudentReportCard from '../components/reports/StudentReportCard';
import { exportElementToPDF, printReportCard } from '../utils/pdfExport';
import { normalizeReportCard } from '../utils/reportUtils';

export default function ReportsPage() {
  const [students, setStudents] = useState([]);
  const [tests, setTests] = useState([]);
  const [studentId, setStudentId] = useState('');
  const [selectedTests, setSelectedTests] = useState([]);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [classFilter, setClassFilter] = useState('');
  const reportRef = useRef();

  useEffect(() => {
    api.get('/students', { params: { limit: 200 } }).then(({ data }) => setStudents(data.data));
  }, []);

  useEffect(() => {
    if (classFilter) {
      api.get('/tests', { params: { class: classFilter } }).then(({ data }) => setTests(data.data));
    } else {
      setTests([]);
    }
  }, [classFilter]);

  useEffect(() => {
    if (studentId) {
      const student = students.find((s) => s._id === studentId);
      if (student?.class) {
        setClassFilter(student.class);
        api.get('/tests', { params: { class: student.class } }).then(({ data }) => setTests(data.data));
      }
    }
  }, [studentId, students]);

  const handleGenerate = async () => {
    if (!studentId || selectedTests.length === 0) {
      return toast.error('Select student and at least one test');
    }
    setLoading(true);
    setReportData(null);
    try {
      const { data } = await api.post('/reports/generate', {
        studentId,
        testIds: selectedTests,
      });
      console.log('API Response:', data);
      const selectedTestObjects = tests.filter((t) =>
        selectedTests.some((id) => String(id) === String(t._id))
      );
      console.log('Selected Tests:', selectedTests, selectedTestObjects);

      const normalized = normalizeReportCard(data.data, selectedTestObjects);
      const hasMarks = normalized?.marksSection?.columns?.length > 0;
      const hasGrade = normalized?.gradeSection?.columns?.length > 0;
      if (!hasMarks && !hasGrade) {
        toast.error('No marks or grade tests in selection. Check test subject types.');
        return;
      }
      setReportData(normalized);
      toast.success('Report ready — download PDF or print');
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportData || !reportRef.current) return;
    try {
      const student = students.find((s) => s._id === studentId);
      await exportElementToPDF(
        reportRef.current.querySelector('.src-sheet') || reportRef.current,
        `report-${student?.rollNo || 'student'}.pdf`
      );
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    }
  };

  const handlePrint = () => {
    if (!reportRef.current) return;
    printReportCard(reportRef.current.querySelector('.src-sheet') || reportRef.current);
  };

  const toggleTest = (id) => {
    const sid = String(id);
    setSelectedTests((prev) =>
      prev.some((t) => String(t) === sid)
        ? prev.filter((t) => String(t) !== sid)
        : [...prev, sid]
    );
  };

  const getTestTypeLabel = (test) => {
    const hasMarks = test.subjects?.some((s) => s.type === 'marks');
    const hasGrade = test.subjects?.some((s) => s.type === 'grade');
    if (hasMarks && hasGrade) return 'Mixed';
    if (hasMarks) return 'Marks';
    if (hasGrade) return 'Grade';
    return '';
  };

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Student Report PDF</h1>
            <p className="text-gray-500">Generate final A4 report card — marks table + grade table</p>
          </div>
          {reportData && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleGenerate}>
                <RefreshCw size={16} /> Regenerate
              </Button>
              <Button variant="secondary" onClick={handlePrint}>
                <Printer size={16} /> Print
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download size={16} /> Download PDF
              </Button>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card title="Generate Report">
              <div className="space-y-4">
                <Input
                  label="Class"
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setSelectedTests([]);
                    setReportData(null);
                  }}
                  placeholder="e.g. 10"
                />
                <Select
                  label="Student"
                  value={studentId}
                  onChange={(e) => {
                    setStudentId(e.target.value);
                    setSelectedTests([]);
                    setReportData(null);
                  }}
                  options={[
                    { value: '', label: 'Select Student' },
                    ...students
                      .filter((s) => !classFilter || s.class === classFilter)
                      .map((s) => ({ value: s._id, label: `${s.rollNo} - ${s.name}` })),
                  ]}
                />

                <div>
                  <p className="text-sm font-medium mb-2">Select tests</p>
                  {tests.length === 0 ? (
                    <p className="text-xs text-gray-500">Select class or student</p>
                  ) : (
                    <div className="space-y-1 max-h-52 overflow-y-auto border rounded-lg p-2 dark:border-gray-700">
                      {tests.map((t) => (
                        <label
                          key={t._id}
                          className="flex items-center gap-2 text-sm p-1.5 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTests.some((id) => String(id) === String(t._id))}
                            onChange={() => toggleTest(t._id)}
                          />
                          <span className="flex-1">
                            {t.testName}
                            <span
                              className={`ml-1 text-xs px-1.5 py-0.5 rounded ${
                                getTestTypeLabel(t) === 'Marks'
                                  ? 'bg-blue-100 text-blue-700'
                                  : getTestTypeLabel(t) === 'Grade'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {getTestTypeLabel(t)}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleGenerate} loading={loading} className="w-full">
                  <FileText size={16} /> Generate Report
                </Button>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            {loading ? (
              <LoadingSpinner />
            ) : reportData ? (
              <div
                ref={reportRef}
                className="overflow-x-auto bg-gray-100 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <StudentReportCard data={reportData} />
              </div>
            ) : (
              <Card className="text-center py-20 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-medium">No report generated</p>
                <p className="text-sm mt-2">Select student and tests, then generate</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </SessionGuard>
  );
}
