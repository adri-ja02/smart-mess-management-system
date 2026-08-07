import axios from "axios";


const API = "http://localhost:5000/api/waitlist";

const getToken = () => localStorage.getItem("token");

/* =====================================
   Student Waitlist
===================================== */

export const getWaitlist = async () => {

    const res = await axios.get(

        API,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Notifications
===================================== */

export const getNotifications = async () => {

    const res = await axios.get(

        `${API}/notifications`,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};

/* =====================================
   Manager Matching Students
===================================== */

export const getMatchingStudents = async (roomId) => {

    const res = await axios.get(

        `${API}/match/${roomId}`,

        {

            headers: {

                Authorization: `Bearer ${getToken()}`

            }

        }

    );

    return res.data;

};