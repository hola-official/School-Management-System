import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { Loader2, Search, UserMinus, UserPlus } from "lucide-react";
import { toast } from "react-toastify";
import abi from "./abi.json";

const CONTRACT_ADDRESS = "0xe4726d0fb94f1Bd78047752414fFAB43bE9f7697";

const ClassRegistrationDApp = () => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [registerForm, setRegisterForm] = useState({
    name: "",
    studentId: "",
  });
  const [removeForm, setRemoveForm] = useState({
    studentId: "",
  });
  const [searchForm, setSearchForm] = useState({
    studentId: "",
  });
  const [studentDetails, setStudentDetails] = useState(null);

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== 4202) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: 4202 }],
          });
        } catch (error) {
          if (error.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [REQUIRED_NETWORK],
              });
            } catch (addError) {
              toast.error("Please add Sepolia network to MetaMask");
            }
          }
        }
      }
      // Update network name
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      setNetworkName(network.name);
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("Please install MetaMask!");
      }

      setLoading(true);
      await checkNetwork();

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      setAccount(accounts[0]);

      toast.success("Wallet connected successfully!");
    } catch (err) {
      console.error("Connection error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getContractInstance = async (needSigner = true) => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask!");
    }

    await checkNetwork();
    const provider = new ethers.BrowserProvider(window.ethereum);
    if (needSigner) {
      const signer = await provider.getSigner();
      return new ethers.Contract(CONTRACT_ADDRESS, abi, signer);
    }
    return new ethers.Contract(CONTRACT_ADDRESS, abi, provider);
  };

  const handleRegisterStudent = async (e) => {
    e.preventDefault();
    if (!registerForm.name || !registerForm.studentId) return;

    try {
      setLoading(true);
      const contract = await getContractInstance();

      toast.info("Registering student...");
      const tx = await contract.registerStudent(
        registerForm.studentId,
        registerForm.name
      );
      await tx.wait();

      setRegisterForm({ name: "", studentId: "" });
      toast.success("Student registered successfully!");
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (e) => {
    e.preventDefault();
    if (!removeForm.studentId) return;

    try {
      setLoading(true);
      const contract = await getContractInstance();

      toast.info("Removing student...");
      const tx = await contract.removeStudent(removeForm.studentId);
      await tx.wait();

      setRemoveForm({ studentId: "" });
      setStudentDetails(null);
      toast.success("Student removed successfully!");
    } catch (err) {
      console.error("Remove error:", err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetStudentById = async (e) => {
    e.preventDefault();
    if (!searchForm.studentId) return;

    try {
      setLoading(true);
      const contract = await getContractInstance(false);

      toast.info("Fetching student details...");
      const result = await contract.getStudentById(searchForm.studentId);
      setSearchForm;
      setStudentDetails(result);
      toast.success("Student details retrieved!");
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.message);
      setStudentDetails(null);
    } finally {
      setLoading(false);
    }
  };
  // Listen for account and network changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0] || "");
      });

      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

      // Check initial connection
      window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkNetwork();
        }
      });

      return () => {
        window.ethereum.removeAllListeners("accountsChanged");
        window.ethereum.removeAllListeners("chainChanged");
      };
    }
  }, []);

  return (
    <div className="app-container">
      <div className="app-content">
        <header className="header">
          <h1>Student Registration</h1>
          <div className="wallet-info">
            {networkName && (
              <span className="network-badge">
                Network: {networkName ? "Lisk" : "Unknown"}
              </span>
            )}
            {!account ? (
              <button
                onClick={connectWallet}
                disabled={loading}
                className="button button-blue"
              >
                {loading ? <Loader2 className="spinner" /> : "Connect Wallet"}
              </button>
            ) : (
              <span className="network-badge">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
            )}
          </div>
        </header>

        {account ? (
          <div className="forms-grid">
            {/* Register Form */}
            <div className="card">
              <div className="card-header">
                <UserPlus />
                <h2 className="card-title">Register New Student</h2>
              </div>
              <form onSubmit={handleRegisterStudent} className="form">
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Student Name"
                    value={registerForm.name}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    className="input"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Student ID"
                    value={registerForm.studentId}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        studentId: e.target.value,
                      }))
                    }
                    className="input"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="button button-blue"
                >
                  {loading ? (
                    <Loader2 className="spinner" />
                  ) : (
                    "Register Student"
                  )}
                </button>
              </form>
            </div>

            {/* Remove Form */}
            <div className="card">
              <div className="card-header">
                <UserMinus />
                <h2 className="card-title">Remove Student</h2>
              </div>
              <form onSubmit={handleRemoveStudent} className="form">
                <input
                  type="text"
                  placeholder="Student ID"
                  value={removeForm.studentId}
                  onChange={(e) => setRemoveForm({ studentId: e.target.value })}
                  className="input"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="button button-red"
                >
                  {loading ? <Loader2 className="spinner" /> : "Remove Student"}
                </button>
              </form>
            </div>

            {/* Search Form */}
            <div className="card">
              <div className="card-header">
                <Search />
                <h2 className="card-title">Search Student</h2>
              </div>
              <form onSubmit={handleGetStudentById} className="form">
                <input
                  type="text"
                  placeholder="Student ID"
                  value={searchForm.studentId}
                  onChange={(e) => setSearchForm({ studentId: e.target.value })}
                  className="input"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="button button-green"
                >
                  {loading ? <Loader2 className="spinner" /> : "Search"}
                </button>
              </form>
            </div>

            {/* Student Details */}
            {studentDetails && (
              <div className="card">
                <h2 className="card-title">Student Details</h2>
                <div className="student-details">
                  <p>
                    <span className="label">Name:</span>
                    <span>{studentDetails.name}</span>
                  </p>
                  <p>
                    <span className="label">Status:</span>
                    <span
                      className={`status-badge ${
                        studentDetails.isRegistered
                          ? "registered"
                          : "not-registered"
                      }`}
                    >
                      {studentDetails.isRegistered
                        ? "Registered"
                        : "Not Registered"}
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <p className="text-center">
              Please connect your wallet to interact with the application.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassRegistrationDApp;
