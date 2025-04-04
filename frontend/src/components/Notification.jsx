function Notification({ notification }) {
  return (
    <div className="p-2 bg-gray-50 border-b">
      <p>{notification.message}</p>
      <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleString()}</span>
    </div>
  );
}

export default Notification;
