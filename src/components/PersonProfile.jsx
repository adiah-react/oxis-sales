import {
  ArrowLeftIcon,
  CalendarIcon,
  DollarSignIcon,
  PackageIcon,
  ShoppingBagIcon,
  TrendingUpIcon,
  UserIcon,
} from "lucide-react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router";

const PersonProfile = ({ persons, sales }) => {
  const navigate = useNavigate();
  const { personId } = useParams();
  const person = useMemo(() => {
    return persons.find((p) => p.id === personId);
  }, [persons, personId]);

  const personSales = useMemo(() => {
    return sales
      .filter((sale) => sale.personId === personId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sales, personId]);

  const stats = useMemo(() => {
    const totalSpent = personSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalItems = personSales.reduce(
      (sum, sale) =>
        sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    );

    const averageOrderValue =
      personSales.length > 0 ? totalSpent / personSales.length : 0;

    // Most purchased items
    const itemMap = new Map();
    personSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const existing = itemMap.get(item.name);
        if (existing) {
          existing.quantity += item.quantity;
          existing.spent += item.price * item.quantity;
        } else {
          itemMap.set(item.name, {
            name: item.name,
            quantity: item.quantity,
            spent: item.price * item.quantity,
          });
        }
      });
    });
    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    return {
      totalSpent,
      totalItems,
      averageOrderValue,
      totalOrders: personSales.length,
      topItems,
    };
  }, [personSales]);

  if (!person) {
    return (
      <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Person Not Found
          </h2>
          <button
            onClick={() => navigate("/admin")}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Return to Admin Panel
          </button>
        </div>
      </div>
    );
  }

  const getTypeColor = (type) => {
    switch (type) {
      case "student":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "staff":
        return "bg-green-100 text-green-800 border-green-200";
      case "other":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span className="font-medium">Back to Admin</span>
          </button>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <UserIcon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {person.name}
                </h1>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{person.email}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(
                      person.type
                    )}`}
                  >
                    {person.type.charAt(0).toUpperCase() + person.type.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Current Balance</p>
              <p className="text-3xl font-bold text-gray-900">
                ${person.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <DollarSignIcon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm-font-medium text-gray-600">
                Total Spent
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.totalSpent.toFixed(2)}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBagIcon className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Total Orders
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <PackageIcon className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Items Purchased
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalItems}
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <TrendingUpIcon className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">
                Avg Order Value
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              ${stats.averageOrderValue.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Purchase History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Purchase History
                </h2>
              </div>

              {personSales.length === 0 ? (
                <div className="p-12 text-center">
                  <ShoppingBagIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No purchases yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {personSales.map((sale, index) => (
                    <div
                      key={sale.id}
                      className="p-6 hover:bg-gray-50 transition-colors"
                      style={{
                        animation: `fadeIn 0.3s ease-out ${index * 0.05}s both`,
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {new Date(sale.date).toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p className="text-sm text-gray-600">
                              {new Date(sale.date).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            ${sale.total.toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              sale.paymentMethod === "balance"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {sale.paymentMethod === "balance"
                              ? "Balance"
                              : "Cash"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {sale.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-gray-600">
                                {item.quantity}x
                              </span>
                              <span className="text-gray-900 font-medium">
                                {item.name}
                              </span>
                            </div>
                            <span className="text-gray-700">
                              ${(item.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Top Items */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  Favorite Items
                </h2>
              </div>

              {stats.topItems.length === 0 ? (
                <div className="p-8 text-center">
                  <PackageIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No items purchased</p>
                </div>
              ) : (
                <div className="p-6 space-y-4">
                  {stats.topItems.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center gap-3"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.1}s both`,
                      }}
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} purchased • ${item.spent.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
					}
				}

				@keyframes slideIn {
					from {
						opacity: 0;
						transform: translateX(-10px);
					}
					to {
						opacity: 1;
						transform: translateX(0);
					}
				}
			`}
      </style>
    </div>
  );
};

export default PersonProfile;
