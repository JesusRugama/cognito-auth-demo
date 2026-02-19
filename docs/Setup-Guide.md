# Setup Guide

Step-by-step instructions to deploy the full Cognito Scopes Demo — from infrastructure provisioning to running the frontend locally and testing in production.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **AWS CLI** | ≥ 2.x | Deploy resources, sync S3, invalidate CloudFront |
| **Terraform** | ≥ 1.5 | Provision all AWS infrastructure |
| **Node.js** | ≥ 20 | Build and run the React frontend |
| **npm** | ≥ 10 | Dependency management |
| **AWS Account** | — | With permissions for Cognito, API Gateway, Lambda, S3, CloudFront, Route 53, ACM, IAM |
| **Domain** | — | Registered domain with a Route 53 hosted zone (e.g., `yourdemo.com`) |

Ensure your AWS CLI is configured with appropriate credentials:

```bash
aws configure
# or use SSO / environment variables
aws sts get-caller-identity   # verify access
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/JesusRugama/cognito-scopes-demo.git
cd cognito-scopes-demo
```

---

## 2. Deploy Infrastructure with Terraform

### 2.1 Configure Variables

Create a `terraform/terraform.tfvars` file (or pass variables via CLI):

```hcl
# terraform/terraform.tfvars

aws_region        = "us-east-2"
domain_name       = "yourdemo.com"
hosted_zone_id    = "Z0123456789ABCDEFGHIJ"

# Cognito
resource_server_identifier = "myapi"
resource_server_scopes = [
  { name = "read",  description = "Read access" },
  { name = "write", description = "Write access" },
  { name = "admin", description = "Admin access" },
]

viewer_client_scopes = ["openid", "profile", "myapi/read"]
admin_client_scopes  = ["openid", "profile", "myapi/read", "myapi/write", "myapi/admin"]

# Tags
project_name = "cognito-scopes-demo"
```

### 2.2 Initialize and Apply

```bash
cd terraform
terraform init          # Downloads providers, configures S3 backend
terraform plan -out=tfplan
terraform apply tfplan
```

### 2.3 Note the Outputs

Terraform will print values you need for the frontend:

```
Outputs:

cognito_user_pool_id     = "us-east-2_AbCdEfGhI"
viewer_client_id         = "1a2b3c4d5e6f7g8h9i0j"
admin_client_id          = "9z8y7x6w5v4u3t2s1r0q"
api_gateway_url          = "https://abc123.execute-api.us-east-2.amazonaws.com/prod"
cloudfront_domain        = "d1234abcdef.cloudfront.net"
s3_bucket_name           = "cognito-scopes-demo-website"
```

---

## 3. Set Up the React Frontend

### 3.1 Install Dependencies

```bash
cd client
npm install
```

### 3.2 Configure Environment Variables

Copy the example env file and fill in values from Terraform outputs:

```bash
cp .env.example .env
```

```env
# client/.env

VITE_AWS_REGION=us-east-2
VITE_COGNITO_USER_POOL_ID=us-east-2_AbCdEfGhI
VITE_COGNITO_VIEWER_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
VITE_COGNITO_ADMIN_CLIENT_ID=9z8y7x6w5v4u3t2s1r0q
VITE_API_URL=https://abc123.execute-api.us-east-2.amazonaws.com/prod
VITE_VIEWER_DOMAIN=viewer.yourdemo.com
VITE_ADMIN_DOMAIN=admin.yourdemo.com
```

### 3.3 Run Locally

```bash
npm run dev
# → http://localhost:5173
```

The app detects `localhost` and defaults to demo/simulation mode. To test subdomain detection locally, add entries to `/etc/hosts`:

```
127.0.0.1  viewer.localhost
127.0.0.1  admin.localhost
```

Then access `http://viewer.localhost:5173` or `http://admin.localhost:5173`.

---

## 4. Create a Demo User in Cognito

You can create the user via the AWS Console or CLI:

```bash
# Create user
aws cognito-idp admin-create-user \
  --user-pool-id us-east-2_AbCdEfGhI \
  --username user@demo.com \
  --user-attributes Name=email,Value=user@demo.com Name=email_verified,Value=true \
  --temporary-password "TempPass1!" \
  --message-action SUPPRESS

# Set permanent password
aws cognito-idp admin-set-user-password \
  --user-pool-id us-east-2_AbCdEfGhI \
  --username user@demo.com \
  --password "Admin123!" \
  --permanent
```

---

## 5. Deploy Frontend to S3 + CloudFront

### 5.1 Build

```bash
cd client
npm run build    # outputs to dist/
```

### 5.2 Upload to S3

```bash
aws s3 sync dist/ s3://cognito-scopes-demo-website --delete
```

### 5.3 Invalidate CloudFront Cache

```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

### 5.4 Verify

Open `https://viewer.yourdemo.com` and `https://admin.yourdemo.com` in your browser.

---

## 6. Test the Full Flow

1. **Viewer flow** — Navigate to `viewer.yourdemo.com`, log in with `user@demo.com` / `Admin123!`.
   - Scopes shown: `openid`, `profile`, `myapi/read`
   - Test endpoint 1 (`GET /api/endpoint1`) → **200 OK ✓**
   - Test endpoint 2 (`POST /api/endpoint2`) → **403 Forbidden ✗** (missing `myapi/write`)

2. **Admin flow** — Navigate to `admin.yourdemo.com`, log in with the same credentials.
   - Scopes shown: `openid`, `profile`, `myapi/read`, `myapi/write`, `myapi/admin`
   - All 4 endpoints → **200 OK ✓**

---

## 7. Optional Enhancements

### SES for Production Emails

By default Cognito uses its built-in email (limited to 50/day). For production:

```bash
# Verify your domain in SES
aws ses verify-domain-identity --domain yourdemo.com

# Then configure Cognito to use SES as the email provider in Terraform:
# email_configuration { source_arn = aws_ses_domain_identity.main.arn }
```

### Enable MFA

Add to the Cognito Terraform module:

```hcl
mfa_configuration = "OPTIONAL"

software_token_mfa_configuration {
  enabled = true
}
```

---

## 8. Tear Down

To destroy all resources and avoid charges:

```bash
cd terraform
terraform destroy
```

> **Warning:** This deletes the Cognito user pool (and all users), S3 bucket contents, CloudFront distribution, and DNS records. Ensure you no longer need them.

---

## References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Cognito User Pool Terraform Resource](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cognito_user_pool)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
