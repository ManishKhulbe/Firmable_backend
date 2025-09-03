# FIRMABLE - ABN Records Management API

A Node.js backend API built with Express and MongoDB for managing Australian Business Number (ABN) records and associated names.

## Features

- **ABN Records Management**: Full CRUD operations for ABN records
- **ABN Names Management**: Manage business names, trading names, and legal names
- **Advanced Search**: Text search and filtering capabilities
- **Data Validation**: Comprehensive input validation using express-validator
- **Error Handling**: Centralized error handling with detailed error messages
- **Security**: Helmet for security headers, rate limiting, and CORS protection
- **Statistics**: Built-in analytics and reporting endpoints

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **express-validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:

   - Copy `config.env` and update with your MongoDB Atlas connection string
   - Update the `MONGODB_URI` with your Atlas connection string
   - Set the database name (default: `firmable`)

4. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## Environment Variables

Create a `config.env` file with the following variables:

```env
MONGODB_URI=your_mongodb_atlas_connection_string_here
PORT=3000
NODE_ENV=development
DB_NAME=firmable
```

## API Endpoints

### ABN Records

| Method | Endpoint                             | Description                                       |
| ------ | ------------------------------------ | ------------------------------------------------- |
| GET    | `/api/v1/abn-records`                | Get all ABN records with filtering and pagination |
| GET    | `/api/v1/abn-records/:abn`           | Get specific ABN record by ABN number             |
| POST   | `/api/v1/abn-records`                | Create new ABN record                             |
| PUT    | `/api/v1/abn-records/:abn`           | Update ABN record                                 |
| DELETE | `/api/v1/abn-records/:abn`           | Delete ABN record                                 |
| GET    | `/api/v1/abn-records/stats/overview` | Get ABN records statistics                        |

### ABN Names

| Method | Endpoint                           | Description                                     |
| ------ | ---------------------------------- | ----------------------------------------------- |
| GET    | `/api/v1/abn-names`                | Get all ABN names with filtering and pagination |
| GET    | `/api/v1/abn-names/:id`            | Get specific ABN name by ID                     |
| GET    | `/api/v1/abn-names/abn/:abn`       | Get all names for a specific ABN                |
| POST   | `/api/v1/abn-names`                | Create new ABN name                             |
| PUT    | `/api/v1/abn-names/:id`            | Update ABN name                                 |
| DELETE | `/api/v1/abn-names/:id`            | Delete ABN name                                 |
| GET    | `/api/v1/abn-names/search/:term`   | Search names by text                            |
| GET    | `/api/v1/abn-names/stats/overview` | Get ABN names statistics                        |

### Query Parameters

#### ABN Records

- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10, max: 100)
- `status` - Filter by status (Active/Cancelled)
- `entityType` - Filter by entity type code
- `state` - Filter by state
- `search` - Search in ABN, legal name, organisation name, or ACN
- `sortBy` - Sort field (abn, status, lastUpdated, createdAt, legalName, organisationName)
- `sortOrder` - Sort order (asc/desc)

#### ABN Names

- `page` - Page number (default: 1)
- `limit` - Records per page (default: 10, max: 100)
- `abn` - Filter by ABN number
- `type` - Filter by name type (TradingName, BusinessName, LegalName, Other)
- `search` - Search in name or ABN
- `sortBy` - Sort field (name, type, createdAt, updatedAt)
- `sortOrder` - Sort order (asc/desc)

## Database Schema

### ABN Records Collection

```javascript
{
  abn: String (11 digits, unique),
  status: String (Active/Cancelled),
  abnStatusFromDate: Date,
  entityTypeCode: String,
  entityTypeText: String,
  legalName: String,
  organisationName: String,
  acn: String (9 digits),
  gstStatus: String (Registered/Cancelled),
  gstFromDate: Date,
  state: String,
  postcode: String,
  lastUpdated: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### ABN Names Collection

```javascript
{
  abn: String (11 digits, references ABN record),
  name: String,
  type: String (TradingName/BusinessName/LegalName/Other),
  createdAt: Date,
  updatedAt: Date
}
```

## Example Usage

### Create ABN Record

```bash
curl -X POST http://localhost:3000/api/v1/abn-records \
  -H "Content-Type: application/json" \
  -d '{
    "abn": "12345678901",
    "status": "Active",
    "entityTypeCode": "COM",
    "entityTypeText": "Company",
    "organisationName": "Example Company Pty Ltd",
    "gstStatus": "Registered",
    "state": "NSW",
    "postcode": "2000"
  }'
```

### Create ABN Name

```bash
curl -X POST http://localhost:3000/api/v1/abn-names \
  -H "Content-Type: application/json" \
  -d '{
    "abn": "12345678901",
    "name": "Example Trading Name",
    "type": "TradingName"
  }'
```

### Search ABN Records

```bash
curl "http://localhost:3000/api/v1/abn-records?search=Example&status=Active&page=1&limit=10"
```

## Project Structure

```
firmable/
├── controllers/          # Business logic controllers
│   ├── abnRecordController.js
│   └── abnNameController.js
├── middleware/           # Custom middleware
│   └── errorHandler.js
├── models/              # Mongoose models
│   ├── AbnRecord.js
│   └── AbnName.js
├── routes/              # API routes
│   ├── abnRecords.js
│   └── abnNames.js
├── config.env           # Environment variables
├── package.json         # Dependencies and scripts
├── server.js           # Main server file
└── README.md           # This file
```

## Security Features

- **Helmet**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configurable cross-origin resource sharing
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Secure error messages (stack traces only in development)

## Development

The project uses nodemon for development with hot reloading:

```bash
npm run dev
```

## Production

For production deployment:

```bash
npm start
```

Make sure to set `NODE_ENV=production` in your environment variables.

## Health Check

The API includes a health check endpoint:

```bash
curl http://localhost:3000/health
```

## License

ISC
