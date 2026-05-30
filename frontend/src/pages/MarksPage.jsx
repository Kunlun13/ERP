import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { GRADES } from '../utils/helpers';

const emptySubjects = (testSubjects) =>
  testSubjects.map((s) => ({
    subjectName: s.name,
    type: s.type,
    marks: '',
    grade: '',
    isAbsent: false,
  }));

const mapEntryFromApi = (entry, testSubjects) => ({
  studentId: entry.student._id,
  student: entry.student,
  subjects: entry.mark?.subjects ?? emptySubjects(testSubjects),
  remarks: entry.mark?.remarks || '',
  hasExisting: entry.hasExisting || Boolean(entry.mark),
});

export default function MarksPage() {
  const [mode, setMode] = useState('class');
  const [classes, setClasses] = useState([]);
  const [tests, setTests] = useState([]);
  const [students, setStudents] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [studentId, setStudentId] = useState('');
  const [testId, setTestId] = useState('');
  const [entries, setEntries] = useState([]);
  const [studentEntry, setStudentEntry] = useState(null);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/students/classes').then(({ data }) => setClasses(data.data));
  }, []);

  useEffect(() => {
    if (classFilter) {
      api.get('/tests', { params: { class: classFilter } }).then(({ data }) => setTests(data.data));
      api.get('/students', { params: { class: classFilter, limit: 200 } }).then(({ data }) => setStudents(data.data));
    } else {
      setTests([]);
      setStudents([]);
    }
  }, [classFilter]);

  useEffect(() => {
    setEntries([]);
    setStudentEntry(null);
    setTest(null);
    setTestId('');
    if (mode === 'student') setStudentId('');
  }, [mode]);

  useEffect(() => {
    if (mode === 'class' && testId && classFilter) loadClassMarks();
  }, [testId, mode, classFilter]);

  useEffect(() => {
    if (mode === 'student' && testId && studentId && classFilter) loadStudentMarks();
  }, [testId, studentId, mode, classFilter]);

  const loadClassMarks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marks', { params: { testId, class: classFilter } });
      setTest(data.data.test);
      setEntries(
        data.data.entries.map((entry) => mapEntryFromApi(entry, data.data.test.subjects))
      );
    } catch {
      toast.error('Failed to load marks');
    } finally {
      setLoading(false);
    }
  };

  const loadStudentMarks = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/marks', {
        params: { testId, class: classFilter, studentId },
      });
      setTest(data.data.test);
      const entry = data.data.entries[0];
      if (entry) {
        setStudentEntry(mapEntryFromApi(entry, data.data.test.subjects));
      }
    } catch {
      toast.error('Failed to load student marks');
    } finally {
      setLoading(false);
    }
  };

  const getMaxMarks = (subjectName) => {
    const sub = test?.subjects?.find((s) => s.name === subjectName);
    return sub?.maxMarks ?? 100;
  };

  const updateMarksValue = (subjects, subIdx, rawValue) => {
    const sub = subjects[subIdx];
    const max = getMaxMarks(sub.subjectName);
    let marks = rawValue === '' ? '' : Number(rawValue);

    if (marks !== '' && !Number.isNaN(marks)) {
      if (marks < 0) marks = 0;
      if (marks > max) {
        toast.error(`${sub.subjectName}: maximum marks is ${max}`);
        marks = max;
      }
    }

    const updated = [...subjects];
    updated[subIdx] = { ...updated[subIdx], marks };
    return updated;
  };

  const updateEntry = (idx, subIdx, field, value) => {
    const updated = [...entries];
    if (field === 'marks') {
      updated[idx].subjects = updateMarksValue(updated[idx].subjects, subIdx, value);
    } else {
      updated[idx].subjects[subIdx] = { ...updated[idx].subjects[subIdx], [field]: value };
    }
    setEntries(updated);
  };

  const updateStudentSubject = (subIdx, field, value) => {
    if (!studentEntry) return;
    let subjects = [...studentEntry.subjects];
    if (field === 'marks') {
      subjects = updateMarksValue(subjects, subIdx, value);
    } else {
      subjects[subIdx] = { ...subjects[subIdx], [field]: value };
    }
    setStudentEntry({ ...studentEntry, subjects });
  };

  const handleBulkSave = async () => {
    setSaving(true);
    try {
      await api.post('/marks/bulk', {
        testId,
        entries: entries.map((e) => ({
          studentId: e.studentId,
          subjects: e.subjects,
          remarks: e.remarks,
        })),
      });
      toast.success('Marks saved successfully');
      loadClassMarks();
    } catch (err) {
      toast.error(err.message || err.errors?.[0] || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleStudentSave = async () => {
    if (!studentEntry) return;
    setSaving(true);
    try {
      await api.post('/marks', {
        testId,
        studentId: studentEntry.studentId,
        subjects: studentEntry.subjects,
        remarks: studentEntry.remarks,
      });
      toast.success('Marks saved successfully');
      loadStudentMarks();
    } catch (err) {
      toast.error(err.message || err.errors?.[0] || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const renderSubjectInput = (sub, subIdx, onUpdate, isAbsent) => {
    const max = getMaxMarks(sub.subjectName);
    if (sub.type === 'grade') {
      return (
        <select
          value={sub.grade || ''}
          onChange={(e) => onUpdate(subIdx, 'grade', e.target.value)}
          className="w-full px-2 py-2 border rounded-lg dark:bg-gray-800"
          disabled={isAbsent}
        >
          <option value="">Select grade</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      );
    }
    return (
      <div>
        <input
          type="number"
          value={sub.marks ?? ''}
          onChange={(e) => onUpdate(subIdx, 'marks', e.target.value)}
          className="w-full px-2 py-2 border rounded-lg dark:bg-gray-800"
          disabled={isAbsent}
          min={0}
          max={max}
          placeholder={`0 - ${max}`}
        />
        <p className="text-xs text-gray-400 mt-1">Max: {max}</p>
      </div>
    );
  };

  const switchMode = (m) => {
    setMode(m);
    setTestId('');
    setEntries([]);
    setStudentEntry(null);
    setTest(null);
  };

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marks Entry</h1>
          <p className="text-gray-500">
            {mode === 'class'
              ? 'Enter marks for all students in a class'
              : 'Select one student and enter marks for a test'}
          </p>
        </div>

        <div className="flex gap-2">
          {['class', 'student'].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === m ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-gray-800'
              }`}
            >
              {m === 'class' ? 'Class-wise' : 'Student-wise'}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Select
            label="Class"
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setTestId('');
              setStudentId('');
            }}
            options={[{ value: '', label: 'Select Class' }, ...classes.map((c) => ({ value: c, label: `Class ${c}` }))]}
            className="w-40"
          />

          {mode === 'student' && (
            <Select
              label="Student"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                setTestId('');
              }}
              options={[
                { value: '', label: 'Select Student' },
                ...students.map((s) => ({ value: s._id, label: `${s.rollNo} - ${s.name}` })),
              ]}
              className="w-56"
            />
          )}

          <Select
            label="Test"
            value={testId}
            onChange={(e) => setTestId(e.target.value)}
            options={[{ value: '', label: 'Select Test' }, ...tests.map((t) => ({ value: t._id, label: t.testName }))]}
            className="w-48"
            disabled={mode === 'student' && !studentId}
          />
        </div>

        {loading && <LoadingSpinner />}

        {/* Class-wise table */}
        {!loading && mode === 'class' && entries.length > 0 && test && (
          <Card
            title={`Class Marks - ${test.testName}`}
            action={
              <div className="flex items-center gap-3">
                {entries.some((e) => e.hasExisting) && (
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Saved marks loaded — edit and save to update
                  </span>
                )}
                <Button onClick={handleBulkSave} loading={saving}>
                  {entries.some((e) => e.hasExisting) ? 'Update All' : 'Save All'}
                </Button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="p-2 text-left">Roll</th>
                    <th className="p-2 text-left">Name</th>
                    {test.subjects.map((s) => (
                      <th key={s.name} className="p-2 text-center min-w-[90px]">
                        {s.name}
                        {s.type === 'marks' && (
                          <span className="block text-xs font-normal text-gray-400">/{s.maxMarks}</span>
                        )}
                      </th>
                    ))}
                    <th className="p-2">AB</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, ei) => (
                    <tr
                      key={entry.studentId}
                      className={`border-t border-gray-100 dark:border-gray-800 ${
                        entry.hasExisting ? 'bg-green-50/50 dark:bg-green-900/10' : ''
                      }`}
                    >
                      <td className="p-2">{entry.student.rollNo}</td>
                      <td className="p-2 font-medium">
                        {entry.student.name}
                        {entry.hasExisting && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">(saved)</span>
                        )}
                      </td>
                      {entry.subjects.map((sub, si) => (
                        <td key={si} className="p-2 text-center">
                          {sub.type === 'grade' ? (
                            <select
                              value={sub.grade || ''}
                              onChange={(e) => updateEntry(ei, si, 'grade', e.target.value)}
                              className="w-20 px-1 py-1 border rounded text-center"
                              disabled={sub.isAbsent}
                            >
                              <option value="">-</option>
                              {GRADES.map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="number"
                              value={sub.marks ?? ''}
                              onChange={(e) => updateEntry(ei, si, 'marks', e.target.value)}
                              className="w-16 px-1 py-1 border rounded text-center"
                              disabled={sub.isAbsent}
                              min={0}
                              max={test.subjects[si]?.maxMarks || 100}
                              title={`Max ${test.subjects[si]?.maxMarks}`}
                            />
                          )}
                        </td>
                      ))}
                      <td className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={entry.subjects.some((s) => s.isAbsent)}
                          onChange={(e) => {
                            const updated = [...entries];
                            updated[ei].subjects = updated[ei].subjects.map((s) => ({
                              ...s,
                              isAbsent: e.target.checked,
                            }));
                            setEntries(updated);
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Student-wise single form */}
        {!loading && mode === 'student' && studentEntry && test && (
          <Card
            title={`${studentEntry.student.name} (${studentEntry.student.rollNo}) - ${test.testName}`}
            action={
              <Button onClick={handleStudentSave} loading={saving}>
                {studentEntry.hasExisting ? 'Update Marks' : 'Save Marks'}
              </Button>
            }
          >
            {studentEntry.hasExisting && (
              <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-700 dark:text-green-300">
                Previously saved marks are loaded below. Edit any subject and click Update Marks.
              </div>
            )}
            <div className="mb-4 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={studentEntry.subjects.some((s) => s.isAbsent)}
                  onChange={(e) =>
                    setStudentEntry({
                      ...studentEntry,
                      subjects: studentEntry.subjects.map((s) => ({
                        ...s,
                        isAbsent: e.target.checked,
                      })),
                    })
                  }
                />
                Mark as Absent (AB)
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentEntry.subjects.map((sub, si) => (
                <div key={si} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <label className="block text-sm font-medium mb-2">
                    {sub.subjectName}
                    <span className="text-gray-400 ml-1">
                      ({sub.type === 'marks' ? `Max ${getMaxMarks(sub.subjectName)}` : 'Grade'})
                    </span>
                  </label>
                  {renderSubjectInput(
                    sub,
                    si,
                    updateStudentSubject,
                    studentEntry.subjects.some((s) => s.isAbsent)
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Input
                label="Remarks"
                value={studentEntry.remarks}
                onChange={(e) => setStudentEntry({ ...studentEntry, remarks: e.target.value })}
              />
            </div>
          </Card>
        )}

        {!loading && testId && mode === 'class' && entries.length === 0 && (
          <p className="text-gray-500">No students found for this class</p>
        )}

        {!loading && mode === 'student' && testId && studentId && !studentEntry && (
          <p className="text-gray-500">Loading student data...</p>
        )}
      </div>
    </SessionGuard>
  );
}
