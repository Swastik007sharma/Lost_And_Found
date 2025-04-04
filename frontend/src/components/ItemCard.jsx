import { Link } from 'react-router-dom';

function ItemCard({ item }) {
  return (
    <div className="p-4 bg-white rounded shadow hover:shadow-lg transition">
      <img src={item.image || '/assets/images/placeholder.png'} alt={item.title} className="w-full h-32 object-cover rounded" />
      <h3 className="text-lg font-semibold mt-2">{item.title}</h3>
      <p className="text-sm text-gray-600">{item.description.substring(0, 50)}...</p>
      <p className="text-sm">Status: <span className="font-medium">{item.status}</span></p>
      <Link to={`/items/${item._id}`} className="text-blue-500 mt-2 inline-block">View Details</Link>
    </div>
  );
}

export default ItemCard;
