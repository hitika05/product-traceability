// src/contract.js
import { ethers } from "ethers";

export const contractAddress =
  "0xfC78A41Dc3cbDC228231A3F5Ec5f9fde98d6669A";

export const contractABI = [
  "function admin() view returns (address)",
  "function roles(address account) view returns (uint8)",
  "function assignRole(address account, uint8 role)",
  "function registerProduct(uint256 productId, string name, string manufacturer)",
  "function verifyProduct(uint256 productId) view returns (bool)",
  "function getProduct(uint256 productId) view returns (uint256 id, string name, string manufacturer, address currentOwner, uint256 registeredAt)",
  "function transferOwnership(uint256 productId, address newOwner)",
  "function getTransferCount(uint256 productId) view returns (uint256)",
  "function getTransferRecord(uint256 productId, uint256 index) view returns (address previousOwner, address newOwner, uint256 timestamp)",
  "event ProductRegistered(uint256 indexed productId, address indexed owner, string name)",
  "event OwnershipTransferred(uint256 indexed productId, address indexed previousOwner, address indexed newOwner, uint256 timestamp)",
  "event RoleAssigned(address indexed account, uint8 role)"
];

const SEPOLIA_CHAIN_ID = "0xaa36a7";

export async function connectWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts"
  });

  if (!accounts.length) {
    throw new Error("Please connect a MetaMask account.");
  }

  const chainId = await window.ethereum.request({
    method: "eth_chainId"
  });

  if (chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error("Please select the Sepolia network in MetaMask.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return {
    account: await signer.getAddress(),
    contract
  };
}

export async function getConnectedWallet() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed.");
  }

  const accounts = await window.ethereum.request({
    method: "eth_accounts"
  });

  if (!accounts.length) {
    return null;
  }

  const chainId = await window.ethereum.request({
    method: "eth_chainId"
  });

  if (chainId !== SEPOLIA_CHAIN_ID) {
    throw new Error("Please select the Sepolia network in MetaMask.");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(
    contractAddress,
    contractABI,
    signer
  );

  return {
    account: await signer.getAddress(),
    contract
  };
}

export function getReadOnlyContract() {
  const provider = new ethers.JsonRpcProvider(
    "https://ethereum-sepolia-rpc.publicnode.com"
  );

  return new ethers.Contract(
    contractAddress,
    contractABI,
    provider
  );
}