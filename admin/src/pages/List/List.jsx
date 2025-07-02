import React, { useEffect, useState } from 'react'
import "./List.css"
import axios from 'axios'
import { toast } from 'react-toastify'; // Changed from react-hot-toast to react-toastify

const List = ({url}) => {
 
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(`${url}/api/food/list`);
      console.log(response.data);
      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Failed to fetch list");
      }
    } catch (error) {
      console.error("Error fetching list:", error);
      toast.error("Error fetching food items");
    }
  }

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      
      if (response.data.success) {
        toast.success(response.data.message || "Item removed successfully!");
        await fetchList(); // Refresh the list after successful removal
      } else {
        toast.error("Error removing item");
      }
    } catch (error) {
      console.error("Error removing food:", error);
      toast.error("Failed to remove item");
    }
  }

  useEffect(() => {
    fetchList();
  }, [])

  return (
    <div className='list add flex-col'>
      <div className="list-header">
        <p className='list-title'>All Foods List</p>
        <div className="list-stats">
          <span className="total-items">Total Items: {list.length}</span>
        </div>
      </div>
      <div className="list-table">
        <div className="list-table-format title">
          <b>S.No</b>
          <b>Photo</b>
          <b>Product Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Remove</b>
        </div>
        {list.length === 0 ? (
          <div className="list-empty">
            <p>No food items found!</p>
            <p>Add some delicious items to get started.</p>
          </div>
        ) : (
          list.map((item, index) => {
            return (
              <div key={index} className='list-table-format'>
                <p className="serial-number">{index + 1}</p>
                <img src={`${url}/images/` + item.image} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>${item.price}</p>
                <p onClick={() => removeFood(item._id)} className='cursor'>Remove</p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default List