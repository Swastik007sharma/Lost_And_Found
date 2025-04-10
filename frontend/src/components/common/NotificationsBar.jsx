import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

function NotificationsBar() {
  const { notifications, removeNotification } = useContext(AuthContext);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`p-4 rounded-md shadow-md ${
            notif.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}
        >
          <p className="text-sm">{notif.message}</p>
          <button
            onClick={() => removeNotification(notif.id)}
            className="ml-2 text-sm font-bold"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationsBar;