# Cognito Scopes Demo

> **Educational demo** showcasing AWS Cognito custom OAuth scopes for fine-grained, scope-based API authorization.

The same Cognito user logs in through **different app clients** (Viewer vs Admin) and receives **different scopes** in their access token. Protected API endpoints then allow or deny requests based on those scopes — demonstrating a real-world pattern for role-differentiated access without multiple user accounts.

<!-- TODO: Replace with actual screenshots -->
![Dashboard Screenshot](docs/assets/dashboard-placeholder.png)

---

## Key Concepts

| Concept | How It Works |
|---|---|
| **One User, Two Clients** | A single Cognito user pool with two app clients (`ViewerClient`, `AdminClient`), each configured with different allowed OAuth scopes. |
| **Custom Resource Server** | Identifier `myapi` with scopes: `myapi/read`, `myapi/write`, `myapi/admin`. |
| **Scope Enforcement** | API Gateway's Cognito Authorizer validates the access token and checks per-method OAuth scopes. |
| **Visual Feedback** | The dashboard shows decoded scopes as badges and returns ✓ Allowed / ✗ Access Denied per endpoint. |

### Scope Matrix

| Endpoint | Method | Required Scope | Viewer | Admin |
|---|---|---|---|---|
| `/api/endpoint1` | `GET` | `myapi/read` | ✅ | ✅ |
| `/api/endpoint2` | `POST` | `myapi/write` | ❌ | ✅ |
| `/api/endpoint3` | `PUT` | `myapi/write` | ❌ | ✅ |
| `/api/endpoint4` | `DELETE` | `myapi/admin` | ❌ | ✅ |

---

## Tech Stack

- **Frontend** — React 18 · Vite · TypeScript · Tailwind CSS · Lucide icons
- **Auth** — AWS Cognito User Pool (custom login UI, SRP auth flow)
- **Backend** — API Gateway (REST) + Lambda (Node.js)
- **Hosting** — S3 + CloudFront (subdomain-based: `viewer.yourdemo.com` / `admin.yourdemo.com`)
- **IaC** — Terraform (Cognito, S3, CloudFront, API Gateway, Lambda, Route 53, ACM)
- **CI/CD** — GitHub Actions

---

## Quick Start

### Prerequisites

- **AWS Account** with CLI configured (`aws configure`)
- **Terraform** ≥ 1.5
- **Node.js** ≥ 20 and npm
- A **Route 53 hosted zone** for your domain (for subdomain setup)

### 1. Clone & Install

```bash
git clone https://github.com/JesusRugama/cognito-scopes-demo.git
cd cognito-scopes-demo
cd client && npm install
```

### 2. Deploy Infrastructure

```bash
cd terraform
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

Terraform outputs the Cognito User Pool ID, app client IDs, API Gateway URL, and CloudFront domain. See [Setup Guide](docs/Setup-Guide.md) for detailed variable configuration.

### 3. Configure & Run Locally

```bash
cd client
cp .env.example .env          # Fill in Cognito & API values from Terraform output
npm run dev                    # http://localhost:5173
```

### 4. Test

1. Open the app — choose **Login as Viewer** or **Login as Admin**.
2. Use demo credentials: `user@demo.com` / `Admin123!`
3. Click **Test** on each endpoint card and observe ✓ / ✗ results.

### 5. Deploy Frontend to S3

```bash
cd client
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## Project Structure

```
cognito-scopes-demo/
├── client/                    # React frontend (Vite + TypeScript)
│   ├── src/
│   │   ├── components/        # EndpointCard, ProtectedRoute
│   │   ├── contexts/          # AuthContext (auth state management)
│   │   ├── pages/             # Auth (login/register), Dashboard
│   │   ├── types/             # TypeScript interfaces (auth, endpoints)
│   │   ├── App.tsx            # Root component with routing
│   │   └── main.tsx           # Entry point
│   ├── package.json
│   └── vite.config.ts
├── server/                    # Lambda function handlers (planned)
├── terraform/                 # IaC — all AWS resources
│   └── backend.tf             # S3 remote state configuration
├── .github/workflows/         # CI/CD pipeline
│   └── deploy.yml
└── docs/                      # Extended documentation
    ├── Architecture.md
    └── Setup-Guide.md
```

---

## Documentation

| Document | Description |
|---|---|
| [Architecture](docs/Architecture.md) | System design, data-flow diagrams (Mermaid), and AWS service map |
| [Setup Guide](docs/Setup-Guide.md) | Step-by-step deployment and configuration |

---

## Current Status

> **Phase 1 (complete):** Simulated frontend — role switching, scope badges, endpoint tester using httpbin.org.
>
> **Phase 2 (in progress):** Terraform modules for Cognito, API Gateway, Lambda, S3/CloudFront, Route 53.
>
> **Phase 3 (planned):** Real Cognito integration with Amplify Auth, live Lambda-backed endpoints, subdomain hosting.

---

## Extensions & Next Steps

- **Machine-to-Machine (M2M):** Add a third app client using the `client_credentials` grant for service-to-service calls.
- **Multi-Tenancy:** Extend scopes with tenant prefixes (e.g., `tenant-a/myapi/read`).
- **MFA:** Enable TOTP or SMS MFA in the Cognito user pool.
- **Fine-Grained Lambda Authorizer:** Replace Cognito Authorizer with a Lambda authorizer for custom claim validation.
- **Audit Logging:** Pipe API Gateway access logs to CloudWatch for scope-usage analytics.

---

## License

[MIT](LICENSE)

---

## Contributing

1. Fork the repo and create a feature branch.
2. Follow existing code style (TypeScript strict, Tailwind utility classes).
3. Open a PR with a clear description of changes.

---

## References

- [AWS Cognito Resource Servers](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-define-resource-servers.html)
- [API Gateway Cognito Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-integrate-with-cognito.html)
- [OAuth 2.0 Scopes](https://oauth.net/2/scope/)
