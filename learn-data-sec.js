/* Practice data: Security & Governance. */

L("ddos", {
  match: [
    ["AWS Shield Standard", "Free, automatic protection against common layer 3/4 DDoS"],
    ["AWS Shield Advanced", "Paid DDoS protection with 24/7 response team and cost protection"],
    ["AWS WAF", "Layer 7 web ACLs: SQL injection, XSS, rate limits, geo match"],
    ["AWS Network Firewall", "Managed stateful firewall and IPS for VPC traffic"],
    ["AWS Firewall Manager", "Central management of WAF, Shield, SGs across an organization"],
    ["Rate-based rule", "Blocks IPs that exceed a request count in 5 minutes"]
  ],
  sort: { title: "Which protection?", buckets: ["WAF", "Shield Advanced", "Network Firewall", "Firewall Manager"], items: [
    ["Block SQL injection on an ALB", 0], ["Refund of scaling costs during a DDoS attack", 1], ["Deep packet inspection of VPC egress traffic", 2],
    ["Apply the same WAF rules to every account", 3], ["Rate-limit login requests per IP", 0], ["Domain-name filtering for outbound traffic", 2]
  ]},
  tf: [
    ["Shield Standard is enabled automatically at no extra cost.", true, "All customers get it."],
    ["AWS WAF can be attached to a Network Load Balancer.", false, "WAF works with CloudFront, ALB, API Gateway, AppSync, Cognito, App Runner, Verified Access."],
    ["Shield Advanced includes access to the Shield Response Team.", true, "24/7 SRT."],
    ["Firewall Manager requires AWS Organizations.", true, "It manages policies across accounts."],
    ["Security groups protect against SQL injection.", false, "That's a layer 7 WAF job."],
    ["WAF managed rule groups provide prebuilt protections.", true, "AWS and Marketplace rule groups."]
  ],
  quiz: [
    ["A web app behind an ALB is targeted by SQL injection and cross-site scripting attempts. What should be used?", ["AWS WAF with managed rule groups on the ALB", "Security group deny rules", "Network ACLs", "AWS Shield Standard"], [0], "Layer 7 attacks → WAF."],
    ["A company wants DDoS cost protection and 24/7 access to AWS experts during attacks. What should it subscribe to?", ["AWS Shield Advanced", "AWS Shield Standard", "Amazon GuardDuty", "AWS Firewall Manager only"], [0], "Shield Advanced adds SRT and cost protection."],
    ["A login page is being brute-forced from many requests per IP. What is the simplest mitigation?", ["A WAF rate-based rule", "A larger ALB", "Shield Standard", "VPC Flow Logs"], [0], "Rate-based rules block abusive IPs."],
    ["Security must enforce consistent WAF rules and security group policies across 80 accounts automatically. What should be used?", ["AWS Firewall Manager", "Manual WAF setup in each account", "AWS Config only", "IAM permission boundaries"], [0], "Firewall Manager centrally deploys protections."],
    ["Outbound traffic from VPCs must be filtered by domain name and inspected by an intrusion prevention system. What should be used?", ["AWS Network Firewall", "AWS WAF", "Security groups", "Route 53 Resolver only"], [0], "Network Firewall does stateful inspection, IPS and domain filtering."],
    ["Which TWO resources can AWS WAF protect directly? (Choose two.)", ["Amazon CloudFront distributions", "Application Load Balancers", "Network Load Balancers", "EC2 instances directly", "Amazon RDS"], [0, 1], "CloudFront, ALB, API Gateway, AppSync, Cognito…"],
    ["Traffic from certain countries must be blocked at the application layer for an API Gateway API. What should be used?", ["AWS WAF geo match rule", "Network ACL", "Shield Advanced", "VPC endpoint policy"], [0], "WAF geo match conditions."],
    ["A company wants to absorb volumetric DDoS attacks before they reach its origin. What architecture helps most?", ["Serve through CloudFront and Route 53 with Shield protection", "Single EC2 instance with a large security group", "Public S3 bucket", "NAT gateway in front of the app"], [0], "Edge services absorb and scale against DDoS."],
    ["DNS queries from VPC resources to known malicious domains must be blocked. What should be used?", ["Route 53 Resolver DNS Firewall", "AWS WAF", "Shield Advanced", "Security groups"], [0], "DNS Firewall filters outbound DNS queries."],
    ["An attack on an ALB causes Auto Scaling to add many instances. Which service can provide credits for the scaling charges?", ["AWS Shield Advanced", "AWS WAF", "Amazon GuardDuty", "AWS Trusted Advisor"], [0], "Shield Advanced offers DDoS cost protection."]
  ]
});

L("detect", {
  match: [
    ["Amazon GuardDuty", "Threat detection from CloudTrail, VPC Flow Logs and DNS logs"],
    ["Amazon Inspector", "Scans EC2, ECR images and Lambda for vulnerabilities"],
    ["Amazon Macie", "Discovers sensitive data like PII in S3"],
    ["AWS Security Hub", "Aggregates findings and checks against standards"],
    ["Amazon Detective", "Investigates root cause of security findings"],
    ["AWS Config", "Records resource configuration and evaluates compliance rules"]
  ],
  sort: { title: "Which detection service?", buckets: ["GuardDuty", "Inspector", "Macie", "Config"], items: [
    ["An instance is communicating with a known crypto-mining domain", 0], ["Container images have a critical CVE", 1],
    ["Credit card numbers found in an S3 bucket", 2], ["Is any S3 bucket publicly readable right now and historically?", 3],
    ["Unusual API calls from a Tor exit node", 0], ["EC2 instances missing OS patches", 1]
  ]},
  tf: [
    ["GuardDuty requires you to deploy agents on EC2.", false, "It analyzes logs; no agents needed (runtime monitoring optional)."],
    ["Macie uses ML to find sensitive data in S3.", true, "PII, credentials, financial data."],
    ["Config rules can automatically remediate with SSM Automation.", true, "Auto-remediation."],
    ["Security Hub can aggregate findings across accounts and Regions.", true, "Central view."],
    ["Inspector scans S3 buckets for PII.", false, "That's Macie."],
    ["CloudTrail is the source of truth for who made an API call.", true, "Audit trail."]
  ],
  quiz: [
    ["A company wants intelligent threat detection that analyzes CloudTrail, VPC Flow Logs and DNS logs without agents. What should it enable?", ["Amazon GuardDuty", "Amazon Inspector", "AWS Config", "Amazon Macie"], [0], "GuardDuty analyzes those sources for threats."],
    ["Security must automatically find PII in thousands of S3 buckets. What should be used?", ["Amazon Macie", "Amazon GuardDuty", "AWS Shield", "AWS Trusted Advisor"], [0], "Macie discovers sensitive data in S3."],
    ["The team needs continuous vulnerability scanning of EC2 instances, ECR images and Lambda functions. What service?", ["Amazon Inspector", "Amazon Detective", "AWS Config", "AWS Artifact"], [0], "Inspector scans for CVEs and exposure."],
    ["Compliance requires detecting and automatically fixing S3 buckets that become public. What should be used?", ["AWS Config rule with automatic remediation", "GuardDuty only", "CloudWatch dashboards", "IAM Access Analyzer reports monthly"], [0], "Config evaluates and remediates via SSM Automation."],
    ["Security needs a single dashboard of findings from GuardDuty, Inspector and Macie checked against CIS benchmarks. What service?", ["AWS Security Hub", "Amazon Detective", "AWS Audit Manager", "Amazon CloudWatch"], [0], "Security Hub aggregates and runs standards."],
    ["After a GuardDuty finding, analysts need to visualize related activity to find the root cause. What should be used?", ["Amazon Detective", "Amazon Macie", "AWS Config", "Amazon Inspector"], [0], "Detective builds behavior graphs for investigation."],
    ["Which TWO services help prove who changed a resource and what the configuration was before and after? (Choose two.)", ["AWS CloudTrail", "AWS Config", "Amazon Macie", "AWS Shield", "Amazon Polly"], [0, 1], "CloudTrail = who; Config = what changed."],
    ["A GuardDuty finding of high severity should automatically isolate the instance. What is the simplest design?", ["EventBridge rule on GuardDuty findings that triggers a Lambda or SSM Automation", "Email the team", "Config rule without remediation", "Manual review weekly"], [0], "GuardDuty sends findings to EventBridge for automation."],
    ["Auditors need AWS compliance reports such as SOC and ISO certifications. Where can they download them?", ["AWS Artifact", "AWS Audit Manager", "AWS Config", "Security Hub"], [0], "Artifact provides AWS compliance documents."],
    ["A company must continuously collect evidence to prepare for audits against a framework like PCI DSS. What service?", ["AWS Audit Manager", "AWS Artifact", "Amazon Macie", "AWS Trusted Advisor"], [0], "Audit Manager automates evidence collection."]
  ]
});

L("kms", {
  match: [
    ["AWS managed key", "Created by a service (aws/s3), rotated yearly, limited control"],
    ["Customer managed key", "You control key policy, rotation and deletion"],
    ["Envelope encryption", "Data key encrypts data; KMS key encrypts the data key"],
    ["CloudHSM", "Dedicated single-tenant HSMs under your exclusive control"],
    ["Secrets Manager", "Stores secrets with automatic rotation (e.g., RDS passwords)"],
    ["ACM", "Free public TLS certificates with auto renewal"]
  ],
  sort: { title: "KMS, CloudHSM, Secrets Manager or ACM?", buckets: ["KMS", "CloudHSM", "Secrets Manager", "ACM"], items: [
    ["FIPS 140-2 Level 3 single-tenant key control", 1], ["Rotate an RDS password every 30 days", 2], ["HTTPS certificate for an ALB", 3],
    ["Encrypt EBS volumes with a key you can audit", 0], ["Store third-party API keys with rotation via Lambda", 2], ["Multi-Region keys for client-side encryption", 0]
  ]},
  tf: [
    ["KMS keys are Regional unless you create multi-Region keys.", true, "Multi-Region keys share key material."],
    ["KMS can directly encrypt data up to 4 KB.", true, "Larger data uses envelope encryption."],
    ["Deleting a KMS key happens immediately.", false, "Minimum 7-day waiting period (7-30 days)."],
    ["ACM certificates can be installed on EC2 instances directly.", false, "Public ACM certs are used with ELB, CloudFront, API Gateway."],
    ["Secrets Manager can rotate secrets automatically.", true, "Built-in for RDS, Lambda for others."],
    ["Copying an encrypted snapshot to another Region requires a key in the destination Region.", true, "Re-encrypt with a destination key."]
  ],
  quiz: [
    ["A company needs to control who can use encryption keys and audit every use in CloudTrail. What should it use?", ["KMS customer managed keys with key policies", "SSE-S3", "AWS managed keys only", "Client-side keys stored in code"], [0], "Customer managed keys give policy control and audit."],
    ["Regulations require single-tenant hardware security modules where AWS has no access to keys. What should be used?", ["AWS CloudHSM", "AWS KMS default key store", "Secrets Manager", "ACM Private CA"], [0], "CloudHSM is dedicated and customer-controlled."],
    ["Database credentials must be rotated automatically every 30 days without code changes to retrieve them. What should be used?", ["AWS Secrets Manager with rotation", "Parameter Store standard parameters", "Environment variables", "KMS key rotation"], [0], "Secrets Manager rotates RDS credentials natively."],
    ["An ALB needs a free public TLS certificate that renews automatically. What should be used?", ["AWS Certificate Manager", "Self-signed certificate on EC2", "CloudHSM", "IAM server certificates"], [0], "ACM issues and renews public certs for ELB/CloudFront."],
    ["An encrypted EBS snapshot must be copied to another Region for DR. What must happen?", ["Copy the snapshot specifying a KMS key in the destination Region", "Copy it unencrypted", "Share the source KMS key across Regions automatically", "Use SSE-S3"], [0], "KMS keys are Regional."],
    ["An application must encrypt 5 GB files with KMS. How does this work?", ["Use envelope encryption with GenerateDataKey", "Call KMS Encrypt on the full file", "Upload the file to KMS", "Use ACM"], [0], "KMS Encrypt is limited to 4 KB; use data keys."],
    ["Which TWO are true about KMS key rotation? (Choose two.)", ["Automatic rotation can be enabled for customer managed symmetric keys", "AWS managed keys rotate automatically every year", "Rotation re-encrypts all existing data", "Imported key material rotates automatically", "Rotation changes the key ID"], [0, 1], "Rotation keeps the key ID and old material for decryption."],
    ["A global app must encrypt data in one Region and decrypt in another without cross-Region KMS calls. What should be used?", ["KMS multi-Region keys", "Two unrelated keys", "CloudHSM in one Region", "SSE-S3"], [0], "Multi-Region keys share key material."],
    ["A KMS key was scheduled for deletion by mistake. What can be done?", ["Cancel deletion during the 7-30 day waiting period", "Nothing; deletion is immediate", "Restore from a snapshot", "Contact AWS Support to undelete after 30 days"], [0], "Deletion has a mandatory waiting period."],
    ["Configuration values that are not secret must be stored cheaply with versioning and hierarchy. What should be used?", ["Systems Manager Parameter Store", "Secrets Manager", "CloudHSM", "ACM"], [0], "Parameter Store standard tier is free for config."]
  ]
});

L("identity", {
  match: [
    ["IAM Identity Center", "Workforce SSO to multiple AWS accounts and business apps"],
    ["Cognito user pools", "User directory for app sign-up/sign-in, returns JWTs"],
    ["Cognito identity pools", "Exchange identities for temporary AWS credentials"],
    ["AWS Directory Service (Managed Microsoft AD)", "Managed AD in AWS, trusts with on-prem AD"],
    ["AD Connector", "Proxy that redirects requests to on-prem AD, no caching"],
    ["SAML 2.0 federation", "Use corporate IdP to sign in to AWS"]
  ],
  sort: { title: "Workforce or customer identity?", buckets: ["IAM Identity Center", "Cognito"], items: [
    ["Employees sign in once to 40 AWS accounts", 0], ["Mobile app users sign up with Google", 1], ["Assign permission sets per account", 0],
    ["Give app users temporary S3 access to their own folder", 1], ["Use Okta/Entra ID as source for engineers", 0], ["Millions of consumer users with MFA", 1]
  ]},
  tf: [
    ["Cognito user pools issue JWT tokens.", true, "ID and access tokens."],
    ["Identity pools provide temporary AWS credentials.", true, "Via STS."],
    ["AD Connector caches directory data in AWS.", false, "It proxies requests to on-prem AD."],
    ["IAM Identity Center can use an external IdP as the identity source.", true, "SAML/SCIM."],
    ["Simple AD supports trust relationships with on-prem AD.", false, "Use Managed Microsoft AD for trusts."],
    ["Permission sets in Identity Center become IAM roles in each account.", true, "Provisioned roles."]
  ],
  quiz: [
    ["Employees must use their corporate credentials to access 50 AWS accounts with single sign-on. What should be used?", ["AWS IAM Identity Center with the corporate IdP", "IAM users in every account", "Cognito user pools", "Shared root credentials"], [0], "Identity Center is the workforce SSO service."],
    ["A mobile app needs user sign-up, sign-in and social login with minimal code. What should be used?", ["Amazon Cognito user pools", "IAM users per customer", "AWS Directory Service", "IAM Identity Center"], [0], "Cognito user pools handle customer identity."],
    ["Mobile app users must upload directly to their own S3 prefix with temporary credentials. What should be used?", ["Cognito identity pools with an IAM role scoped by identity ID", "Embedded access keys", "Public bucket", "IAM Identity Center"], [0], "Identity pools issue scoped temporary credentials."],
    ["Windows workloads in AWS need Active Directory with a trust to the on-prem AD. What should be used?", ["AWS Managed Microsoft AD", "Simple AD", "AD Connector", "Cognito"], [0], "Managed AD supports trusts."],
    ["A company wants AWS services to authenticate against on-prem AD without storing directory data in AWS. What should be used?", ["AD Connector", "Simple AD", "Managed Microsoft AD", "Cognito user pools"], [0], "AD Connector proxies to on-prem."],
    ["Which TWO statements about Cognito are true? (Choose two.)", ["User pools are user directories that return JWTs", "Identity pools grant temporary AWS credentials", "Identity pools store passwords", "User pools replace IAM roles", "Cognito is for workforce SSO to AWS accounts"], [0, 1], "User pools = authentication; identity pools = AWS access."],
    ["A company uses SAML 2.0 IdP and wants users to assume IAM roles in a single account. What enables this?", ["IAM SAML identity provider with role trust", "Cognito user pools", "AD Connector", "Access keys"], [0], "IAM SAML federation via AssumeRoleWithSAML."],
    ["An ALB-fronted app must authenticate customers via a Cognito user pool without code changes. What is used?", ["ALB authenticate-cognito action", "Security groups", "WAF geo rules", "NLB TLS"], [0], "ALB listener rule authentication."],
    ["A small team needs a basic, low-cost Samba-based directory for Linux workloads with no on-prem trust. What fits?", ["Simple AD", "Managed Microsoft AD", "AD Connector", "IAM Identity Center"], [0], "Simple AD is cheap and basic."],
    ["Users authenticated through a web identity provider must call AWS APIs from the browser. Which STS API is used under the hood?", ["AssumeRoleWithWebIdentity", "GetSessionToken", "AssumeRoleWithSAML", "GetFederationToken"], [0], "Web identity federation (Cognito identity pools wrap this)."]
  ]
});

L("governance", {
  match: [
    ["AWS Organizations", "Manage many accounts with OUs and consolidated billing"],
    ["Service control policy", "Sets the maximum permissions for accounts in an OU"],
    ["AWS Control Tower", "Sets up a governed landing zone with guardrails"],
    ["AWS RAM", "Shares resources like subnets and TGWs across accounts"],
    ["Tag policies", "Standardize tags across an organization"],
    ["AWS Service Catalog", "Approved, self-service product portfolio for users"]
  ],
  sort: { title: "Which governance tool?", buckets: ["SCP", "Control Tower", "RAM", "Service Catalog"], items: [
    ["Prevent any account from leaving approved Regions", 0], ["Spin up a new multi-account landing zone with best practices", 1],
    ["Share a VPC subnet with other accounts", 2], ["Let developers launch only approved CloudFormation products", 3],
    ["Deny disabling CloudTrail in member accounts", 0], ["Account Factory for new accounts", 1]
  ]},
  tf: [
    ["SCPs grant permissions.", false, "SCPs only limit; IAM policies still must allow."],
    ["SCPs affect the management account.", false, "The management account is not restricted by SCPs."],
    ["Consolidated billing can share Reserved Instance discounts across accounts.", true, "Volume and RI/SP sharing."],
    ["Control Tower uses Organizations under the hood.", true, "Plus guardrails and Account Factory."],
    ["RAM can share Transit Gateways across accounts.", true, "Also subnets, Route 53 Resolver rules and more."],
    ["Trusted Advisor checks cost, security, performance and fault tolerance.", true, "Plus service limits and operational excellence."]
  ],
  quiz: [
    ["Developer accounts must never be able to use Regions outside eu-west-1, even by administrators in those accounts. What should be used?", ["An SCP denying actions outside eu-west-1 on the OU", "IAM policies in each account", "AWS Config rules", "Permission boundaries"], [0], "SCPs restrict even account admins."],
    ["A company wants to set up a multi-account environment quickly with best-practice guardrails and centralized logging. What should it use?", ["AWS Control Tower", "Manual Organizations setup", "AWS Service Catalog", "AWS RAM"], [0], "Control Tower creates a governed landing zone."],
    ["A central networking account must share subnets with application accounts so they launch into one VPC. What should be used?", ["AWS RAM VPC sharing", "VPC peering to each account", "Transit Gateway per account", "Copy the VPC"], [0], "RAM shares subnets."],
    ["An organization wants a single bill and to share volume discounts across accounts. What enables this?", ["Consolidated billing in AWS Organizations", "Cost Explorer", "AWS Budgets", "Separate payment methods"], [0], "Consolidated billing aggregates usage."],
    ["Users should only deploy pre-approved, tagged infrastructure products via self-service. What should be used?", ["AWS Service Catalog", "AWS Control Tower guardrails only", "AWS RAM", "IAM Access Analyzer"], [0], "Service Catalog offers approved portfolios."],
    ["Which TWO statements about SCPs are correct? (Choose two.)", ["SCPs define maximum available permissions", "An action must be allowed by both SCPs and IAM policies", "SCPs grant permissions to users", "SCPs apply to the management account", "SCPs replace IAM roles"], [0, 1], "SCPs are guardrails, not grants."],
    ["The company needs to enforce consistent tag keys and values across all accounts. What should be used?", ["Tag policies in AWS Organizations", "Cost allocation tags only", "AWS Config advanced queries", "Resource Groups"], [0], "Tag policies standardize tags."],
    ["A team wants checks for idle resources, open security groups and service quotas. What service provides these recommendations?", ["AWS Trusted Advisor", "AWS Artifact", "Amazon Macie", "AWS Audit Manager"], [0], "Trusted Advisor gives best-practice checks."],
    ["Member accounts must not be able to disable GuardDuty or leave the organization. What should be used?", ["SCPs denying those actions", "IAM groups", "AWS Budgets actions", "Tag policies"], [0], "SCP deny statements enforce this."],
    ["A company wants to centrally manage backup policies for all accounts. What should be used?", ["AWS Organizations backup policies with AWS Backup", "Local snapshots per account", "AWS RAM", "Service Catalog"], [0], "Backup policies are an Organizations policy type."]
  ]
});

L("cost", {
  match: [
    ["AWS Budgets", "Alerts when actual or forecast spend crosses a threshold"],
    ["Cost Explorer", "Visualize and forecast costs and usage"],
    ["Cost and Usage Report", "Most granular billing data delivered to S3"],
    ["Compute Optimizer", "ML right-sizing recommendations for EC2, EBS, Lambda"],
    ["Cost allocation tags", "Split costs by project or team in reports"],
    ["Savings Plans", "Commit $/hour for 1 or 3 years for discounts"]
  ],
  sort: { title: "Which cost tool?", buckets: ["Budgets", "Cost Explorer", "CUR", "Compute Optimizer"], items: [
    ["Email me when forecast spend exceeds $5,000", 0], ["Chart last 12 months by service", 1], ["Hourly line items queried with Athena", 2],
    ["Which instances are over-provisioned?", 3], ["Stop instances automatically when budget is exceeded", 0], ["Forecast next 3 months of spend", 1]
  ]},
  tf: [
    ["Cost allocation tags must be activated in Billing before appearing in reports.", true, "Activation required."],
    ["Compute Optimizer uses CloudWatch metrics for recommendations.", true, "ML on utilization."],
    ["Budgets can only alert on actual spend.", false, "Also forecasted spend, usage, RI/SP coverage."],
    ["CUR is the most detailed billing data source.", true, "Hourly, per resource."],
    ["Data transfer into AWS is generally free.", true, "Egress is charged."],
    ["Compute Savings Plans apply to Fargate and Lambda.", true, "Plus EC2 any family/Region."]
  ],
  quiz: [
    ["Finance wants an alert when forecasted monthly spend will exceed the budget. What should be used?", ["AWS Budgets with a forecast-based alert", "Cost Explorer", "CloudTrail", "Trusted Advisor"], [0], "Budgets alert on forecasted spend."],
    ["A company must charge back costs to departments. What should be done?", ["Tag resources and activate cost allocation tags", "Create separate Regions per department", "Use CloudWatch dashboards", "Use IAM groups"], [0], "Activated tags split costs in reports."],
    ["Analysts need the most granular billing data to build custom reports with Athena. What should be used?", ["Cost and Usage Report delivered to S3", "Cost Explorer default reports", "AWS Budgets", "Billing dashboard"], [0], "CUR is hourly, per resource."],
    ["EC2 instances appear oversized. Which service recommends right-sizing based on utilization?", ["AWS Compute Optimizer", "AWS Budgets", "AWS Artifact", "Amazon Inspector"], [0], "Compute Optimizer gives right-sizing recommendations."],
    ["A company runs steady EC2, Fargate and Lambda workloads and wants the most flexible commitment-based discount. What should it buy?", ["Compute Savings Plans", "EC2 Instance Savings Plans", "Standard Reserved Instances", "Spot Instances"], [0], "Compute SP covers all three."],
    ["Development instances run 24/7 but are used only during business hours. What reduces cost with minimal effort?", ["Schedule stop/start with Instance Scheduler or EventBridge + SSM", "Buy 3-year RIs", "Move to Dedicated Hosts", "Increase instance size"], [0], "Stop unused instances outside hours."],
    ["Which TWO reduce data transfer costs? (Choose two.)", ["Use VPC gateway endpoints for S3 traffic instead of NAT gateways", "Serve content via CloudFront", "Route all traffic through a NAT gateway", "Replicate everything to all Regions", "Use public IPs for internal traffic"], [0, 1], "Gateway endpoints avoid NAT processing; CloudFront lowers egress costs."],
    ["Management wants to automatically restrict new resource creation when a project's budget is exceeded. What should be used?", ["AWS Budgets actions applying an IAM policy or SCP", "Cost Explorer alerts", "CloudTrail Insights", "AWS Config conformance pack"], [0], "Budget actions can apply policies or stop instances."],
    ["A team wants to detect unusual spikes in spend automatically. What should be used?", ["AWS Cost Anomaly Detection", "AWS Artifact", "AWS Shield", "CloudFront reports"], [0], "ML-based anomaly detection on cost."],
    ["Which purchasing option gives the deepest discount for interruptible workloads?", ["Spot Instances", "Savings Plans", "Reserved Instances", "On-Demand Capacity Reservations"], [0], "Spot can be up to 90% off."]
  ]
});
