import axios from "axios";
import { GET_ALL_DATA } from "./Actions";

const fetchData = () => {
  return async (dispatch) => {
    try {
      const response = await axios.get(
        "https://my-api-production-3918.up.railway.app/admin/allproduct"
      );
      dispatch({
        type: GET_ALL_DATA,
        payload: response.data,
      });
    } catch (error) {
      dispatch({
        type: GET_ALL_DATA,
        payload: error.response ? error.response.data : "An error occurred",
      });
    }
  };
};

export default fetchData;
