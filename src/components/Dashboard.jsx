import {
  AlertTriangleIcon,
  DollarSignIcon,
  PackageIcon,
  PlusIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useState } from "react";
import SalesAnalytics from "./SalesAnalytics";

const Dashboard = ({
  products,
  salesHistory,
  onRestock,
  onBackToRegister,
  loading = false,
  error = null,
}) => {
  const [restockAmount, setRestockAmount] = useState({});
  const [activeView, setActiveView] = useState("overview");
  const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = salesHistory.reduce(
    (sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );

  const averageOrderValue =
    salesHistory.length > 0 ? totalRevenue / salesHistory.length : 0;
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.lowStockThreshold
  );

  const outOfStockProducts = products.filter((p) => p.stock === 0);
  const handleRestock = (productId) => {
    const amount = restockAmount[productId] || 0;
    if (amount > 0) {
      onRestock(productId, amount);
      setRestockAmount({
        ...restockAmount,
        [productId]: 0,
      });
    }
  };

  const topSellingProducts = products
    .map((product) => {
      const soldQuantity = salesHistory.reduce((sum, sale) => {
        const item = sale.items.find((i) => i.id === product.id);
        return sum + (item?.quantity || 0);
      }, 0);
      return {
        ...product,
        soldQuantity,
      };
    })
    .sort((a, b) => b.soldQuantity - a.soldQuantity)
    .slice(0, 5);
  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            onClick={onBackToRegister}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <div className="w-5 h-5" />
            Back to Register
          </button>
        </div>

        {/* View Tabs */}
        <div className="flex gap-4">
          <button
            onClick={() => setActiveView("overview")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === "overview"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveView("analytics")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeView === "analytics"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Sales Analytics
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 p-4">
          <div className="flex items-center text-red-800">
            <AlertTriangleIcon className="w-5 h-5 mr-2" />
            <span className="font-semibold">{error}</span>
          </div>
        </div>
      )}

      <div className="p-6">
        {activeView === "analytics" ? (
          <SalesAnalytics sales={salesHistory} product={products} />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">
                    Total Revenue
                  </span>
                  <DollarSignIcon className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${totalRevenue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {salesHistory.length} transactions
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">Items Sold</span>
                  <ShoppingBagIcon className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  {totalItemsSold}
                </p>
                <p className="text-sm text-gray-500 mt-1">Total units</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 font-medium">
                    Avg Order Value
                  </span>
                  <TrendingUpIcon className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-3xl font-bold text-gray-900">
                  ${averageOrderValue.toFixed(2)}
                </p>
                <p className="text-sm text-gray-500 mt-1">Per transaction</p>
              </div>
            </div>
            {/* Alerts Section */}
            {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangleIcon className="w-6 h-6 tet-amber-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Inventory Alerts
                  </h2>
                </div>
                {outOfStockProducts.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-red-600 mb-2">
                      Out of Stock ({outOfStockProducts.length})
                    </h3>
                    <div className="space-y-2">
                      {outOfStockProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between bg-red-50 p-3 rounded-lg"
                        >
                          <div>
                            <span className="font-medium text-gray-900">
                              {product.name}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              ({product.category})
                            </span>
                          </div>
                          <span className="text-red-600 font-semibold">
                            0 in stock
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {lowStockProducts.filter((p) => p.stock > 0).length > 0 && (
                  <div>
                    <h3 className="font-semibold text-amber-600 mb-2">
                      Low Stock (
                      {lowStockProducts.filter((p) => p.stock > 0).length})
                    </h3>
                    <div className="space-y-2">
                      {lowStockProducts
                        .filter((p) => p.stock > 0)
                        .map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between bg-amber-50 p-3 rounded-lg"
                          >
                            <div>
                              <span className="font-medium text-gray-900">
                                {product.name}
                              </span>
                              <span className="text-sm text-gray-600 ml-2">
                                ({product.category})
                              </span>
                            </div>
                            <span className="text-amber-600 font-semibold">
                              {product.stock} left
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Inventory Management */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <PackageIcon className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Inventory Management
                  </h2>
                </div>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {products.map((product) => {
                    const isLowStock =
                      product.stock <= product.lowStockThreshold;
                    const isOutOfStock = product.stock === 0;
                    return (
                      <div
                        key={product.id}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {product.category} • ${product.price.toFixed(2)}
                            </p>
                          </div>
                          <div
                            className={`text-right ${
                              isOutOfStock
                                ? "text-red-600"
                                : isLowStock
                                ? "text-amber-600"
                                : "text-green-600"
                            }`}
                          >
                            <p className="font-bold text-lg">{product.stock}</p>
                            <p className="text-xs">in stock</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={restockAmount[product.id] || ""}
                            onChange={(e) =>
                              setRestockAmount({
                                ...restockAmount,
                                [product.id]: parseInt(e.target.value) || 0,
                              })
                            }
                            placeholder="Qty"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            onClick={() => handleRestock(product.id)}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                          >
                            <PlusIcon className="w-4 h-4" />
                            Restock
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Top Selling Products */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUpIcon className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    Top Selling Products
                  </h2>
                </div>
                <div className="space-y-3">
                  {topSellingProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          {product.soldQuantity}
                        </p>
                        <p className="text-xs text-gray-600">sold</p>
                      </div>
                    </div>
                  ))}
                  {topSellingProducts.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      No sales data yet
                    </p>
                  )}
                </div>
              </div>
            </div>
            {/* Recent Sales */}
            {salesHistory.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Recent Sales
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Items
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesHistory.slice(0, 10).map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(sale.date).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {sale.items
                              .map((item) => `${item.name} (${item.quantity})`)
                              .join(", ")}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            ${sale.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
