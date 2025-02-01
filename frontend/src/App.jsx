import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Loader2 } from "lucide-react";
import abi from "./abi.json";

const CONTRACT_ADDRESS = "0xe4726d0fb94f1Bd78047752414fFAB43bE9f7697";
const CONTRACT_ABI = abi;

const ClassRegistrationDApp = () => {
 const [provider, setProvider] = useState(null);
 const [contract, setContract] = useState(null);
 const [account, setAccount] = useState("");
 const [isAdmin, setIsAdmin] = useState(false);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [students, setStudents] = useState([]);
 const [newStudent, setNewStudent] = useState({ id: "", name: "" });
 const [studentCount, setStudentCount] = useState(0);

 const connectWallet = async () => {
   try {
     if (!window.ethereum) {
       throw new Error("Please install MetaMask!");
     }

     setLoading(true);
     setError("");

     const accounts = await window.ethereum.request({
       method: "eth_requestAccounts",
     });
     if (!accounts || accounts.length === 0) {
       throw new Error("No accounts found!");
     }

     const account = accounts[0];
     setAccount(account);

     const provider = new ethers.BrowserProvider(window.ethereum);
     const signer = await provider.getSigner();
     const contractInstance = new ethers.Contract(
       CONTRACT_ADDRESS,
       CONTRACT_ABI,
       signer
     );

     setProvider(provider);
     setContract(contractInstance);

     // Check if connected account is admin
     try {
       const adminAddress = await contractInstance.admin();
       setIsAdmin(adminAddress.toLowerCase() === account.toLowerCase());
     } catch (err) {
       console.error("Error checking admin status:", err);
       // Don't throw here, just log the error and continue
       setIsAdmin(false);
     }

     await loadStudents();
     setLoading(false);
   } catch (err) {
     console.error("Connection error:", err);
     setError(err.message);
     setLoading(false);
   }
 };

 const loadStudents = async () => {
   if (!contract) return;

   try {
     const loadedStudents = [];
     let id = 0;

     while (id < 100) {
       // Safety limit
       try {
         const student = await contract.getStudentById(id);
         if (student && student.isRegistered) {
           loadedStudents.push({ id: id.toString(), name: student.name });
         }
         id++;
       } catch (err) {
         // If we hit an error, assume we've reached the end
         break;
       }
     }

     setStudents(loadedStudents);
     setStudentCount(loadedStudents.length);
   } catch (err) {
     console.error("Error loading students:", err);
     setError("Error loading students: " + err.message);
   }
 };

 const registerStudent = async (e) => {
   e.preventDefault();
   if (!contract || !isAdmin) return;

   try {
     setLoading(true);
     setError("");

     const tx = await contract.registerStudent(newStudent.id, newStudent.name);
     await tx.wait();

     setNewStudent({ id: "", name: "" });
     await loadStudents();
   } catch (err) {
     console.error("Error registering student:", err);
     setError("Error registering student: " + err.message);
   } finally {
     setLoading(false);
   }
 };

 const removeStudent = async (studentId) => {
   if (!contract || !isAdmin) return;

   try {
     setLoading(true);
     setError("");

     const tx = await contract.removeStudent(studentId);
     await tx.wait();

     await loadStudents();
   } catch (err) {
     console.error("Error removing student:", err);
     setError("Error removing student: " + err.message);
   } finally {
     setLoading(false);
   }
 };

  // Add MetaMask account change listener
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          // Reconnect with new account
          connectWallet();
        } else {
          setAccount("");
          setIsAdmin(false);
          setStudents([]);
        }
      });

      window.ethereum.on("chainChanged", () => {
        // Reload the page when chain changes
        window.location.reload();
      });

      // Initial connection if MetaMask is already unlocked
      if (window.ethereum.selectedAddress) {
        connectWallet();
      }

      return () => {
        // Cleanup listeners
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      };
    }
  }, []);

  // Contract event listeners
  useEffect(() => {
    if (contract) {
      const registeredFilter = contract.filters.StudentRegistered();
      const removedFilter = contract.filters.StudentRemoved();

      contract.on(registeredFilter, (studentId, name) => {
        loadStudents();
      });

      contract.on(removedFilter, (studentId) => {
        loadStudents();
      });

      return () => {
        contract.removeAllListeners(registeredFilter);
        contract.removeAllListeners(removedFilter);
      };
    }
  }, [contract]);

  return (
    <div className="app">
      <div className="container">
        <div className="card header-card">
          <h1>Class Registration System</h1>
          {!account ? (
            <button onClick={connectWallet} className="btn btn-primary">
              Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
              {isAdmin && <span className="admin-badge">Admin</span>}
            </div>
          )}
        </div>

        {error && <div className="alert error">{error}</div>}

        {isAdmin && (
          <div className="card">
            <h2>Register New Student</h2>
            <form onSubmit={registerStudent} className="registration-form">
              <input
                type="number"
                placeholder="Student ID"
                value={newStudent.id}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, id: e.target.value })
                }
                className="input"
                min="0"
                required
              />
              <input
                placeholder="Student Name"
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, name: e.target.value })
                }
                className="input"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="btn btn-success"
              >
                {loading ? <Loader2 className="spinner" /> : "Register"}
              </button>
            </form>
          </div>
        )}

        <div className="card">
          <h2>
            Registered Students{" "}
            <span className="student-count">({studentCount})</span>
          </h2>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.id}</td>
                  <td>{student.name}</td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => removeStudent(student.id)}
                        disabled={loading}
                        className="btn btn-danger"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 3 : 2} className="no-students">
                    No students registered yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ClassRegistrationDApp;
