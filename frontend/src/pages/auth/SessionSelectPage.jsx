import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchSessions, createSession, setActiveSession } from '../../store/slices/sessionSlice';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { useState } from 'react';

export default function SessionSelectPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessions, loading } = useSelector((s) => s.session);
  const [showModal, setShowModal] = useState(false);
  const [newSession, setNewSession] = useState({ name: '', startYear: 2025, endYear: 2026 });

  useEffect(() => {
    dispatch(fetchSessions());
  }, [dispatch]);

  const handleSelect = (session) => {
    dispatch(setActiveSession({ id: session._id, name: session.name }));
    toast.success(`Session ${session.name} selected`);
    navigate('/dashboard');
  };

  const handleCreate = async () => {
    if (!newSession.name) return toast.error('Session name required');
    const result = await dispatch(createSession(newSession));
    if (createSession.fulfilled.match(result)) {
      toast.success('Session created');
      setShowModal(false);
      dispatch(setActiveSession({ id: result.payload._id, name: result.payload.name }));
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Select Academic Session
        </h1>
        <p className="text-center text-gray-500 mb-8">All data is isolated per session</p>

        <div className="grid gap-4 sm:grid-cols-2">
          {sessions.map((session) => (
            <button
              key={session._id}
              onClick={() => handleSelect(session)}
              className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 transition text-left"
            >
              <Calendar className="text-primary-600" size={32} />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{session.name}</p>
                <p className="text-sm text-gray-500">{session.startYear} - {session.endYear}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button variant="secondary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Create New Session
          </Button>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Academic Session">
        <div className="space-y-4">
          <Input
            label="Session Name"
            value={newSession.name}
            onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
            placeholder="2026-2027"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Year"
              type="number"
              value={newSession.startYear}
              onChange={(e) => setNewSession({ ...newSession, startYear: +e.target.value })}
            />
            <Input
              label="End Year"
              type="number"
              value={newSession.endYear}
              onChange={(e) => setNewSession({ ...newSession, endYear: +e.target.value })}
            />
          </div>
          <Button onClick={handleCreate} className="w-full">Create Session</Button>
        </div>
      </Modal>
    </div>
  );
}
