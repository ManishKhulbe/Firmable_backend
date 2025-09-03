// MongoDB initialization script for local development
// This script runs when the MongoDB container starts for the first time

// Switch to the firmable database
db = db.getSiblingDB("firmable");

// Create collections with validation
db.createCollection("abnrecords", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["abn"],
      properties: {
        abn: {
          bsonType: "string",
          pattern: "^[0-9]{11}$",
          description: "ABN must be exactly 11 digits",
        },
        status: {
          bsonType: "string",
          enum: ["Active", "Cancelled"],
          description: "Status must be either Active or Cancelled",
        },
        entityTypeCode: {
          bsonType: "string",
          maxLength: 10,
          description: "Entity type code cannot exceed 10 characters",
        },
        entityTypeText: {
          bsonType: "string",
          maxLength: 100,
          description: "Entity type text cannot exceed 100 characters",
        },
        acn: {
          bsonType: "string",
          pattern: "^[0-9]{9}$",
          description: "ACN must be exactly 9 digits",
        },
        gstStatus: {
          bsonType: "string",
          enum: ["Registered", "Cancelled"],
          description: "GST status must be either Registered or Cancelled",
        },
        state: {
          bsonType: "string",
          maxLength: 10,
          description: "State cannot exceed 10 characters",
        },
        postcode: {
          bsonType: "string",
          maxLength: 10,
          description: "Postcode cannot exceed 10 characters",
        },
      },
    },
  },
});

db.createCollection("abnnames", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["abn", "name", "type"],
      properties: {
        abn: {
          bsonType: "string",
          pattern: "^[0-9]{11}$",
          description: "ABN must be exactly 11 digits",
        },
        name: {
          bsonType: "string",
          minLength: 1,
          maxLength: 500,
          description: "Name must be between 1 and 500 characters",
        },
        type: {
          bsonType: "string",
          enum: ["TradingName", "BusinessName", "LegalName", "Other"],
          description:
            "Type must be one of: TradingName, BusinessName, LegalName, Other",
        },
      },
    },
  },
});

// Create indexes for better performance
db.abnrecords.createIndex({ abn: 1 }, { unique: true });
db.abnrecords.createIndex({ status: 1 });
db.abnrecords.createIndex({ entityTypeCode: 1 });
db.abnrecords.createIndex({ state: 1 });
db.abnrecords.createIndex({ lastUpdated: -1 });
db.abnrecords.createIndex({ createdAt: -1 });

db.abnnames.createIndex({ abn: 1 });
db.abnnames.createIndex({ name: "text" });
db.abnnames.createIndex({ type: 1 });
db.abnnames.createIndex({ createdAt: -1 });

// Create a user for the application
db.createUser({
  user: "firmable_user",
  pwd: "firmable_password",
  roles: [
    {
      role: "readWrite",
      db: "firmable",
    },
  ],
});

print("Database initialization completed successfully!");
