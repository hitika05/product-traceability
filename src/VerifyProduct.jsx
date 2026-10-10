// src/VerifyProduct.jsx
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { contractAddress, getReadOnlyContract } from "./contract";
import "./App.css";

function VerifyProduct() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProduct() {
      setLoading(true);
      setError("");
      setProduct(null);
      setHistory([]);

      try {
        if (!/^\d+$/.test(productId || "")) {
          throw new Error("Invalid product ID.");
        }

        const contract = getReadOnlyContract();
        const id = BigInt(productId);
        const exists = await contract.verifyProduct(id);

        if (!exists) {
          throw new Error("This product is not registered on the blockchain.");
        }

        const details = await contract.getProduct(id);
        const count = Number(await contract.getTransferCount(id));

        const records = await Promise.all(
          Array.from({ length: count }, async (_, index) => {
            const record = await contract.getTransferRecord(
              id,
              BigInt(index)
            );

            return {
              previousOwner: record.previousOwner,
              newOwner: record.newOwner,
              timestamp: record.timestamp.toString()
            };
          })
        );

        if (!cancelled) {
          setProduct({
            id: details.id.toString(),
            name: details.name,
            manufacturer: details.manufacturer,
            currentOwner: details.currentOwner,
            registeredAt: details.registeredAt.toString()
          });
          setHistory(records);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Unable to verify this product.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProduct();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return (
    <main className="app">
      <header className="app-header">
        <h1>Product Authenticity Verification</h1>
        <p>Product information and ownership records from the blockchain.</p>
      </header>

      <section className="card">
        {loading && <p>Checking the blockchain...</p>}

        {error && (
          <div className="result error-message">
            <h2>Verification Failed</h2>
            <p>{error}</p>
          </div>
        )}

        {product && !loading && (
          <div className="result">
            <h2>Product Registered</h2>
            <p>
              <strong>Product ID:</strong> {product.id}
            </p>
            <p>
              <strong>Product name:</strong> {product.name}
            </p>
            <p>
              <strong>Manufacturer:</strong> {product.manufacturer}
            </p>
            <p>
              <strong>Current owner:</strong> {product.currentOwner}
            </p>
            <p>
              <strong>Registration time:</strong>{" "}
              {new Date(
                Number(product.registeredAt) * 1000
              ).toLocaleString()}
            </p>

            <h3>Ownership History</h3>

            {history.map((record, index) => (
              <div
                className="history-item"
                key={`${record.timestamp}-${index}`}
              >
                <h4>Record {index + 1}</h4>
                <p>
                  <strong>Previous owner:</strong> {record.previousOwner}
                </p>
                <p>
                  <strong>New owner:</strong> {record.newOwner}
                </p>
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(
                    Number(record.timestamp) * 1000
                  ).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <p>
          <strong>Smart contract:</strong> {contractAddress}
        </p>

        <p>
          <a
            href={`https://sepolia.etherscan.io/address/${contractAddress}`}
            target="_blank"
            rel="noreferrer"
          >
            View contract on Etherscan
          </a>
        </p>

        <Link to="/">Return to the application</Link>
      </section>
    </main>
  );
}

export default VerifyProduct;