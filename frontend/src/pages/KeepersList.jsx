import React, { useEffect, useState } from 'react';
import { getKeepers } from '../services/keeperService';

const KeepersList = () => {
  const [keepers, setKeepers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getKeepers()
      .then(res => setKeepers(res.data.keepers))
      .catch(() => setError('Failed to fetch keepers'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center mt-8">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Available Keepers</h1>
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {keepers.map(keeper => (
          <div
            key={keeper._id}
            className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-xl font-semibold text-blue-700 mb-3">
              {keeper.name?.[0] || '?'}
            </div>
            <div className="text-lg font-medium mb-1">{keeper.name}</div>
            <div className="text-gray-600 text-sm mb-1">{keeper.email}</div>
            {keeper.location && (
              <div className="text-blue-700 text-xs mb-1">Location: {keeper.location}</div>
            )}
            {keeper.department && (
              <div className="text-blue-700 text-xs mb-1">Department: {keeper.department}</div>
            )}
            {keeper.description && (
              <div className="text-gray-500 text-xs mb-1 italic">{keeper.description}</div>
            )}
            <div className="text-gray-400 text-xs">Joined: {new Date(keeper.createdAt).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeepersList;
