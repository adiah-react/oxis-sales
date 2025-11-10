import {
  AlertTriangleIcon,
  LayoutDashboardIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  RefreshCwIcon,
  ShieldIcon,
  ShoppingCartIcon,
  TrashIcon,
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
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showReceipt, setShowReceipt] = useState(false);
  const [salesHistory, setSalesHistory] = useState([]);
  const [view, setView] = useState("register");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [useApi, setUseApi] = useState(true);

  // Fetch products from API on mount
  useEffect(() => {
    loadProducts();
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

  const categories = [
    "All",
    ...Array.from(new Set(products.map((p) => p.category))),
  ];

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
  const handleCheckout = async () => {
    try {
      setLoading(true);
      setError(null);
      // Create sale data
      const saleData = {
        items: cart,
        subtotal,
        tax,
        total,
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
      <div className="flex flex-col lg:flex-row h-screen">
        {/* Products Section */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
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
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium disabled:opacity-50"
                >
                  <RefreshCwIcon
                    className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                  />
                  Refresh
                </button>
                <button
                  onClick={() => setView("dashboard")}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  <LayoutDashboardIcon className="w-5 h-5" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate("/admin")}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
                >
                  <ShieldIcon className="w-5 h-5" />
                  Admin
                </button>
              </div>
            </div>
            {/* Category Filter */}
            <div className="flex gap-2 flex-wrap">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => {
                const isLowStock = product.stock <= product.lowStockThreshold;
                const isOutOfStock = product.stock === 0;
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow text-left relative ${
                      isOutOfStock ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isLowStock && !isOutOfStock && (
                      <div className="absolute top-2 right-2">
                        <AlertTriangleIcon className="w-5 h-5 text-amber-500" />
                      </div>
                    )}
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg mb-3 flex items-center justify-center">
                      <img src={product.image} alt="" />
                      {/* <ShoppingCartIcon className="w-12 h-12 text-blue-600" /> */}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {product.category}
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      ${product.price.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <PackageIcon className="w-4 h-4 text-gray-500" />
                      <span
                        className={`text-sm font-medium ${
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
        <div className="lg:w-96 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Current Order</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <ShoppingCartIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No items in cart</p>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {item.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-8 h-8 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="font-bold text-lg">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Checkout Section */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Tax (0%):</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t-2 border-gray-300">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || loading}
              className="w-full py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Processing..." : "Complete Sale"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
