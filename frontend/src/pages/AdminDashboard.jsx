import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { BarChart, PieChart } from '../components/Charts';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const [statsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5000/api/admin/stats', config),
          axios.get('http://localhost:5000/api/admin/users', config),
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userInfo]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium">Total Users</h3>
          <p className="text-2xl font-bold">{stats.usersCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium">Total Products</h3>
          <p className="text-2xl font-bold">{stats.productsCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium">Total Orders</h3>
          <p className="text-2xl font-bold">{stats.ordersCount}</p>
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium">Total Sales</h3>
          <p className="text-2xl font-bold">${stats.totalSales.toFixed(2)}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">Sales Overview</h3>
          <BarChart />
        </div>
        <div className="bg-white p-6 rounded shadow">
          <h3 className="text-lg font-medium mb-4">User Distribution</h3>
          <PieChart />
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Users Management</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select 
                      value={user.role} 
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="buyer">Buyer</option>
                      <option value="farmer">Farmer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => handleDeleteUser(user._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}