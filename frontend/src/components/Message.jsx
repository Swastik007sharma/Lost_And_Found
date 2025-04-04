function Message({ message }) {
  return (
    <div className="p-2 bg-blue-100 rounded mb-2">
      <p>{message.content}</p>
      <span className="text-xs text-gray-500">{message.sender.name} - {new Date(message.createdAt).toLocaleString()}</span>
    </div>
  );
}

export default Message;
