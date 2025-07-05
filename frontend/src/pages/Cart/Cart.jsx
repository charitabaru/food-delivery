import React, { useContext, useState } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { 
    cartItems, 
    food_list, 
    removeFromCart, 
    addToCart,
    updateCartItem,
    clearCart,
    getTotalCartAmount,
    loading,
    cartCount 
  } = useContext(StoreContext);
  
  const navigate = useNavigate();
  const [promoCode, setPromoCode] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const isCartEmpty = !Object.values(cartItems).some((quantity) => quantity > 0);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return;
    updateCartItem(itemId, newQuantity);
  };

  const handleClearCart = () => {
    if (showClearConfirm) {
      clearCart();
      setShowClearConfirm(false);
    } else {
      setShowClearConfirm(true);
      setTimeout(() => setShowClearConfirm(false), 3000);
    }
  };

  const handlePromoCode = () => {
    if (promoCode.trim() === "") {
      alert("Please enter a promo code");
      return;
    }
    alert(`Promo code "${promoCode}" applied! (This is a demo)`);
    setPromoCode("");
  };

  if (loading) {
    return (
      <div className="cart">
        <div className="loading-message">
          <p>Loading cart...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cart">
      {isCartEmpty ? (
        <div className="cart-empty">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Start adding items to your cart to see them here!</p>
          <button onClick={() => navigate('/')} className="shop-more-btn">
            Shop Now
          </button>
        </div>
      ) : (
        <>
          <div className="cart-header">
            <h2>Shopping Cart ({cartCount} items)</h2>
            <button 
              onClick={handleClearCart}
              className={`clear-cart-btn ${showClearConfirm ? 'confirm' : ''}`}
              title={showClearConfirm ? "Click again to confirm" : "Clear all items"}
            >
              {showClearConfirm ? "Confirm Clear?" : "Clear Cart"}
            </button>
          </div>

          <div className="cart-items">
            <div className="cart-items-title">
              <p>Item</p>
              <p>Title</p>
              <p>Price</p>
              <p>Quantity</p>
              <p>Total</p>
              <p>Remove</p>
            </div>
            <br />
            <hr />
            
            {food_list.map((item) => {
              if (cartItems[item._id] > 0) {
                return (
                  <div key={item._id}>
                    <div className="cart-items-title cart-items-item">
                      <img src={item.image} alt={item.name} />
                      <p>{item.name}</p>
                      <p>₹{item.price.toLocaleString()}</p>
                      <div className="quantity-controls">
                        <button 
                          onClick={() => removeFromCart(item._id)}
                          className="quantity-btn minus"
                          disabled={cartItems[item._id] <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={cartItems[item._id]}
                          onChange={(e) => handleQuantityChange(item._id, parseInt(e.target.value) || 1)}
                          className="quantity-input"
                        />
                        <button 
                          onClick={() => addToCart(item._id, 1)}
                          className="quantity-btn plus"
                        >
                          +
                        </button>
                      </div>
                      <p>₹{(item.price * cartItems[item._id]).toLocaleString()}</p>
                      <button
                        onClick={() => updateCartItem(item._id, 0)}
                        className="cross"
                        title="Remove item completely"
                      >
                        ×
                      </button>
                    </div>
                    <hr />
                  </div>
                );
              }
              return null;
            })}
          </div>

          {/* New "Shop More Items" button */}
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button 
              onClick={() => navigate('/#explore-menu')}
              className="shop-more-btn"
            >
              Shop More Items
            </button>
          </div>
        </>
      )}

      {!isCartEmpty && (
        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>₹{getTotalCartAmount().toLocaleString()}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>₹{getTotalCartAmount() === 0 ? 0 : 25}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>₹{(getTotalCartAmount() + (getTotalCartAmount() === 0 ? 0 : 25)).toLocaleString()}</b>
              </div>
            </div>
            <button 
              onClick={() => navigate('/order')}
              disabled={getTotalCartAmount() === 0}
            >
              Proceed to Checkout
            </button>
          </div>
          
          <div className="cart-promocode">
            <div>
              <p>If you have a promo code, enter it here</p>
              <div className="cart-promocode-input">
                <input
                  type="text"
                  placeholder="Promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button onClick={handlePromoCode}>Apply Code</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;