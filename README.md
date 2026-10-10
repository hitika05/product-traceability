# Blockchain-Based Secure Product Ownership Transfer and Traceability System

## 1. Project Overview

The **Blockchain-Based Secure Product Ownership Transfer and Traceability System** is a decentralized application designed to improve product traceability, ownership transparency, and product record verification using blockchain technology.

The system uses Ethereum smart contracts to register products, manage ownership transfers across different supply-chain participants, and maintain a verifiable history of ownership transactions. Each product can be associated with a QR code that opens a public verification page, allowing users to view product information and its ownership history without connecting a cryptocurrency wallet.

The prototype is developed using Solidity, Ethereum Sepolia Testnet, Remix IDE, MetaMask, React, Vite, ethers.js, and Vercel.

## 2. Problem Statement

Traditional product ownership and supply-chain tracking systems often depend on centralized databases and manually maintained records. Such systems can make it difficult to independently verify ownership history, identify unauthorized ownership changes, and provide transparent product information to consumers.

A blockchain-based solution can maintain a shared, tamper-resistant transaction history and enforce ownership-transfer rules through smart contracts.

This project addresses the problem by developing a decentralized product registration and ownership tracking system that records product registration and subsequent ownership transfers on the Ethereum blockchain.

## 3. Objectives

- To develop a blockchain-based product registration system.
- To implement role-based access control for supply-chain participants.
- To enable secure ownership transfers through Solidity smart contracts.
- To maintain a transparent, on-chain ownership history.
- To generate QR codes linked to product verification pages.
- To allow public verification of registered products without requiring MetaMask.
- To demonstrate smart contract deployment, execution, validation, and transaction verification on Ethereum Sepolia.
- To evaluate the functional correctness of the prototype through practical testing.

## 4. Proposed Solution

The proposed solution combines a React web application with an Ethereum smart contract.

Manufacturers register products through the application. The smart contract records product details and the initial owner. Ownership can subsequently be transferred through the permitted sequence:

**Manufacturer → Supplier → Retailer → Consumer**

The smart contract validates ownership and permitted transitions before accepting a transfer. Registration and ownership-transfer records are stored on-chain.

A QR code is generated for each product and links to its public verification page. When the QR code is scanned, the application retrieves the corresponding blockchain record and displays the product details, current owner, and ownership history.

The application uses MetaMask for blockchain transactions, while read-only verification can be performed without connecting a wallet.

## 5. Benefits of Using Blockchain

- **Transparency:** Product registration and ownership transfers can be independently inspected on the blockchain.
- **Traceability:** Ownership history is recorded as a sequence of blockchain transactions.
- **Tamper resistance:** Confirmed blockchain records cannot ordinarily be modified or deleted by a single application administrator.
- **Smart contract enforcement:** Ownership-transfer conditions are checked by the deployed contract.
- **Public verification:** Users can inspect registered product information through a QR-linked verification page.
- **Decentralized record keeping:** The product ownership ledger is maintained by the blockchain network rather than solely by the application's database.
- **Auditability:** Transactions can be examined using a blockchain explorer.

## 6. System Architecture

The system consists of the following components:

### 6.1 User Layer

The application supports the following roles:

- **Admin:** Assigns roles to blockchain addresses.
- **Manufacturer:** Registers products and transfers ownership to suppliers.
- **Supplier:** Receives products from manufacturers and transfers them to retailers.
- **Retailer:** Receives products from suppliers and transfers them to consumers.
- **Consumer:** Receives products and verifies product information and ownership history.

### 6.2 Frontend Layer

The frontend is developed using React and Vite. It provides interfaces for:

- Connecting a MetaMask wallet.
- Registering products.
- Assigning user roles.
- Transferring product ownership.
- Generating QR codes.
- Verifying products.
- Viewing ownership history.

### 6.3 Blockchain Layer

The application interacts with a Solidity smart contract deployed on the Ethereum Sepolia Testnet.

The contract handles product registration, role management, ownership validation, ownership transfers, and retrieval of product and ownership-history records.

### 6.4 Wallet Layer

MetaMask connects users to Ethereum Sepolia and signs transactions that modify blockchain state.

### 6.5 Verification Layer

The public verification page reads product information and ownership history through a read-only blockchain provider. This allows product verification without requiring a wallet connection.

### 6.6 Deployment Layer

- **Smart contract:** Ethereum Sepolia Testnet
- **Smart contract development and deployment:** Remix IDE
- **Frontend hosting:** Vercel
- **Source code management:** GitHub

## 7. Technology Stack

| Component | Technology |
|---|---|
| Frontend | React.js |
| Development server and build tool | Vite |
| Smart contract language | Solidity |
| Blockchain platform | Ethereum Sepolia Testnet |
| Smart contract IDE | Remix IDE |
| Wallet | MetaMask |
| Blockchain interaction library | ethers.js |
| QR code generation | qrcode.react |
| QR code scanning | html5-qrcode |
| Frontend deployment | Vercel |
| Version control | Git and GitHub |

## 8. Smart Contract Functionality

The deployed `ProductRegistryRoles` smart contract implements the following main functions:

| Function | Purpose |
|---|---|
| `assignRole()` | Assigns a role to a blockchain address; restricted to the administrator. |
| `registerProduct()` | Registers a product with its ID, name, and manufacturer information. |
| `verifyProduct()` | Checks whether a product ID is registered. |
| `getProduct()` | Retrieves product information and current ownership. |
| `transferOwnership()` | Transfers ownership subject to contract validation. |
| `getTransferCount()` | Returns the number of recorded ownership-history entries. |
| `getTransferRecord()` | Retrieves an individual ownership-history record. |

The contract also emits events for product registration, ownership transfers, and role assignments.

### Ownership Transfer Rules

The smart contract permits the following ownership transitions:

1. Manufacturer → Supplier
2. Supplier → Retailer
3. Retailer → Consumer

A transfer must be initiated by the product's current owner. Invalid transitions and unauthorized ownership changes are rejected by the smart contract.

## 9. Application Workflow

1. The administrator assigns roles to Ethereum addresses.
2. A manufacturer connects MetaMask and registers a product.
3. The smart contract validates the registration transaction and records the product.
4. The application generates a QR code linked to the product's verification page.
5. The manufacturer transfers ownership to a supplier.
6. The supplier transfers ownership to a retailer.
7. The retailer transfers ownership to a consumer.
8. Each successful ownership transfer is recorded on the blockchain.
9. A user scans the product QR code or opens its verification link.
10. The verification page retrieves product details and ownership history from Ethereum Sepolia.
11. Users can inspect the records without connecting MetaMask.

## 10. Implementation Details

The prototype was implemented using Remix IDE for Solidity contract development and deployment, and React for the frontend.

The `ProductRegistryRoles` contract was deployed to Ethereum Sepolia. The frontend uses ethers.js to connect to MetaMask for write operations and a read-only JSON-RPC provider for product verification.

The application supports role-specific interfaces, product registration, ownership transfers, QR code generation, and public product verification.

The ownership history is retrieved from the smart contract's recorded history entries. The deployed frontend is hosted on Vercel, and the source code is maintained in GitHub.

### Deployed Smart Contract

- **Network:** Ethereum Sepolia Testnet
- **Contract:** `ProductRegistryRoles`
- **Contract address:** `0xfC78A41Dc3cbDC228231A3F5Ec5f9fde98d6669A`
- **Explorer:** [View contract on Sepolia Etherscan](https://sepolia.etherscan.io/address/0xfC78A41Dc3cbDC228231A3F5Ec5f9fde98d6669A)

## 11. Testing and Validation

The following functional tests were performed on the prototype:

| Test Case | Expected Result | Status |
|---|---|---|
| Connect MetaMask on Sepolia | Wallet connects successfully | Passed |
| Assign roles | Authorized administrator assigns roles | Passed |
| Register a product | Product is recorded on-chain | Passed |
| Register an existing product ID again | Duplicate registration is rejected | Passed |
| Transfer Manufacturer → Supplier | Valid transfer succeeds | Passed |
| Transfer Supplier → Retailer | Valid transfer succeeds | Passed |
| Transfer Retailer → Consumer | Valid transfer succeeds | Passed |
| Transfer from an unauthorized owner | Transfer is rejected | Passed |
| Verify a registered product | Product details are displayed | Passed |
| Verify an unregistered product | Product is reported as unregistered | Passed |
| View ownership history | Registration and transfer records are displayed | Passed |
| Generate a QR code | QR code links to product verification | Passed |
| Public verification | Product details can be retrieved without MetaMask | Passed |
| Verify a deployed product using its public URL | Product details and history are displayed | Passed |

**Testing note:** These results describe the functional tests performed on the prototype. They do not constitute a formal security audit, load test, or proof of physical-product authenticity.

## 12. Security Considerations

- Smart contract functions enforce role and ownership restrictions for state-changing operations.
- Transactions that modify blockchain state require an authorized wallet signature.
- The smart contract checks the current owner before allowing an ownership transfer.
- Public verification uses read-only blockchain access.
- The Sepolia network is a test network and should not be treated as a production deployment.
- QR codes link to product records but do not independently prove that a physical product is genuine.
- A copied QR code may direct users to the same legitimate product record.
- The current prototype does not implement cryptographic product-hash comparison or location-based counterfeit detection.
- Private keys, recovery phrases, and sensitive credentials must never be committed to GitHub.
- The prototype has not undergone an independent smart contract security audit.

## 13. Limitations

- The application is deployed on Ethereum Sepolia rather than Ethereum Mainnet.
- The prototype uses predefined product roles and ownership transitions.
- Product authenticity is based on the registered blockchain record; physical-item authentication is not independently established.
- Cryptographic product-hash verification is not implemented.
- Location-based supply-chain verification is not implemented.
- Performance under large-scale transaction volumes has not been formally evaluated.

## 14. Future Enhancements

- Add cryptographic product-hash generation and verification.
- Introduce additional supply-chain checkpoint and status tracking.
- Explore physical-product authentication mechanisms such as tamper-evident labels or secure identifiers.
- Add automated testing and formal smart contract security analysis.
- Conduct transaction performance and scalability testing.
- Explore production-grade identity management and deployment options.

## 15. Running the Project Locally

### Prerequisites

- Node.js and npm
- Git
- MetaMask browser extension
- Access to the Ethereum Sepolia network

### Installation

Clone the repository:

```bash
git clone https://github.com/hitika05/product-traceability.git
cd product-traceability
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173/`.

### Using the Application

1. Connect MetaMask and select Ethereum Sepolia for write operations.
2. Use an address with the appropriate role to register a product or transfer ownership.
3. Use the Product Lookup section to retrieve product details and generate a QR code.
4. Open a verification link such as `/verify/2001` to view public product details and ownership history.

**Note:** A local QR link containing `localhost` will only work on the computer running the application. Use the deployed Vercel URL for verification from other devices.

## 16. Project Deployment

The frontend is deployed on Vercel, while the smart contract is deployed on Ethereum Sepolia.

The application can be accessed using the project's Vercel deployment URL. Replace the placeholder below with the final public URL:

**Live Application:** `https://product-traceability.vercel.app/`

## 17. Research Reference

This project is inspired by the following research paper:

**Title:** Decentralized framework for product security using blockchain and smart contract-based QR verification

**Publisher:** Springer Nature

**DOI:** [10.1007/s42452-026-08542-z](https://doi.org/10.1007/s42452-026-08542-z)

The project implements a subset of the concepts relevant to blockchain-based product registration, ownership traceability, smart contract validation, and QR-based verification. It is an independent prototype and is not a complete reproduction of the paper's system.

## 18. Conclusion

The Blockchain-Based Secure Product Ownership Transfer and Traceability System demonstrates how Ethereum smart contracts can be used to maintain product registration records, enforce ownership-transfer rules, and provide transparent ownership history.

By integrating a React frontend, MetaMask, QR codes, and a public verification page, the prototype enables users to interact with blockchain records through a web application.

The project demonstrates the practical application of blockchain technology to product traceability and ownership management while identifying cryptographic product verification, physical-product authentication, and scalability evaluation as areas for future development.
