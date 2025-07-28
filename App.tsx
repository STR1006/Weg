import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Trash2,
  ArrowLeft,
  Check,
  Minus,
  ShoppingCart,
  RefreshCw,
  Share2,
  Download,
  Upload,
  Edit,
  X,
  Copy,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Filter,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  quantity: number;
  isCompleted: boolean;
  isOutOfStock: boolean;
  imageUrl?: string;
  comment?: string;
  category?: string;
  completedAt?: Date;
}

interface RestockList {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  products: Product[];
}

export default function GuluInventoryApp() {
  const [lists, setLists] = useState<RestockList[]>(() => {
    const saved = localStorage.getItem("gulu-lists");
    return saved
      ? JSON.parse(saved).map((l: any) => ({
          ...l,
          createdAt: new Date(l.createdAt),
          products: l.products.map((p: any) => ({
            ...p,
            completedAt: p.completedAt
              ? new Date(p.completedAt)
              : undefined,
          })),
        }))
      : [
          {
            id: "1",
            name: "Sparkling Water",
            description: "Imported from Shopify on 10/26/23",
            createdAt: new Date("2025-07-24"),
            products: [
              {
                id: "1",
                name: "Blackberry Tange...",
                quantity: 0,
                isCompleted: false,
                isOutOfStock: false,
                category: "Beverages",
                imageUrl:
                  "https://images.unsplash.com/photo-1581635439309-ab4edce0c040?w=300&h=300&fit=crop",
              },
              {
                id: "2",
                name: "Blueberry Nectar...",
                quantity: 0,
                isCompleted: false,
                isOutOfStock: false,
                category: "Beverages",
                imageUrl:
                  "https://images.unsplash.com/photo-1560458675-fc20e3b8a1e2?w=300&h=300&fit=crop",
              },
              {
                id: "3",
                name: "Cherry Lime",
                quantity: 0,
                isCompleted: false,
                isOutOfStock: false,
                category: "Beverages",
                imageUrl:
                  "https://images.unsplash.com/photo-1560458675-fc20e3b8a1e2?w=300&h=300&fit=crop",
              },
              {
                id: "4",
                name: "Pomegranate",
                quantity: 0,
                isCompleted: false,
                isOutOfStock: false,
                category: "Beverages",
                imageUrl:
                  "https://images.unsplash.com/photo-1560458675-fc20e3b8a1e2?w=300&h=300&fit=crop",
              },
            ],
          },
          {
            id: "2",
            name: "Organic Snacks",
            description: "Manual Entry",
            createdAt: new Date("2025-07-23"),
            products: Array.from({ length: 15 }, (_, i) => ({
              id: `2-${i}`,
              name: `Product ${i + 1}`,
              quantity: 0,
              isCompleted: i < 8,
              isOutOfStock: false,
              category: i < 5 ? "Snacks" : i < 10 ? "Organic" : "Health Food",
            })),
          },
          {
            id: "3",
            name: "Cleaning Supplies",
            description: "Imported from Code",
            createdAt: new Date("2025-07-22"),
            products: Array.from({ length: 31 }, (_, i) => ({
              id: `3-${i}`,
              name: `Product ${i + 1}`,
              quantity: 0,
              isCompleted: i < 31,
              isOutOfStock: false,
              category: i < 10 ? "Cleaning" : i < 20 ? "Household" : "Maintenance",
            })),
          },
          {
            id: "4",
            name: "Dairy Products",
            description: "Manual Entry",
            createdAt: new Date("2025-07-21"),
            products: Array.from({ length: 8 }, (_, i) => ({
              id: `4-${i}`,
              name: `Product ${i + 1}`,
              quantity: 0,
              isCompleted: i < 2,
              isOutOfStock: false,
              category: i < 4 ? "Dairy" : "Refrigerated",
            })),
          },
        ];
  });

  const [selectedListId, setSelectedListId] = useState<
    string | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchProductName, setSearchProductName] =
    useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<
    "name" | "date" | "quantity"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    "desc",
  );
  const [productSortBy, setProductSortBy] = useState<
    "name" | "quantity" | "completion" | "stock" | "category"
  >("name");
  const [productSortOrder, setProductSortOrder] = useState<
    "asc" | "desc"
  >("asc");
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCsvImportModal, setShowCsvImportModal] =
    useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] =
    useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);
  const [shareCode, setShareCode] = useState("");
  const [importCode, setImportCode] = useState("");
  const [csvContent, setCsvContent] = useState("");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");
  const [copied, setCopied] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDescription, setNewListDescription] =
    useState("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductImage, setNewProductImage] = useState("");
  const [newProductComment, setNewProductComment] =
    useState("");
  const [newProductCategory, setNewProductCategory] = useState("");
  const [editForm, setEditForm] = useState({
    name: "",
    imageUrl: "",
    comment: "",
    category: "",
  });

  // PWA states
  const [isOffline, setIsOffline] = useState(false);
  const [showOfflineNotice, setShowOfflineNotice] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);

  useEffect(() => {
    localStorage.setItem("gulu-lists", JSON.stringify(lists));
  }, [lists]);

  // PWA initialization
  useEffect(() => {
    // Simple offline detection
    const handleOnline = () => {
      setIsOffline(false);
      setShowOfflineNotice(false);
    };
    
    const handleOffline = () => {
      setIsOffline(true);
      setShowOfflineNotice(true);
      setTimeout(() => setShowOfflineNotice(false), 3000);
    };

    if (typeof window !== 'undefined') {
      // Check initial online status
      setIsOffline(!navigator.onLine);
      
      // Add connectivity listeners
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Listen for PWA install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        setShowInstallPrompt(true);
      };
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }
  }, []);

  const selectedList =
    lists.find((list) => list.id === selectedListId) || null;

  // Get all unique categories from current list
  const availableCategories = useMemo(() => {
    if (!selectedList) return [];
    const categories = selectedList.products
      .map(p => p.category)
      .filter((cat): cat is string => !!cat)
      .filter((cat, index, arr) => arr.indexOf(cat) === index)
      .sort();
    return categories;
  }, [selectedList]);

  const filteredLists = useMemo(() => {
    return lists
      .filter(
        (list) =>
          list.name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          list.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()),
      )
      .sort((a, b) => {
        // Calculate completion status for each list
        const aCompletedCount = a.products.filter(
          (p) => p.isCompleted,
        ).length;
        const aIsFullyCompleted =
          a.products.length > 0 &&
          aCompletedCount === a.products.length;
        const bCompletedCount = b.products.filter(
          (p) => p.isCompleted,
        ).length;
        const bIsFullyCompleted =
          b.products.length > 0 &&
          bCompletedCount === b.products.length;

        // Always sort fully completed lists to the bottom
        if (aIsFullyCompleted !== bIsFullyCompleted) {
          return aIsFullyCompleted ? 1 : -1;
        }

        // Apply regular sorting for lists with same completion status
        if (sortBy === "name") {
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortBy === "quantity") {
          return sortOrder === "asc"
            ? a.products.length - b.products.length
            : b.products.length - a.products.length;
        } else {
          // 'date'
          return sortOrder === "asc"
            ? a.createdAt.getTime() - b.createdAt.getTime()
            : b.createdAt.getTime() - a.createdAt.getTime();
        }
      });
  }, [lists, searchQuery, sortBy, sortOrder]);

  const generateShareCode = (list: RestockList) => {
    const shareData = {
      n: list.name,
      d: list.description,
      p: list.products.map((p) => ({
        n: p.name,
        q: p.quantity,
        c: p.comment || "",
        i: p.imageUrl || "",
        cat: p.category || "",
      })),
    };
    const encoded = btoa(JSON.stringify(shareData));
    return encoded;
  };

  const decodeShareCode = (
    code: string,
  ): RestockList | null => {
    try {
      const decoded = JSON.parse(atob(code));
      return {
        id: Date.now().toString(),
        name: decoded.n || "Imported List",
        description: decoded.d || "",
        createdAt: new Date(),
        products: (decoded.p || []).map(
          (p: any, index: number) => ({
            id: `${Date.now()}-${index}`,
            name: p.n || "Unnamed Product",
            quantity: p.q || 0,
            isCompleted: false,
            isOutOfStock: false,
            imageUrl: p.i || "",
            comment: p.c || "",
            category: p.cat || "",
          }),
        ),
      };
    } catch (error) {
      return null;
    }
  };

  const parseCSV = (content: string): RestockList | null => {
    try {
      const lines = content
        .trim()
        .split("\n")
        .filter((line) => line.trim());
      if (lines.length === 0) {
        throw new Error("CSV content is empty");
      }
      const listName =
        lines[0].split(",")[0].trim() || "Imported List";
      const products: Product[] = [];
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i]
          .split(",")
          .map((part) => part.trim());
        const productName =
          parts[0] || `Product ${products.length + 1}`;
        const category = parts[1] || "";
        const imageUrl = parts[2] || "";
        const comment = parts[3] || "";
        products.push({
          id: `${Date.now()}-${products.length}`,
          name: productName,
          quantity: 0,
          isCompleted: false,
          isOutOfStock: false,
          imageUrl: imageUrl || undefined,
          comment: comment || undefined,
          category: category || undefined,
        });
      }
      return {
        id: Date.now().toString(),
        name: listName,
        description: `Imported from CSV on ${new Date().toLocaleDateString()}`,
        createdAt: new Date(),
        products,
      };
    } catch (error) {
      setImportError(
        error instanceof Error
          ? error.message
          : "Invalid CSV format",
      );
      return null;
    }
  };

  const handleCsvFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      setImportError("Please select a CSV file");
      return;
    }
    
    setImportError(""); // Clear any previous errors
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setCsvContent(content);
      setCsvFile(file);
    };
    reader.onerror = () => {
      setImportError("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };

  const importCsv = () => {
    if (!csvFile) {
      setImportError("Please select a CSV file");
      return;
    }
    if (!csvContent.trim()) {
      setImportError("Unable to read file content. Please try again.");
      return;
    }
    const importedList = parseCSV(csvContent);
    if (importedList) {
      setLists([...lists, importedList]);
      setShowCsvImportModal(false);
      setCsvContent("");
      setCsvFile(null);
      setImportError("");
      setSelectedListId(importedList.id);
    }
  };

  const createNewList = () => {
    if (newListName.trim()) {
      const newList: RestockList = {
        id: Date.now().toString(),
        name: newListName,
        description: newListDescription,
        createdAt: new Date(),
        products: [],
      };
      setLists([...lists, newList]);
      setNewListName("");
      setNewListDescription("");
      setShowNewListForm(false);
    }
  };

  const shareList = (list: RestockList) => {
    const code = generateShareCode(list);
    setShareCode(code);
    setShowShareModal(true);
  };

  const importList = () => {
    if (!importCode.trim()) {
      setImportError("Please enter a share code");
      return;
    }
    const importedList = decodeShareCode(importCode.trim());
    if (importedList) {
      setLists([...lists, importedList]);
      setShowImportModal(false);
      setImportCode("");
      setImportError("");
      setSelectedListId(importedList.id);
    } else {
      setImportError(
        "Invalid share code. Please check the code and try again.",
      );
    }
  };

  const copyToClipboard = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const deleteList = (listId: string) =>
    setLists(lists.filter((list) => list.id !== listId));

  const updateProduct = (
    productId: string,
    updates: Partial<Product>,
  ) => {
    if (!selectedList) return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
  };

  const resetAllProducts = () => {
    if (!selectedList) return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) => ({
        ...p,
        quantity: 0,
        isCompleted: false,
        completedAt: undefined,
      })),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
  };

  const resetProductQuantity = (productId: string) => {
    if (!selectedList) return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) =>
        p.id === productId ? { ...p, quantity: 0 } : p,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
  };

  const updateProductQuantity = (
    productId: string,
    change: number,
  ) => {
    if (!selectedList) return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) =>
        p.id === productId
          ? { ...p, quantity: Math.max(0, p.quantity + change) }
          : p,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
  };

  const toggleProductCompletion = (productId: string) => {
    if (!selectedList) return;

    const product = selectedList.products.find(
      (p) => p.id === productId,
    );
    if (!product) return;

    const isNowCompleted = !product.isCompleted;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) =>
        p.id === productId
          ? {
              ...p,
              isCompleted: isNowCompleted,
              completedAt: isNowCompleted
                ? new Date()
                : undefined,
            }
          : p,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
  };

  const toggleOutOfStock = (productId: string) => {
    if (!selectedList) return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) =>
        p.id === productId
          ? { ...p, isOutOfStock: !p.isOutOfStock }
          : p,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
  };

  const addProduct = () => {
    if (!selectedList || !newProductName.trim()) return;
    const newProduct: Product = {
      id: Date.now().toString(),
      name: newProductName,
      quantity: 0,
      isCompleted: false,
      isOutOfStock: false,
      imageUrl: newProductImage || undefined,
      comment: newProductComment || undefined,
      category: newProductCategory || undefined,
    };
    const updatedList = {
      ...selectedList,
      products: [...selectedList.products, newProduct],
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
    setNewProductName("");
    setNewProductImage("");
    setNewProductComment("");
    setNewProductCategory("");
    setShowAddProductModal(false);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      imageUrl: product.imageUrl || "",
      comment: product.comment || "",
      category: product.category || "",
    });
    setShowEditModal(true);
  };

  const saveProductEdit = () => {
    if (
      !editingProduct ||
      !selectedList ||
      !editForm.name.trim()
    )
      return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: editForm.name,
              imageUrl: editForm.imageUrl || undefined,
              comment: editForm.comment || undefined,
              category: editForm.category || undefined,
            }
          : p,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
    setShowEditModal(false);
    setEditingProduct(null);
  };

  const deleteProductFromEdit = () => {
    if (!editingProduct || !selectedList) return;
    const updatedList = {
      ...selectedList,
      products: selectedList.products.filter(
        (p) => p.id !== editingProduct.id,
      ),
    };
    setLists(
      lists.map((list) =>
        list.id === selectedList.id ? updatedList : list,
      ),
    );
    setShowEditModal(false);
    setEditingProduct(null);
  };

  if (selectedList) {
    const filteredProducts = selectedList.products
      .filter((p) => {
        const matchesSearch = p.name
          .toLowerCase()
          .includes(searchProductName.toLowerCase());
        const matchesCategory = !categoryFilter || p.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        // First, always sort out-of-stock items to the bottom
        if (a.isOutOfStock !== b.isOutOfStock) {
          return a.isOutOfStock ? 1 : -1;
        }

        // Second, within in-stock items, always sort completed items to the bottom
        // (unless specifically sorting by completion status)
        if (
          productSortBy !== "completion" &&
          a.isCompleted !== b.isCompleted
        ) {
          return a.isCompleted ? 1 : -1;
        }

        // Handle different sort options for items with same stock and completion status
        let comparison = 0;

        switch (productSortBy) {
          case "name":
            comparison = a.name.localeCompare(b.name);
            break;
          case "quantity":
            comparison = a.quantity - b.quantity;
            break;
          case "completion":
            // For completion sort, allow user to control the order
            comparison =
              a.isCompleted === b.isCompleted
                ? 0
                : a.isCompleted
                  ? 1
                  : -1;
            break;
          case "stock":
            // Since we already handled stock status above, sort by name as secondary
            comparison = a.name.localeCompare(b.name);
            break;
          case "category":
            comparison = (a.category || "").localeCompare(b.category || "");
            break;
          default:
            comparison = a.name.localeCompare(b.name);
        }

        // Apply sort order
        if (productSortOrder === "desc") {
          comparison = -comparison;
        }

        // Secondary sort by name if primary sort values are equal (except for name sort)
        if (comparison === 0 && productSortBy !== "name") {
          comparison = a.name.localeCompare(b.name);
        }

        return comparison;
      });

    const completedCount = selectedList.products.filter(
      (p) => p.isCompleted,
    ).length;
    const totalCount = selectedList.products.length;

    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSelectedListId(null)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Lists</span>
            </button>
            <button
              onClick={resetAllProducts}
              className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All
            </button>
          </div>

          {/* Title Section */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 mb-1">
              {selectedList.name}
            </h1>
            <p className="text-gray-600 mb-2">
              {selectedList.description}
            </p>
            <div className="flex items-center justify-between">
              <p className="text-gray-500">
                {completedCount} of {totalCount} items completed
              </p>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6 py-2 flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Product
              </button>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchProductName}
                onChange={(e) =>
                  setSearchProductName(e.target.value)
                }
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {categoryFilter && (
                  <button
                    onClick={() => setCategoryFilter("")}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Clear filter"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Sort Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-600">Sort</span>
                  <select
                    value={productSortBy}
                    onChange={(e) =>
                      setProductSortBy(e.target.value as "name" | "quantity" | "completion" | "stock" | "category")
                    }
                    className="border-none shadow-none p-0 bg-transparent focus:outline-none"
                  >
                    <option value="name">Name</option>
                    <option value="category">Category</option>
                    <option value="quantity">Quantity</option>
                    <option value="completion">Completion</option>
                    <option value="stock">Stock Status</option>
                  </select>
                </div>
                <button
                  onClick={() =>
                    setProductSortOrder(
                      productSortOrder === "asc"
                        ? "desc"
                        : "asc",
                    )
                  }
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                  title={`Sort ${productSortOrder === "asc" ? "descending" : "ascending"}`}
                >
                  {productSortOrder === "asc" ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>
              <div className="text-sm text-gray-500">
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? "s" : ""}
                {categoryFilter && ` in ${categoryFilter}`}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className={`border border-gray-200 rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${
                  product.isOutOfStock
                    ? "bg-red-50"
                    : "bg-white"
                }`}
                onClick={() => openEditModal(product)}
              >
                {/* Product Header */}
                <div className="p-4 pb-2">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleOutOfStock(product.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                      title={
                        product.isOutOfStock
                          ? "Mark as in stock"
                          : "Mark as out of stock"
                      }
                    >
                      <ShoppingCart
                        className={`w-4 h-4 ${product.isOutOfStock ? "text-red-500" : "text-gray-400"}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        resetProductQuantity(product.id);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">
                    {product.name}
                  </h3>
                  {product.category && (
                    <p className="text-sm text-gray-500 mb-2">
                      {product.category}
                    </p>
                  )}
                </div>

                {/* Product Image */}
                <div className="mx-4 mb-4">
                  <div className="bg-white rounded-lg h-32 flex items-center justify-center overflow-hidden border border-gray-200">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    )}
                  </div>
                </div>

                {/* Quantity Controls */}
                <div className="px-4 pb-4">
                  <div className="flex items-center justify-center mb-3 gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProductQuantity(product.id, -1);
                      }}
                      className="flex-1 h-10 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors touch-manipulation"
                    >
                      <Minus className="w-5 h-5 text-gray-600" />
                    </button>
                    <span className="px-4 text-lg font-medium text-gray-900 min-w-[3rem] text-center">
                      {product.quantity}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateProductQuantity(product.id, 1);
                      }}
                      className="flex-1 h-10 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center transition-colors touch-manipulation"
                    >
                      <Plus className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleProductCompletion(product.id);
                    }}
                    className={`w-full rounded-lg py-2 transition-colors border ${
                      product.isCompleted
                        ? "bg-green-100 text-green-700 border-green-300 hover:bg-green-200"
                        : "bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {product.isCompleted ? "Done" : "Mark Done"}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No products found.
              </p>
            </div>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Add New Product
                </h2>
                <button
                  onClick={() => {
                    setShowAddProductModal(false);
                    setNewProductName("");
                    setNewProductImage("");
                    setNewProductComment("");
                    setNewProductCategory("");
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    value={newProductName}
                    onChange={(e) =>
                      setNewProductName(e.target.value)
                    }
                    onKeyPress={(e) =>
                      e.key === "Enter" && addProduct()
                    }
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category (optional)</label>
                  <input
                    type="text"
                    value={newProductCategory}
                    onChange={(e) =>
                      setNewProductCategory(e.target.value)
                    }
                    placeholder="Enter category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    value={newProductImage}
                    onChange={(e) =>
                      setNewProductImage(e.target.value)
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                  <textarea
                    value={newProductComment}
                    onChange={(e) =>
                      setNewProductComment(e.target.value)
                    }
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addProduct}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                    disabled={!newProductName.trim()}
                  >
                    Add Product
                  </button>
                  <button
                    onClick={() => {
                      setShowAddProductModal(false);
                      setNewProductName("");
                      setNewProductImage("");
                      setNewProductComment("");
                      setNewProductCategory("");
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Product Modal */}
        {showEditModal && editingProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Edit Product
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingProduct(null);
                  }}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Product Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        name: e.target.value,
                      })
                    }
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category (optional)</label>
                  <input
                    type="text"
                    value={editForm.category}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        category: e.target.value,
                      })
                    }
                    placeholder="Enter category"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    value={editForm.imageUrl}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        imageUrl: e.target.value,
                      })
                    }
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Comment (optional)</label>
                  <textarea
                    value={editForm.comment}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        comment: e.target.value,
                      })
                    }
                    placeholder="Add a comment..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveProductEdit}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={deleteProductFromEdit}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Offline Notice */}
      {showOfflineNotice && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
          You're offline. Changes will sync when you're back online.
        </div>
      )}

      {/* PWA Install Prompt */}
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50 max-w-sm mx-auto">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">C</span>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">Install Gulu Inventory</h3>
                <p className="text-xs text-gray-500">Add to your home screen for quick access</p>
              </div>
            </div>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Install
            </button>
            <button
              onClick={() => setShowInstallPrompt(false)}
              className="flex-1 border border-gray-300 text-gray-600 hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold">
                C
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowNewListForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full transition-colors"
          >
            New List
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Import and Sort Controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors"
            >
              <Download className="w-4 h-4" />
              Import from Code
            </button>
            <button
              onClick={() => setShowCsvImportModal(true)}
              className="flex items-center gap-2 border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-4 py-2 rounded-md transition-colors"
            >
              <Upload className="w-4 h-4" />
              Import from CSV
            </button>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">Sort</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "date" | "quantity")}
                className="border-none shadow-none p-0 bg-transparent focus:outline-none"
              >
                <option value="date">Date</option>
                <option value="name">Name</option>
                <option value="quantity">Items</option>
              </select>
            </div>
            <button
              onClick={() =>
                setSortOrder(
                  sortOrder === "asc" ? "desc" : "asc",
                )
              }
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={`Sort ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search lists..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lists */}
        <div className="space-y-4">
          {filteredLists.map((list) => {
            const completedCount = list.products.filter(
              (p) => p.isCompleted,
            ).length;
            const totalCount = list.products.length;
            const progressPercentage =
              totalCount > 0
                ? (completedCount / totalCount) * 100
                : 0;

            return (
              <div
                key={list.id}
                className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer relative"
                onClick={() => setSelectedListId(list.id)}
              >
                {/* Action buttons in top right */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      shareList(list);
                    }}
                    className="p-2 text-gray-400 hover:text-teal-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Share list"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteList(list.id);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                    title="Delete list"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between mb-4 pr-20">
                  <div>
                    <h3 className="text-xl text-gray-900 mb-1">
                      {list.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {list.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {list.products.filter(p => !p.isOutOfStock).length} out of {totalCount} in stock
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {list.createdAt.toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {filteredLists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">
              No lists found matching your search.
            </p>
          </div>
        )}
      </div>

      {/* New List Form Dialog */}
      {showNewListForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Create New List</h2>
              <button
                onClick={() => setShowNewListForm(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="name">List Name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1" htmlFor="description">Description</label>
                <textarea
                  id="description"
                  placeholder="Enter description..."
                  value={newListDescription}
                  onChange={(e) =>
                    setNewListDescription(e.target.value)
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowNewListForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createNewList}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                Create List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Import List</h2>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportCode("");
                  setImportError("");
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Paste a share code to import a list shared by someone else.
            </p>
            <div className="space-y-4">
              <input
                type="text"
                value={importCode}
                onChange={(e) => {
                  setImportCode(e.target.value);
                  setImportError(""); // Clear error when user types
                }}
                placeholder="Paste share code here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
              {importError && (
                <p className="text-red-500 text-sm">
                  {importError}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportCode("");
                  setImportError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={importList}
                disabled={!importCode.trim()}
                className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Code Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Share List</h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Copy and share this code with others to import your list.
            </p>
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={shareCode}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md bg-gray-50"
                />
                <button
                  onClick={() => copyToClipboard(shareCode)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 transition-colors"
                  title="Copy to clipboard"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCsvImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Import from CSV</h2>
              <button
                onClick={() => {
                  setShowCsvImportModal(false);
                  setCsvContent("");
                  setCsvFile(null);
                  setImportError("");
                }}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Select a CSV file to import a list with products and their details.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Select CSV File</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                />
              </div>
              {csvFile && (
                <div className="text-sm text-gray-600">
                  Selected file: {csvFile.name}
                </div>
              )}
              <div className="text-sm text-gray-500">
                <p className="mb-2">Expected CSV format:</p>
                <div className="bg-gray-50 p-3 rounded border font-mono text-xs">
                  ListName<br/>
                  Product1,category,image-url,comment<br/>
                  Product2,category,image-url,comment
                </div>
              </div>
              {importError && (
                <p className="text-red-500 text-sm">
                  {importError}
                </p>
              )}
            </div>
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCsvImportModal(false);
                  setCsvContent("");
                  setCsvFile(null);
                  setImportError("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-600 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={importCsv}
                disabled={!csvFile}
                className="flex-1 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-md transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Import List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}