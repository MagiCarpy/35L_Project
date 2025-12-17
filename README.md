# UCLA Delivery Network (35L Project)

> Deployed at: www.carpp.org (as of 12/5/2025)

UCLA specific, all-purpose delivery request service. Convenient for students that live on campus, especially apartments, that would like to avoid hours wasted traversing across campus by connecting them with students willing to assist in a variety of delivery services for a quick buck (or other incentive). These requests can include dorm or class specific food delivery, peer-to-peer package delivery, or even more general requests that can be described and then completed by anyone interested in the task.

## Features

- **Real-Time Map Interface**: View active delivery requests on an interactive map of the UCLA campus.
- **Live Tracking**: Track the status of your delivery from "Open" to "Accepted" to "Completed" in real-time.
- **Request Management**:
  - **Requesters**: Create new requests with pickup/dropoff locations and item details.
  - **Helpers**: Browse and accept open requests to help fellow students.
- **Delivery Confirmation**: Photo upload verification for completed deliveries.
- **Responsive Design**: UI that provides pleasant viewing on both desktop and mobile.

## Tech Stack

| Frontend                  | Backend             |
| ------------------------- | ------------------- |
| • React                   | • Node.js & Express |
| • Vite                    | • MySQL             |
| • Tailwind CSS            | • Sequelize         |
| • Leaflet / React-Leaflet | • OpenRouteService  |

## Project Structure

- **`frontend/`**: React application source code.
  - `src/pages/`: Main page components (Map, Login, Profile).
  - `src/components/`: Reusable UI components.
  - `src/context/`: React context for Auth and Toast notifications.
- **`backend/`**: Express server source code.
  - `models/`: Sequelize database models.
  - `controllers/`: Request handling logic.
  - `routes/`: API route definitions.

## Setup

### Prerequisites

- **Node.js** (v22 recommended)
- **MySQL Server (or MariaDB)**

  ```bash
  sudo apt install mysql-server mysql-client
  sudo systemctl start mysql
  sudo systemctl enable mysql

  # OR (same interface as MySQL)
  sudo apt install mariadb-server mariadb-client -y
  sudo systemctl start mariadb
  sudo systemctl enable mariadb
  ```

  Config Database username, host, and password...

  ```sql
  ALTER USER 'username'@'host' IDENTIFIED BY 'password';
  FLUSH PRIVILEGES;
  ```

- **Redis**

  ```bash
  sudo apt install redis-server
  sudo systemctl start redis
  ```

### 1. Clone the Repo

```bash
git clone https://github.com/MagiCarpy/35L_Project.git
cd 35L_Project
```

### 2. Install Dependencies

Install dependencies for both the frontend and backend:

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd frontend
npm install
```

### 3. Env Config

Create a `.env` file in the **root** directory of the project (parent of `frontend` and `backend`). Use the following template:

```env
# Server Configuration
PORT=5000

# Database Configuration
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASS=pass
MYSQL_DB=projDB
MYSQL_PORT=3306

# Security & APIs
SESSION_SECRET=secure_random_string
ORS_API_KEY=openrouteservice_api_key
```

> **Note**: You will need to register for a free API key at [OpenRouteService](https://openrouteservice.org/) and create a MySQL database named `projDB` (or whatever you specified in `MYSQL_DB`).

### 4. Run the Application

You can start both the backend server and the frontend development server from the root directory:

```bash
# From the project root
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Diagrams

![alt text](https://github.com/MagiCarpy/35L_Project/blob/main/Diagrams/ER_diagram.jpg?raw=true)
![alt text](https://github.com/MagiCarpy/35L_Project/blob/main/Diagrams/ReqDiagram.jpg?raw=true)
![alt text](https://github.com/MagiCarpy/35L_Project/blob/main/Diagrams/ChatStateDiagram.png?raw=true)
![alt text](https://github.com/MagiCarpy/35L_Project/blob/main/Diagrams/loginDiagram.jpg?raw=true)
![alt text](https://github.com/MagiCarpy/35L_Project/blob/main/Diagrams/ChatPollingSequenceDiagram.png?raw=true)
