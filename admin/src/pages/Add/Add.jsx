import React, { useState } from 'react'
import "./Add.css"
import { assets } from '../../assets/assets'
import axios from 'axios'
import { toast } from 'react-toastify'

const Add = ({url}) => {

  const [image, setImage] = useState(false);
  const [loading, setLoading] = useState(false); // Added missing loading state
  const [data, setData] = useState({
    name: "",
    description: "",
    category: "Salad",
    price: "",
  });

  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setData(data => ({ ...data, [name]: value }));
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!image) {
      toast.error("Please select an image");
      return;
    }
    
    if (!data.name.trim()) {
      toast.error("Please enter product name");
      return;
    }
    
    if (!data.description.trim()) {
      toast.error("Please enter product description");
      return;
    }
    
    if (!data.price || data.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("price", Number(data.price));
      formData.append("image", image);

      const response = await axios.post(`${url}/api/food/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          category: "Salad",
          price: "",
        });
        setImage(false);
        toast.success("Product added successfully!");
      } else {
        toast.error("Error: " + (response.data.message || "Unknown error"));
      }
    } catch (error) {
      if (error.response) {
        toast.error(`Server Error: ${error.response.data.message || error.response.status}`);
      } else if (error.request) {
        toast.error("Network error. Please check if your server is running on port 4000.");
      } else {
        toast.error("Failed to add product. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='add'>
      <form className='flex-col' onSubmit={onSubmitHandler}>
        <div className='add-img-upload flex-col'>
          <p>Upload Image</p>
          <label htmlFor='image'>
            <img src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
          </label>
          <input 
            onChange={(e) => setImage(e.target.files[0])} 
            type="file" 
            id='image' 
            hidden 
            required 
            accept="image/*"
          />
        </div>
        <div className="add-product-name flex-col">
          <p>Product name</p>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type="text" 
            name="name" 
            placeholder='Type here' 
            required
          />
        </div>
        <div className='add-product-description flex-col'>
          <p>Product Description</p>
          <textarea 
            onChange={onChangeHandler} 
            value={data.description} 
            name="description" 
            rows="6" 
            placeholder='write content here' 
            required
          />
        </div>
        <div className='add-category-price'>
          <div className="add-category flex-col">
            <p>Product Category</p>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Product Price</p>
            <input 
              onChange={onChangeHandler} 
              value={data.price} 
              type="number" 
              name="price" 
              placeholder='₹20' 
              min="1"
              step="0.01"
              required
            />
          </div>
        </div>
        <button type='submit' className='add-btn' disabled={loading}>
          {loading ? "Adding..." : "ADD"}
        </button>
      </form>
    </div>
  )
}

export default Add