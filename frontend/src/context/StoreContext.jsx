import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [food_list, setFood_list] = useState([]);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const url = "https://food-delivery-396q.onrender.com";

  // Authentication Functions
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${url}/api/user/login`, {
        email,
        password
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success("Login successful!");
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.message || "Login failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await axios.post(`${url}/api/user/register`, {
        name,
        email,
        password
      });

      if (response.data.success) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        toast.success("Account created successfully!");
        return { success: true };
      } else {
        toast.error(response.data.message);
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      console.error("Register error:", error);
      const errorMessage = error.response?.data?.message || "Registration failed";
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
    setCartItems({});
    setCartCount(0);
    toast.success("Logged out successfully!");
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    if (!token) return;
    
    try {
      const response = await axios.get(`${url}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch food list from backend
  const fetchFoodList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      if (response.data.success) {
        const processedFoodList = response.data.data.map(item => ({
          ...item,
          image: item.image.startsWith('http') ? item.image : `${url}/images/${item.image}`
        }));
        setFood_list(processedFoodList);
      } else {
        toast.error("Failed to fetch food items");
      }
    } catch (error) {
      console.error("Error fetching food list:", error);
      toast.error("Error loading food items");
    }
  };

  // CART FUNCTIONS - Updated with full backend integration

  // Add item to cart
  const addToCart = async (itemId, quantity = 1) => {
    // Update local state immediately for better UX
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + quantity
    }));

    // If user is logged in, sync with backend
    if (token) {
      try {
        const response = await axios.post(`${url}/api/cart/add`, { 
          itemId, 
          quantity 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Update cart count
          await getCartCount();
          toast.success("Item added to cart!");
        } else {
          // Revert local state if backend failed
          setCartItems((prev) => ({
            ...prev,
            [itemId]: Math.max(0, (prev[itemId] || 0) - quantity)
          }));
          toast.error(response.data.message || "Failed to add item to cart");
        }
      } catch (error) {
        console.error("Error adding to cart:", error);
        // Revert local state if backend failed
        setCartItems((prev) => ({
          ...prev,
          [itemId]: Math.max(0, (prev[itemId] || 0) - quantity)
        }));
        toast.error("Failed to add item to cart");
      }
    } else {
      toast.info("Please login to save cart items");
    }
  };

  // Remove one item from cart
  const removeFromCart = async (itemId) => {
    if (!cartItems[itemId] || cartItems[itemId] <= 0) return;

    // Update local state immediately
    setCartItems((prev) => ({
      ...prev,
      [itemId]: Math.max(0, prev[itemId] - 1)
    }));

    // If user is logged in, sync with backend
    if (token) {
      try {
        const response = await axios.post(`${url}/api/cart/remove`, { 
          itemId 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Update cart count
          await getCartCount();
        } else {
          // Revert local state if backend failed
          setCartItems((prev) => ({
            ...prev,
            [itemId]: (prev[itemId] || 0) + 1
          }));
          toast.error(response.data.message || "Failed to remove item from cart");
        }
      } catch (error) {
        console.error("Error removing from cart:", error);
        // Revert local state if backend failed
        setCartItems((prev) => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + 1
        }));
        toast.error("Failed to remove item from cart");
      }
    }
  };

  // Update cart item quantity
  const updateCartItem = async (itemId, quantity) => {
    if (quantity < 0) return;

    const oldQuantity = cartItems[itemId] || 0;

    // Update local state immediately
    if (quantity === 0) {
      setCartItems((prev) => {
        const newCart = { ...prev };
        delete newCart[itemId];
        return newCart;
      });
    } else {
      setCartItems((prev) => ({
        ...prev,
        [itemId]: quantity
      }));
    }

    // If user is logged in, sync with backend
    if (token) {
      try {
        const response = await axios.put(`${url}/api/cart/update`, { 
          itemId, 
          quantity 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Update cart count
          await getCartCount();
          toast.success("Cart updated!");
        } else {
          // Revert local state if backend failed
          setCartItems((prev) => ({
            ...prev,
            [itemId]: oldQuantity
          }));
          toast.error(response.data.message || "Failed to update cart");
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        // Revert local state if backend failed
        setCartItems((prev) => ({
          ...prev,
          [itemId]: oldQuantity
        }));
        toast.error("Failed to update cart");
      }
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    const oldCartItems = { ...cartItems };

    // Update local state immediately
    setCartItems({});
    setCartCount(0);

    // If user is logged in, sync with backend
    if (token) {
      try {
        const response = await axios.delete(`${url}/api/cart/clear`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          toast.success("Cart cleared!");
        } else {
          // Revert local state if backend failed
          setCartItems(oldCartItems);
          toast.error(response.data.message || "Failed to clear cart");
        }
      } catch (error) {
        console.error("Error clearing cart:", error);
        // Revert local state if backend failed
        setCartItems(oldCartItems);
        toast.error("Failed to clear cart");
      }
    } else {
      toast.success("Cart cleared!");
    }
  };

  // Get cart count
  const getCartCount = async () => {
    if (!token) {
      // Calculate local cart count
      const count = Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
      setCartCount(count);
      return count;
    }

    try {
      const response = await axios.get(`${url}/api/cart/count`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setCartCount(response.data.count);
        return response.data.count;
      }
    } catch (error) {
      console.error("Error getting cart count:", error);
    }
    return 0;
  };

  // Get total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  // Load cart data from backend when user logs in
  const loadCartData = async () => {
    if (!token) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/cart/get`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
        await getCartCount();
      }
    } catch (error) {
      console.error("Error loading cart data:", error);
      toast.error("Failed to load cart data");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is authenticated on app load
  useEffect(() => {
    const loadData = async () => {
      await fetchFoodList();
      
      const savedToken = localStorage.getItem("token");
      if (savedToken) {
        setToken(savedToken);
      }
    };
    
    loadData();
  }, []);

  // Load user data when token changes
  useEffect(() => {
    if (token) {
      fetchUserProfile();
      loadCartData();
    } else {
      // Calculate local cart count when not logged in
      getCartCount();
    }
  }, [token]);

  // Update cart count when cartItems change
  useEffect(() => {
    if (!token) {
      getCartCount();
    }
  }, [cartItems, token]);

  const contextValue = {
    // Food data
    food_list,
    
    // Cart data
    cartItems,
    setCartItems,
    cartCount,
    loading,
    
    // Cart functions
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getTotalCartAmount,
    getCartCount,
    loadCartData,
    
    // App config
    url,
    
    // Authentication
    token,
    setToken,
    user,
    setUser,
    login,
    register,
    logout,
    
    // Helper functions
    isAuthenticated: !!token
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
