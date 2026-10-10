// src/App.jsx
import { useCallback, useEffect, useState } from "react";
import {
  connectWallet,
  getConnectedWallet,
  getReadOnlyContract,
  contractAddress
} from "./contract";
import ProductQR from "./ProductQR";
import "./App.css";

const ROLE_NAMES = {
  0: "Unassigned",
  1: "Manufacturer",
  2: "Supplier",
  3: "Retailer",
  4: "Consumer"
};

function shortenAddress(address) {
  if (!address) return "Not available";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [role, setRole] = useState(0);
  const [admin, setAdmin] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Admin: assign a role
  const [roleAddress, setRoleAddress] = useState("");
  const [selectedRole, setSelectedRole] = useState("1");

  // Manufacturer: register a product
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [manufacturerName, setManufacturerName] = useState("");
  const [registeredProductId, setRegisteredProductId] = useState("");

  // Look up existing products and regenerate QR codes
  const [qrLookupId, setQrLookupId] = useState("");
  const [qrProductId, setQrProductId] = useState("");
  const [qrProductDetails, setQrProductDetails] = useState(null);

  // Verify a product
  const [verifyId, setVerifyId] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);

  // Transfer ownership
  const [transferId, setTransferId] = useState("");
  const [newOwner, setNewOwner] = useState("");

  // Ownership history
  const [historyId, setHistoryId] = useState("");
  const [history, setHistory] = useState([]);

  const refreshWallet = useCallback(async () => {
    try {
      const wallet = await getConnectedWallet();

      if (!wallet) {
        setAccount("");
        setContract(null);
        setRole(0);
        setAdmin("");
        return;
      }

      const [walletRole, contractAdmin] = await Promise.all([
        wallet.contract.roles(wallet.account),
        wallet.contract.admin()
      ]);

      setAccount(wallet.account);
      setContract(wallet.contract);
      setRole(Number(walletRole));
      setAdmin(contractAdmin);
    } catch (err) {
      setAccount("");
      setContract(null);
      setRole(0);
      setAdmin("");
      setError(err.message || "Unable to refresh the connected wallet.");
    }
  }, []);

  useEffect(() => {
    refreshWallet();

    if (!window.ethereum) return undefined;

    const handleAccountsChanged = () => {
      setMessage("");
      setError("");
      refreshWallet();
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.ethereum.removeListener(
        "accountsChanged",
        handleAccountsChanged
      );
      window.ethereum.removeListener(
        "chainChanged",
        handleChainChanged
      );
    };
  }, [refreshWallet]);

  const isAdmin =
    account &&
    admin &&
    account.toLowerCase() === admin.toLowerCase();

  async function runAction(action, successMessage) {
    setBusy(true);
    setMessage("");
    setError("");

    try {
      await action();
      if (successMessage) setMessage(successMessage);
    } catch (err) {
      console.error(err);
      setError(
        err?.shortMessage ||
          err?.reason ||
          err?.message ||
          "The operation failed."
      );
    } finally {
      setBusy(false);
    }
  }

  async function handleConnectWallet() {
    await runAction(async () => {
      const wallet = await connectWallet();
      const [walletRole, contractAdmin] = await Promise.all([
        wallet.contract.roles(wallet.account),
        wallet.contract.admin()
      ]);

      setAccount(wallet.account);
      setContract(wallet.contract);
      setRole(Number(walletRole));
      setAdmin(contractAdmin);
    }, "Wallet connected successfully.");
  }

  async function handleAssignRole(event) {
    event.preventDefault();

    if (!ethersAddressIsValid(roleAddress)) {
      setError("Enter a valid Ethereum wallet address.");
      return;
    }

    await runAction(async () => {
      if (!contract) throw new Error("Connect your admin wallet first.");

      const tx = await contract.assignRole(
        roleAddress.trim(),
        Number(selectedRole)
      );
      await tx.wait();

      setRoleAddress("");
    }, "Role assigned successfully.");
  }

  async function handleRegisterProduct(event) {
    event.preventDefault();

    if (!productId.trim() || !productName.trim() || !manufacturerName.trim()) {
      setError("Please fill in all product registration fields.");
      return;
    }

    await runAction(async () => {
      if (!contract) throw new Error("Connect your wallet first.");
      if (role !== 1) {
        throw new Error("Only a Manufacturer can register products.");
      }

      const exists = await contract.verifyProduct(BigInt(productId));
      if (exists) throw new Error("This product ID is already registered.");

      const tx = await contract.registerProduct(
        BigInt(productId),
        productName.trim(),
        manufacturerName.trim()
      );
      await tx.wait();

      const savedId = productId.trim();

      setRegisteredProductId(savedId);

      // Also make the newly registered product available in the
      // permanent QR lookup section.
      setQrLookupId(savedId);
      setQrProductId(savedId);

      const details = await getReadOnlyContract().getProduct(BigInt(savedId));
      setQrProductDetails({
        id: details.id.toString(),
        name: details.name,
        manufacturer: details.manufacturer,
        currentOwner: details.currentOwner,
        registeredAt: details.registeredAt.toString()
      });

      setProductId("");
      setProductName("");
      setManufacturerName("");
    }, "Product registered successfully.");
  }

  async function handleGenerateExistingQR(event) {
    event.preventDefault();

    await runAction(async () => {
      const id = qrLookupId.trim();

      if (!id || !/^\d+$/.test(id)) {
        throw new Error("Enter a valid numeric product ID.");
      }

      // Read-only access means a wallet is not required for this lookup.
      const readContract = getReadOnlyContract();
      const exists = await readContract.verifyProduct(BigInt(id));

      if (!exists) {
        setQrProductId("");
        setQrProductDetails(null);
        throw new Error(`Product ID ${id} was not found on Sepolia.`);
      }

      const details = await readContract.getProduct(BigInt(id));

      setQrProductId(id);
      setQrProductDetails({
        id: details.id.toString(),
        name: details.name,
        manufacturer: details.manufacturer,
        currentOwner: details.currentOwner,
        registeredAt: details.registeredAt.toString()
      });
    }, "Product found. Its QR code is ready.");
  }

  async function handleVerifyProduct(event) {
    event.preventDefault();

    await runAction(async () => {
      const id = verifyId.trim();

      if (!id || !/^\d+$/.test(id)) {
        throw new Error("Enter a valid numeric product ID.");
      }

      const readContract = getReadOnlyContract();
      const exists = await readContract.verifyProduct(BigInt(id));

      if (!exists) {
        setVerificationResult({
          exists: false,
          id
        });
        return;
      }

      const details = await readContract.getProduct(BigInt(id));

      setVerificationResult({
        exists: true,
        id: details.id.toString(),
        name: details.name,
        manufacturer: details.manufacturer,
        currentOwner: details.currentOwner,
        registeredAt: details.registeredAt.toString()
      });
    }, "Product verification completed.");
  }

  async function handleTransferOwnership(event) {
    event.preventDefault();

    if (!ethersAddressIsValid(newOwner)) {
      setError("Enter a valid new-owner wallet address.");
      return;
    }

    await runAction(async () => {
      if (!contract) throw new Error("Connect your wallet first.");

      if (![1, 2, 3].includes(role)) {
        throw new Error(
          "Only Manufacturers, Suppliers, and Retailers can transfer ownership."
        );
      }

      if (!transferId.trim() || !/^\d+$/.test(transferId.trim())) {
        throw new Error("Enter a valid numeric product ID.");
      }

      const tx = await contract.transferOwnership(
        BigInt(transferId),
        newOwner.trim()
      );
      await tx.wait();

      setNewOwner("");
    }, "Ownership transferred successfully.");
  }

  async function handleLoadHistory(event) {
    event.preventDefault();

    await runAction(async () => {
      const id = historyId.trim();

      if (!id || !/^\d+$/.test(id)) {
        throw new Error("Enter a valid numeric product ID.");
      }

      const readContract = getReadOnlyContract();
      const exists = await readContract.verifyProduct(BigInt(id));

      if (!exists) throw new Error(`Product ID ${id} was not found.`);

      const count = Number(
        await readContract.getTransferCount(BigInt(id))
      );

      const records = await Promise.all(
        Array.from({ length: count }, async (_, index) => {
          const record = await readContract.getTransferRecord(
            BigInt(id),
            BigInt(index)
          );

          return {
            previousOwner: record.previousOwner,
            newOwner: record.newOwner,
            timestamp: record.timestamp.toString()
          };
        })
      );

      setHistory(records);
    }, "Ownership history loaded.");
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>Blockchain Product Traceability</h1>
        <p>
          Register products, transfer ownership, and verify product history
          using the Ethereum Sepolia test network.
        </p>

        <button
          type="button"
          onClick={handleConnectWallet}
          disabled={busy}
        >
          {account ? "Wallet Connected" : "Connect MetaMask"}
        </button>

        {account && (
          <div className="wallet-info">
            <p>
              <strong>Connected account:</strong> {shortenAddress(account)}
            </p>
            <p>
              <strong>Your role:</strong> {ROLE_NAMES[role] || "Unassigned"}
            </p>
          </div>
        )}
      </header>

      {message && (
        <div className="result success-message" role="status">
          {message}
        </div>
      )}

      {error && (
        <div className="result error-message" role="alert">
          {error}
        </div>
      )}

      <section className="card">
        <h2>Product Lookup &amp; QR Code</h2>
        <p>
          Enter any registered product ID to retrieve its information and
          generate its QR code again. This section does not require MetaMask.
        </p>

        <form onSubmit={handleGenerateExistingQR}>
          <label htmlFor="qrLookupId">Existing Product ID</label>
          <input
            id="qrLookupId"
            type="number"
            min="1"
            value={qrLookupId}
            onChange={(event) => setQrLookupId(event.target.value)}
            placeholder="e.g. 2001"
            required
          />

          <button type="submit" disabled={busy}>
            Find Product &amp; Generate QR
          </button>
        </form>

        {qrProductDetails && qrProductId && (
          <div className="result">
            <h3>Product Details</h3>
            <p>
              <strong>ID:</strong> {qrProductDetails.id}
            </p>
            <p>
              <strong>Name:</strong> {qrProductDetails.name}
            </p>
            <p>
              <strong>Manufacturer:</strong> {qrProductDetails.manufacturer}
            </p>
            <p>
              <strong>Current owner:</strong>{" "}
              {shortenAddress(qrProductDetails.currentOwner)}
            </p>

            <ProductQR productId={qrProductId} />
          </div>
        )}
      </section>

      {account && role === 1 && (
        <section className="card">
          <h2>Register a New Product</h2>
          <p>Only a Manufacturer can register a product.</p>

          <form onSubmit={handleRegisterProduct}>
            <label htmlFor="productId">Product ID</label>
            <input
              id="productId"
              type="number"
              min="1"
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
              placeholder="e.g. 2002"
              required
            />

            <label htmlFor="productName">Product Name</label>
            <input
              id="productName"
              value={productName}
              onChange={(event) => setProductName(event.target.value)}
              placeholder="e.g. Smart Watch"
              required
            />

            <label htmlFor="manufacturerName">Manufacturer Name</label>
            <input
              id="manufacturerName"
              value={manufacturerName}
              onChange={(event) => setManufacturerName(event.target.value)}
              placeholder="e.g. ABC Electronics"
              required
            />

            <button type="submit" disabled={busy}>
              Register Product
            </button>
          </form>

          {registeredProductId && (
            <div className="result">
              <h3>New Product Registered</h3>
              <p>
                Product ID: <strong>{registeredProductId}</strong>
              </p>
              <p>
                You can retrieve this QR code later using the Product Lookup
                section above.
              </p>
              <ProductQR productId={registeredProductId} />
            </div>
          )}
        </section>
      )}

      {account && isAdmin && (
        <section className="card">
          <h2>Admin: Assign a Role</h2>

          <form onSubmit={handleAssignRole}>
            <label htmlFor="roleAddress">Wallet Address</label>
            <input
              id="roleAddress"
              value={roleAddress}
              onChange={(event) => setRoleAddress(event.target.value)}
              placeholder="0x..."
              required
            />

            <label htmlFor="selectedRole">Role</label>
            <select
              id="selectedRole"
              value={selectedRole}
              onChange={(event) => setSelectedRole(event.target.value)}
            >
              <option value="1">Manufacturer</option>
              <option value="2">Supplier</option>
              <option value="3">Retailer</option>
              <option value="4">Consumer</option>
              <option value="0">Unassigned</option>
            </select>

            <button type="submit" disabled={busy}>
              Assign Role
            </button>
          </form>
        </section>
      )}

      {account && [1, 2, 3].includes(role) && (
        <section className="card">
          <h2>Transfer Product Ownership</h2>
          <p>
            Your role is {ROLE_NAMES[role]}. The smart contract enforces the
            permitted ownership-transfer sequence.
          </p>

          <form onSubmit={handleTransferOwnership}>
            <label htmlFor="transferId">Product ID</label>
            <input
              id="transferId"
              type="number"
              min="1"
              value={transferId}
              onChange={(event) => setTransferId(event.target.value)}
              placeholder="e.g. 2001"
              required
            />

            <label htmlFor="newOwner">Next Owner Wallet Address</label>
            <input
              id="newOwner"
              value={newOwner}
              onChange={(event) => setNewOwner(event.target.value)}
              placeholder="0x..."
              required
            />

            <button type="submit" disabled={busy}>
              Transfer Ownership
            </button>
          </form>
        </section>
      )}

      <section className="card">
        <h2>Verify Product</h2>
        <p>
          Check whether a product is registered and view its current owner.
          MetaMask is not required.
        </p>

        <form onSubmit={handleVerifyProduct}>
          <label htmlFor="verifyId">Product ID</label>
          <input
            id="verifyId"
            type="number"
            min="1"
            value={verifyId}
            onChange={(event) => setVerifyId(event.target.value)}
            placeholder="e.g. 2001"
            required
          />

          <button type="submit" disabled={busy}>
            Verify Product
          </button>
        </form>

        {verificationResult && (
          <div className="result">
            {verificationResult.exists ? (
              <>
                <h3>Product Registered</h3>
                <p>
                  <strong>Product ID:</strong> {verificationResult.id}
                </p>
                <p>
                  <strong>Name:</strong> {verificationResult.name}
                </p>
                <p>
                  <strong>Manufacturer:</strong>{" "}
                  {verificationResult.manufacturer}
                </p>
                <p>
                  <strong>Current owner:</strong>{" "}
                  {verificationResult.currentOwner}
                </p>
                <p>
                  <strong>Registered at:</strong>{" "}
                  {new Date(
                    Number(verificationResult.registeredAt) * 1000
                  ).toLocaleString()}
                </p>
              </>
            ) : (
              <p>Product ID {verificationResult.id} is not registered.</p>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Ownership History</h2>
        <p>
          View the on-chain registration and ownership-transfer records for a
          product.
        </p>

        <form onSubmit={handleLoadHistory}>
          <label htmlFor="historyId">Product ID</label>
          <input
            id="historyId"
            type="number"
            min="1"
            value={historyId}
            onChange={(event) => setHistoryId(event.target.value)}
            placeholder="e.g. 2001"
            required
          />

          <button type="submit" disabled={busy}>
            Load History
          </button>
        </form>

        {history.length > 0 && (
          <div className="history-list">
            {history.map((record, index) => (
              <div className="history-item" key={`${record.timestamp}-${index}`}>
                <h3>Record {index + 1}</h3>
                <p>
                  <strong>Previous owner:</strong>{" "}
                  {record.previousOwner}
                </p>
                <p>
                  <strong>New owner:</strong> {record.newOwner}
                </p>
                <p>
                  <strong>Timestamp:</strong>{" "}
                  {new Date(
                    Number(record.timestamp) * 1000
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        {history.length === 0 && historyId && (
          <p>No history loaded yet, or the selected product has no records.</p>
        )}
      </section>

      <footer className="app-footer">
        <p>
          Network: Ethereum Sepolia testnet
        </p>
        <p>
          Contract: {shortenAddress(contractAddress)}
        </p>
        <p>
          <a
            href="https://sepolia.etherscan.io/address/0xfC78A41Dc3cbDC228231A3F5Ec5f9fde98d6669A"
            target="_blank"
            rel="noreferrer"
          >
            View contract on Sepolia Etherscan
          </a>
        </p>
      </footer>
    </main>
  );
}

function ethersAddressIsValid(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address.trim());
}

export default App;