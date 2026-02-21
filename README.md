# Cognito Auth Demo

> **Educational demo** showcasing AWS Cognito groups-based authorization with a custom login UI, two app clients, and a Lambda authorizer for API access control.

Users log in through a **custom login form** (no Hosted UI) using one of two Cognito app clients — Customer or Admin. A Lambda authorizer on API Gateway reads `cognito:groups` and `client_id` from the JWT to allow or deny access per endpoint.

---

## Key Concepts

| Concept | How It Works |
|---|---|
| **Custom Login UI** | Email/password form calls Cognito `InitiateAuth` directly via SRP — no redirect to Hosted UI. |
| **Two App Clients** | `customer-app` and `admin-app` in the same User Pool. A Pre-Authentication Lambda blocks users from logging into the wrong client. |
| **Groups-based RBAC** | Users belong to `customer` or `admin` groups. The JWT includes `cognito:groups` automatically — no custom claims needed. |
| **Lambda Authorizer** | Reads `cognito:groups` + `client_id` from the token and enforces per-endpoint access rules. |
| **Visual Feedback** | Dashboard shows group badges and ✓ Allowed / ✗ Access Denied per endpoint. |

### Access Matrix

| Endpoint | Method | Required Group | Customer | Admin |
|---|---|---|---|---|
| `/endpoint1` | `GET` | `customer \| admin` | ✅ | ✅ |
| `/endpoint2` | `POST` | `customer \| admin` | ✅ | ✅ |
| `/endpoint3` | `PUT` | `admin` | ❌ | ✅ |
| `/endpoint4` | `GET` | `admin` | ❌ | ✅ |

---

## Tech Stack

- **Frontend** — React 18 · Vite · TypeScript · Tailwind CSS · Lucide icons · `amazon-cognito-identity-js`
- **Auth** — AWS Cognito User Pool · Custom login UI · SRP auth flow · Groups-based RBAC
- **Backend** — API Gateway (REST) + Lambda (Node.js 20) · Lambda authorizer
- **Hosting** — S3 + CloudFront (`cognito-auth.demos.jesusrugama.com`)
- **IaC** — Terraform (Cognito, API Gateway, Lambda, S3, CloudFront, Route 53, ACM)
- **CI/CD** — GitHub Actions

---

## Quick Start

### Prerequisites

- **AWS Account** with CLI configured (`aws configure`)
- **Terraform** ≥ 1.5
- **Node.js** ≥ 20 and npm
- A **Route 53 hosted zone** for your domain

### 1. Clone & Install

```bash
git clone https://github.com/JesusRugama/cognito-auth-demo.git
cd cognito-auth-demo
cd client && npm install
cd ../server && npm install
```

### 2. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Terraform outputs the User Pool ID, App Client IDs, and API Gateway URL. See [Setup Guide](docs/Setup-Guide.md) for details.

### 3. Configure & Run Locally

```bash
cd client
cp .env.example .env          # Fill in Cognito & API values from Terraform output
npm run dev                    # http://localhost:5173
```

### 4. Test

1. Open the app — select **Customer App** or **Admin App** at login.
2. Log in with a pre-created demo user.
3. Click **Test** on each endpoint card and observe ✓ / ✗ results.

---

## Project Structure

```
cognito-auth-demo/
├── client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # EndpointCard, ProtectedRoute
│   │   ├── contexts/          # AuthContext (Cognito SRP auth)
│   │   ├── pages/             # Auth (login), Dashboard
│   │   ├── types/             # TypeScript interfaces (auth, endpoints)
│   │   ├── App.tsx            # Root component with routing
│   │   └── main.tsx           # Entry point
│   ├── .env.example
│   └── vite.config.ts
├── server/                    # Lambda function handlers (Node.js)
│   ├── src/
│   │   ├── endpoint1–4/       # API endpoint handlers
│   │   ├── authorizer/        # Lambda authorizer (JWT + groups check)
│   │   ├── pre-auth/          # Pre-Authentication trigger
│   │   └── shared/            # CORS headers, response helpers
│   └── scripts/               # package.sh + deploy.sh
├── terraform/                 # IaC — all AWS resources
│   ├── cognito.tf             # User Pool, Groups, App Clients
│   ├── api_gateway.tf         # REST API, methods, authorizer
│   ├── lambda.tf              # Lambda functions + IAM role
│   └── backend.tf             # S3 remote state
├── .github/workflows/
│   └── deploy.yml             # CI/CD pipeline
└── docs/
    ├── Architecture.md
    └── Setup-Guide.md
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/Architecture.md) | System design, data-flow diagrams, and AWS service map |
| [Setup Guide](docs/Setup-Guide.md) | Step-by-step deployment and configuration |

---

## Current Status

> **Phase 1 (complete):** React frontend with custom Cognito login, group badges, endpoint tester.
>
> **Phase 2 (complete):** Terraform for Cognito, API Gateway, Lambda, S3/CloudFront, Route 53. Lambda authorizer and Pre-Auth trigger implemented.
>
> **Phase 3 (in progress):** Wire Lambda authorizer to API Gateway, create demo users, end-to-end testing.

---

## Extensions & Next Steps

- **Google SSO:** Add federated login via Google — users land in the same User Pool and get assigned a group via Post Confirmation trigger.
- **MFA:** Enable TOTP or SMS MFA in the Cognito user pool.
- **Fine-Grained Permissions:** Replace group-level rules with Amazon Verified Permissions (AVP) + Cedar policies for per-resource access control.
- **Audit Logging:** Pipe API Gateway access logs to CloudWatch.

---

## License

[MIT](LICENSE)

---

## References

- [AWS Cognito User Pool Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
- [API Gateway Lambda Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)
- [amazon-cognito-identity-js](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
