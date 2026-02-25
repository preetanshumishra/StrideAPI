# MongoDB Atlas Setup Guide

This guide walks you through setting up a free MongoDB Atlas database for Stride API development.

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Click "Start Free" or "Sign Up"
3. Create an account with your email or use Google/GitHub login
4. Verify your email

## Step 2: Create a Free Cluster

1. After signing up, click "Create a Deployment"
2. Select **M0 Shared** (Free tier - includes 512 MB storage)
3. Choose your cloud provider (AWS, Google Cloud, or Azure) and region
4. Click "Create Deployment"
5. Wait 2-5 minutes for the cluster to be created

## Step 3: Create Database User

1. In the left sidebar, click "Security" → "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `stride_user` (or your choice)
5. Password: Generate a secure password or enter one
6. Under "Built-in Roles", select "Atlas Admin"
7. Click "Add User"

**Important**: Save your username and password securely!

## Step 4: Allow Network Access

1. In the left sidebar, click "Security" → "Network Access"
2. Click "Add IP Address"
3. Select "Allow access from anywhere" (0.0.0.0/0) for development
   - ⚠️ For production, restrict to your IP address
4. Click "Confirm"

## Step 5: Get Connection String

1. In the left sidebar, click "Deployment" → "Databases"
2. Find your cluster and click "Connect"
3. Select "Drivers" (Node.js)
4. Copy the connection string (it will look like):
   ```
   mongodb+srv://stride_user:your_password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 6: Update .env File

Replace `your_password` in the connection string and update `.env`:

```env
MONGO_URI=mongodb+srv://stride_user:your_password@cluster0.xxxxx.mongodb.net/stride?retryWrites=true&w=majority
JWT_SECRET=stride-development-secret-key-12345
JWT_REFRESH_SECRET=stride-refresh-secret-key-67890
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## Step 7: Test Connection

Start the API server:
```bash
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
🚀 Stride API running on port 5001
```

## Troubleshooting

### Connection Refused
- Check your IP address is whitelisted (Network Access)
- Verify username and password are correct
- Wait 5 minutes after creating the IP whitelist rule

### Authentication Failed
- Double-check password - special characters need URL encoding
- If password has `@`, `#`, `$`, etc., it must be URL-encoded:
  - `@` → `%40`
  - `#` → `%23`
  - `$` → `%24`
  - `%` → `%25`

### Cluster Not Found
- Ensure you're using the correct cluster name
- Check the database name in the URI

## Creating the Database

MongoDB Atlas creates the database automatically when you first write data to it. You don't need to create it manually.

## Monitoring Usage

1. Go to "Deployment" → "Overview"
2. Click your cluster to see:
   - Storage usage
   - Network activity
   - Connected applications

## Important Notes

- **Free Tier Limits**:
  - 512 MB storage
  - 100 concurrent connections
  - No backup snapshots
  - Data automatically deleted after 90 days of inactivity

- **For Production**:
  - Use strong, unique passwords
  - Restrict IP addresses
  - Enable encryption at rest
  - Use dedicated clusters (paid tier)
  - Set up backups

## Resources

- [MongoDB Atlas Documentation](https://www.mongodb.com/docs/atlas/)
- [Connection String Reference](https://www.mongodb.com/docs/manual/reference/connection-string/)
- [Database Users](https://www.mongodb.com/docs/atlas/security-add-mongodb-users/)
