import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { GraduationCap, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { signup, clearError } from '../../store/slices/authSlice';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function SignupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    mobileNo: '',
    password: '',
    confirmPassword: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((s) => s.auth);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearError());

    if (!form.name || !form.email || !form.password) {
      return toast.error('Name, email and password are required');
    }

    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    const { confirmPassword, ...payload } = form;
    const result = await dispatch(signup(payload));
    if (signup.fulfilled.match(result)) {
      toast.success('Account created successfully!');
      navigate('/select-session');
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-600 to-primary-900 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-primary-100 dark:bg-primary-900/40 rounded-xl mb-4">
            <GraduationCap className="text-primary-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create Account</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Sign up for School ERP</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="john@school.com"
            required
          />
          <Input
            label="Mobile Number"
            name="mobileNo"
            value={form.mobileNo}
            onChange={handleChange}
            placeholder="+91 9876543210"
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          {error && <p className="text-sm text-red-500 text-center">{error}</p>}
          <Button type="submit" className="w-full" loading={loading}>
            <UserPlus size={18} />
            Sign Up
          </Button>
        </form>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
