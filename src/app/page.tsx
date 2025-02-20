"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../utils/firebase";
import { FaTrash } from "react-icons/fa";

interface Offer {
  id: string;
  seller: string;
  price: string;
}

interface Product {
  id: string;
  url: string;
  timestamp: string;
  offers: Offer[];
  minimumProductValue: string;
  price: string;
  APIkey: string;
  description: string;
  offerId: string;
}

export default function OffersPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [productLink, setProductLink] = useState("");
  const [minimumProductValue, setMinimumProductValue] = useState("");
  const [APIkey, setAPIkey] = useState("");
  const [description, setDescription] = useState("");
  const [offerId, setOfferId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<object | null>(null);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/sign-in");
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const fetchProducts = async () => {
      try {
        const productsQuery = query(
          collection(db, "products"),
          orderBy("timestamp", "desc")
        );
        const productsSnapshot = await getDocs(productsQuery);
        const productsData: Product[] = [];

        for (const productDoc of productsSnapshot.docs) {
          const productId = productDoc.id;
          const offerId = productDoc.data().offerId;
          const productData = productDoc.data();
          const minimumProductValue = productDoc.data().minimumProductValue;
          const APIkey = productDoc.data().APIkey;
          const description = productDoc.data().description;
          const productPrice = productDoc.data().price;
          const offersQuery = collection(
            db,
            `products/${productId}/productOffers`
          );
          const offersSnapshot = await getDocs(offersQuery);

          const offersData: Offer[] = offersSnapshot.docs.map((offerDoc) => ({
            id: offerDoc.id,
            seller: offerDoc.data().seller, 
            price: offerDoc.data().price,
          }));

          productsData.push({
            id: productId,
            url: productData.url,
            minimumProductValue: minimumProductValue,
            price: productPrice,
            timestamp: productData.timestamp,
            offers: offersData,
            APIkey: APIkey,
            description: description,
            offerId: offerId,
          });
        }

        setProducts(productsData);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!productLink.trim() || isSubmitting) return;
  
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "products"), {
        url: productLink,
        minimumProductValue,
        timestamp: serverTimestamp(),
        price: "",
        APIkey,
        description,
        offerId,
      });
  
      setProducts((prev) => [
        {
          id: docRef.id,
          url: productLink,
          minimumProductValue,
          timestamp: new Date().toISOString(),
          offers: [],
          price: "", 
          APIkey,  
          description, 
          offerId
        },
        ...prev,
      ]);
  
      setProductLink("");
      setMinimumProductValue("");
      setAPIkey("");
      setDescription("");
      setOfferId("")
    } catch (err) {
      setError("Failed to add product. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  

  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts((prev) => prev.filter((product) => product.id !== productId));
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking authentication...
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500 text-xl">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800 mb-6">
          Product Offers
        </h1>

        <form onSubmit={handleSubmit} className="mb-6">
          <div className="flex flex-col gap-4">
            <input
              type="text"
              placeholder="Enter new product link"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={productLink}
              onChange={(e) => setProductLink(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Enter the minimum value"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={minimumProductValue}
              onChange={(e) => setMinimumProductValue(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Enter the API key for the Product"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={APIkey}
              onChange={(e) => setAPIkey(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Enter Product Description"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Enter Offer id"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={offerId}
              onChange={(e) => setOfferId(e.target.value)}
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Product"}
            </button>
          </div>
        </form>

        <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Min Value
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Price
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Product Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Offer ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-4">
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline break-all"
                    >
                      PRODUCT LINK
                    </a>
                  </td>
              
                 
                  <td className="px-4 py-4 text-sm text-gray-900 text-left">
                    {product.minimumProductValue}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900 text-left">
                    {product.price ? `R ${product.price}` : "No data"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-900 text-left">
                    {product.description ? `${product.description}` : "No data"}
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-900 text-left">
                    {product.offerId ? `${product.offerId}` : "No data"}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      title="Delete Product"
                    >
                      <FaTrash className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
