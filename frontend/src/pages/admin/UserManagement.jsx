import { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getUsers();
        setUsers(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      setUpdatingUserId(userId);
      await adminAPI.updateUserRole(userId, { role: newRole });
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Role update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setDeletingUserId(userId);
      await adminAPI.deleteUser(userId);
      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      console.error('Delete user error:', error);
      toast.error(error.response?.data?.message || 'Failed to delete user. Please try again.');
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <h2 className="text-xl font-semibold p-4 border-b">User Management</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map(user => (
              <tr key={user._id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                    className={`px-2 py-1 text-xs rounded ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'farmer' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}
                    disabled={updatingUserId === user._id}
                  >
                    <option value="buyer">Buyer</option>
                    <option value="farmer">Farmer</option>
                    <option value="admin">Admin</option>
                  </select>
                  {updatingUserId === user._id && (
                    <span className="ml-2 text-xs text-gray-500">Updating...</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className={`text-red-500 hover:underline ${
                      deletingUserId === user._id ? 'opacity-50' : ''
                    }`}
                    disabled={deletingUserId === user._id}
                  >
                    {deletingUserId === user._id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}