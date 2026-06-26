# 💬 Chat App Backend

A scalable real-time chat application backend built with **Node.js**, **Express.js**, **Socket.IO**, **Prisma ORM**, and **MariaDB**. It provides secure authentication, real-time messaging, file uploads, API documentation, and database management.

---

## 🚀 Features

- 🔐 JWT Authentication
- 🔒 Password Hashing using Bcrypt
- 💬 Real-time Messaging with Socket.IO
- 📁 File Upload Support (Multer)
- ✅ Request Validation using Joi
- 🗄️ MariaDB Database with Prisma ORM
- 📖 Swagger API Documentation
- 🌐 CORS Enabled
- 📝 HTTP Request Logging (Morgan)
- ⚙️ Environment Variable Configuration

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime Environment |
| Express.js | Backend Framework |
| Socket.IO | Real-time Communication |
| Prisma ORM | Database ORM |
| MariaDB | Database |
| JWT | Authentication |
| Bcrypt | Password Encryption |
| Multer | File Uploads |
| Joi | Request Validation |
| Swagger | API Documentation |

---

## 📦 Installation

Clone the repository

```bash
git clone <repository-url>
```

Navigate to the project

```bash
cd chat-app-backend
```

Install dependencies

```bash
npm install
```

Create a `.env` file

```env
PORT=5000

DATABASE_URL="mysql://username:password@localhost:3306/chat_app"

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

## 🗄️ Prisma Setup

Generate Prisma Client

```bash
npx prisma generate
```

Run database migrations

```bash
npx prisma migrate dev
```

If the database already exists

```bash
npx prisma db pull
```

---

## ▶️ Running the Server

Development

```bash
npm run dev
```

Production

```bash
npm start
```

---

## 📁 Project Structure

```
chat-app-backend
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── uploads/
│
├── routes/
├── controllers/
├── middleware/
├── services/
├── utils/
├── config/
│
├── server.js
├── package.json
└── .env
```

---

## 📖 API Documentation

After starting the server, Swagger documentation is available at:

```
http://localhost:5000/api-docs
```

---

## 📡 Socket.IO Events

Example events:

- User Connected
- User Disconnected
- Send Message
- Receive Message
- Join Room
- Leave Room
- Typing Indicator

---

## 📜 Available Scripts

```bash
npm run dev      # Start development server using Nodemon

npm start        # Start production server
```

---

## 📦 Dependencies

- Express
- Socket.IO
- Prisma
- MariaDB
- JWT
- Bcrypt
- Joi
- Multer
- Swagger
- Morgan
- CORS
- Dotenv

---

## 🔒 Environment Variables

| Variable | Description |
|----------|-------------|
| PORT | Server Port |
| DATABASE_URL | MariaDB Connection URL |
| JWT_SECRET | Secret Key for JWT |
| CLIENT_URL | Frontend URL |

---

## 👨‍💻 Author

**Ishant Nikure**

---

## 📄 License

This project is licensed under the ISC License.
