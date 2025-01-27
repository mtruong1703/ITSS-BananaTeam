import React, { useEffect, useState } from "react";
import ResItem from "./res-item";
import { sendRequest } from '../../../helpers/requestHelper';

function ListComponent() {
  const [restaurant, setrestaurant] = useState([]);

  useEffect(() => {
    fetchrestaurant();
  }, []); 

  const fetchrestaurant = async () => {
    const resp = await sendRequest({
        url: `http://localhost:8000/api/v1/home`,
        method: "GET",
      })
    console.log('in home', resp.data['content']['restaurant'])
    setrestaurant(resp.data['content']['restaurant'])
  };
 
  const firstFourrestaurant = restaurant.slice(0, 4);
  const remainingrestaurant = restaurant.slice(4);

  return (
    <div className="home-fav-res">
      <div className="res-line-1">
        {firstFourrestaurant.map((restaurant) => (
          <ResItem
            key={restaurant.id}
            image_src={"http://localhost:8000" + restaurant.img}
            text={restaurant.name}
          />
        ))}
      </div>
      <div className="res-line-2">
        {remainingrestaurant.map((restaurant) => (
          <ResItem
            key={restaurant.id}
            image_src={"http://localhost:8000" + restaurant.img}
            text={restaurant.name}
          />
        ))}
      </div>
    </div>
  );
}

export default ListComponent;
