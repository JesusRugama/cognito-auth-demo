# Setup Guide

Step-by-step instructions to deploy the Cognito Auth Demo — from infrastructure provisioning to running the frontend locally and testing in production.

---

## Prerequisites

| Tool | Version | Purpose |
|---|---|---|
| **AWS CLI** | ≥ 2.x | Deploy resources, sync S3, invalidate CloudFront |
| **Terraform** | ≥ 1.5 | Provision all AWS infrastructure |
| **Node.js** | ≥ 20 | Build and run the React frontend and Lambda functions |
| **npm** | ≥ 10 | Dependency management |
| **AWS Account** | — | With permissions for Cognito, API Gateway, Lambda, S3, CloudFront, Route 53, ACM, IAM |
| **Domain** | — | Registered domain with a Route 53 hosted zone |

```bash
aws configure
aws sts get-caller-identity   # verify access
```

---

## 1. Clone the Repository

```bash
git clone https://github.com/JesusRugama/cognito-auth-demo.git
cd cognito-auth-demo
```

---

## 2. Deploy Infrastructure with Terraform

### 2.1 Configure Variables

Edit `terraform/variables.tf` defaults or create a `terraform.tfvars`:

```hcl
domain_name      = "cognito-auth.demos.yourdomain.com"
hosted_zone_name = "yourdomain.com"
bucket_name      = "yourdomain.demos.cognito-auth"
```

### 2.2 Initialize and Apply

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 2.3 Note the Outputs

```
cognito_user_pool_id     = "us-east-1_AbCdEfGhI"
customer_client_id       = "1a2b3c4d5e6f7g8h9i0j"
admin_client_id          = "9z8y7x6w5v4u3t2s1r0q"
api_gateway_url          = "https://abc123.execute-api.us-east-1.amazonaws.com/prod"
cloudfront_domain        = "d1234abcdef.cloudfront.net"
```

---

## 3. Build and Deploy Lambda Functions

```bash
cd server
npm install
npm run package    # bundles each handler with esbuild → zips in server/zips/
S3_BUCKET=your-bucket npm run deploy   # uploads zips + updates Lambda function code
```

---

## 4. Configure the React Frontend

### 4.1 Install Dependencies

```bash
cd client
npm install
```

### 4.2 Environment Variables

```bash
cp .env.example .env
```

```env
# client/.env

VITE_AWS_REGION=us-east-1
VITE_COGNITO_USER_POOL_ID=us-east-1_AbCdEfGhI
VITE_COGNITO_CUSTOMER_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
VITE_COGNITO_ADMIN_CLIENT_ID=9z8y7x6w5v4u3t2s1r0q
VITE_API_BASE_URL=https://abc123.execute-api.us-east-1.amazonaws.com/prod
```

### 4.3 Run Locally

```bash
npm run dev
# → http://localhost:5173
```

---

## 5. Create Demo Users in Cognito

Create one user per group via CLI:

```bash
POOL_ID=us-east-1_AbCdEfGhI

# Create customer user
aws cognito-idp admin-create-user \
  --user-pool-id $POOL_ID \
  --username customer@demo.com \
  --user-attributes Name=email,Value=customer@demo.com Name=email_verified,Value=true \
  --temporary-password "TempPass1!" \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id $POOL_ID \
  --username customer@demo.com \
  --password "Demo123!" \
  --permanent

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $POOL_ID \
  --username customer@demo.com \
  --group-name customer

# Create admin user
aws cognito-idp admin-create-user \
  --user-pool-id $POOL_ID \
  --username admin@demo.com \
  --user-attributes Name=email,Value=admin@demo.com Name=email_verified,Value=true \
  --temporary-password "TempPass1!" \
  --message-action SUPPRESS

aws cognito-idp admin-set-user-password \
  --user-pool-id $POOL_ID \
  --username admin@demo.com \
  --password "Demo123!" \
  --permanent

aws cognito-idp admin-add-user-to-group \
  --user-pool-id $POOL_ID \
  --username admin@demo.com \
  --group-name admin
```

---

## 6. Deploy Frontend to S3 + CloudFront

```bash
cd client
npm run build
aws s3 sync dist/ s3://your-bucket --delete
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

---

## 7. Test the Full Flow

**Customer flow:**
1. Open the app — select **Customer App** at login
2. Log in with `customer@demo.com` / `Demo123!`
3. Groups shown: `customer`
4. Endpoint 1 (`GET`) → ✅ 200 OK
5. Endpoint 2 (`POST`) → ✅ 200 OK
6. Endpoint 3 (`PUT`) → ❌ 403 Forbidden (admin only)
7. Endpoint 4 (`GET`) → ❌ 403 Forbidden (admin only)

**Admin flow:**
1. Select **Admin App** at login
2. Log in with `admin@demo.com` / `Demo123!`
3. Groups shown: `admin`
4. All 4 endpoints → ✅ 200 OK

**Pre-Auth enforcement:**
- Try logging in with `admin@demo.com` through the **Customer App** → ✅ allowed (admin gets customer-level access)
- Try logging in with `customer@demo.com` through the **Admin App** → ❌ blocked by Pre-Auth Lambda

---

## 8. Optional Enhancements

### Enable MFA

```hcl
mfa_configuration = "OPTIONAL"

software_token_mfa_configuration {
  enabled = true
}
```

### SES for Production Emails

```hcl
email_configuration {
  email_sending_account = "DEVELOPER"
  source_arn            = aws_ses_domain_identity.main.arn
}
```

---

## 9. Tear Down

```bash
cd terraform
terraform destroy
```

> **Warning:** This deletes the Cognito user pool (and all users), S3 bucket contents, CloudFront distribution, and DNS records.

---

## References

- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Cognito User Pool Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
- [amazon-cognito-identity-js](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
