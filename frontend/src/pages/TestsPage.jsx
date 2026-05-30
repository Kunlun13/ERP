import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Modal from '../components/ui/Modal';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { EXAM_TYPES } from '../utils/helpers';

export default function TestsPage() {
  const [tests, setTests] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    testName: '', class: '10', examType: 'Unit Test',
    subjects: [{ name: 'Maths', type: 'marks', maxMarks: 100 }],
  });

  const fetchTests = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tests', { params: { class: classFilter } });
      setTests(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTests(); }, [classFilter]);

  const addSubject = () => {
    setForm({
      ...form,
      subjects: [...form.subjects, { name: '', type: 'marks', maxMarks: 100 }],
    });
  };

  const updateSubject = (i, updates) => {
    const subjects = [...form.subjects];
    subjects[i] = { ...subjects[i], ...updates };
    setForm({ ...form, subjects });
  };

  const removeSubject = (i) => {
    setForm({ ...form, subjects: form.subjects.filter((_, idx) => idx !== i) });
  };

  const handleCreate = async () => {
    if (!form.testName || form.subjects.some((s) => !s.name)) {
      return toast.error('Fill all required fields');
    }
    try {
      await api.post('/tests', form);
      toast.success('Test created');
      setShowModal(false);
      fetchTests();
    } catch (err) {
      toast.error(err.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete test?')) return;
    await api.delete(`/tests/${id}`);
    toast.success('Deleted');
    fetchTests();
  };

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Test Creation</h1>
            <p className="text-gray-500">Create exams with marks or grade subjects</p>
          </div>
          <Button onClick={() => setShowModal(true)}><Plus size={16} /> Create Test</Button>
        </div>

        <Input
          label="Filter by Class"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          placeholder="e.g. 10 (leave empty for all)"
          className="max-w-xs"
        />

        {loading ? <LoadingSpinner /> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tests.map((test) => (
              <Card key={test._id}>
                <h3 className="font-semibold text-lg">{test.testName}</h3>
                <p className="text-sm text-gray-500">Class {test.class} · {test.examType}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {test.subjects.map((s) => (
                    <span key={s.name} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      {s.name} ({s.type === 'marks' ? `${s.maxMarks}m` : 'Grade'})
                    </span>
                  ))}
                </div>
                <button onClick={() => handleDelete(test._id)} className="mt-3 text-red-500 text-sm flex items-center gap-1">
                  <Trash2 size={14} /> Delete
                </button>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Test" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <Input label="Test Name" value={form.testName} onChange={(e) => setForm({ ...form, testName: e.target.value })} />
            <Input label="Class" value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} />
            <Select label="Exam Type" value={form.examType} onChange={(e) => setForm({ ...form, examType: e.target.value })} options={EXAM_TYPES} />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Subjects</h4>
              <Button variant="secondary" onClick={addSubject}><Plus size={14} /> Add</Button>
            </div>
            {form.subjects.map((sub, i) => (
              <div key={i} className="flex gap-2 items-end">
                <Input label="Name" value={sub.name} onChange={(e) => updateSubject(i, { name: e.target.value })} />
                <Select
                  label="Type"
                  value={sub.type}
                  onChange={(e) => updateSubject(i, { type: e.target.value })}
                  options={[{ value: 'marks', label: 'Marks' }, { value: 'grade', label: 'Grade' }]}
                />
                {sub.type === 'marks' && (
                  <Input label="Max" type="number" value={sub.maxMarks} onChange={(e) => updateSubject(i, { maxMarks: +e.target.value })} />
                )}
                <button onClick={() => removeSubject(i)} className="p-2 text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <Button onClick={handleCreate} className="w-full">Create Test</Button>
        </div>
      </Modal>
    </SessionGuard>
  );
}
