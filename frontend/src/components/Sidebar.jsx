function Sidebar() {
  return (
    <div className="w-64 bg-gray-100 h-screen p-4">
      <h2 className="text-xl font-bold mb-4">Menu</h2>
      <ul>
        <li><a href="/admin" className="block py-2 hover:bg-gray-200">Dashboard</a></li>
        <li><a href="/items" className="block py-2 hover:bg-gray-200">Items</a></li>
        <li><a href="/profile" className="block py-2 hover:bg-gray-200">Profile</a></li>
      </ul>
    </div>
  );
}

export default Sidebar;
