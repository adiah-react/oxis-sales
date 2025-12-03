import {
  BarChart3Icon,
  CalendarIcon,
  PackageIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

const SalesAnalytics = ({ sales, products }) => {
  const [timeRange, setTimeRange] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());

  const getDateRange = (date, range) => {
    const start = new Date(date);
    const end = new Date(date);
    if (range === "daily") {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (range === "weekly") {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (range === "monthly") {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }
    return {
      start,
      end,
    };
  };

  const itemSalesData = useMemo(() => {
    const { start, end } = getDateRange(selectedDate, timeRange);
    const filteredSales = sales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= start && saleDate <= end;
    });
    const itemMap = new Map();
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = itemMap.get(item.id);
        if (existing) {
          existing.quantity += item.quantity;
          existing.revenue += item.price * item.quantity;
        } else {
          itemMap.set(item.id, {
            productId: item.id,
            productName: item.name,
            quantity: item.quantity,
            revenue: item.price * item.quantity,
          });
        }
      });
    });
    return Array.from(itemMap.values()).sort((a, b) => b.revenue - a.revenue);
  }, [sales, selectedDate, timeRange]);

  const totalRevenue = itemSalesData.reduce(
    (sum, item) => sum + item.revenue,
    0
  );

  const totalQuantity = itemSalesData.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const formatDateRange = () => {
    const { start, end } = getDateRange(selectedDate, timeRange);
    if (timeRange === "daily") {
      return start.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (timeRange === "weekly") {
      return `${start.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    } else {
      return start.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  };

  const navigateDate = (direction) => {
    const newDate = new Date(selectedDate);
    if (timeRange === "daily") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (timeRange === "weekly") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (timeRange === "monthly") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const maxRevenue = Math.max(...itemSalesData.map((item) => item.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BarChart3Icon className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">
              Sales Analytics
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setTimeRange("daily")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === "daily"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeRange("weekly")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === "weekly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Weekly
            </button>

            <button
              onClick={() => setTimeRange("monthly")}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === "monthly"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigateDate("prev")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2 text-gray-900">
            <CalendarIcon className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-lg">{formatDateRange()}</span>
          </div>

          <button
            onClick={() => navigateDate("next")}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
          >
            Next →
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-700 font-medium">Total Revenue</span>
            <TrendingUpIcon className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-900">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-green-700 font-medium">Items Sold</span>
            <PackageIcon className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-900">{totalQuantity}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-purple-700 font-medium">Products Sold</span>
            <BarChart3Icon className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-900">
            {itemSalesData.length}
          </p>
        </div>
      </div>

      {/* Sales by Item */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">Sales by Item</h3>
        </div>

        {itemSalesData.length === 0 ? (
          <div className="p-12 text-center">
            <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No sales data for this period
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {itemSalesData.map((item, index) => {
              const percentage = (item.revenue / maxRevenue) * 100;
              return (
                <div
                  key={item.productId}
                  className="group"
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {item.productName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {item.quantity} units sold
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ${item.revenue.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        ${(item.revenue / item.quantity).toFixed(2)} avg
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        animationDelay: `${index * 0.05}s`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>
        {`
				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateY(10px);
					}
					to {
						opacity: 1;
						transform: translateY(0);
					}
				}
			`}
      </style>
    </div>
  );
};

export default SalesAnalytics;
