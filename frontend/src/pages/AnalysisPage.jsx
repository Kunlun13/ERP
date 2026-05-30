import { useEffect, useState, useRef } from 'react';
import { Download, Printer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { exportElementToPDF, printElement } from '../utils/pdfExport';

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#dc2626'];

export default function AnalysisPage() {
  const [mode, setMode] = useState('class');
  const [classes, setClasses] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [testId, setTestId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const reportRef = useRef();

  useEffect(() => {
    api.get('/students/classes').then(({ data }) => setClasses(data.data));
  }, []);

  useEffect(() => {
    if (classFilter) {
      api.get('/tests', { params: { class: classFilter } }).then(({ data }) => setTests(data.data));
      api.get('/students', { params: { class: classFilter, limit: 100 } }).then(({ data }) => setStudents(data.data));
    }
  }, [classFilter]);

  const loadAnalysis = async () => {
    setLoading(true);
    try {
      if (mode === 'class') {
        const { data } = await api.get('/analytics/class', { params: { class: classFilter, testId } });
        setAnalysis(data.data);
      } else {
        const { data } = await api.get(`/analytics/student/${studentId}`);
        setAnalysis(data.data);
      }
    } catch {
      toast.error('Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      await exportElementToPDF(reportRef.current, `analysis-${Date.now()}.pdf`);
      toast.success('PDF downloaded');
    } catch {
      toast.error('PDF export failed');
    }
  };

  const passFailData = analysis?.stats
    ? [
        { name: 'Passed', value: analysis.stats.passed },
        { name: 'Failed', value: analysis.stats.failed },
      ]
    : [];

  const barData = analysis?.students?.slice(0, 15).map((s) => ({
    name: s.rollNo,
    percentage: s.percentage,
  })) || [];

  const studentLineData = analysis?.testPerformance?.map((t) => ({
    name: t.testName,
    percentage: t.percentage,
  })) || [];

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-500">Class and student performance analysis</p>
          </div>
          {analysis && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => printElement(reportRef.current)}>
                <Printer size={16} /> Print
              </Button>
              <Button onClick={handleExportPDF}><Download size={16} /> Export PDF</Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {['class', 'student'].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setAnalysis(null); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${mode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              {m === 'class' ? 'Class-wise' : 'Student-wise'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {mode === 'class' ? (
            <>
              <Select label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
                options={[{ value: '', label: 'Select' }, ...classes.map((c) => ({ value: c, label: `Class ${c}` }))]} className="w-36" />
              <Select label="Test" value={testId} onChange={(e) => setTestId(e.target.value)}
                options={[{ value: '', label: 'Select' }, ...tests.map((t) => ({ value: t._id, label: t.testName }))]} className="w-48" />
            </>
          ) : (
            <>
              <Select label="Class" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}
                options={[{ value: '', label: 'Select' }, ...classes.map((c) => ({ value: c, label: `Class ${c}` }))]} className="w-36" />
              <Select label="Student" value={studentId} onChange={(e) => setStudentId(e.target.value)}
                options={[{ value: '', label: 'Select' }, ...students.map((s) => ({ value: s._id, label: `${s.rollNo} - ${s.name}` }))]} className="w-56" />
            </>
          )}
          <Button onClick={loadAnalysis}>Analyze</Button>
        </div>

        {loading && <LoadingSpinner />}

        {analysis && (
          <div ref={reportRef} className="space-y-6 bg-white p-4">
            {mode === 'class' && analysis.stats && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    ['Total', analysis.stats.totalStudents],
                    ['Passed', analysis.stats.passed],
                    ['Failed', analysis.stats.failed],
                    ['Average %', `${analysis.stats.average}%`],
                  ].map(([label, val]) => (
                    <div key={label} className="p-4 bg-gray-50 rounded-lg text-center">
                      <p className="text-sm text-gray-500">{label}</p>
                      <p className="text-xl font-bold">{val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card title="Marks Comparison">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={barData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar dataKey="percentage" fill="#2563eb" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Card>
                  <Card title="Pass/Fail Distribution">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie data={passFailData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                          {passFailData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                        </Pie>
                        <Legend />
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </Card>
                </div>

                <Card title="Rankings">
                  <table className="w-full text-sm">
                    <thead><tr><th className="p-2 text-left">Rank</th><th className="p-2 text-left">Name</th><th className="p-2">Roll</th><th className="p-2">%</th><th className="p-2">Grade</th></tr></thead>
                    <tbody>
                      {analysis.students.map((s) => (
                        <tr key={s.studentId} className="border-t">
                          <td className="p-2">{s.rank}</td>
                          <td className="p-2">{s.name}</td>
                          <td className="p-2">{s.rollNo}</td>
                          <td className="p-2">{s.percentage}%</td>
                          <td className="p-2">{s.grade}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              </>
            )}

            {mode === 'student' && (
              <Card title={`Performance - ${analysis.student?.name}`}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={studentLineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#2563eb" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </div>
        )}
      </div>
    </SessionGuard>
  );
}
