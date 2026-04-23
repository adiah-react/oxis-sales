import {
  BarChart3Icon,
  CalendarIcon,
  LayersIcon,
  PackageIcon,
  PrinterIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useMemo, useState } from "react";

const SalesAnalytics = ({ sales, products }) => {
  const [timeRange, setTimeRange] = useState("daily");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("item");
  const [expandedCategory, setExpandedCategory] = useState(null);

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

  const productCategoryMap = useMemo(() => {
    const map = new Map();
    products.forEach((p) => map.set(p.id, p.category));
    return map;
  }, [products]);

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

  const categorySalesData = useMemo(() => {
    const categoryMap = new Map();
    itemSalesData.forEach((item) => {
      const category =
        productCategoryMap.get(item.productId) || "Uncategorized";
      const existing = categoryMap.get(category);
      if (existing) {
        existing.quantity += item.quantity;
        existing.revenue += item.revenue;
        existing.itemCount += 1;
        existing.items.push(item);
      } else {
        categoryMap.set(category, {
          category,
          quantity: item.quantity,
          revenue: item.revenue,
          itemCount: 1,
          items: [item],
        });
      }
    });
    return Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );
  }, [itemSalesData, productCategoryMap]);

  const totalRevenue = itemSalesData.reduce(
    (sum, item) => sum + item.revenue,
    0,
  );

  const totalQuantity = itemSalesData.reduce(
    (sum, item) => sum + item.quantity,
    0,
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

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const dateLabel = formatDateRange();
    const rangeLabel = timeRange.charAt(0).toUpperCase() + timeRange.slice(1);
    const itemRows = itemSalesData
      .map((item, i) => {
        const category =
          productCategoryMap.get(item.productId) || "Uncategorized";
        return `<tr>
        <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;font-weight:600;">${i + 1}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-weight:500;">${item.productName}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${category}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;">${item.quantity}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;">$${item.revenue.toFixed(2)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;color:#6b7280;">$${(item.revenue / item.quantity).toFixed(2)}</td>
      </tr>
      `;
      })
      .join("");
    const categoryRows = categorySalesData
      .map((cat) => {
        const pct =
          totalRevenue > 0
            ? ((cat.revenue / totalRevenue) * 100).toFixed(1)
            : "0";
        const subRows = cat.items
          .sort((a, b) => b.revenue - a.revenue)
          .map(
            (item) => `<tr style="background:#f9fafb;">
              <td style="padding:6px 16px 6px 40px;border-bottom:1px solid #f3f4f6;color:#6b7280;font-size:13px;">↳</td>
              <td style="padding:6px 16px;border-bottom:1px solid #f3f4f6;font-size:13px;">${item.productName}</td>
              <td style="padding:6px 16px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;">${item.quantity}</td>
              <td style="padding:6px 16px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;font-weight:500;">$${item.revenue.toFixed(2)}</td>
              <td style="padding:6px 16px;border-bottom:1px solid #f3f4f6;text-align:right;font-size:13px;color:#6b7280;"></td>
            </tr>`,
          )
          .join("");
        return `<tr style="background:#fff;">
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;font-weight:700;">${cat.category}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;color:#6b7280;">${cat.itemCount} product${cat.itemCount !== 1 ? "s" : ""}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;">${cat.quantity}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:700;">$${cat.revenue.toFixed(2)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid #e5e7eb;text-align:right;color:#6b7280;">${pct}%</td>
        </tr>${subRows}`;
      })
      .join("");
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Sales Report — ${dateLabel}</title>
  <style>
    {* { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #111827; padding: 40px; max-width: 900px; margin: 0 auto; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none !important; }
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
    }
    h1 { font-size: 28px; font-weight: 700; margin-bottom: 4px; }
    .subtitle { color: #6b7280; font-size: 15px; margin-bottom: 32px; }
    .summary { display: flex; gap: 24px; margin-bottom: 36px; }
    .summary-card { flex: 1; padding: 20px; border: 1px solid #e5e7eb; border-radius: 10px; }
    .summary-card .label { font-size: 13px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
    .summary-card .value { font-size: 28px; font-weight: 700; }
    .section-title { font-size: 18px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #111827; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 36px; font-size: 14px; }
    th { padding: 10px 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #d1d5db; font-weight: 600; }
    th.right { text-align: right; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 12px; display: flex; justify-content: space-between; }
    .print-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 24px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; margin-bottom: 32px; }
    .print-btn:hover { background: #1d4ed8; }}</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">🖨️ Print Report</button>

  <h1>Sales Report</h1>
  <p class="subtitle">${rangeLabel} Report — ${dateLabel}</p>

  <div class="summary">
    <div class="summary-card">
      <div class="label">Total Revenue</div>
      <div class="value">$${totalRevenue.toFixed(2)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Items Sold</div>
      <div class="value">${totalQuantity}</div>
    </div>
    <div class="summary-card">
      <div class="label">Products</div>
      <div class="value">${itemSalesData.length}</div>
    </div>
  </div>

  <div class="section-title">Sales by Item</div>
  <table>
    <thead>
      <tr>
        <th style="width:50px;">#</th>
        <th>Product</th>
        <th>Category</th>
        <th class="right">Qty</th>
        <th class="right">Revenue</th>
        <th class="right">Avg Price</th>
      </tr>
    </thead>
    <tbody>${itemRows}</tbody>
  </table>

  <div class="section-title">Sales by Category</div>
  <table>
    <thead>
      <tr>
        <th>Category</th>
        <th>Products</th>
        <th class="right">Qty</th>
        <th class="right">Revenue</th>
        <th class="right">% of Total</th>
      </tr>
    </thead>
    <tbody>${categoryRows}</tbody>
  </table>

  <div class="footer">
    <span>Generated on ${new Date().toLocaleString()}</span>
    <span>Cash Register System</span>
  </div>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const maxItemRevenue = Math.max(
    ...itemSalesData.map((item) => item.revenue),
    1,
  );

  const maxCategoryRevenue = Math.max(
    ...categorySalesData.map((c) => c.revenue),
    1,
  );

  const categoryColors = {
    Beverages: {
      bar: "from-sky-500 to-sky-600",
      bg: "bg-sky-100",
      text: "text-sky-800",
    },
    Food: {
      bar: "from-amber-500 to-amber-600",
      bg: "bg-amber-100",
      text: "text-amber-800",
    },
    Snacks: {
      bar: "from-rose-500 to-rose-600",
      bg: "bg-rose-100",
      text: "text-rose-800",
    },
  };

  const getCategoryColor = (category) => {
    return (
      categoryColors[category] || {
        bar: "from-gray-500 to-gray-600",
        bg: "bg-gray-100",
        text: "text-gray-800",
      }
    );
  };

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
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 font-medium transition-colors"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Report
            </button>
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
            {viewMode === "item"
              ? itemSalesData.length
              : categorySalesData.length}
          </p>
        </div>
      </div>

      {/* Sales Breakdown */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900">
            Sales by {viewMode === "item" ? "Item" : "Category"}
          </h3>

          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("item")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${viewMode === "item" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <PackageIcon className="w-4 h-4" />
              By Item
            </button>
            <button
              onClick={() => setViewMode("category")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm transition-all ${viewMode === "category" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
            >
              <LayersIcon className="w-4 h-4" />
              By Category
            </button>
          </div>
        </div>

        {itemSalesData.length === 0 ? (
          <div className="p-12 text-center">
            <PackageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              No sales data for this period
            </p>
          </div>
        ) : viewMode === "item" ? (
          <div className="p-6 space-y-4">
            {itemSalesData.map((item, index) => {
              const percentage = (item.revenue / maxItemRevenue) * 100;
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
        ) : (
          <div className="p-6 space-y-4">
            {categorySalesData.map((cat, index) => {
              const percentage = (cat.revenue / maxCategoryRevenue) * 100;
              const colors = getCategoryColor(cat.category);
              const isExpanded = expandedCategory === cat.category;
              const maxItemInCategory = Math.max(
                ...cat.items.map((i) => i.revenue),
                1,
              );
              return (
                <div
                  key={cat.category}
                  style={{
                    animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                  }}
                >
                  <button
                    onClick={() =>
                      setExpandedCategory(isExpanded ? null : cat.category)
                    }
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}
                        >
                          <LayersIcon className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {cat.category}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {cat.itemCount} product
                            {cat.itemCount !== 1 ? "s" : ""} • {cat.quantity}{" "}
                            units sold
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="text-lg font-bold text-gray-900">
                            ${cat.revenue.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {totalRevenue > 0
                              ? ((cat.revenue / totalRevenue) * 100).toFixed(1)
                              : 0}
                            % of total
                          </p>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-700 ease-out`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 ml-13 pl-4 border-l-2 border-gray-200 space-y-3">
                      {cat.items
                        .sort((a, b) => b.revenue - a.revenue)
                        .map((item) => {
                          const itemPercentage =
                            (item.revenue / maxItemInCategory) * 100;
                          return (
                            <div
                              key={item.productId}
                              className="py-2"
                              style={{
                                animation: "slideIn 0.2s ease-out both",
                              }}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <div>
                                  <span className="font-medium text-gray-800 text-sm">
                                    {item.productName}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    {item.quantity} units
                                  </span>
                                </div>
                                <span className="font-semibold text-gray-900 text-sm">
                                  ${item.revenue.toFixed(2)}
                                </span>
                              </div>
                              <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                  className={`absolute top-0 left-0 h-full bg-gradient-to-r ${colors.bar} rounded-full transition-all duration-500 ease-out opacity-60`}
                                  style={{
                                    width: `${itemPercentage}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
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
