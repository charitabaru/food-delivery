import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Orders.css';

const Orders = ({ url }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${url}/api/order/list`);
      if (res.data.success) {
        setOrders(res.data.data);
      } else {
        setError('Failed to load orders');
      }
    } catch (err) {
      console.error(err);
      setError('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, status) => {
    try {
      await axios.put(`${url}/api/order/update-status`, { orderId, status });
      fetchOrders();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const getItemSummary = (items) => {
    return items.map(i => `${i.name} x ${i.quantity}`).join(', ');
  };

  const getItemCount = (items) => {
    return items.reduce((acc, item) => acc + item.quantity, 0);
  };

  return (
    <div className="admin-orders">
      <h2>Order Page</h2>

      {loading ? (
        <p className="loading-text">Loading orders...</p>
      ) : error ? (
        <p className="error-text">{error}</p>
      ) : orders.length === 0 ? (
        <p className="empty-text">No orders found.</p>
      ) : (
        orders.map(order => (
          <div key={order._id} className="order-box">
            <div className="order-box-left">
              <img
                src="https://cdn-icons-png.flaticon.com/512/4290/4290854.png"
                alt="package"
                className="order-icon"
              />
              <div className="order-text">
                <p className="item-summary"><strong>{getItemSummary(order.items)}</strong></p>
                <p>Items: {getItemCount(order.items)}</p>
                <div className="address">
                  <p>{order.address.name}</p>
                  <p>{order.address.street}</p>
                  <p>{order.address.city}, {order.address.state}, {order.address.zip}</p>
                  <p>{order.address.phone}</p>
                </div>
              </div>
            </div>
            <div className="order-box-right">
              <p><strong>₹{order.amount}</strong></p>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
              >
                <option value="pending">Food Processing</option>
                <option value="out_for_delivery">Out for delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Orders;
