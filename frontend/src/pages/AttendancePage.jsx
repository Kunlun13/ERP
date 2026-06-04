import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ClipboardCheck,
  Search,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Eye,
  ChevronLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { getImageUrl, formatDate } from '../utils/helpers';

const STATUS_OPTIONS = [
  { value: 'present', label: 'Present', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  { value: 'absent', label: 'Absent', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  { value: 'late', label: 'Late', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
  { value: 'excused', label: 'Excused', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
];

function getStatusColor(status) {
  return STATUS_OPTIONS.find((s) => s.value === status)?.color || '';
}

export default function AttendancePage() {
  const [view, setView] = useState('take'); // 'take' or 'student'
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('A');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [existingAttendance, setExistingAttendance] = useState(null);

  // Student attendance view state
  const [searchQuery, setSearchQuery] = useState('');
  const [studentList, setStudentList] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentAttendance, setStudentAttendance] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Load classes
  useEffect(() => {
    api.get('/students/classes').then(({ data }) => {
      setClasses(data.data || []);
    });
  }, []);

  // Load attendance data when class/date changes
  useEffect(() => {
    if (!selectedClass || !date) return;
    setLoading(true);
    api
      .get('/attendance', {
        params: {
          class: selectedClass,
          section: selectedSection,
          date,
        },
      })
      .then(({ data }) => {
        const { attendance, students: studentsList } = data.data;
        setStudents(studentsList);
        setExistingAttendance(attendance);

        // Build records map from existing attendance or default all to present
        const recordMap = {};
        studentsList.forEach((s) => {
          const existing = attendance?.records?.find(
            (r) =>
              (r.studentId?._id || r.studentId)?.toString() ===
              s._id.toString()
          );
          recordMap[s._id] = {
            status: existing?.status || 'present',
            remarks: existing?.remarks || '',
          };
        });
        setRecords(recordMap);
      })
      .catch(() => toast.error('Failed to load attendance data'))
      .finally(() => setLoading(false));
  }, [selectedClass, selectedSection, date]);

  // Search students for student view
  useEffect(() => {
    if (view !== 'student' || !selectedClass) return;
    api
      .get('/students', {
        params: { class: selectedClass, search: searchQuery, limit: 50 },
      })
      .then(({ data }) => setStudentList(data.data || []));
  }, [view, selectedClass, searchQuery]);

  const handleStatusChange = (studentId, status) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
  };

  const handleMarkAll = (status) => {
    const updated = {};
    students.forEach((s) => {
      updated[s._id] = { ...records[s._id], status };
    });
    setRecords(updated);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !date || students.length === 0) {
      return toast.error('Select a class and date first');
    }

    setSaving(true);
    try {
      const recordsArray = Object.entries(records).map(
        ([studentId, data]) => ({
          studentId,
          status: data.status,
          remarks: data.remarks,
        })
      );

      await api.post('/attendance', {
        class: selectedClass,
        section: selectedSection,
        date,
        records: recordsArray,
      });

      toast.success('Attendance saved successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleViewStudentAttendance = async (student) => {
    setSelectedStudent(student);
    setLoadingStudent(true);
    try {
      const { data } = await api.get(
        `/attendance/student/${student._id}`,
        { params: { month: selectedMonth } }
      );
      setStudentAttendance(data.data);
    } catch {
      toast.error('Failed to load student attendance');
    } finally {
      setLoadingStudent(false);
    }
  };

  // Re-fetch when month changes and a student is selected
  useEffect(() => {
    if (selectedStudent) {
      handleViewStudentAttendance(selectedStudent);
    }
  }, [selectedMonth]);

  const presentCount = Object.values(records).filter(
    (r) => r.status === 'present'
  ).length;
  const absentCount = Object.values(records).filter(
    (r) => r.status === 'absent'
  ).length;
  const lateCount = Object.values(records).filter(
    (r) => r.status === 'late'
  ).length;

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <ClipboardCheck className="text-primary-600" />
              Attendance
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Take class attendance or view student attendance records
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant={view === 'take' ? 'primary' : 'secondary'}
              onClick={() => {
                setView('take');
                setSelectedStudent(null);
                setStudentAttendance(null);
              }}
            >
              <ClipboardCheck size={16} />
              Take Attendance
            </Button>
            <Button
              variant={view === 'student' ? 'primary' : 'secondary'}
              onClick={() => setView('student')}
            >
              <Eye size={16} />
              View Student
            </Button>
          </div>
        </div>

        {/* ──────────── TAKE ATTENDANCE VIEW ──────────── */}
        {view === 'take' && (
          <>
            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Select
                  label="Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: '', label: 'Select Class' },
                    ...classes.map((c) => ({ value: c, label: `Class ${c}` })),
                  ]}
                />
                <Select
                  label="Section"
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  options={['A', 'B', 'C', 'D'].map((s) => ({
                    value: s,
                    label: s,
                  }))}
                />
                <Input
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <div className="flex items-end">
                  <Button
                    onClick={handleSaveAttendance}
                    loading={saving}
                    disabled={!selectedClass || students.length === 0}
                    className="w-full"
                  >
                    Save Attendance
                  </Button>
                </div>
              </div>
            </Card>

            {loading ? (
              <LoadingSpinner />
            ) : selectedClass && students.length > 0 ? (
              <>
                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {students.length}
                    </p>
                    <p className="text-sm text-gray-500">Total</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {presentCount}
                    </p>
                    <p className="text-sm text-green-600">Present</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {absentCount}
                    </p>
                    <p className="text-sm text-red-600">Absent</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {lateCount}
                    </p>
                    <p className="text-sm text-yellow-600">Late</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    onClick={() => handleMarkAll('present')}
                    className="text-green-600"
                  >
                    <UserCheck size={16} /> Mark All Present
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleMarkAll('absent')}
                    className="text-red-600"
                  >
                    <UserX size={16} /> Mark All Absent
                  </Button>
                </div>

                {/* Student List */}
                <Card>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            #
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Student
                          </th>
                          <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Roll No
                          </th>
                          <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.map((student, idx) => (
                          <tr
                            key={student._id}
                            className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                          >
                            <td className="py-3 px-4 text-gray-500">
                              {idx + 1}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {student.photo ? (
                                  <img
                                    src={getImageUrl(student.photo)}
                                    alt=""
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xs font-bold">
                                    {student.name?.[0]}
                                  </div>
                                )}
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {student.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                              {student.rollNo}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex justify-center gap-1">
                                {STATUS_OPTIONS.map((opt) => (
                                  <button
                                    key={opt.value}
                                    onClick={() =>
                                      handleStatusChange(
                                        student._id,
                                        opt.value
                                      )
                                    }
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                                      records[student._id]?.status ===
                                      opt.value
                                        ? opt.color +
                                          ' ring-2 ring-offset-1 ring-primary-500'
                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            ) : selectedClass ? (
              <Card>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No students found in this class/section.
                </p>
              </Card>
            ) : (
              <Card>
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  Select a class and date to take attendance.
                </p>
              </Card>
            )}
          </>
        )}

        {/* ──────────── VIEW STUDENT ATTENDANCE ──────────── */}
        {view === 'student' && !selectedStudent && (
          <>
            <Card>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Class"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  options={[
                    { value: '', label: 'Select Class' },
                    ...classes.map((c) => ({ value: c, label: `Class ${c}` })),
                  ]}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Search Student"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or roll number..."
                  />
                </div>
              </div>
            </Card>

            {selectedClass && studentList.length > 0 ? (
              <Card>
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {studentList.map((student) => (
                    <div
                      key={student._id}
                      className="flex items-center justify-between py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg cursor-pointer"
                      onClick={() => handleViewStudentAttendance(student)}
                    >
                      <div className="flex items-center gap-3">
                        {student.photo ? (
                          <img
                            src={getImageUrl(student.photo)}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 font-bold">
                            {student.name?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Roll: {student.rollNo} | Class: {student.class}
                          </p>
                        </div>
                      </div>
                      <Eye
                        size={18}
                        className="text-gray-400 hover:text-primary-600"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            ) : selectedClass ? (
              <Card>
                <p className="text-center text-gray-500 py-8">
                  No students found.
                </p>
              </Card>
            ) : (
              <Card>
                <p className="text-center text-gray-500 py-8">
                  Select a class to view student attendance.
                </p>
              </Card>
            )}
          </>
        )}

        {/* ──────────── INDIVIDUAL STUDENT ATTENDANCE ──────────── */}
        {view === 'student' && selectedStudent && (
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setSelectedStudent(null);
                setStudentAttendance(null);
              }}
            >
              <ChevronLeft size={16} /> Back to Student List
            </Button>

            {loadingStudent ? (
              <LoadingSpinner />
            ) : studentAttendance ? (
              <>
                {/* Student Info & Summary */}
                <Card>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {studentAttendance.student?.photo ? (
                        <img
                          src={getImageUrl(studentAttendance.student.photo)}
                          alt=""
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center text-primary-700 dark:text-primary-300 text-xl font-bold">
                          {studentAttendance.student?.name?.[0]}
                        </div>
                      )}
                      <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                          {studentAttendance.student?.name}
                        </h2>
                        <p className="text-gray-500">
                          Roll: {studentAttendance.student?.rollNo} | Class:{' '}
                          {studentAttendance.student?.class}-
                          {studentAttendance.student?.section}
                        </p>
                      </div>
                    </div>
                    <Input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                </Card>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-4 text-center">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {studentAttendance.summary?.total || 0}
                    </p>
                    <p className="text-sm text-gray-500">Total Days</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 p-4 text-center">
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {studentAttendance.summary?.present || 0}
                    </p>
                    <p className="text-sm text-green-600">Present</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800 p-4 text-center">
                    <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                      {studentAttendance.summary?.absent || 0}
                    </p>
                    <p className="text-sm text-red-600">Absent</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {studentAttendance.summary?.late || 0}
                    </p>
                    <p className="text-sm text-yellow-600">Late</p>
                  </div>
                  <div className="bg-primary-50 dark:bg-primary-900/20 rounded-xl border border-primary-200 dark:border-primary-800 p-4 text-center">
                    <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">
                      {studentAttendance.summary?.percentage || 0}%
                    </p>
                    <p className="text-sm text-primary-600">Attendance %</p>
                  </div>
                </div>

                {/* Records Table */}
                <Card title="Attendance Records">
                  {studentAttendance.records?.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                              Date
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                              Subject
                            </th>
                            <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                              Status
                            </th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">
                              Remarks
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentAttendance.records.map((record, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-100 dark:border-gray-800"
                            >
                              <td className="py-3 px-4 text-gray-900 dark:text-white">
                                {formatDate(record.date)}
                              </td>
                              <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                                {record.subject || '-'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    record.status
                                  )}`}
                                >
                                  {record.status.charAt(0).toUpperCase() +
                                    record.status.slice(1)}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-gray-500">
                                {record.remarks || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-8">
                      No attendance records found for this month.
                    </p>
                  )}
                </Card>
              </>
            ) : null}
          </>
        )}
      </div>
    </SessionGuard>
  );
}
