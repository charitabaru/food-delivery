import React, { useState, useContext } from "react";
import "./LoginPopup.css";
import { assets } from "../../assets/assets";
import { StoreContext } from "../../context/StoreContext";

const LoginPopup = ({ setShowLogin }) => {
  const { login, register } = useContext(StoreContext);
  const [currentState, setCurrentState] = useState("Sign Up");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(data => ({ ...data, [name]: value }));
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      
      if (currentState === "Login") {
        result = await login(data.email, data.password);
      } else {
        result = await register(data.name, data.email, data.password);
      }

      if (result.success) {
        // Reset form
        setData({
          name: "",
          email: "",
          password: ""
        });
        
        // Close popup
        setShowLogin(false);
      }
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={onSubmitHandler}>
        <div className="login-popup-title">
          <h2>{currentState}</h2>
          <img
            onClick={() => setShowLogin(false)}
            src={assets.cross_icon}
            alt="Close"
          />
        </div>
        <div className="login-popup-inputs">
          {currentState === "Login" ? (
            <></>
          ) : (
            <input 
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              type="text" 
              placeholder="Your name" 
              required 
            />
          )}
          <input 
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            type="email" 
            placeholder="Your email" 
            required 
          />
          <input 
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            type="password" 
            placeholder="Password" 
            required 
            minLength="8"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading 
            ? "Please wait..." 
            : currentState === "Sign Up" 
              ? "Create account" 
              : "Login"
          }
        </button>
        <div className="login-popup-condition">
          <input type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currentState === "Login" ? (
          <p>
            Create a new account? <span onClick={() => setCurrentState("Sign Up")}>Click here</span>
          </p>
        ) : (
          <p>
            Already have an account? <span onClick={() => setCurrentState("Login")}>Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default LoginPopup;