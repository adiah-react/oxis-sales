import {
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CreditCardIcon,
  DollarSignIcon,
  LayoutDashboardIcon,
  LayoutGridIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  ShieldIcon,
  ShoppingCartIcon,
  TrashIcon,
  UserIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./contexts/AuthContext";
import apiService from "./services/api";
const initialProducts = [
  {
    id: 1,
    name: "Coffee",
    price: 3.5,
    category: "Beverages",
    stock: 50,
    lowStockThreshold: 10,
  },
  {
    id: 2,
    name: "Tea",
    price: 2.5,
    category: "Beverages",
    stock: 45,
    lowStockThreshold: 10,
  },
  {
    id: 3,
    name: "Sandwich",
    price: 7.99,
    category: "Food",
    stock: 30,
    lowStockThreshold: 5,
  },
  {
    id: 4,
    name: "Salad",
    price: 8.99,
    category: "Food",
    stock: 25,
    lowStockThreshold: 5,
  },
  {
    id: 5,
    name: "Muffin",
    price: 3.99,
    category: "Bakery",
    stock: 40,
    lowStockThreshold: 8,
  },
  {
    id: 6,
    name: "Croissant",
    price: 4.5,
    category: "Bakery",
    stock: 35,
    lowStockThreshold: 8,
  },
  {
    id: 7,
    name: "Water",
    price: 1.5,
    category: "Beverages",
    stock: 100,
    lowStockThreshold: 20,
  },
  {
    id: 8,
    name: "Juice",
    price: 3.99,
    category: "Beverages",
    stock: 60,
    lowStockThreshold: 15,
  },
  {
    id: 9,
    name: "Burger",
    price: 9.99,
    category: "Food",
    stock: 20,
    lowStockThreshold: 5,
  },
  {
    id: 10,
    name: "Pizza Slice",
    price: 4.99,
    category: "Food",
    stock: 8,
    lowStockThreshold: 5,
  },
  {
    id: 11,
    name: "Cookie",
    price: 2.5,
    category: "Bakery",
    stock: 55,
    lowStockThreshold: 10,
  },
  {
    id: 12,
    name: "Brownie",
    price: 3.5,
    category: "Bakery",
    stock: 4,
    lowStockThreshold: 10,
  },
];
const App = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [products, setProducts] = useState(initialProducts);
  const [persons, setPersons] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [cart, setCart] = useState([]);
  const [personSearchTerm, setPersonSearchTerm] = useState("");
  const [showPersonSearch, setShowPersonSearch] = useState(false);
  const [cashReceived, setCashReceived] = useState("");
  const [showCashInput, setShowCashInput] = useState(false);
  const [isPersonSectionCollapsed, setIsPersonSectionCollapsed] =
    useState(false);
  const [mobileView, setMobileView] = useState("products");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showReceipt, setShowReceipt] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [view, setView] = useState("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useApi, setUseApi] = useState(true);
  const [isCheckoutCollapsed, setIsCheckoutCollapsed] = useState(false);

  // Fetch products from API on mount
  useEffect(() => {
    loadProducts();
    loadPersons();
    loadSalesHistory();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchProducts();
      setProducts(data);
      setUseApi(true);
    } catch (err) {
      console.error("Failed to fetch products from API:", err);
      setError("Using local data. Could not connect to API.");
      // Keep using initial products as fallback
      // TODO: Need to setup fallback local data
      // setUseApi(false);
    } finally {
      setLoading(false);
    }
  };

  const loadSalesHistory = async () => {
    try {
      const data = await apiService.fetchSalesHistory();
      setSalesHistory(data);
    } catch (err) {
      console.error("Failed to fetch sales history from API:", err);
      // Keep using local sales history
    }
  };

  const loadPersons = async () => {
    try {
      const data = await apiService.fetchPersons();
      setPersons(data);
    } catch (err) {
      console.error("Failed to fetch persons from API:", err);
    }
  };

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

  const filteredPersons = persons.filter(
    (person) =>
      person.name.toLowerCase().includes(personSearchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(personSearchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);
    const currentQuantity = existingItem ? existingItem.quantity : 0;
    if (currentQuantity >= product.stock) {
      alert(`Cannot add more ${product.name}. Only ${product.stock} in stock.`);
      return;
    }
    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          ...product,
          quantity: 1,
        },
      ]);
    }
  };
  const updateQuantity = (id, delta) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    setCart(
      cart
        .map((item) => {
          if (item.id === id) {
            const newQuantity = Math.max(0, item.quantity + delta);
            if (newQuantity > product.stock) {
              alert(
                `Cannot add more ${product.name}. Only ${product.stock} in stock.`
              );
              return item;
            }
            return {
              ...item,
              quantity: newQuantity,
            };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };
  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.0;
  const total = subtotal + tax;

  const handleSelectPerson = (person) => {
    setSelectedPerson(person);
    setShowPersonSearch(false);
    setPersonSearchTerm("");
    // setPaymentMethod("cash");
    // setPersonSearchTerm("");
    setPaymentMethod("balance");
  };

  const handleClearPerson = () => {
    setSelectedPerson(null);
    setPaymentMethod("cash");
    setPersonSearchTerm("");
  };

  const handleCheckout = async () => {
    if (paymentMethod === "balance") {
      if (!selectedPerson) {
        setError("Please select a person to pay with balance");
        return;
      }
      if (selectedPerson.balance < total) {
        setError("Insufficient balance");
        return;
      }
    }

    if (paymentMethod === "cash" && !showCashInput) {
      setShowCashInput(true);
      return;
    }

    if (paymentMethod === "cash") {
      const received = parseFloat(cashReceived);
      if (isNaN(received) || received < total) {
        setError("Insufficient cash received");
        return;
      }
    }

    try {
      setLoading(true);
      setError(null);
      // Create sale data
      const saleData = {
        items: cart,
        subtotal,
        tax,
        total,
        personId: selectedPerson?.id,
        paymentMethod,
      };
      if (useApi) {
        // Send sale to API
        const createdSale = await apiService.createSale(saleData);
        setSalesHistory([createdSale, ...salesHistory]);
        // Update inventory on backend
        for (const item of cart) {
          const newStock =
            products.find((p) => p.id === item.id).stock - item.quantity;
          await apiService.updateProductStock(item.id, newStock);
        }
        if (paymentMethod === "balance" && selectedPerson) {
          await apiService.updatePersonBalance(selectedPerson.id, -total);
          await loadPersons();
        }
        // Refresh products from API
        await loadProducts();
      } else {
        // Local update if API is not available
        const updatedProducts = products.map((product) => {
          const cartItem = cart.find((item) => item.id === product.id);
          if (cartItem) {
            return {
              ...product,
              stock: product.stock - cartItem.quantity,
            };
          }
          return product;
        });
        setProducts(updatedProducts);
        const sale = {
          id: Date.now(),
          date: new Date(),
          items: cart,
          subtotal,
          tax,
          total,
          personId: selectedPerson?.id,
          paymentMethod,
        };
        setSalesHistory([sale, ...salesHistory]);
      }
      setShowReceipt(true);
    } catch (err) {
      console.error("Failed to complete checkout:", err);
      setError("Failed to complete sale. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleNewTransaction = () => {
    setCart([]);
    setShowReceipt(false);
    setSelectedPerson(null);
    setPaymentMethod("cash");
    setCashReceived("");
    setShowCashInput(false);
  };

  const handleRestock = async (productId, amount) => {
    try {
      setLoading(true);
      setError(null);
      if (useApi) {
        await apiService.restockProduct(productId, amount);
        await loadProducts();
      } else {
        setProducts(
          products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  stock: p.stock + amount,
                }
              : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to restock product:", err);
      setError("Failed to restock product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const change = cashReceived ? parseFloat(cashReceived) - total : 0;

  const filteredProducts =
    selectedCategory === "All"
      ? products
      : products.filter((p) => p.category === selectedCategory);
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  );

  if (view === "dashboard") {
    return (
      <Dashboard
        products={products}
        persons={persons}
        salesHistory={salesHistory}
        onRestock={handleRestock}
        onBackToRegister={() => setView("register")}
        loading={loading}
        error={error}
      />
    );
  }
  if (showReceipt) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
            <p className="text-gray-600 text-sm">
              Thank you for your purchase!
            </p>
            <p className="text-gray-500 text-xs mt-1">
              {new Date().toLocaleString()}
            </p>
          </div>
          <div className="border-t border-b border-gray-300 py-4 mb-4">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between mb-2">
                <div>
                  <span className="font-medium">{item.name}</span>
                  <span className="text-gray-600 text-sm ml-2">
                    x{item.quantity}
                  </span>
                </div>
                <span className="font-medium">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-gray-700">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Tax (0%):</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {paymentMethod === "cash" && cashReceived && (
              <>
                <div className="flex justify-between text-gray-700 pt-2">
                  <span>Cash Received:</span>
                  <span>${parseFloat(cashReceived).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-green-600">
                  <span>Change:</span>
                  <span>${change.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
          <button
            onClick={handleNewTransaction}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            New Transaction
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center justify-between text-red-800">
            <span className="font-semibold">{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      {/* Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangleIcon className="w-5 h-5" />
            <span className="font-semibold">
              Low Stock Alert: {lowStockProducts.length} item(s) running low
            </span>
            <button
              onClick={() => setView("dashboard")}
              className="ml-auto text-amber-700 underline hover:text-amber-900"
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Mobile View Switcher */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="grid grid-cols-2 gap-0">
          <button
            onClick={() => setMobileView("products")}
            className={`flex items-center justify-center gap-2 py-4 font-semibold transition-colors ${
              mobileView === "products"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <LayoutGridIcon className="w-5 h-5" />
            Products
          </button>
          <button
            onClick={() => setMobileView("cart")}
            className={`flex items-center justify-center gap-2 py-4 font-semibold transition-colors ${
              mobileView === "cart"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700"
            }`}
          >
            <ShoppingCartIcon className="w-5 h-5" />
            Cart
            {cart.length > 0 && (
              <span className="absolute top-2 right-1/4 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-screen pb-16 lg:pb-0">
        {/* Products Section */}
        <div
          className={`flex-1 p-4 sm:p-6 overflow-y-auto ${
            mobileView === "cart" ? "hidden lg:block" : "block"
          }`}
        >
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Cash Register
                </h1>
                {useApi && (
                  <p className="text-sm text-green-600 mt-1">
                    Connected to API
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={loadProducts}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50"
                >
                  <RefreshCwIcon
                    className={`w-4 sm:w-5 h-4 sm:h-5 ${
                      loading ? "animate-spin" : ""
                    }`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
                <button
                  onClick={() => setView("dashboard")}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <LayoutDashboardIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  <ShieldIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                  <span className="hidden sm:inline">Admin</span>
                </button>
              </div>
            </div>
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                    selectedCategory === category
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
          {/* Product Grid */}
          {loading && products.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCwIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.lowStockThreshold;
                const isOutOfStock = product.stock === 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-lg transition-shadow text-left relative ${
                      isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLowStock && !isOutOfStock && (
                      <div className="absolute top-2 right-2">
                        <AlertTriangleIcon className="w-4 sm:w-5 h-4 sm:h-5 text-amber-500" />
                      </div>
                    )}
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg mb-2 sm:mb-3 flex items-center justify-center">
                      <img src={product.image} alt="" />
                      {/* <ShoppingCartIcon className="w-8 sm:w-12 h-8 sm:h-12 text-blue-600" /> */}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base truncate">
                      {product.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 sm:mb-2">
                      {product.category}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-1 sm:gap-2 mt-1 sm:mt-2">
                      <PackageIcon className="w-3 sm:w-4 h-3 sm:h-4 text-gray-500" />
                      <span
                        className={`text-xs sm:text-sm font-medium ${
                          isOutOfStock
                            ? "text-red-600"
                            : isLowStock
                            ? "text-amber-600"
                            : "text-gray-600"
                        }`}
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : `${product.stock} in stock`}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
        {/* Cart Section */}
        <div
          className={`lg:w-96 bg-white border-l border-gray-200 flex flex-col ${
            mobileView === "products" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Current Order
            </h2>
          </div>

          {/* Collapsible Person Selection with Search */}
          <div className="border-b border-gray-200 bg-gray-50">
            <button
              onClick={() =>
                setIsPersonSectionCollapsed(!isPersonSectionCollapsed)
              }
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">
                  {selectedPerson ? selectedPerson.name : "Customer"}
                </span>
              </div>

              {isPersonSectionCollapsed ? (
                <ChevronDownIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronUpIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {!isPersonSectionCollapsed && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                {selectedPerson ? (
                  <div className="relative">
                    <div className="p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600" />
                          <span className="font-semibold text-blue-900 text-sm sm:text-base">
                            {selectedPerson.name}
                          </span>
                        </div>
                        <button
                          onClick={handleClearPerson}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <XIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            selectedPerson.type === "student"
                              ? "bg-blue-100 text-blue-800"
                              : selectedPerson.type === "staff"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {selectedPerson.type}
                        </span>
                        <div className="flex items-center gap-1">
                          <DollarSignIcon className="w-3 sm:w-4 h-3 sm:h-4 text-blue-600" />
                          <span className="text-xs sm:text-sm font-semibold text-blue-700">
                            ${selectedPerson.balance.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {selectedPerson.balance < total && (
                        <p className="text-xs text-red-600 mt-2">
                          Insufficient balance
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <button
                      onClick={() => setShowPersonSearch(!showPersonSearch)}
                      className="w-full px-3 sm:px-4 p-2 sm:py-3 bg-white border border-gray-300 rounded-lg text-left flex items-center justify-between hover:border-blue-500 transition-colors text-sm sm:text-base"
                    >
                      <span className="text-gray-500">Search customer</span>
                      <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                    </button>

                    {showPersonSearch && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-64 overflow-hidden flex flex-col">
                        <div className="p-3 border-b border-gray-200">
                          <div className="relative">
                            <SearchIcon className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                            <input
                              type="text"
                              value={personSearchTerm}
                              onChange={(e) =>
                                setPersonSearchTerm(e.target.value)
                              }
                              className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                              placeholder="Search customers..."
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="overflow-y-auto flex-1">
                          {filteredPersons.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No customers found
                            </div>
                          ) : (
                            filteredPersons.map((person) => (
                              <button
                                key={person.id}
                                onClick={() => handleSelectPerson(person)}
                                className="w-full px-3 sm:px-4 py-2 sm:py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-b-0 transition-colors"
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="font-medium text-gray-900 text-sm sm:text-base truncate">
                                    {person.name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ml-2 ${
                                      person.type === "student"
                                        ? "bg-blue-100 text-blue-800"
                                        : person.type === "staff"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {person.type}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs sm:text-sm text-gray-600 truncate">
                                    {person.email}
                                  </span>
                                  <span className="text-xs sm:text-sm font-semibold text-gray-900 flex-shrink-0 ml-2">
                                    ${person.balance.toFixed(2)}
                                  </span>
                                </div>
                              </button>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCartIcon className="w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-sm sm:text-base">No items in cart</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {cart.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gray-50 p-3 sm:p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {item.name}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 flex-shrink-0 ml-2"
                      >
                        <TrashIcon className="w-4 sm:w-5 h-4 sm:h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-7 sm:w-8 h-7 sm:h-8 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <MinusIcon className="w-3 sm:w-4 h-3 sm:h-2" />
                        </button>
                        <span className="w-10 sm:w-12 text-center font-semibold text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-7 sm:w-8 h-7 sm:h-8 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <PlusIcon className="w-3 sm:w-4 h-3 sm:h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-base sm:text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Checkout Section */}
          <div className="border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setIsCheckoutCollapsed(!isCheckoutCollapsed)}
              className="w-full p-4 sm:p-6 flex items-center justify-between hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <DollarSignIcon className="w-5 h-5 text-gray-600" />
                <span className="font-bold text-xl sm:text-2xl text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
              {isCheckoutCollapsed ? (
                <ChevronUpIcon className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDownIcon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {!isCheckoutCollapsed && (
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                {/* Payment Method Selection */}
                {selectedPerson && (
                  <div className="mb-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Payment Method
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setPaymentMethod("cash");
                          setShowCashInput(true);
                          setCashReceived("");
                        }}
                        className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                          paymentMethod === "cash"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <CreditCardIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1 sm:mr-2" />
                        Cash
                      </button>
                      <button
                        onClick={() => {
                          setPaymentMethod("balance");
                          setShowCashInput(false);
                          setCashReceived("");
                        }}
                        disabled={selectedPerson.balance < total}
                        className={`flex-1 py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed ${
                          paymentMethod === "balance"
                            ? "bg-blue-600 text-white"
                            : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <DollarSignIcon className="w-3 sm:w-4 h-3 sm:h-4 inline mr-1 sm:mr-2" />
                        Balance
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                    <span>Subtotal:</span>
                    <span className="font-semibold">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700 text-sm sm:text-base">
                    <span>Tax (0%):</span>
                    <span className="font-semibold">${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xl sm:text-2xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Cash Input */}
                {showCashInput && paymentMethod === "cash" && (
                  <div className="mb-4 p-3 sm:p-4 bg-white rounded-lg border border-gray-300">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Cash Received
                    </label>
                    <div className="relative mb-3">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold text-base sm:text-lg">
                        $
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={cashReceived}
                        onChange={(e) => setCashReceived(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-7 sm:pl-8 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-lg font-semibold"
                        autoFocus
                      />
                    </div>
                    {cashReceived && parseFloat(cashReceived) >= total && (
                      <div className="p-2 sm:p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-green-700">
                            ${change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    )}
                    {cashReceived && parseFloat(cashReceived) < total && (
                      <p className="text-xs sm:text-sm text-red-600">
                        Amount must be at least ${total.toFixed(2)}
                      </p>
                    )}
                  </div>
                )}

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || loading}
                  className="w-full py-3 sm:py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-base sm:text-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading
                    ? "Processing..."
                    : showCashInput && paymentMethod === "cash"
                    ? "Complete Sale"
                    : "Continue to Payment"}
                </button>

                {showCashInput && (
                  <button
                    onClick={() => {
                      setShowCashInput(false);
                      setCashReceived("");
                    }}
                    className="w-full mt-2 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
