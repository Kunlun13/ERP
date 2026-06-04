import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SessionGuard from '../components/SessionGuard';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { formatDate } from '../utils/helpers';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logo, setLogo] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/settings'),
      api.get('/settings/activities'),
    ])
      .then(([s, a]) => {
        setSettings(s.data.data);
        setActivities(a.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(settings).forEach(([k, v]) => {
      if (typeof v !== 'object') fd.append(k, v);
    });
    if (logo) fd.append('logo', logo);
    try {
      const { data } = await api.put('/settings', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setSettings(data.data);
      toast.success('Settings saved');
    } catch {
      toast.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <SessionGuard>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-500">School configuration and activity logs</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card title="School Settings">
            <div className="space-y-4">
              {['schoolName', 'address', 'contact', 'email', 'principalName', 'diseCode', 'district', 'block', 'state'].map((field) => (
                <Input
                  key={field}
                  label={field.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  value={settings?.[field] || ''}
                  onChange={(e) => setSettings({ ...settings, [field]: e.target.value })}
                />
              ))}
              <Input
                label="Pass Percentage"
                type="number"
                value={settings?.passPercentage || 33}
                onChange={(e) => setSettings({ ...settings, passPercentage: +e.target.value })}
              />
              <div>
                <label className="text-sm font-medium">School Logo</label>
                <input type="file" accept="image/*" onChange={(e) => setLogo(e.target.files[0])} className="mt-1 block" />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={settings?.attendanceEnabled} onChange={(e) => setSettings({ ...settings, attendanceEnabled: e.target.checked })} />
                  Attendance Module
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={settings?.feeManagementEnabled} onChange={(e) => setSettings({ ...settings, feeManagementEnabled: e.target.checked })} />
                  Fee Management (Future)
                </label>
              </div>
              <Button onClick={handleSave} loading={saving}>Save Settings</Button>
            </div>
          </Card>

          <Card title="Activity History (Audit Log)">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {activities.map((act) => (
                <div key={act._id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                  <p className="font-medium">{act.description}</p>
                  <p className="text-xs text-gray-500">
                    {act.userId?.name} · {act.module} · {formatDate(act.createdAt)}
                  </p>
                </div>
              ))}
              {activities.length === 0 && <p className="text-gray-500">No activities yet</p>}
            </div>
          </Card>
        </div>
      </div>
    </SessionGuard>
  );
}
