import {
  AlertTriangleIcon,
  DollarSignIcon,
  EditIcon,
  MinusIcon,
  PackageIcon,
  PlusIcon,
  SaveIcon,
  ShoppingBagIcon,
  TrashIcon,
  TrendingUpIcon,
  XIcon,
} from "lucide-react";
import { Fragment, useState } from "react";
import { Link } from "react-router";
import apiService from "../services/api";
import SalesAnalytics from "./SalesAnalytics";

const Dashboard = ({
  products,
  persons,
  salesHistory,
  onRestock,
  onBackToRegister,
  // loading = false,
  // error = null,
}) => {
  const [restockAmount, setRestockAmount] = useState({});
  const [activeView, setActiveView] = useState("overview");
  const [editingSale, setEditingSale] = useState(null);
  const [editFormData, setEditFormData] = useState({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.total, 0);
  const totalItemsSold = salesHistory.reduce(
    (sum, sale) =>
      sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0,
  );

  const averageOrderValue =
    salesHistory.length > 0 ? totalRevenue / salesHistory.length : 0;
  const lowStockProducts = products.filter(
    (p) => p.stock <= p.lowStockThreshold,
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

  const handleDeleteSale = async (saleId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this sale? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await apiService.deleteSale(saleId);
      // Reload sales history
      window.location.reload();
    } catch (err) {
      setError("Failed to delete sale");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startEditSale = (sale) => {
    setEditingSale(sale);
    setEditFormData({
      items: [...sale.items],
      subtotal: sale.subtotal,
      tax: sale.tax,
      total: sale.total,
    });
  };

  const cancelEditSale = () => {
    setEditingSale(null);
    setEditFormData({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
    });
  };

  const updateSaleItem = (itemId, quantity) => {
    const updatedItems = editFormData.items.map((item) =>
      item.id === itemId
        ? {
            ...item,
            quantity: Math.max(1, quantity),
          }
        : item,
    );
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0;
    const total = subtotal + tax;
    setEditFormData({
      items: updatedItems,
      subtotal,
      tax,
      total,
    });
  };

  const removeSaleItem = (itemId) => {
    const updatedItems = editFormData.items.filter(
      (item) => item.id !== itemId,
    );
    if (updatedItems.length === 0) {
      alert("Cannot remove all items. Delete the sale instead.");
      return;
    }
    const subtotal = updatedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const tax = subtotal * 0;
    const total = subtotal + tax;
    setEditFormData({
      items: updatedItems,
      subtotal,
      tax,
      total,
    });
  };

  const handleUpdateSale = async () => {
    if (!editingSale) return;
    try {
      setLoading(true);
      await apiService.updateSale(editingSale.id, editFormData);
      cancelEditSale();
      // Reload sales history
      window.location.reload();
    } catch (err) {
      setError("Failed to update sale");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
          <SalesAnalytics sales={salesHistory} products={products} />
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
                          Customer
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Items
                        </th>

                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                          Payment
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Total
                        </th>
                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {salesHistory.slice(0, 10).map((sale) => {
                        const person = sale.personId
                          ? products.length > 0
                            ? persons.find((p) => p.id === sale.personId)
                            : null
                          : null;

                        return (
                          <Fragment key={sale.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {new Date(sale.date).toLocaleString()}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {sale.personId ? (
                                  <span className="text-blue-600 font-medium">
                                    <Link to={`/admin/person/${person.id}`}>
                                      {person.name}
                                    </Link>
                                  </span>
                                ) : (
                                  <span className="text-gray-500">Guest</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {sale.items
                                  .map(
                                    (item) =>
                                      `${item.name} (x${item.quantity})`,
                                  )
                                  .join(", ")}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    sale.paymentMethod === "balance"
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {sale.paymentMethod === "balance"
                                    ? "Balance"
                                    : "Cash"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                ${sale.total.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 text-sm text-right">
                                <button
                                  // onClick={() => startEditSale(sale)}
                                  className="text-blue-600 hover:text-blue-800 mr-3"
                                  title="Edit Sale"
                                >
                                  <EditIcon className="w-4 h-4 inline" />
                                </button>
                                <button
                                  onClick={() => handleDeleteSale(sale.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Delete Sale"
                                >
                                  <TrashIcon className="w-4 h-4 inline" />
                                </button>
                              </td>
                            </tr>
                            {editingSale?.id === sale.id && (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="px-4 py-4 bg-gray-50"
                                >
                                  <div className="bg-white rounded-lg border border-gray-300 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                      <h3 className="text-lg font-bold text-gray-900">
                                        Edit Sale
                                      </h3>
                                      <button className="text-gray-600 hover:text-gray-800">
                                        <XIcon className="w-5 h-5" />
                                      </button>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                      {editFormData.items.map((item) => (
                                        <div
                                          key={item.id}
                                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                          <div className="flex-1">
                                            <p className="font-medium text-gray-900">
                                              {item.name}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                              ${item.price.toFixed(2)} each
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2">
                                              <button
                                                onClick={() =>
                                                  updateSaleItem(
                                                    item.id,
                                                    item.quantity - 1,
                                                  )
                                                }
                                                className="w-7 h-7 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                              >
                                                <MinusIcon className="w-4 h-4" />
                                              </button>
                                              <span className="w-10 text-center font-semibold">
                                                {item.quantity}
                                              </span>
                                              <button
                                                onClick={() =>
                                                  updateSaleItem(
                                                    item.id,
                                                    item.quantity + 1,
                                                  )
                                                }
                                                className="w-7 h-7 bg-white rounded border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                                              >
                                                <PlusIcon className="w-4 h-4" />
                                              </button>
                                            </div>
                                            <span className="font-bold text-gray-900 w-20 text-right">
                                              $
                                              {(
                                                item.price * item.quantity
                                              ).toFixed(2)}
                                            </span>
                                            <button
                                              onClick={() =>
                                                removeSaleItem(item.id)
                                              }
                                              className="text-red-600 hover:text-red-800"
                                            >
                                              <TrashIcon className="w-4 h-4" />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>

                                    <div className="border-t border-gray-200 pt-3 mb-4">
                                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">
                                          ${editFormData.subtotal.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-sm text-gray-700 mb-1">
                                        <span>Tax (0%):</span>
                                        <span className="font-semibold">
                                          ${editFormData.tax.toFixed(2)}
                                        </span>
                                      </div>
                                      <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                                        <span>Total:</span>
                                        <span>
                                          ${editFormData.total.toFixed(2)}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleUpdateSale}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
                                      >
                                        <SaveIcon className="w-4 h-4" />
                                        Save Changes
                                      </button>
                                      <button
                                        onClick={cancelEditSale}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
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
