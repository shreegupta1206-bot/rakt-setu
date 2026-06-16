# 🩸 RaktSetu - Blood Bank Management System

## 📌 Project Overview

RaktSetu is a modern web-based Blood Bank Management System designed to bridge the gap between **patients, hospitals, blood donors, and blood banks**. The platform provides a centralized network where hospitals can request blood, donors can register and donate, patients can find required blood groups, and blood banks can efficiently manage their inventory.

The main goal of RaktSetu is to reduce delays in blood availability and create a faster, more reliable blood donation ecosystem.

---

# 🚀 Features

## 👤 Donor Module

* Donor registration and secure login.
* Create and manage donor profiles.
* Update availability status for blood donation.
* View blood donation history.
* Receive notifications for urgent blood requests.
* Search nearby blood donation camps and requests.

## 🏥 Hospital Module

* Hospital registration and authentication.
* Raise emergency blood requests.
* Search available blood units across connected blood banks.
* Track request status.
* Manage patient blood requirements.

## 🩸 Blood Bank Module

* Manage blood inventory.
* Add, update, and remove blood stock.
* Monitor blood availability by blood group.
* Approve or reject hospital requests.
* Maintain donor and donation records.

## 🧑‍⚕️ Patient Module

* Register patient information.
* Search for required blood groups.
* Connect with hospitals and donors.
* Track blood request progress.

## 🔐 Authentication & Security

* Secure user authentication.
* Role-based access control.
* Password encryption and secure data handling.
* Protected routes for authorized users.

---

# 🛠️ Technology Stack

## Frontend

The frontend of the application is built using:

* **React.js** - Component-based user interface development.
* **Tailwind CSS** - Utility-first CSS framework for responsive and modern UI.
* **React Router** - Client-side routing and navigation.
* **Axios** - Handling API requests between frontend and backend.

---

## Backend

The backend is developed using:

* **Node.js** - JavaScript runtime environment.
* **Express.js** - Backend framework for building REST APIs.
* **REST API** - Communication layer between frontend and database.
* **JWT Authentication** - Secure user login and authorization.

---

## Database

The system stores and manages data such as:

* User accounts.
* Donor details.
* Hospital records.
* Patient information.
* Blood inventory.
* Blood requests.
* Donation history.

*(The database can be integrated using MongoDB, MySQL, or any preferred database system.)*

---

# 🏗️ System Architecture

```
              React + Tailwind Frontend
                        |
                        |
                     Axios
                        |
                        |
                Express.js REST API
                        |
                        |
                    Database
                        |
    --------------------------------------------
    |                    |                     |
 Blood Banks          Hospitals             Donors
    |
 Patients & Blood Requests
```

---

# 📂 Project Structure

```
RaktSetu/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── App.jsx
│   │
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── config/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation & Setup

## Prerequisites

Make sure the following are installed on your system:

* Node.js
* npm or yarn
* Database service (MongoDB/MySQL)

---

## Clone the Repository

```bash
git clone <repository-url>
cd RaktSetu
```

---

## Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
npm install
npm run dev
```

The frontend server will start at:

```
http://localhost:5173
```

---

## Backend Setup

Open a new terminal and navigate to the backend directory:

```bash
cd backend
npm install
npm start
```

The backend server will start at:

```
http://localhost:5000
```

---

# 🔄 API Communication Flow

1. User performs an action from the React frontend.
2. Axios sends an HTTP request to the Express API.
3. The backend validates the request and interacts with the database.
4. The database returns the required information.
5. The API sends the response back to the frontend.
6. The frontend updates the UI dynamically.

---

# 🎯 Future Enhancements

* Real-time emergency blood request alerts.
* AI-based donor matching.
* Location-based nearest donor search.
* Integration with hospitals and government blood banks.
* Email and SMS notification system.
* Blood donation appointment scheduling.
* Analytics dashboard for blood availability.

---

# 👥 Stakeholders

* 🩸 Blood Donors
* 🏥 Hospitals
* 👨‍⚕️ Patients
* 🏢 Blood Banks
* 👨‍💻 Administrators

---

# 🤝 Contribution

Contributions are welcome! Feel free to fork the repository, create a feature branch, and submit a pull request.

---

# 📄 License

This project is licensed under the MIT License. You are free to use, modify, and distribute this software.

---

# ❤️ Mission

**"Connecting lives through blood — one donation at a time."**

RaktSetu aims to create a seamless digital bridge between donors, patients, hospitals, and blood banks to ensure that no life is lost due to the unavailability of blood.
