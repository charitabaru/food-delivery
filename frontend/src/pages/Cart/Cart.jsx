import React, { useContext } from "react";
import "./Cart.css";
import { StoreContext } from "../../context/StoreContext";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, food_list, removeFromCart, getTotalCartAmount } = useContext(StoreContext);
  const navigate = useNavigate();

  // Check if the cart is empty
  const isCartEmpty = !Object.values(cartItems).some((quantity) => quantity > 0);

  return (
    <div className="cart">
      <div className="cart-items">
        {isCartEmpty ? (
          <div className="cart-empty">
            <h3>Your cart is empty</h3>
            <p>Start adding items to your cart to see them here!</p>
            <button onClick={() => navigate('/')}>Browse Items</button>
          </div>
        ) : (
          <>
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
                    <div className="cart-items-item">
                      <img src={item.image} alt={item.name} />
                      <p>{item.name}</p>
                      <p>₹{item.price.toLocaleString()}</p>
                      <p>{cartItems[item._id]}</p>
                      <p>₹{(item.price * cartItems[item._id]).toLocaleString()}</p>
                      <p
                        onClick={() => removeFromCart(item._id)}
                        className="cross"
                        title="Remove item"
                      >
                        ×
                      </p>
                    </div>
                    <hr />
                  </div>
                );
              }
              return null;
            })}
          </>
        )}
      </div>
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
                <p>₹25</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>₹{(getTotalCartAmount() + 25).toLocaleString()}</b>
              </div>
            </div>
            <button onClick={() => navigate('/order')}>
              Proceed to Checkout
            </button>
          </div>
          <div className="cart-promocode">
            <div>
              <p>If you have a promo code, enter it here</p>
              <div className="cart-promocode-input">
                <input type="text" placeholder="Enter promo code" />
                <button>Apply Code</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;