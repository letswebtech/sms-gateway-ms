# SMS Gateway Microservice

A lightweight, FCM-based SMS gateway microservice that enables sending OTPs and notifications via Firebase Cloud Messaging through a Flutter relay app.

## 🚀 Features

- **OTP Delivery**: Send one-time passwords and SMS messages via FCM to connected devices
- **Rate Limiting**: Built-in rate limiting (20 requests per minute by default) to prevent abuse
- **Delivery Tracking**: Real-time tracking of pending SMS deliveries
- **Security**: Helmet.js security middleware, JWT authentication support, input validation
- **Error Handling**: Comprehensive error logging and structured error responses
- **Health Checks**: `/health` endpoint for monitoring service status and uptime
- **Production Ready**: Railway.toml configured for easy deployment

## 📋 Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Messaging**: Firebase Admin SDK
- **Security**: Helmet.js
- **Rate Limiting**: express-rate-limit
- **Logging**: Winston
- **Validation**: Joi
- **ID Generation**: UUID
- **Environment**: dotenv

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/sms/send` | Send SMS message |
| POST | `/api/callback` | Handle SMS delivery callbacks |
| POST | `/api/gateway` | Gateway-related operations |
| GET | `/health` | Service health status and metrics |

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=20

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
GATEWAY_FCM_TOKEN=your-fcm-token

# Database/Cache (if applicable)
DATABASE_URL=

# Logging
LOG_LEVEL=info
```

## 🚀 Getting Started

### Prerequisites
- Node.js 14+ 
- npm or yarn
- Firebase project setup

### Installation

```bash
# Clone the repository
git clone https://github.com/letswebtech/sms-gateway-ms.git
cd sms-gateway-ms

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
npm run dev
```

The service will start on `http://localhost:3000` with hot-reload enabled via nodemon.

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

## 📁 Project Structure

```
.
├── config/
│   └── firebase.js           # Firebase initialization
├── src/
│   ├── index.js              # Application entry point
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── sms.js            # SMS sending routes
│   │   ├── callback.js       # Callback routes
│   │   └── gateway.js        # Gateway routes
│   ├── services/
│   │   ├── deliveryTracker.js # Track SMS deliveries
│   │   └── fcmService.js     # FCM messaging service
│   └── utils/
│       ├── logger.js         # Winston logger
│       └── httpError.js      # HTTP error handling
├── package.json
├── railway.toml              # Railway deployment config
└── README.md
```

## 🔐 Security

- **Helmet.js**: Protects against common vulnerabilities
- **Rate Limiting**: Prevents brute-force and DoS attacks
- **Input Validation**: Uses Joi for schema validation
- **.env Protection**: Sensitive credentials are never committed
- **Firebase Auth**: Secure service account authentication

## 📊 Health Check

```bash
curl http://localhost:3000/health
```

Response example:
```json
{
  "status": "ok",
  "pendingDeliveries": 0,
  "gatewayConfigured": true,
  "uptime": 3600
}
```

## 🚢 Deployment

### Railway
The project includes `railway.toml` for easy deployment to Railway:

```bash
npm install -g @railway/cli
railway login
railway link
railway up
```

### Docker
```bash
docker build -t sms-gateway-microservice .
docker run -p 3000:3000 --env-file .env sms-gateway-microservice
```

## 📝 API Examples

### Send SMS
```bash
curl -X POST http://localhost:3000/api/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "+1234567890",
    "message": "Your OTP is: 123456"
  }'
```

## 🐛 Error Handling

The service includes comprehensive error handling:

- **400**: Bad Request (malformed JSON, validation errors)
- **401**: Unauthorized (authentication required)
- **404**: Not Found
- **429**: Too Many Requests (rate limit exceeded)
- **500**: Internal Server Error

## 📚 Logging

Logs are structured and output to console with Winston. Set `LOG_LEVEL` in `.env`:

- `error`: Only errors
- `warn`: Warnings and errors
- `info`: General information
- `debug`: Detailed debugging information

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -am 'Add your feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

**Built with ❤️ by Kashif Ahmed Siddiqui**
