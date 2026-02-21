# Architecture

## Overview

This project demonstrates **groups-based authorization** using AWS Cognito. Users authenticate through a custom login form (no Hosted UI) using one of two app clients. A Lambda authorizer on API Gateway reads `cognito:groups` and `client_id` from the JWT to enforce per-endpoint access rules.

---

## System Diagram

```mermaid
flowchart LR
    subgraph Browser
        A[React App<br/>cognito-auth.demos.jesusrugama.com]
    end

    subgraph AWS Cognito
        UP[User Pool]
        GC[Group: customer]
        GA[Group: admin]
        CC[customer-app client]
        AC[admin-app client]
        PA[Pre-Auth Lambda<br/>blocks wrong client]
    end

    subgraph API Layer
        APIGW[API Gateway<br/>REST API]
        AUTH[Lambda Authorizer<br/>checks groups + client_id]
        L1[Lambda endpoint1]
        L2[Lambda endpoint2]
        L3[Lambda endpoint3]
        L4[Lambda endpoint4]
    end

    subgraph Hosting
        S3[S3 Bucket]
        CF[CloudFront CDN]
        R53[Route 53]
        ACM[ACM Cert]
    end

    A -->|InitiateAuth SRP| UP
    UP --> PA
    PA -->|allow/deny| UP
    UP --> GC
    UP --> GA
    UP --> CC
    UP --> AC

    A -->|Bearer Token| APIGW
    APIGW --> AUTH
    AUTH -->|verify JWT + check groups| UP
    AUTH -->|allow| APIGW
    APIGW --> L1
    APIGW --> L2
    APIGW --> L3
    APIGW --> L4

    R53 --> CF
    CF --> S3
    ACM -.-> CF
```

---

## Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as React App
    participant Cog as Cognito User Pool
    participant PA as Pre-Auth Lambda
    participant APIGW as API Gateway
    participant Authz as Lambda Authorizer
    participant L as Lambda

    U->>App: Selects app client (customer / admin)
    U->>App: Enters email + password
    App->>Cog: InitiateAuth (SRP) with selected client_id
    Cog->>PA: Pre-Authentication trigger
    PA->>Cog: AdminListGroupsForUser
    Cog-->>PA: User groups
    PA-->>Cog: Allow or throw error
    Cog-->>App: ID Token + Access Token (includes cognito:groups)
    App->>App: Decode JWT → display group badges
    U->>App: Clicks "Test" on /endpoint3 (admin only)
    App->>APIGW: PUT /endpoint3 — Authorization: Bearer <token>
    APIGW->>Authz: Invoke with token
    Authz->>Authz: Verify JWT signature (JWKS)
    Authz->>Authz: Check cognito:groups + client_id
    Authz-->>APIGW: Deny (customer group, admin-only endpoint)
    APIGW-->>App: 403 Forbidden
    App-->>U: "Access Denied ✗"
```

---

## Component Breakdown

### AWS Services

| Service | Role |
|---|---|
| **Cognito User Pool** | User directory, authentication, token issuance. Contains two groups (`customer`, `admin`) and two app clients. |
| **Pre-Authentication Lambda** | Invoked before password validation. Blocks users from logging in through the wrong app client. |
| **API Gateway (REST)** | Exposes 4 endpoints. Each method uses a Lambda authorizer for access control. |
| **Lambda Authorizer** | Verifies the JWT signature using Cognito's JWKS, reads `cognito:groups` and `client_id`, and returns allow/deny. |
| **Lambda (endpoints)** | Simple handlers returning `200 OK` with JSON. Authorization happens at the Gateway level before Lambda is invoked. |
| **S3** | Hosts the static React build (`dist/`). |
| **CloudFront** | CDN fronting S3. Provides HTTPS via ACM certificate. |
| **Route 53** | DNS record for `cognito-auth.demos.jesusrugama.com`. |
| **ACM** | TLS certificate attached to CloudFront. |
| **IAM** | Execution role for all Lambda functions. |

### Frontend Components

| Component | Responsibility |
|---|---|
| `AuthContext` | Manages Cognito SRP login/logout via `amazon-cognito-identity-js`. Stores tokens in memory. |
| `Auth` page | Login form with app client selector (Customer / Admin). |
| `Dashboard` page | Displays group badges, app client switcher, and endpoint tester grid. |
| `EndpointCard` | Fires test requests with Bearer token, shows ✓ Allowed or ✗ Access Denied. |
| `ProtectedRoute` | Guards the dashboard — redirects unauthenticated users to login. |

---

## Data Flow

1. **App client selection** — User picks Customer or Admin app client at login. The frontend uses the corresponding Cognito `client_id` for `InitiateAuth`.
2. **Pre-Authentication** — Cognito invokes the Pre-Auth Lambda before validating the password. The Lambda calls `AdminListGroupsForUser` and blocks the login if the user's group doesn't match the app client.
3. **Token issuance** — Cognito returns tokens. The ID/Access token automatically includes `cognito:groups` — no custom claims needed.
4. **Token storage** — Tokens stored in memory (via `amazon-cognito-identity-js` session). Decoded client-side to display group badges.
5. **API calls** — Each endpoint card sends `Authorization: Bearer <token>`. The Lambda authorizer verifies the JWT and checks groups + client_id.
6. **Enforcement** — Group allowed + client allowed → `200 OK` from Lambda. Otherwise → `403 Forbidden` from API Gateway.

---

## Authorization Model

```
┌─────────────────────────────────────────────────────────┐
│                    Cognito User Pool                     │
│                                                         │
│  Groups: customer, admin                                │
│  App Clients: customer-app, admin-app                   │
│                                                         │
│  JWT includes: cognito:groups, client_id automatically  │
└─────────────────────────────────────────────────────────┘
                         │
                    Bearer Token
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│                  Lambda Authorizer                       │
│                                                         │
│  1. Verify JWT signature (Cognito JWKS)                 │
│  2. Read cognito:groups + client_id from token          │
│  3. Check endpoint permission map:                      │
│                                                         │
│  /endpoint1 → customer | admin, any client              │
│  /endpoint2 → customer | admin, any client              │
│  /endpoint3 → admin only, admin-app client              │
│  /endpoint4 → admin only, admin-app client              │
└─────────────────────────────────────────────────────────┘
```

---

## Pre-Authentication Flow

The Pre-Auth Lambda prevents users from obtaining tokens through the wrong app client:

```
User submits login
       ↓
Cognito receives InitiateAuth request
       ↓
Cognito invokes Pre-Authentication Lambda
       ↓
Lambda calls AdminListGroupsForUser
       ↓
  customer-app + admin user   → ❌ blocked (admin must use admin-app)
  admin-app + non-admin user  → ❌ blocked (only admins on admin-app)
  customer-app + customer     → ✅ allowed
  admin-app + admin           → ✅ allowed
  customer-app + admin        → ✅ allowed (admin can use customer app at customer level)
       ↓
  Allow → Cognito validates password → token issued
  Deny  → Cognito rejects login entirely
```

---

## When to Use Other Patterns

| Requirement | Solution |
|---|---|
| Groups-based access (this demo) | `cognito:groups` in JWT + Lambda authorizer |
| Block users from wrong app client | Pre-Authentication Lambda trigger |
| Per-user or per-resource permissions | Amazon Verified Permissions (AVP) + Cedar policies |
| Federated login (Google, etc.) | Cognito Identity Federation + Post Confirmation trigger for group assignment |
| Machine-to-machine auth | Client Credentials grant (no user involved) |

---

## Infrastructure (Terraform)

```
terraform/
├── backend.tf        # Remote state (S3 + DynamoDB)
├── cognito.tf        # User Pool, Groups, App Clients, Pre-Auth Lambda
├── api_gateway.tf    # REST API, methods, Lambda authorizer
├── lambda.tf         # Endpoint Lambda functions + IAM role
├── lambda_iam.tf     # IAM role definition
├── variables.tf      # Input variables
├── outputs.tf        # User Pool ID, Client IDs, API URL
├── s3.tf             # Static hosting bucket
├── cloudfront.tf     # CDN distribution
├── route53.tf        # DNS records
└── acm.tf            # TLS certificate
```

---

## References

- [Cognito User Pool Groups](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-user-groups.html)
- [API Gateway Lambda Authorizer](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)
- [Cognito Pre-Authentication Trigger](https://docs.aws.amazon.com/cognito/latest/developerguide/user-pool-lambda-pre-authentication.html)
- [CloudFront + S3 Origin](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/DownloadDistS3AndCustomOrigins.html)
