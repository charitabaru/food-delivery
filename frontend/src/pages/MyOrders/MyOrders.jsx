import React, { useState, useEffect, useContext } from 'react';
import './MyOrders.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { assets } from '../../assets/assets';

const MyOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { url, token } = useContext(StoreContext);

    // Fetch user orders
    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(''); // Clear any previous errors
            
            if (!token) {
                setError('Please login to view your orders');
                setLoading(false);
                return;
            }

            console.log('Fetching orders with URL:', `${url}/api/order/userorders`);
            console.log('Token available:', !!token);

            const response = await axios.get(`${url}/api/order/userorders`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Response:', response.data);
            
            if (response.data.success) {
                // Sort orders by date (newest first)
                const sortedOrders = response.data.data.sort((a, b) => 
                    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
                );
                setOrders(sortedOrders);
            } else {
                setError(response.data.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.response) {
                // Server responded with error status
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
                setError(error.response.data.message || `Server Error: ${error.response.status}`);
            } else if (error.request) {
                // Network error
                console.error('Network error:', error.request);
                setError('Network error. Please check your connection.');
            } else {
                // Other error
                console.error('Error message:', error.message);
                setError('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('Token in MyOrders:', token);
        console.log('Token type:', typeof token);
        console.log('Token length:', token?.length);
        
        if (token && token.trim() !== '') {
            fetchOrders();
        } else {
            setLoading(false);
            setError('Please login to view your orders');
        }
    }, [token, url]);

    // Format date
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return '#ff9800';
            case 'confirmed':
                return '#2196f3';
            case 'preparing':
                return '#ff5722';
            case 'out for delivery':
                return '#9c27b0';
            case 'delivered':
                return '#4caf50';
            case 'cancelled':
                return '#f44336';
            default:
                return '#757575';
        }
    };

    if (loading) {
        return (
            <div className="my-orders">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading your orders...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="my-orders">
                <div className="error-container">
                    <h2>Oops!</h2>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="my-orders">
            <div className="my-orders-container">
                <h2>My Orders</h2>
                
                {orders.length === 0 ? (
                    <div className="no-orders">
                        <div className="no-orders-icon">📦</div>
                        <h3>No Orders Yet</h3>
                        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
                        <button 
                            onClick={() => window.location.href = '/'}
                            className="start-shopping-btn"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-item">
                                <img src={assets.parcel_icon} alt="Order" className="order-icon" />
                                <div className="order-details">
                                    <p className="order-items-text">
                                        {order.items.map((item, index) => (
                                            <span key={index}>
                                                {item.name} x {item.quantity}
                                                {index < order.items.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                                <div className="order-amount">
                                    ₹{order.amount.toFixed(2)}
                                </div>
                                <div className="order-info">
                                    <p className="order-count">Items: {order.items.length}</p>
                                    <div className="order-status-container">
                                        <span 
                                            className="status-dot"
                                            style={{ backgroundColor: getStatusColor(order.status) }}
                                        ></span>
                                        <span className="status-text">{order.status || 'Food Processing'}</span>
                                    </div>
                                </div>
                                <button onClick={fetchOrders}className="track-order-button">Track Order</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyOrders;