import React, { useContext, useEffect } from 'react'
import "./Verify.css"
import { useSearchParams, useNavigate } from 'react-router-dom'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const Verify = () => {
    const [searchParams] = useSearchParams();
    const success = searchParams.get("success");
    const orderId = searchParams.get("orderId");
    const { url } = useContext(StoreContext);
    const navigate = useNavigate();

    const verifyPayment = async () => {
        try {
            const response = await axios.post(url + "/api/order/verify", {
                orderId: orderId,
                success: success
            });

            if (response.data.success) {
                // Payment successful, redirect to orders page
                navigate("/myorders");
            } else {
                // Payment failed, redirect to home
                navigate("/");
            }
        } catch (error) {
            console.error("Payment verification error:", error);
            // On error, redirect to home
            navigate("/");
        }
    }

    useEffect(() => {
        // Only verify if we have the required parameters
        if (orderId && success) {
            verifyPayment();
        } else {
            // If no parameters, redirect to home
            navigate("/");
        }
    }, [orderId, success])

    return (
        <div className='verify'>
            <div className='spinner'></div>
            <p>Verifying your payment...</p>
        </div>
    )
}

export default Verify