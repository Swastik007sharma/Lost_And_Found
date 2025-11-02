import {
	useState,
	useEffect,
	useContext,
	useRef,
	useCallback,
} from "react";
import { AuthContext } from "../context/AuthContext";
import {
	getDashboardStats,
	getConversations,
} from "../services/adminService";
import {
	addCategory,
	deleteCategory,
	updateCategory,
	getAllCategoriesForAdmin,
} from "../services/categoryService";
import { getKeepers } from "../services/keeperService";
import { register } from "../services/authService";
import { useNavigate, useSearchParams } from "react-router-dom";
import useClickOutside from "../hooks/useClickOutside";
import {
	FaUsers,
	FaBoxOpen,
	FaUserShield,
	FaComments,
	FaTags,
	FaUserPlus,
	FaChartBar,
	FaCrown
} from "react-icons/fa";
import Loader from "../components/common/Loader";
import { toast } from "react-toastify";

// Import tab components
import OverviewTab from "../components/admin/OverviewTab";
import UsersTab from "../components/admin/UsersTab";
import ItemsTab from "../components/admin/ItemsTab";
import KeepersTab from "../components/admin/KeepersTab";
import ConversationsTab from "../components/admin/ConversationsTab";
import CategoriesTab from "../components/admin/CategoriesTab";
import CreateAccountTab from "../components/admin/CreateAccountTab";
import ReportsTab from "../components/admin/ReportsTab";

// Main AdminDashboard Component
function AdminDashboard() {
	const { user } = useContext(AuthContext);
	const navigate = useNavigate();
	const [searchParams, setSearchParams] = useSearchParams();

	// Get initial tab from URL or default to "overview"
	const initialTab = searchParams.get("tab") || "overview";
	const [activeTab, setActiveTab] = useState(initialTab);
	const [stats, setStats] = useState({});
	const [keepers, setKeepers] = useState([]);
	const [conversations, setConversations] = useState([]);
	const [totalConversations, setTotalConversations] = useState(0);
	const [conversationSortOrder, setConversationSortOrder] = useState("desc"); // desc = newer first, asc = older first
	const [categories, setCategories] = useState([]);
	const [allCategories, setAllCategories] = useState([]); // All categories for dropdown filters
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
	const limit = 12;

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

	const messagesRef = useRef(null);

	useClickOutside(categoryCardRef, () => (selectedCategory.current = null));

	// Handle tab change and update URL
	const handleTabChange = useCallback((tab) => {
		setActiveTab(tab);
		setSearchParams({ tab });
	}, [setSearchParams]);

	// Sync activeTab with URL on initial load and when URL changes
	useEffect(() => {
		const urlTab = searchParams.get("tab");
		if (urlTab && urlTab !== activeTab) {
			setActiveTab(urlTab);
		}
	}, [searchParams, activeTab]);

	// Fetch all categories for dropdown filters (not paginated)
	const fetchAllCategories = useCallback(async () => {
		try {
			const response = await getAllCategoriesForAdmin({ page: 1, limit: 1000 });
			setAllCategories(response.data.categories || []);
		} catch (err) {
			console.error("Failed to load all categories:", err);
		}
	}, []);

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
				getConversations({ page: page.conversations, limit, sortOrder: conversationSortOrder }),
				getAllCategoriesForAdmin({ page: page.categories, limit }),
			]);
			setStats(statsResponse.data.stats || {});
			setKeepers(keepersResponse.data.keepers || []);
			setConversations(conversationsResponse.data.conversations || []);
			setTotalConversations(conversationsResponse.data.pagination?.total || 0);
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
	}, [page.conversations, page.categories, limit, conversationSortOrder]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	// Fetch all categories once on mount
	useEffect(() => {
		fetchAllCategories();
	}, [fetchAllCategories]);

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
			// Redirect to OTP verification page
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
			// Also refresh all categories for dropdown
			fetchAllCategories();
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
			// Also refresh all categories for dropdown
			fetchAllCategories();
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

	const handleToggleCategoryActivation = async (categoryId, currentStatus) => {
		const action = currentStatus ? "deactivate" : "activate";
		if (window.confirm(`Are you sure you want to ${action} this category?`)) {
			setLoading(true);
			try {
				await updateCategory(categoryId, { isActive: !currentStatus });
				// Refetch categories to get updated list
				const categoriesResponse = await getAllCategoriesForAdmin({ page: page.categories, limit });
				setCategories(categoriesResponse.data.categories || []);
				setTotalPages((prev) => ({
					...prev,
					categories: categoriesResponse.data.pagination?.totalPages || 1,
				}));
				// Also refresh all categories for dropdown
				fetchAllCategories();
				const successMsg = `Category ${action}d successfully`;
				if (!shownToasts.current.has(successMsg)) {
					toast.success(successMsg);
					shownToasts.current.add(successMsg);
					setTimeout(() => shownToasts.current.delete(successMsg), 5000);
				}
				setSuccess(successMsg);
			} catch (err) {
				const errorMsg = `Failed to ${action} category: ` + (err.response?.data?.message || err.message);
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
		<div className="container mx-auto p-4 sm:p-6 min-h-screen transition-all duration-300" style={{ background: 'var(--color-bg)' }}>
			{/* Enhanced Header */}
			<div className="mb-8 text-center">
				<div className="flex items-center justify-center gap-3 mb-2">
					<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
						<FaCrown className="text-2xl text-white" />
					</div>
					<h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
						Admin Dashboard
					</h1>
				</div>
				<p className="text-sm sm:text-base opacity-70" style={{ color: 'var(--color-text)' }}>
					Manage your Lost & Found platform
				</p>
			</div>

			{(success || error) && (
				<div className="fixed top-6 right-6 z-50 w-full max-w-sm">
					{success && (
						<div className="p-4 rounded-lg shadow-md animate-fade-in" style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
							<p className="text-sm font-medium">{success}</p>
						</div>
					)}
					{error && (
						<div className="p-4 rounded-lg shadow-md animate-fade-in" style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}>
							<p className="text-sm font-medium">{error}</p>
						</div>
					)}
				</div>
			)}

			{/* Enhanced Tab Navigation */}
			<div className="flex flex-wrap gap-2 sm:gap-3 mb-8 p-4 rounded-xl shadow-md" style={{ background: 'var(--color-secondary)' }}>
				{[
					{ key: "overview", label: "Overview", icon: <FaChartBar /> },
					{ key: "users", label: "Users", icon: <FaUsers /> },
					{ key: "items", label: "Items", icon: <FaBoxOpen /> },
					{ key: "keepers", label: "Keepers", icon: <FaUserShield /> },
					{ key: "conversations", label: "Conversations", icon: <FaComments /> },
					{ key: "categories", label: "Categories", icon: <FaTags /> },
					{ key: "reports", label: "Reports", icon: <FaChartBar /> },
					{ key: "create-account", label: "Create Account", icon: <FaUserPlus /> },
				].map((tab) => (
					<button
						key={tab.key}
						onClick={() => handleTabChange(tab.key)}
						className={`flex items-center gap-2 py-2.5 px-4 text-xs sm:text-sm font-semibold rounded-lg transition-all duration-200 ${activeTab === tab.key
							? "shadow-lg scale-105 transform"
							: "hover:bg-gray-300 dark:hover:bg-gray-700 hover:scale-105 transform"
							}`}
						style={activeTab === tab.key
							? { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }
							: { background: 'var(--color-bg)', color: 'var(--color-text)' }
						}
					>
						<span className="text-base">{tab.icon}</span>
						<span className="hidden sm:inline">{tab.label}</span>
					</button>
				))}
			</div>

			{loading ? (
				<Loader size="lg" variant="pulse" text="Loading statistics..." />
			) : (
				<div className="space-y-6">
					{activeTab === "overview" && <OverviewTab stats={stats} />}

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
							limit={10} //Limit
						/>
					)}

					{activeTab === "keepers" && <KeepersTab keepers={keepers} />}

					{activeTab === "conversations" && (
						<ConversationsTab
							conversations={conversations}
							selectedConversation={selectedConversation}
							handleConversationClick={handleConversationClick}
							messagesRef={messagesRef}
							page={page.conversations}
							setPage={(newPage) => setPage(prev => ({ ...prev, conversations: newPage }))}
							totalPages={totalPages.conversations}
							totalConversations={totalConversations}
							conversationSortOrder={conversationSortOrder}
							setConversationSortOrder={setConversationSortOrder}
						/>
					)}					{activeTab === "categories" && (
						<CategoriesTab
							categories={categories}
							allCategories={allCategories}
							categoryForm={categoryForm}
							setCategoryForm={setCategoryForm}
							editCategoryForm={editCategoryForm}
							setEditCategoryForm={setEditCategoryForm}
							selectedCategory={selectedCategory}
							categoryCardRef={categoryCardRef}
							handleAddCategory={handleAddCategory}
							handleEditCategory={handleEditCategory}
							handleUpdateCategory={handleUpdateCategory}
							handleDeleteCategory={handleDeleteCategory}
							handleToggleCategoryActivation={handleToggleCategoryActivation}
							loading={loading}
							page={page}
							setPage={setPage}
							totalPages={totalPages}
						/>
					)}

					{activeTab === "reports" && (
						<ReportsTab />
					)}

					{activeTab === "create-account" && (
						<CreateAccountTab
							accountForm={accountForm}
							setAccountForm={setAccountForm}
							showPassword={showPassword}
							showConfirmPassword={showConfirmPassword}
							togglePasswordVisibility={togglePasswordVisibility}
							toggleConfirmPasswordVisibility={toggleConfirmPasswordVisibility}
							handleCreateAccount={handleCreateAccount}
							loading={loading}
						/>
					)}
				</div>
			)}
		</div>
	);
}

export default AdminDashboard;