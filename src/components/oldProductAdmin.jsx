{
  /* Create Button */
}
<div className="mb-6">
  <button
    onClick={() => {
      setShowCreateForm(true);
      setEditingProduct(null);
    }}
    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
  >
    <PlusIcon className="w-5 h-5" />
    Add New Product
  </button>
</div>;
{
  /* Create/Edit Form */
}
{
  (showCreateForm || editingProduct) && (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {editingProduct ? "Edit Product" : "Create New Product"}
        </h2>
        <button
          onClick={cancelEdit}
          className="text-gray-600 hover:text-gray-800"
        >
          <XIcon className="w-6 h-6" />"
        </button>
      </div>
      <form
        onSubmit={editingProduct ? handleUpdate : handleCreate}
        className="grid grid-cols-2 gap-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Product Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor=""
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Price ($)
          </label>
          <input
            type="number"
            step={0.01}
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: e.target.value })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor=""
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor=""
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Stock Quantity
          </label>
          <input
            type="number"
            value={formData.stock}
            onChange={(e) =>
              setFormData({ ...formData, stock: e.target.value })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label
            htmlFor=""
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Low Stock Threshold
          </label>
          <input
            type="number"
            value={formData.lowStockThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                lowStockThreshold: e.target.value,
              })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
          >
            <SaveIcon className="w-5 h-5" />
            {editingProduct ? "Update Product" : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
{
  /* Products Table */
}
<div className="bg-white rounded-lg shadow overflow-hidden">
  <table className="w-full">
    <thead className="bg-gray-50 border-b border-gray-200">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Product
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Category
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Price
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Stock
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Low Stock Alert
        </th>

        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
    <tbody className="bg-white divide-y divide-gray-200">
      {products.map((product) => (
        <tr className="hover:bg-gray-50" key={product.id}>
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center">
              <PackageIcon className="w-5 h-5 text-gray-400 mr-3" />
              <span className="font-medium text-gray-900">{product.name}</span>
            </div>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            {product.category}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
            ${product.price.toFixed(2)}
          </td>
          <td className="px-6 py-4 whitespace-nowrap">
            <span
              className={`text-sm font-medium ${
                product.stock <= product.lowStockThreshold
                  ? "text-red-600"
                  : "text-gray-900"
              }`}
            >
              {product.stock}
            </span>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
            {product.lowStockThreshold}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <button
              className="text-blue-600 hover:text-blue-800 mr-4"
              onClick={() => startEdit(product)}
            >
              <EditIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleDelete(product.id)}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>;
