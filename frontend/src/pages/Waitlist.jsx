import { useEffect, useState } from "react";
import { getWaitlist } from "../services/waitlistService";

function Waitlist() {

  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWaitlist();
  }, []);

  const loadWaitlist = async () => {

    try {

      const data = await getWaitlist();
      console.log(data);

      setWaitlist(data.waitlist);

    } catch (error) {

      console.log(error);

      alert("Failed to load waitlist.");

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="container mt-5">

      <h2 className="mb-4">
        My Waitlist
      </h2>

      {

        loading ?

        (

          <div className="text-center">

            <div
              className="spinner-border"
              role="status"
            ></div>

          </div>

        )

        :

        waitlist.length === 0 ?

        (

          <div className="alert alert-info">

            You are not on any waitlist.

          </div>

        )

        :

        (

          <table className="table table-bordered">

            <thead className="table-dark">

              <tr>

                <th>Room</th>

                <th>Budget</th>

                <th>Roommate Preference</th>

                <th>Space Preference</th>

                <th>Status</th>

                <th>Notification</th>

              </tr>

            </thead>

            <tbody>

              {

                waitlist.map((item)=>(

                  <tr key={item._id}>

                    <td>

                      {item.room?.roomNumber || "Any"}

                    </td>

                    <td>

                      {item.budget}

                    </td>

                    <td>

                      {item.roommatePreference || "-"}

                    </td>

                    <td>

                      {item.spacePreference || "-"}

                    </td>

                    <td>

                      <span
                        className={
                          item.status === "matched"
                          ? "badge bg-success"
                          : "badge bg-warning text-dark"
                        }
                      >
                        {item.status}
                      </span>

                    </td>

                    <td>

                      {

                        item.notified ?

                        (

                          <span className="text-success">

                            🔔 {item.notificationMessage}

                          </span>

                        )

                        :

                        (

                          "No notification"

                        )

                      }

                    </td>

                  </tr>

                ))

              }

            </tbody>

          </table>

        )

      }

    </div>

  );

}

export default Waitlist;