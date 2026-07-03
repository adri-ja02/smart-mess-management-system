import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


import {
  getAllUsers,
  getPendingManagers,
  approveManager,
  rejectManager,
  blockUser,
  unblockUser,
} from "../services/adminService";


function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();


  const [users, setUsers] = useState([]);
  const [pendingManagers, setPendingManagers] = useState([]);
  const [loading, setLoading] = useState(true);


  const loadData = async () => {
    try {
      const allUsers = await getAllUsers();
      const pending = await getPendingManagers();


      setUsers(allUsers);
      setPendingManagers(pending);
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    loadData();
  }, []);


  const handleApprove = async (id) => {
    try {
      await approveManager(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };


  const handleReject = async (id) => {
    try {
      await rejectManager(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };


  const handleBlock = async (id) => {
    try {
      await blockUser(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };


  const handleUnblock = async (id) => {
    try {
      await unblockUser(id);
      loadData();
    } catch (error) {
      alert(error.response?.data?.message);
    }
  };


  const handleLogout = () => {
    logout();
    navigate("/");
  };


  return (
    <div className="container mt-4">


      <div className="d-flex justify-content-between align-items-center mb-4">


        <div>
          <h2>Admin Dashboard</h2>
          <h5>Welcome, {user?.name}</h5>
          <p>{user?.email}</p>
        </div>


        <button
          className="btn btn-danger"
          onClick={handleLogout}
        >
          Logout
        </button>


      </div>


      {loading ? (
        <div className="alert alert-info">
          Loading...
        </div>
      ) : (
        <>
          {/* Pending Managers */}


          <div className="card shadow mb-4">


            <div className="card-header bg-warning">
              <h4 className="mb-0">
                Pending Manager Requests ({pendingManagers.length})
              </h4>
            </div>


            <div className="card-body">


              {pendingManagers.length === 0 ? (
                <p>No pending manager requests.</p>
              ) : (
                <table className="table table-bordered">


                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Action</th>
                    </tr>
                  </thead>


                  <tbody>


                    {pendingManagers.map((manager) => (
                      <tr key={manager._id}>


                        <td>{manager.name}</td>


                        <td>{manager.email}</td>


                        <td>


                          <button
                            className="btn btn-success btn-sm me-2"
                            onClick={() => handleApprove(manager._id)}
                          >
                            Approve
                          </button>


                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleReject(manager._id)}
                          >
                            Reject
                          </button>


                        </td>


                      </tr>
                    ))}


                  </tbody>


                </table>
              )}


            </div>


          </div>


          {/* All Users */}


          <div className="card shadow">


            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">All Users</h4>
            </div>


            <div className="card-body">


              <table className="table table-striped table-bordered">


                <thead>


                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Approval</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>


                </thead>


                <tbody>


                  {users.map((u) => (


                    <tr key={u._id}>


                      <td>{u.name}</td>


                      <td>{u.email}</td>


                      <td>{u.role}</td>


                      <td>{u.approvalStatus}</td>


                      <td>{u.accountStatus}</td>


                      <td>


                        {u.accountStatus === "active" ? (
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => handleBlock(u._id)}
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => handleUnblock(u._id)}
                          >
                            Unblock
                          </button>
                        )}


                      </td>


                    </tr>


                  ))}


                </tbody>


              </table>


            </div>


          </div>
        </>
      )}


    </div>
  );
}


export default AdminDashboard;
