import axios from "axios";


const API = "http://localhost:5000/api/auth";



/* REGISTER */

export const register = async (data) => {

  const res = await axios.post(
    `${API}/register`,
    data
  );

  return res.data;

};




/* LOGIN */

export const login = async (data) => {

  const res = await axios.post(
    `${API}/login`,
    data
  );


  // Save JWT token

  if (res.data.token) {

    localStorage.setItem(
      "token",
      res.data.token
    );

  }


  // Save user information if available

  if (res.data.user) {

    localStorage.setItem(
      "user",
      JSON.stringify(res.data.user)
    );

  }


  return res.data;

};




/* PROFILE */

export const getProfile = async () => {

  const token = localStorage.getItem("token");


  const res = await axios.get(

    `${API}/profile`,

    {
      headers: {

        Authorization:
          `Bearer ${token}`

      }

    }

  );


  return res.data;

};




/* LOGOUT */

export const logout = () => {

  localStorage.removeItem("token");

  localStorage.removeItem("user");

};