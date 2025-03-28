#!/bin/bash

# Script to properly configure a Google Cloud Storage bucket for Strapi
# Usage: ./setup-gcs-bucket.sh <bucket-name> <service-account-email>

set -e

if [ $# -lt 2 ]; then
  echo "Usage: $0 <bucket-name> <service-account-email>"
  echo "Example: $0 my-strapi-media-bucket service-account@project-id.iam.gserviceaccount.com"
  exit 1
fi

BUCKET_NAME=$1
SERVICE_ACCOUNT=$2

echo "⚙️ Configuring bucket: $BUCKET_NAME for Strapi image uploads..."

# Step 1: Set proper CORS configuration
echo "📝 Setting CORS configuration for browser uploads..."
cat > /tmp/cors-config.json << EOF
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "PUT", "POST"],
    "responseHeader": ["Content-Type", "Content-MD5", "Content-Disposition", "Accept", "Origin", "Authorization"],
    "maxAgeSeconds": 3600
  }
]
EOF

gsutil cors set /tmp/cors-config.json gs://$BUCKET_NAME
echo "✅ CORS configuration set successfully"

# Step 2: Set the bucket publicly readable
echo "🔓 Making bucket objects publicly readable..."
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME
echo "✅ Public read access configured"

# Step 3: Grant service account full access to the bucket
echo "🔑 Granting service account full access to bucket objects..."
gsutil iam ch serviceAccount:$SERVICE_ACCOUNT:objectAdmin gs://$BUCKET_NAME
echo "✅ Service account permissions set"

# Step 4: Verify configuration
echo "🔍 Verifying configuration..."
echo "Bucket permissions:"
gsutil iam get gs://$BUCKET_NAME
echo ""
echo "CORS configuration:"
gsutil cors get gs://$BUCKET_NAME

echo ""
echo "✨ Bucket configuration complete! ✨"
echo "Your GCS bucket should now be properly configured for Strapi image uploads."
echo ""
echo "⚠️ Important: Make sure that the service account credentials are properly"
echo "   configured in your Strapi environment (GCS_SERVICE_ACCOUNT_KEY_JSON)."
