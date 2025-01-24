'use client';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner3D from '@/components/ui/LoadingSpinner3D';

export default function AddTeamMember() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'user',
    department: '',
    position: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/create-team-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create team member');
      }

      // Clear form after successful creation
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'user',
        department: '',
        position: ''
      });

      toast.success('Team member account created successfully! They can now login with their email and password.');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to create team member account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    setFormData(prev => ({ ...prev, password }));
  };

  return (
    <>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Add Team Member</h1>
          <p className="text-gray-400 mt-1">Create a new account for team member</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                First Name*
              </label>
              <input
                type="text"
                name="firstName"
                required
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                placeholder="John"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Last Name*
              </label>
              <input
                type="text"
                name="lastName"
                required
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                placeholder="Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address*
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password*
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="flex-1 px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                  placeholder="Password"
                />
                <button
                  type="button"
                  onClick={generatePassword}
                  className="px-3 py-2 text-sm font-medium text-white bg-gray-700 rounded-lg hover:bg-gray-600"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Role*
              </label>
              <select
                name="role"
                required
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                placeholder="Marketing"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Position
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-[#1e2532] border border-gray-700 text-white focus:outline-none focus:border-blue-500"
                placeholder="Team Lead"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-[#1e2532] rounded-lg border border-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
      <LoadingSpinner3D isOpen={loading} />
    </>
  );
} 