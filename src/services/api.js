import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";

// Product APIs
export const fetchProducts = async () => {
  try {
    const productsRef = collection(db, "products");
    const q = query(productsRef, orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    const products = [];
    snapshot.forEach((doc) => {
      products.push({
        // id: parseInt(doc.id),
        id: doc.id,
        ...doc.data(),
      });
    });
    return products;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Failed to fetch products from Firestore");
  }
};

export const createProduct = async (product) => {
  try {
    const productsRef = collection(db, "products");
    const docRef = await addDoc(productsRef, product);
    return {
      id: docRef.id,
      ...product,
    };
  } catch (error) {
    console.error("Error creating product:", error);
    throw new Error("Failed to create a product");
  }
};

export const updateProduct = async (productId, updates) => {
  try {
    const productRef = doc(db, "products", productId.toString());
    await updateDoc(productRef, updates);
    const products = await fetchProducts();
    const updatedProduct = products.find((p) => p.id === productId);
    if (!updatedProduct) {
      throw new Error("Product not found after update");
    }
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw new Error("Failed to update product");
  }
};

export const deleteProduct = async (productId) => {
  try {
    const productRef = doc(db, "products", productId.toString());
    await deleteDoc(productRef);
  } catch (error) {
    console.error("Error deleting product:", error);
    throw new Error("Failed to delete product");
  }
};

export const updateProductStock = async (productId, stock) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { stock });
    // Return updated product
    const products = await fetchProducts();
    const updatedProduct = products.find((p) => p.id === productId);
    if (!updatedProduct) {
      throw new Error("Product not found after update");
    }
    return updatedProduct;
  } catch (error) {
    console.error("Error updating product stock:", error);
    throw new Error("Failed to update product stock");
  }
};

export const restockProduct = async (productId, amount) => {
  try {
    const productRef = doc(db, "products", productId);
    await updateDoc(productRef, { stock: increment(amount) });
    // Return updated product
    const products = await fetchProducts();
    const updatedProduct = products.find((p) => p.id === productId);
    if (!updatedProduct) {
      throw new Error("Product not found after restock");
    }
    return updatedProduct;
  } catch (error) {
    console.error("Error restocking product:", error);
    throw new Error("Failed to restock product");
  }
};

// Person APIs
export const fetchPersons = async () => {
  try {
    const personsRef = collection(db, "persons");
    const snapshot = await getDocs(personsRef);
    const persons = [];
    snapshot.forEach((doc) => {
      persons.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return persons;
  } catch (error) {
    console.error("Error fetching persons:", error);
    throw new Error("Failed to fetch persons from Firestore");
  }
};

export const createPerson = async (person) => {
  try {
    const personsRef = collection(db, "persons");
    const docRef = await addDoc(personsRef, person);
    return {
      id: docRef.id,
      ...person,
    };
  } catch (error) {
    console.error("Error creating person:", error);
    throw new Error("Failed to create person");
  }
};

export const updatePerson = async (personId, updates) => {
  try {
    const personRef = doc(db, "persons", personId.toString());
    await updateDoc(personRef, updates);
    const persons = await fetchPersons();
    const updatedPerson = persons.find((p) => p.id === personId);
    if (!updatedPerson) {
      throw new Error("Person not found after update");
    }
    return updatedPerson;
  } catch (error) {
    console.error("Error updating person:", error);
    throw new Error("Failed to update person");
  }
};

export const deletePerson = async (personId) => {
  try {
    const personRef = doc(db, "persons", personId.toString());
    await deleteDoc(personRef);
  } catch (error) {
    console.error("Error deleting person:", error);
    throw new Error("Failed to delete person");
  }
};

export const updatePersonBalance = async (personId, amount) => {
  try {
    const personRef = doc(db, "persons", personId.toString());
    await updateDoc(personRef, {
      balance: increment(amount),
    });
    const persons = await fetchPersons();
    const updatedPerson = persons.find((p) => p.id === personId);
    if (!updatedPerson) {
      throw new Error("Person not found after update");
    }
    return updatedPerson;
  } catch (error) {
    console.error("Error updating person balance:", error);
    throw new Error("Failed to update person balance");
  }
};

// Sales APIs
export const fetchSalesHistory = async () => {
  try {
    const salesRef = collection(db, "sales");
    const q = query(salesRef, orderBy("date", "desc"));
    const snapshot = await getDocs(q);
    const sales = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      sales.push({
        id: doc.id,
        date:
          data.date instanceof Timestamp
            ? data.date.toDate()
            : new Date(data.date),
        items: data.items,
        subtotal: data.subtotal,
        tax: data.tax,
        total: data.total,
        personId: data.personId,
        paymentMethod: data.paymentMethod || "cash",
      });
    });
    return sales;
  } catch (error) {
    console.error("Error fetching sales history:", error);
    throw new Error("Failed to fetch sales history from Firestore");
  }
};

export const createSale = async (saleData) => {
  try {
    const salesRef = collection(db, "sales");

    if (!saleData.personId) {
      saleData.personId = "vX8XyW927t9btOWs2om5";
    }

    const docRef = await addDoc(salesRef, {
      ...saleData,
      date: Timestamp.now(),
    });
    return {
      id: docRef.id,
      date: new Date(),
      items: saleData.items,
      subtotal: saleData.subtotal,
      tax: saleData.tax,
      total: saleData.total,
      personId: saleData.personId,
      paymentMethod: saleData.paymentMethod,
    };
  } catch (error) {
    console.error("Error creating sale:", error);
    throw new Error("Failed to create sale in Firestore");
  }
};

export const apiService = {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStock,
  restockProduct,
  fetchPersons,
  createPerson,
  updatePerson,
  deletePerson,
  updatePersonBalance,
  fetchSalesHistory,
  createSale,
};

export default apiService;
