# Setting Up Google Cloud Storage for Strapi Media

This guide explains how to properly configure Google Cloud Storage for your Strapi application's media uploads.

## Prerequisites

- Google Cloud Platform account
- Access to create/modify service accounts and IAM permissions
- Access to your GitHub repository settings (to add secrets)
- `gcloud` CLI installed (for bucket configuration)

## Step 1: Create a Service Account for GCS Access

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **IAM & Admin** > **Service Accounts**
3. Click **CREATE SERVICE ACCOUNT**
4. Enter a name (e.g., `strapi-storage`) and optional description
5. Click **CREATE AND CONTINUE**
6. Add the following roles:
   - **Storage Object Admin** (for creating/managing objects in buckets)
   - **Storage Admin** (if you need to manage buckets as well)
7. Click **CONTINUE** and then **DONE**

## Step 2: Create and Download Service Account Key

1. In the Service Accounts list, find your newly created account
2. Click the three dots menu (⋮) and select **Manage keys**
3. Click **ADD KEY** > **Create new key**
4. Select **JSON** format
5. Click **CREATE**

The JSON key file will be downloaded to your computer. Keep this file secure, as it provides access to your GCP resources.

## Step 3: Add Service Account Key to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name it `GCS_SERVICE_ACCOUNT_KEY_JSON`
5. Paste the **entire contents** of the downloaded JSON key file
6. Click **Add secret**

## Step 4: Configure Bucket Permissions and CORS

1. Using the provided script `backend/scripts/setup-gcs-bucket.sh`:

```bash
# First make it executable
chmod +x backend/scripts/setup-gcs-bucket.sh

# Run it with your bucket name and service account email
# (The email is in the format service-account-name@project-id.iam.gserviceaccount.com)
./backend/scripts/setup-gcs-bucket.sh your-bucket-name your-service-account-email
```

This script will:
- Set up proper CORS configuration to allow uploads
- Make bucket objects publicly readable
- Grant your service account admin access to objects
- Verify the configuration

## Step 5: Trigger a New Deployment

Commit and push your changes to trigger a new deployment with the updated GitHub Actions workflow:

```bash
git add .
git commit -m "Add GCS service account credentials to backend deployment"
git push
```

## Verifying the Setup

1. After deployment, log into your Strapi admin panel
2. Try uploading a new image to any content type
3. After upload, check if the image is publicly accessible
4. Ensure the image URL points to your Google Cloud Storage bucket

## Troubleshooting

If uploads still fail:

1. Check Cloud Run logs for any errors related to GCS
2. Verify the service account has the correct permissions
3. Ensure the bucket name in your configuration is correct
4. Make sure `GCS_SERVICE_ACCOUNT_KEY_JSON` is being passed correctly
5. Check if your Strapi version is compatible with the upload provider

## Additional Notes

- The service account JSON key should **never** be committed to your repository
- For local development, you can add the JSON key to your `.env` file
- If you change your bucket configuration, you may need to run the setup script again
