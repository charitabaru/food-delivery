import React, { useContext, useState, useEffect } from 'react'
import "./PlaceOrder.css"
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const PlaceOrder = () => {
  
  const { getTotalCartAmount, token, food_list, cartItems, url } = useContext(StoreContext);
  const navigate = useNavigate();
  
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  })

  const [paymentMethod, setPaymentMethod] = useState('cod'); // Default to COD

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(data => ({
      ...data,
      [name]: value
    }));
  }

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  }

  const placeOrder = async (e) => {
    e.preventDefault();
    
    // Validate form data
    if (!data.firstName || !data.lastName || !data.email || !data.street || 
        !data.city || !data.state || !data.zipCode || !data.country || !data.phone) {
      alert("Please fill all the fields");
      return;
    }

    // Check if cart is empty
    if (getTotalCartAmount() === 0) {
      alert("Your cart is empty");
      return;
    }

    let orderItems = [];
    food_list.map((item) => {
      if (cartItems[item._id] > 0) {
        let itemInfo = item;
        itemInfo["quantity"] = cartItems[item._id];
        orderItems.push(itemInfo);
      }
    });

    let orderData = {
      address: data,
      items: orderItems,
      amount: getTotalCartAmount() + 25, // Including delivery fee
      paymentMethod: paymentMethod
    }

    try {
      let response;
      
      if (paymentMethod === 'cod') {
        // For COD, place order directly
        response = await axios.post(url + "/api/order/place-cod", orderData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          // Clear cart and redirect to my orders page
          alert("Order placed successfully!");
          navigate('/myorders'); // Changed from '/orders' to '/myorders'
        } else {
          alert("Error placing order: " + response.data.message);
        }
      } else if (paymentMethod === 'stripe') {
        // For Stripe, get payment session URL
        response = await axios.post(url + "/api/order/place-stripe", orderData, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data.success) {
          const { session_url } = response.data;
          window.location.replace(session_url);
        } else {
          alert("Error creating payment session: " + response.data.message);
        }
      }
    } catch (error) {
      console.log("Error:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  // Redirect to cart if not logged in
  useEffect(() => {
    if (!token) {
      navigate('/cart');
    } else if (getTotalCartAmount() === 0) {
      navigate('/cart');
    }
  }, [token])

  return (
    <form onSubmit={placeOrder} className='place-order'>
      <div className="place-order-left">
        <p className="title">Delivery Information</p>
        <div className="multi-fields">
          <input 
            required
            name='firstName' 
            onChange={onChangeHandler} 
            value={data.firstName} 
            type="text" 
            placeholder='First Name'
          />
          <input 
            required
            name="lastName" 
            onChange={onChangeHandler} 
            value={data.lastName} 
            type="text" 
            placeholder='Last Name'
          />
        </div>
        <input 
          required
          name="email"
          onChange={onChangeHandler}
          value={data.email}
          type="email" 
          placeholder='Email address' 
        />
        <input 
          required
          name="street"
          onChange={onChangeHandler}
          value={data.street}
          type="text"
          placeholder='Street' 
        />
        <div className="multi-fields">
          <input 
            required
            name="city"
            onChange={onChangeHandler}
            value={data.city}
            type="text" 
            placeholder='City'
          />
          <input 
            required
            name="state"
            onChange={onChangeHandler}
            value={data.state}
            type="text" 
            placeholder='State'
          />
        </div>
        <div className="multi-fields">
          <input 
            required
            name="zipCode"
            onChange={onChangeHandler}
            value={data.zipCode}
            type="text" 
            placeholder='Zip code'
          />
          <input 
            required
            name="country"
            onChange={onChangeHandler}
            value={data.country}
            type="text" 
            placeholder='Country'
          />
        </div>
        <input 
          required
          name="phone"
          onChange={onChangeHandler}
          value={data.phone}
          type="text" 
          placeholder='Phone' 
        />
      </div>
      <div className="place-order-right">
        <div className="cart-total">
          <h2>Cart Totals</h2>
          <div>
            <div className="cart-total-details">
              <p>Subtotal</p>
              <p>₹{getTotalCartAmount()}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <p>Delivery Fee</p>
              <p>₹{getTotalCartAmount() === 0 ? 0 : 25}</p>
            </div>
            <hr />
            <div className="cart-total-details">
              <b>Total</b>
              <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 25}</b>
            </div>
          </div>
          
          {/* Payment Method Selection */}
          <div className="payment-method">
            <h3>Payment Method</h3>
            <div className="payment-options">
              <div 
                className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('cod')}
              >
                <input 
                  type="radio" 
                  id="cod" 
                  name="paymentMethod" 
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                />
                <label htmlFor="cod">COD (Cash on Delivery)</label>
              </div>
              <div 
                className={`payment-option ${paymentMethod === 'stripe' ? 'selected' : ''}`}
                onClick={() => handlePaymentMethodChange('stripe')}
              >
                <input 
                  type="radio" 
                  id="stripe" 
                  name="paymentMethod" 
                  value="stripe"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => handlePaymentMethodChange('stripe')}
                />
                <label htmlFor="stripe">Stripe (Credit/Debit Card)</label>
              </div>
            </div>
          </div>

          <button type="submit">
            {paymentMethod === 'cod' ? 'PLACE ORDER' : 'PROCEED TO PAYMENT'}
          </button>
        </div>
      </div>
    </form>
  )
}

export default PlaceOrder