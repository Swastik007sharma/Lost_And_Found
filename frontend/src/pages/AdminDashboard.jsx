import {
	useState,
	useEffect,
	useContext,
	useRef,
	useCallback,
	useMemo,
} from "react";
import { AuthContext } from "../context/AuthContext";
import {
	getDashboardStats,
	getUsers,
	toggleUserActivation,
	getConversations,
	getAllItems,
} from "../services/adminService";
import {
	addCategory,
	deleteCategory,
	updateCategory,
	getAllCategoriesForAdmin,
} from "../services/categoryService";
import { getKeepers } from "../services/keeperService";
import {
	getItems,
	toggleItemActivation,
	assignKeeperToItem,
} from "../services/itemService";
import { register, verifyOtp } from "../services/authService";
import { Link, useNavigate } from "react-router-dom";
import useClickOutside from "../hooks/useClickOutside";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Loader from "../components/common/Loader";
import Pagination from "../components/common/Pagination";
import Input from "../components/common/Input";
import Select from "../components/common/Select";
import Textarea from "../components/common/Textarea";
import Button from "../components/common/Button";
import { toast } from "react-toastify";

// UsersTab Component
function UsersTab({ user, page, setPage, totalPages, setTotalPages, limit }) {
	const [users, setUsers] = useState([]);
	const [userSearch, setUserSearch] = useState("");
	const [userSortBy, setUserSortBy] = useState("createdAt");
	const [userOrder, setUserOrder] = useState("desc");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const shownToasts = useRef(new Set());

	const fetchUsers = useCallback(async () => {
		setLoading(true);
		try {
			const response = await getUsers({
				page: page.users,
				limit,
				search: userSearch,
				sortBy: userSortBy,
				order: userOrder,
			});
			setUsers(response.data.users || []);
			setTotalPages((prev) => ({
				...prev,
				users: response.data.pagination?.totalPages || 1,
			}));
		} catch (err) {
			const errorMsg = "Failed to load users: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	}, [page.users, limit, userSearch, userSortBy, userOrder, setTotalPages]);

	useEffect(() => {
		const debounceFetch = setTimeout(() => fetchUsers(), 300);
		return () => clearTimeout(debounceFetch);
	}, [fetchUsers]);

	useEffect(() => {
		if (success || error) {
			const timeout = setTimeout(() => {
				setSuccess("");
				setError("");
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [success, error]);

	const handleToggleUserActivation = useCallback(async (userId, isActive) => {
		if (window.confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this user?`)) {
			setLoading(true);
			try {
				await toggleUserActivation(userId);
				setUsers((prev) =>
					prev.map((u) => (u._id === userId ? { ...u, isActive: !isActive } : u))
				);
				const successMsg = `User ${!isActive ? "activated" : "deactivated"} successfully`;
				if (!shownToasts.current.has(successMsg)) {
					toast.success(successMsg);
					shownToasts.current.add(successMsg);
					setTimeout(() => shownToasts.current.delete(successMsg), 5000);
				}
				setSuccess(successMsg);
			} catch (err) {
				const errorMsg = "Failed to toggle user activation: " + (err.response?.data?.message || err.message);
				if (!shownToasts.current.has(errorMsg)) {
					toast.error(errorMsg);
					shownToasts.current.add(errorMsg);
					setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
				}
				setError(errorMsg);
			} finally {
				setLoading(false);
			}
		}
	}, []);

	const userSearchSection = useMemo(
		() => (
			<div className="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-[var(--bg-color)] p-4 rounded-lg shadow-sm">
				<Input
					type="text"
					placeholder="Search by name, email, or role..."
					value={userSearch}
					onChange={(e) => {
						setUserSearch(e.target.value);
						setPage((prev) => ({ ...prev, users: 1 }));
					}}
					className="w-full sm:w-1/3 text-sm input-border"
				/>
				<Select
					value={userSortBy}
					onChange={(e) => {
						setUserSortBy(e.target.value);
						setPage((prev) => ({ ...prev, users: 1 }));
					}}
					className="w-full sm:w-1/3 text-sm input-border"
				>
					<option value="name">Name</option>
					<option value="email">Email</option>
					<option value="createdAt">Created At</option>
				</Select>
				<Select
					value={userOrder}
					onChange={(e) => {
						setUserOrder(e.target.value);
						setPage((prev) => ({ ...prev, users: 1 }));
					}}
					className="w-full sm:w-1/3 text-sm input-border"
				>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</Select>
			</div>
		),
		[userSearch, userSortBy, userOrder, setPage]
	);

	return (
		<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg transition-all duration-300">
			{userSearchSection}
			<h2 className="text-2xl font-semibold text-[var(--text-color)] mb-6">Manage Users</h2>
			{(success || error) && (
				<div className="mb-4">
					{success && (
						<div className="bg-green-600 text-white p-4 rounded-lg shadow-md animate-fade-in">
							<p className="text-sm font-medium">{success}</p>
						</div>
					)}
					{error && (
						<div className="bg-red-600 text-white p-4 rounded-lg shadow-md animate-fade-in">
							<p className="text-sm font-medium">{error}</p>
						</div>
					)}
				</div>
			)}
			{loading ? (
				<Loader />
			) : (
				<>
					<div className="overflow-x-auto rounded-lg shadow-sm">
						<table className="min-w-full table-auto border-collapse bg-[var(--bg-color)]">
							<thead>
								<tr className="table-header text-left text-sm font-semibold text-[var(--text-color)]">
									<th className="px-6 py-4 border-b">Name</th>
									<th className="px-6 py-4 border-b">Email</th>
									<th className="px-6 py-4 border-b">Role</th>
									<th className="px-6 py-4 border-b">Status</th>
									<th className="px-6 py-4 border-b">Actions</th>
								</tr>
							</thead>
							<tbody>
								{users.map((u) => (
									<tr
										key={u._id}
										className="border-t table-row-hover transition-colors duration-200"
									>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">{u.name}</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">{u.email}</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">{u.role}</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">
											<span
												className={`px-2 py-1 rounded-full text-xs ${u.isActive ? "bg-green-600 text-white" : "bg-red-600 text-white"
													}`}
											>
												{u.isActive ? "Active" : "Inactive"}
											</span>
										</td>
										<td className="px-6 py-4 text-sm flex gap-3">
											<Link
												to={`../users/${u._id}`}
												className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm"
											>
												View
											</Link>
											<Button
												onClick={() => handleToggleUserActivation(u._id, u.isActive)}
												className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm text-white ${u.isActive
													? "bg-red-600 hover:bg-red-700"
													: "bg-green-600 hover:bg-green-700"
													} ${u._id === user._id ? "opacity-50 cursor-not-allowed" : ""}`}
												disabled={u._id === user._id}
											>
												{u.isActive ? "Deactivate" : "Activate"}
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<Pagination
						currentPage={page.users}
						totalPages={totalPages.users}
						onPageChange={(newPage) => setPage((prev) => ({ ...prev, users: newPage }))}
					/>
				</>
			)}
		</div>
	);
}

function ItemsTab({ page, setPage, totalPages, setTotalPages, limit }) {
	const [items, setItems] = useState([]);
	const [itemSearch, setItemSearch] = useState("");
	const [itemSortBy, setItemSortBy] = useState("createdAt");
	const [itemOrder, setItemOrder] = useState("desc");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [keepers, setKeepers] = useState([]);
	const [selectedKeeperIds, setSelectedKeeperIds] = useState({});
	const shownToasts = useRef(new Set());

	const fetchItems = useCallback(async () => {
		setLoading(true);
		try {
			const [itemsResponse, keepersResponse] = await Promise.all([
				getAllItems({
					page: page.items,
					limit,
					search: itemSearch,
					sortBy: itemSortBy,
					order: itemOrder,
				}),
				getKeepers(),
			]);
			setItems(itemsResponse.data.items || []);
			setKeepers(keepersResponse.data.keepers || []);
			setTotalPages((prev) => ({
				...prev,
				items: itemsResponse.data.pagination?.totalPages || 1,
			}));
			setSelectedKeeperIds(
				itemsResponse.data.items.reduce((acc, item) => ({
					...acc,
					[item._id]: item.keeperId || "",
				}), {})
			);
		} catch (err) {
			const errorMsg = "Failed to load items: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	}, [page.items, limit, itemSearch, itemSortBy, itemOrder, setTotalPages]);

	useEffect(() => {
		const debounceFetch = setTimeout(() => fetchItems(), 300);
		return () => clearTimeout(debounceFetch);
	}, [fetchItems]);

	useEffect(() => {
		if (success || error) {
			const timeout = setTimeout(() => {
				setSuccess("");
				setError("");
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [success, error]);

	const handleToggleItemActivation = useCallback(async (itemId, isActive) => {
		if (window.confirm(`Are you sure you want to ${isActive ? "deactivate" : "activate"} this item?`)) {
			setLoading(true);
			try {
				await toggleItemActivation(itemId);
				setItems((prev) =>
					prev.map((i) => (i._id === itemId ? { ...i, isActive: !isActive } : i))
				);
				const successMsg = `Item ${!isActive ? "activated" : "deactivated"} successfully`;
				if (!shownToasts.current.has(successMsg)) {
					toast.success(successMsg);
					shownToasts.current.add(successMsg);
					setTimeout(() => shownToasts.current.delete(successMsg), 5000);
				}
				setSuccess(successMsg);
			} catch (err) {
				const errorMsg = "Failed to toggle item activation: " + (err.response?.data?.message || err.message);
				if (!shownToasts.current.has(errorMsg)) {
					toast.error(errorMsg);
					shownToasts.current.add(errorMsg);
					setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
				}
				setError(errorMsg);
			} finally {
				setLoading(false);
			}
		}
	}, []);

	const handleAssignKeeper = useCallback(async (itemId) => {
		const currentKeeperId = selectedKeeperIds[itemId];
		if (!currentKeeperId) {
			const errorMsg = "Please select a keeper";
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
			return;
		}
		setLoading(true);
		try {
			const selectedKeeper = keepers.find((k) => k._id === currentKeeperId);
			if (!selectedKeeper) {
				throw new Error("Selected keeper not found");
			}
			const keeperName = selectedKeeper.name;

			await assignKeeperToItem(itemId, { keeperId: currentKeeperId, keeperName });
			const successMsg = `Keeper ${keeperName} assigned to item ${itemId}`;
			if (!shownToasts.current.has(successMsg)) {
				toast.success(successMsg);
				shownToasts.current.add(successMsg);
				setTimeout(() => shownToasts.current.delete(successMsg), 5000);
			}
			setSuccess(successMsg);

			const updatedItemsResponse = await getAllItems({
				page: page.items,
				limit,
				search: itemSearch,
				sortBy: itemSortBy,
				order: itemOrder,
			});
			setItems(updatedItemsResponse.data.items || []);
			setSelectedKeeperIds((prev) => ({
				...prev,
				[itemId]: updatedItemsResponse.data.items.find((i) => i._id === itemId)?.keeperId || "",
			}));
		} catch (err) {
			const errorMsg = "Failed to assign keeper: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	}, [selectedKeeperIds, keepers, page.items, limit, itemSearch, itemSortBy, itemOrder]);

	const handleKeeperChange = (itemId, event) => {
		setSelectedKeeperIds((prev) => ({
			...prev,
			[itemId]: event.target.value,
		}));
	};

	const itemSearchSection = useMemo(
		() => (
			<div className="mb-6 flex flex-col sm:flex-row gap-4 items-center bg-[var(--bg-color)] p-4 rounded-lg shadow-sm">
				<Input
					type="text"
					placeholder="Search by title, description, or status..."
					value={itemSearch}
					onChange={(e) => {
						setItemSearch(e.target.value);
						setPage((prev) => ({ ...prev, items: 1 }));
					}}
					className="w-full sm:w-1/3 text-sm input-border"
				/>
				<Select
					value={itemSortBy}
					onChange={(e) => {
						setItemSortBy(e.target.value);
						setPage((prev) => ({ ...prev, items: 1 }));
					}}
					className="w-full sm:w-1/3 text-sm input-border"
				>
					<option value="title">Title</option>
					<option value="status">Status</option>
					<option value="createdAt">Created At</option>
				</Select>
				<Select
					value={itemOrder}
					onChange={(e) => {
						setItemOrder(e.target.value);
						setPage((prev) => ({ ...prev, items: 1 }));
					}}
					className="w-full sm:w-1/3 text-sm input-border"
				>
					<option value="asc">Ascending</option>
					<option value="desc">Descending</option>
				</Select>
			</div>
		),
		[itemSearch, itemSortBy, itemOrder, setPage]
	);

	return (
		<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg transition-all duration-300">
			{itemSearchSection}
			<h2 className="text-2xl font-semibold text-[var(--text-color)] mb-6">Manage Items</h2>
			{(success || error) && (
				<div className="mb-4">
					{success && (
						<div className="bg-green-600 text-white p-4 rounded-lg shadow-md animate-fade-in">
							<p className="text-sm font-medium">{success}</p>
						</div>
					)}
					{error && (
						<div className="bg-red-600 text-white p-4 rounded-lg shadow-md animate-fade-in">
							<p className="text-sm font-medium">{error}</p>
						</div>
					)}
				</div>
			)}
			{loading ? (
				<Loader />
			) : (
				<>
					<div className="overflow-x-auto rounded-lg shadow-sm">
						<table className="min-w-full table-auto border-collapse bg-[var(--bg-color)]">
							<thead>
								<tr className="table-header text-left text-sm font-semibold text-[var(--text-color)]">
									<th className="px-6 py-4 border-b">Title</th>
									<th className="px-6 py-4 border-b">Status</th>
									<th className="px-6 py-4 border-b">Posted By</th>
									<th className="px-6 py-4 border-b">Category</th>
									<th className="px-6 py-4 border-b">Active Status</th>
									<th className="px-6 py-4 border-b">Keeper</th>
									<th className="px-6 py-4 border-b">Claimed By</th>
									<th className="px-6 py-4 border-b">Actions</th>
								</tr>
							</thead>
							<tbody>
								{items.map((item) => (
									<tr
										key={item._id}
										className="border-t table-row-hover transition-colors duration-200"
									>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">{item.title}</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">{item.status}</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">
											{item.postedBy?.name || "Unknown"}
										</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">
											{item.category?.name || "N/A"}
										</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">
											<span
												className={`px-2 py-1 rounded-full text-xs ${item.isActive ? "bg-green-600 text-white" : "bg-red-600 text-white"
													}`}
											>
												{item.isActive ? "Active" : "Inactive"}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">
											{item.keeperName || "Not Assigned"}
										</td>
										<td className="px-6 py-4 text-sm text-[var(--text-color)]">
											{item.claimedByName || "Not Claimed"}
										</td>
										<td className="px-6 py-4 text-sm flex gap-3 flex-wrap">
											<Link
												to={`/items/${item._id}`}
												className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm"
											>
												View
											</Link>
											<Button
												onClick={() => handleToggleItemActivation(item._id, item.isActive)}
												className={`px-4 py-2 rounded-lg text-sm transition-colors duration-200 shadow-sm text-white ${item.isActive
													? "bg-red-600 hover:bg-red-700"
													: "bg-green-600 hover:bg-green-700"
													}`}
											>
												{item.isActive ? "Deactivate" : "Activate"}
											</Button>
											<Select
												value={selectedKeeperIds[item._id] || ""}
												onChange={(e) => handleKeeperChange(item._id, e)}
												className="p-2 text-sm input-border"
											>
												<option value="">Select Keeper</option>
												{keepers.map((k) => (
													<option key={k._id} value={k._id}>
														{k.name}
													</option>
												))}
											</Select>
											<Button
												onClick={() => handleAssignKeeper(item._id)}
												className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors duration-200 shadow-sm"
											>
												Assign Keeper
											</Button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<Pagination
						currentPage={page.items}
						totalPages={totalPages.items}
						onPageChange={(newPage) => setPage((prev) => ({ ...prev, items: newPage }))}
					/>
				</>
			)}
		</div>
	);
}

// Main AdminDashboard Component
function AdminDashboard() {
	const { user } = useContext(AuthContext);
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState("overview");
	const [stats, setStats] = useState({});
	const [keepers, setKeepers] = useState([]);
	const [conversations, setConversations] = useState([]);
	const [categories, setCategories] = useState([]);
	const [selectedConversation, setSelectedConversation] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const shownToasts = useRef(new Set());

	const [page, setPage] = useState({
		users: 1,
		items: 1,
		conversations: 1,
		categories: 1,
	});
	const [totalPages, setTotalPages] = useState({
		users: 1,
		items: 1,
		conversations: 1,
		categories: 1,
	});
	const limit = 10;

	const selectedCategory = useRef(null);
	const categoryCardRef = useRef(null);
	const [accountForm, setAccountForm] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		role: "admin",
	});
	const [categoryForm, setCategoryForm] = useState({
		name: "",
		description: "",
	});
	const [editCategoryForm, setEditCategoryForm] = useState({
		name: "",
		description: "",
		isActive: true,
	});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const alertTimeout = useRef(null);
	const messagesRef = useRef(null);

	useClickOutside(categoryCardRef, () => (selectedCategory.current = null));

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const [
				statsResponse,
				keepersResponse,
				conversationsResponse,
				categoriesResponse,
			] = await Promise.all([
				getDashboardStats(),
				getKeepers(),
				getConversations({ page: page.conversations, limit }),
				getAllCategoriesForAdmin({ page: page.categories, limit }),
			]);
			setStats(statsResponse.data.stats || {});
			setKeepers(keepersResponse.data.keepers || []);
			setConversations(conversationsResponse.data.conversations || []);
			setTotalPages((prev) => ({
				...prev,
				conversations: conversationsResponse.data.pagination?.totalPages || 1,
			}));
			setCategories(categoriesResponse.data.categories || []);
			setTotalPages((prev) => ({
				...prev,
				categories: categoriesResponse.data.pagination?.totalPages || 1,
			}));
		} catch (err) {
			const errorMsg = "Failed to load data: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	}, [page.conversations, page.categories, limit]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	useEffect(() => {
		if (success || error) {
			const timeout = setTimeout(() => {
				setSuccess("");
				setError("");
			}, 3000);
			return () => clearTimeout(timeout);
		}
	}, [success, error]);

	const handleCreateAccount = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);

		if (
			!accountForm.name ||
			!accountForm.email ||
			!accountForm.password ||
			!accountForm.confirmPassword
		) {
			const errorMsg = "Please fill in all fields";
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
			setLoading(false);
			return;
		}

		if (accountForm.password !== accountForm.confirmPassword) {
			const errorMsg = "Passwords do not match";
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
			setLoading(false);
			return;
		}

		try {
			const response = await register({
				name: accountForm.name,
				email: accountForm.email,
				password: accountForm.password,
				role: accountForm.role,
			});
			const successMsg = `Account creation initiated for ${response.data.email}. An OTP has been sent to the email for verification.`;
			if (!shownToasts.current.has(successMsg)) {
				toast.success(successMsg);
				shownToasts.current.add(successMsg);
				setTimeout(() => shownToasts.current.delete(successMsg), 5000);
			}
			setSuccess(successMsg);
			setAccountForm({
				name: "",
				email: "",
				password: "",
				confirmPassword: "",
				role: "admin",
			});
			navigate(`/verify-otp?email=${encodeURIComponent(accountForm.email)}`);
		} catch (err) {
			const errorMsg = "Failed to create account: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleAddCategory = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await addCategory(categoryForm);
			setCategories([...categories, response.data.category]);
			const successMsg = `Category added successfully: ${response.data.category.name}`;
			if (!shownToasts.current.has(successMsg)) {
				toast.success(successMsg);
				shownToasts.current.add(successMsg);
				setTimeout(() => shownToasts.current.delete(successMsg), 5000);
			}
			setSuccess(successMsg);
			setCategoryForm({ name: "", description: "" });
		} catch (err) {
			const errorMsg = "Failed to add category: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleEditCategory = (category) => {
		selectedCategory.current = category;
		setEditCategoryForm({ ...category });
	};

	const handleUpdateCategory = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await updateCategory(
				selectedCategory.current._id,
				editCategoryForm
			);
			setCategories(
				categories.map((cat) =>
					cat._id === selectedCategory.current._id ? response.data.category : cat
				)
			);
			const successMsg = `Category updated successfully: ${response.data.category.name}`;
			if (!shownToasts.current.has(successMsg)) {
				toast.success(successMsg);
				shownToasts.current.add(successMsg);
				setTimeout(() => shownToasts.current.delete(successMsg), 5000);
			}
			setSuccess(successMsg);
			selectedCategory.current = null;
		} catch (err) {
			const errorMsg = "Failed to update category: " + (err.response?.data?.message || err.message);
			if (!shownToasts.current.has(errorMsg)) {
				toast.error(errorMsg);
				shownToasts.current.add(errorMsg);
				setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
			}
			setError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteCategory = async (categoryId) => {
		if (window.confirm("Are you sure you want to deactivate this category?")) {
			setLoading(true);
			try {
				await deleteCategory(categoryId);
				setCategories(categories.filter((cat) => cat._id !== categoryId));
				const successMsg = "Category deactivated successfully";
				if (!shownToasts.current.has(successMsg)) {
					toast.success(successMsg);
					shownToasts.current.add(successMsg);
					setTimeout(() => shownToasts.current.delete(successMsg), 5000);
				}
				setSuccess(successMsg);
			} catch (err) {
				const errorMsg = "Failed to deactivate category: " + (err.response?.data?.message || err.message);
				if (!shownToasts.current.has(errorMsg)) {
					toast.error(errorMsg);
					shownToasts.current.add(errorMsg);
					setTimeout(() => shownToasts.current.delete(errorMsg), 5000);
				}
				setError(errorMsg);
			} finally {
				setLoading(false);
			}
		}
	};

	const handleConversationClick = (conversation) => {
		setSelectedConversation(conversation);
	};

	useEffect(() => {
		if (messagesRef.current && selectedConversation) {
			messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
		}
	}, [selectedConversation, selectedConversation?.messages]);

	const togglePasswordVisibility = () => setShowPassword(!showPassword);
	const toggleConfirmPasswordVisibility = () =>
		setShowConfirmPassword(!showConfirmPassword);

	return (
		<div className="container mx-auto p-6 bg-[var(--bg-color)] min-h-screen transition-all duration-300">
			<h1 className="text-3xl font-bold mb-8 text-[var(--text-color)] text-center animate-fade-in-down">
				Admin Dashboard
			</h1>

			{(success || error) && (
				<div className="fixed top-6 right-6 z-50 w-full max-w-sm">
					{success && (
						<div className="bg-green-600 text-white p-4 rounded-lg shadow-md animate-fade-in">
							<p className="text-sm font-medium">{success}</p>
						</div>
					)}
					{error && (
						<div className="bg-red-600 text-white p-4 rounded-lg shadow-md animate-fade-in">
							<p className="text-sm font-medium">{error}</p>
						</div>
					)}
				</div>
			)}

			<div className="flex flex-wrap gap-3 mb-8 border-b border-[var(--secondary)] pb-2">
				{[
					"overview",
					"users",
					"items",
					"keepers",
					"conversations",
					"categories",
					"create-account",
				].map((tab) => (
					<Button
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={`py-2 px-5 text-sm font-semibold rounded-lg transition-all duration-200 text-white ${activeTab === tab
							? "bg-[var(--primary)] shadow-md"
							: "bg-[var(--secondary)] hover:bg-gray-600"
							}`}
					>
						{tab
							.split("-")
							.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
							.join(" ")}
					</Button>
				))}
			</div>

			{loading ? (
				<Loader />
			) : (
				<div className="space-y-6">
					{activeTab === "overview" && (
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{Object.entries(stats).map(([key, value]) => {
								if (key === "mostActiveUsers") return null;
								return (
									<div
										key={key}
										className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
									>
										<h2 className="text-xl font-semibold text-[var(--text-color)] mb-4 capitalize">
											{key.replace(/([A-Z])/g, " $1").trim()}
										</h2>
										<p className="text-3xl text-[var(--primary)] font-bold">{value}</p>
									</div>
								);
							})}
							<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 col-span-1 sm:col-span-2 lg:col-span-3">
								<h2 className="text-xl font-semibold text-[var(--text-color)] mb-4">
									Most Active Users
								</h2>
								{stats.mostActiveUsers?.length > 0 ? (
									<ul className="space-y-3">
										{stats.mostActiveUsers.map((activeUser) => (
											<li
												key={activeUser.userId}
												className="flex justify-between items-center p-3 bg-gray-50 rounded-lg table-row-hover transition-colors duration-200"
											>
												<span className="text-sm text-[var(--text-color)]">
													{activeUser.name} ({activeUser.email})
												</span>
												<span className="text-sm text-[var(--primary)] font-medium">
													{activeUser.itemCount} items
												</span>
											</li>
										))}
									</ul>
								) : (
									<p className="text-[var(--secondary)] text-sm">No active users yet.</p>
								)}
							</div>
						</div>
					)}

					{activeTab === "users" && (
						<UsersTab
							user={user}
							page={page}
							setPage={setPage}
							totalPages={totalPages}
							setTotalPages={setTotalPages}
							limit={limit}
						/>
					)}

					{activeTab === "items" && (
						<ItemsTab
							page={page}
							setPage={setPage}
							totalPages={totalPages}
							setTotalPages={setTotalPages}
							limit={limit}
						/>
					)}

					{activeTab === "keepers" && (
						<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg transition-all duration-300">
							<h2 className="text-2xl font-semibold text-[var(--text-color)] mb-6">
								Manage Keepers
							</h2>
							<div className="overflow-x-auto rounded-lg shadow-sm">
								<table className="min-w-full table-auto border-collapse bg-[var(--bg-color)]">
									<thead>
										<tr className="table-header text-left text-sm font-semibold text-[var(--text-color)]">
											<th className="px-6 py-4 border-b">Name</th>
											<th className="px-6 py-4 border-b">Email</th>
										</tr>
									</thead>
									<tbody>
										{keepers.map((keeper) => (
											<tr
												key={keeper._id}
												className="border-t table-row-hover transition-colors duration-200"
											>
												<td className="px-6 py-4 text-sm text-[var(--text-color)]">
													{keeper.name}
												</td>
												<td className="px-6 py-4 text-sm text-[var(--text-color)]">
													{keeper.email}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{activeTab === "conversations" && (
						<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg transition-all duration-300">
							<h2 className="text-2xl font-semibold text-[var(--text-color)] mb-6">
								Manage Conversations
							</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
										Conversations
									</h3>
									<ul className="space-y-3 max-h-80 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner">
										{conversations.map((conv) => (
											<li
												key={conv._id}
												onClick={() => handleConversationClick(conv)}
												className={`p-3 rounded-lg cursor-pointer text-sm ${selectedConversation?._id === conv._id
													? "bg-[var(--primary)] text-white"
													: "table-row-hover text-[var(--text-color)]"
													} transition-colors duration-200`}
											>
												{conv.item?.title} ({conv.item?.status}) -{" "}
												{conv.participants.map((p) => p.name).join(", ")}
												<p className="text-xs text-[var(--secondary)] mt-1">
													Last Message: {conv.lastMessage?.content || "No messages yet"} (
													{new Date(conv.lastMessage?.createdAt || 0).toLocaleString()})
												</p>
											</li>
										))}
									</ul>
									<div className="flex justify-center items-center gap-4 mt-6">
										<Button
											onClick={() =>
												setPage((prev) => ({
													...prev,
													conversations: Math.max(prev.conversations - 1, 1),
												}))
											}
											disabled={page.conversations === 1}
											className="px-4 py-2 bg-[var(--secondary)] text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 shadow-sm"
										>
											Previous
										</Button>
										<span className="text-sm text-[var(--text-color)] font-medium">
											Page {page.conversations} of {totalPages.conversations}
										</span>
										<Button
											onClick={() =>
												setPage((prev) => ({
													...prev,
													conversations: Math.min(
														prev.conversations + 1,
														totalPages.conversations
													),
												}))
											}
											disabled={page.conversations === totalPages.conversations}
											className="px-4 py-2 bg-[var(--secondary)] text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 shadow-sm"
										>
											Next
										</Button>
									</div>
								</div>
								<div>
									<h3 className="text-xl font-semibold text-[var(--text-color)] mb-3">
										Messages
									</h3>
									{selectedConversation ? (
										<div
											ref={messagesRef}
											className="border border-[var(--secondary)] rounded-lg p-4 h-80 overflow-y-auto bg-gray-50 shadow-inner"
										>
											{selectedConversation.messages.map((msg) => (
												<div
													key={msg._id}
													className="mb-3 p-3 bg-[var(--bg-color)] rounded-lg shadow-sm"
												>
													<p className="text-xs text-[var(--secondary)]">
														{msg.sender?.name} ({new Date(msg.createdAt).toLocaleString()}):
													</p>
													<p className="text-sm text-[var(--text-color)] mt-1">{msg.content}</p>
												</div>
											))}
										</div>
									) : (
										<p className="text-[var(--secondary)] text-sm bg-gray-50 p-4 rounded-lg shadow-inner">
											Select a conversation to view messages.
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{activeTab === "categories" && (
						<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg transition-all duration-300">
							<div className="mb-6 p-6 bg-gray-50 rounded-lg shadow-sm">
								<h3 className="text-xl font-semibold text-[var(--text-color)] mb-4">
									Add New Category
								</h3>
								<form onSubmit={handleAddCategory} className="space-y-4">
									<div>
										<label
											htmlFor="category-name"
											className="block text-sm font-medium text-[var(--text-color)]"
										>
											Name
										</label>
										<Input
											id="category-name"
											type="text"
											value={categoryForm.name}
											onChange={(e) =>
												setCategoryForm({
													...categoryForm,
													name: e.target.value,
												})
											}
											className="mt-1 text-sm input-border"
											required
										/>
									</div>
									<div>
										<label
											htmlFor="category-description"
											className="block text-sm font-medium text-[var(--text-color)]"
										>
											Description
										</label>
										<Textarea
											id="category-description"
											value={categoryForm.description}
											onChange={(e) =>
												setCategoryForm({
													...categoryForm,
													description: e.target.value,
												})
											}
											className="mt-1 text-sm input-border"
											rows="3"
										/>
									</div>
									<Button
										type="submit"
										className="w-full bg-[var(--primary)] text-white py-3 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
										disabled={loading}
									>
										{loading ? "Adding..." : "Add Category"}
									</Button>
								</form>
							</div>
							<div>
								<h3 className="text-xl font-semibold text-[var(--text-color)] mb-4">
									Available Categories
								</h3>
								{categories.length > 0 ? (
									<div className="overflow-x-auto rounded-lg shadow-sm">
										<table className="min-w-full table-auto border-collapse bg-[var(--bg-color)]">
											<thead>
												<tr className="table-header text-left text-sm font-semibold text-[var(--text-color)]">
													<th className="px-6 py-4 border-b">Name</th>
													<th className="px-6 py-4 border-b">Description</th>
													<th className="px-6 py-4 border-b">Status</th>
													<th className="px-6 py-4 border-b">Created At</th>
													<th className="px-6 py-4 border-b">Actions</th>
												</tr>
											</thead>
											<tbody>
												{categories.map((category) => (
													<tr
														key={category._id}
														className="border-t table-row-hover transition-colors duration-200"
													>
														<td className="px-6 py-4 text-sm text-[var(--text-color)]">
															{category.name}
														</td>
														<td className="px-6 py-4 text-sm text-[var(--text-color)]">
															{category.description || "N/A"}
														</td>
														<td className="px-6 py-4 text-sm text-[var(--text-color)]">
															<span
																className={`px-2 py-1 rounded-full text-xs ${category.isActive
																	? "bg-green-600 text-white"
																	: "bg-red-600 text-white"
																	}`}
															>
																{category.isActive ? "Active" : "Inactive"}
															</span>
														</td>
														<td className="px-6 py-4 text-sm text-[var(--text-color)]">
															{new Date(category.createdAt).toLocaleDateString()}
														</td>
														<td className="px-6 py-4 text-sm flex gap-3">
															<Button
																onClick={() => handleEditCategory(category)}
																className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-yellow-700 transition-colors duration-200 shadow-sm"
															>
																Edit
															</Button>
															<Button
																onClick={() => handleDeleteCategory(category._id)}
																className={`bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors duration-200 shadow-sm ${!category.isActive ? "opacity-50 cursor-not-allowed" : ""
																	}`}
																disabled={!category.isActive}
															>
																Deactivate
															</Button>
														</td>
													</tr>
												))}
											</tbody>
										</table>
										<div className="flex justify-center items-center gap-4 mt-6">
											<Button
												onClick={() =>
													setPage((prev) => ({
														...prev,
														categories: Math.max(prev.categories - 1, 1),
													}))
												}
												disabled={page.categories === 1}
												className="px-4 py-2 bg-[var(--secondary)] text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 shadow-sm"
											>
												Previous
											</Button>
											<span className="text-sm text-[var(--text-color)] font-medium">
												Page {page.categories} of {totalPages.categories}
											</span>
											<Button
												onClick={() =>
													setPage((prev) => ({
														...prev,
														categories: Math.min(prev.categories + 1, totalPages.categories),
													}))
												}
												disabled={page.categories === totalPages.categories}
												className="px-4 py-2 bg-[var(--secondary)] text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50 shadow-sm"
											>
												Next
											</Button>
										</div>
									</div>
								) : (
									<p className="text-[var(--secondary)] text-sm bg-gray-50 p-4 rounded-lg shadow-inner">
										No categories available.
									</p>
								)}
							</div>
						</div>
					)}

					{selectedCategory.current && (
						<div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
							<div
								ref={categoryCardRef}
								className="bg-[var(--bg-color)] p-6 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100"
							>
								<h3 className="text-xl font-semibold text-[var(--text-color)] mb-6">
									Edit Category
								</h3>
								<form onSubmit={handleUpdateCategory} className="space-y-4">
									<div>
										<label
											htmlFor="edit-category-name"
											className="block text-sm font-medium text-[var(--text-color)]"
										>
											Name
										</label>
										<Input
											id="edit-category-name"
											type="text"
											value={editCategoryForm.name}
											onChange={(e) =>
												setEditCategoryForm({
													...editCategoryForm,
													name: e.target.value,
												})
											}
											className="mt-1 text-sm input-border"
											required
										/>
									</div>
									<div>
										<label
											htmlFor="edit-category-description"
											className="block text-sm font-medium text-[var(--text-color)]"
										>
											Description
										</label>
										<Textarea
											id="edit-category-description"
											value={editCategoryForm.description}
											onChange={(e) =>
												setEditCategoryForm({
													...editCategoryForm,
													description: e.target.value,
												})
											}
											className="mt-1 text-sm input-border"
											rows="3"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-[var(--text-color)] mb-2">
											Status
										</label>
										<div className="flex space-x-6">
											<label className="flex items-center">
												<input
													type="radio"
													name="isActive"
													value="true"
													checked={editCategoryForm.isActive === true}
													onChange={() =>
														setEditCategoryForm({
															...editCategoryForm,
															isActive: true,
														})
													}
													className="mr-2 text-[var(--primary)] focus:ring-[var(--primary)]"
												/>
												<span className="text-sm text-[var(--text-color)]">Active</span>
											</label>
											<label className="flex items-center">
												<input
													type="radio"
													name="isActive"
													value="false"
													checked={editCategoryForm.isActive === false}
													onChange={() =>
														setEditCategoryForm({
															...editCategoryForm,
															isActive: false,
														})
													}
													className="mr-2 text-[var(--primary)] focus:ring-[var(--primary)]"
												/>
												<span className="text-sm text-[var(--text-color)]">Inactive</span>
											</label>
										</div>
									</div>
									<div className="flex justify-end gap-4 mt-6">
										<Button
											type="submit"
											className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors duration-200 shadow-sm disabled:opacity-50"
											disabled={loading}
										>
											{loading ? "Updating..." : "Update Category"}
										</Button>
										<Button
											type="button"
											onClick={() => (selectedCategory.current = null)}
											className="bg-[var(--secondary)] text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-600 transition-colors duration-200 shadow-sm"
										>
											Cancel
										</Button>
									</div>
								</form>
							</div>
						</div>
					)}

					{activeTab === "create-account" && (
						<div className="bg-[var(--bg-color)] p-6 rounded-xl shadow-lg transition-all duration-300 max-w-lg mx-auto">
							<h2 className="text-2xl font-semibold text-[var(--text-color)] mb-6">
								Create Admin/Keeper Account
							</h2>
							<form onSubmit={handleCreateAccount} className="space-y-6">
								<div>
									<label
										htmlFor="name"
										className="block text-sm font-medium text-[var(--text-color)]"
									>
										Name
									</label>
									<Input
										id="name"
										type="text"
										value={accountForm.name}
										onChange={(e) =>
											setAccountForm({ ...accountForm, name: e.target.value })
										}
										className="mt-1 text-sm input-border"
										required
										disabled={loading}
									/>
								</div>
								<div>
									<label
										htmlFor="email"
										className="block text-sm font-medium text-[var(--text-color)]"
									>
										Email
									</label>
									<Input
										id="email"
										type="email"
										value={accountForm.email}
										onChange={(e) =>
											setAccountForm({ ...accountForm, email: e.target.value })
										}
										className="mt-1 text-sm input-border"
										required
										disabled={loading}
									/>
								</div>
								<div className="relative">
									<label
										htmlFor="password"
										className="block text-sm font-medium text-[var(--text-color)]"
									>
										Password
									</label>
									<Input
										id="password"
										type={showPassword ? "text" : "password"}
										value={accountForm.password}
										onChange={(e) =>
											setAccountForm({
												...accountForm,
												password: e.target.value,
											})
										}
										className="mt-1 text-sm pr-12 input-border"
										required
										disabled={loading}
									/>
									<button
										type="button"
										onClick={togglePasswordVisibility}
										className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full icon-color hover:text-[var(--text-color)] focus:outline-none mt-4"
										disabled={loading}
									>
										{showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
									</button>
								</div>
								<div className="relative">
									<label
										htmlFor="confirm-password"
										className="block text-sm font-medium text-[var(--text-color)]"
									>
										Confirm Password
									</label>
									<Input
										id="confirm-password"
										type={showConfirmPassword ? "text" : "password"}
										value={accountForm.confirmPassword}
										onChange={(e) =>
											setAccountForm({
												...accountForm,
												confirmPassword: e.target.value,
											})
										}
										className="mt-1 text-sm pr-12 input-border"
										required
										disabled={loading}
									/>
									<button
										type="button"
										onClick={toggleConfirmPasswordVisibility}
										className="absolute inset-y-0 right-0 flex items-center justify-center w-12 h-full icon-color hover:text-[var(--text-color)] focus:outline-none mt-4"
										disabled={loading}
									>
										{showConfirmPassword ? (
											<FaEyeSlash className="h-5 w-5" />
										) : (
											<FaEye className="h-5 w-5" />
										)}
									</button>
								</div>
								<div>
									<label className="block text-sm font-medium text-[var(--text-color)] mb-2">
										Role
									</label>
									<div className="flex space-x-6">
										<label className="flex items-center">
											<input
												type="radio"
												name="role"
												value="admin"
												checked={accountForm.role === "admin"}
												onChange={(e) =>
													setAccountForm({
														...accountForm,
														role: e.target.value,
													})
												}
												className="mr-2 text-[var(--primary)] focus:ring-[var(--primary)] disabled:opacity-50"
												disabled={loading}
											/>
											<span className="text-sm text-[var(--text-color)]">Admin</span>
										</label>
										<label className="flex items-center">
											<input
												type="radio"
												name="role"
												value="keeper"
												checked={accountForm.role === "keeper"}
												onChange={(e) =>
													setAccountForm({
														...accountForm,
														role: e.target.value,
													})
												}
												className="mr-2 text-[var(--primary)] focus:ring-[var(--primary)] disabled:opacity-50"
												disabled={loading}
											/>
											<span className="text-sm text-[var(--text-color)]">Keeper</span>
										</label>
									</div>
								</div>
								<Button
									type="submit"
									className={`w-full py-3 rounded-lg text-sm font-semibold text-white transition-all duration-200 shadow-md ${loading
										? "bg-blue-400 cursor-not-allowed"
										: "bg-[var(--primary)] hover:bg-blue-700 hover:shadow-lg"
										}`}
									disabled={loading}
								>
									{loading ? (
										<span className="flex items-center justify-center">
											<svg
												className="animate-spin h-5 w-5 mr-2 text-white"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
											>
												<circle
													className="opacity-25"
													cx="12"
													cy="12"
													r="10"
													stroke="currentColor"
													strokeWidth="4"
												></circle>
												<path
													className="opacity-75"
													fill="currentColor"
													d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
												></path>
											</svg>
											Creating...
										</span>
									) : (
										"Create Account"
									)}
								</Button>
							</form>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default AdminDashboard;