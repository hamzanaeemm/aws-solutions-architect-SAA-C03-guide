/* Practice data: Scaling, Availability & DNS. */

L("elb", {
  match: [
    ["Application Load Balancer", "Layer 7: path/host routing, HTTP/HTTPS, gRPC, WebSockets"],
    ["Network Load Balancer", "Layer 4: TCP/UDP, millions of req/s, static IP per AZ"],
    ["Gateway Load Balancer", "Layer 3: inserts third-party virtual appliances (GENEVE)"],
    ["Sticky sessions", "Bind a user to the same target via a cookie"],
    ["Cross-zone load balancing", "Spread traffic evenly across targets in all AZs"],
    ["Connection draining (deregistration delay)", "Let in-flight requests finish before removing a target"]
  ],
  sort: { title: "ALB, NLB or GWLB?", buckets: ["ALB", "NLB", "GWLB"], items: [
    ["Route /api and /images to different target groups", 0], ["Static Elastic IP for firewall allow-listing", 1],
    ["Insert a fleet of third-party firewalls", 2], ["Ultra-low latency TCP gaming traffic", 1],
    ["Authenticate users with Cognito before the app", 0], ["Front end for PrivateLink endpoint services", 1],
    ["Route by host header to multiple domains", 0]
  ]},
  tf: [
    ["An ALB supports static IP addresses natively.", false, "Use an NLB (or Global Accelerator) for static IPs."],
    ["NLBs can route UDP traffic.", true, "TCP, UDP and TLS."],
    ["ALB can route to Lambda functions as targets.", true, "Lambda is a supported target type."],
    ["The client IP is available to targets behind an ALB in the X-Forwarded-For header.", true, "ALB terminates the connection."],
    ["SNI lets one ALB serve multiple TLS certificates.", true, "Server Name Indication picks the right cert."],
    ["Gateway Load Balancer works at layer 7.", false, "It works at layer 3 (IP packets)."]
  ],
  quiz: [
    ["A microservices app must route requests by URL path (/orders, /users) to different services. Which load balancer?", ["Application Load Balancer", "Network Load Balancer", "Gateway Load Balancer", "Classic Load Balancer"], [0], "Path-based routing is ALB (layer 7)."],
    ["A partner must allow-list fixed IP addresses for a TCP service that handles millions of requests per second. What should be used?", ["Network Load Balancer with Elastic IPs", "Application Load Balancer", "CloudFront", "Classic Load Balancer"], [0], "NLB has one static IP per AZ and extreme performance."],
    ["A company wants to inspect all VPC traffic through a fleet of third-party firewall appliances that scale automatically. What should be used?", ["Gateway Load Balancer", "Application Load Balancer", "Network Load Balancer", "AWS WAF"], [0], "GWLB is designed for virtual appliances."],
    ["A legacy app stores session state in memory, and users lose their sessions when routed to another instance. What is the quickest fix?", ["Enable sticky sessions on the ALB target group", "Use an NLB", "Enable cross-zone load balancing", "Increase the deregistration delay"], [0], "Stickiness keeps a user on the same target (better long-term: externalize sessions)."],
    ["One ALB must serve HTTPS for app1.example.com and app2.example.com with different certificates. What enables this?", ["Server Name Indication (SNI) with multiple certificates", "Two listeners on port 443", "An NLB with TLS passthrough", "Separate ALBs are required"], [0], "SNI allows multiple certs on one listener."],
    ["During deployments, users see errors when instances are removed mid-request. What should be configured?", ["Deregistration delay (connection draining)", "Sticky sessions", "Cross-zone load balancing", "Slow start mode only"], [0], "Draining lets in-flight requests complete."],
    ["The application needs the original client IP address in logs. It is behind an ALB. Where is it?", ["The X-Forwarded-For header", "The source IP of the packet", "The Host header", "VPC Flow Logs only"], [0], "ALB adds X-Forwarded-For."],
    ["Which TWO are valid ALB target types? (Choose two.)", ["EC2 instances", "Lambda functions", "S3 buckets", "DynamoDB tables", "SQS queues"], [0, 1], "ALB targets: instances, IPs and Lambda."],
    ["The company wants users to sign in with a social identity provider before reaching the web app, without code changes. What should it use?", ["ALB authentication with Amazon Cognito", "NLB with TLS", "Security group rules", "AWS Shield Advanced"], [0], "ALB listener rules can authenticate via Cognito/OIDC."],
    ["An ALB sends unhealthy instances traffic for too long. What should be tuned?", ["Health check interval and unhealthy threshold", "Sticky session duration", "Idle timeout", "SNI settings"], [0], "Health checks decide when targets are taken out."]
  ]
});

L("asg", {
  match: [
    ["Target tracking", "Keep a metric like average CPU at 50%"],
    ["Step scaling", "Add or remove capacity in steps based on alarm breach size"],
    ["Scheduled scaling", "Change capacity at known times like 9 AM weekdays"],
    ["Predictive scaling", "ML forecasts load and scales ahead of time"],
    ["Launch template", "Defines AMI, instance type, security groups for new instances"],
    ["Warm pool", "Pre-initialized instances to cut scale-out time"]
  ],
  sort: { title: "Which scaling policy?", buckets: ["Target tracking", "Scheduled", "Predictive"], items: [
    ["Keep ALB requests per target at 1,000", 0], ["Every Monday 8 AM the payroll app gets busy", 1],
    ["Daily cyclical traffic, scale before it arrives", 2], ["Maintain 60% average CPU", 0], ["Black Friday known start time", 1]
  ]},
  tf: [
    ["An ASG can replace instances that fail ELB health checks.", true, "Enable ELB health check type on the ASG."],
    ["Launch configurations are the recommended way to define instances.", false, "Use launch templates; launch configurations are legacy."],
    ["The default termination policy favors the AZ with the most instances.", true, "Then the oldest launch template/config."],
    ["Scaling cooldown helps prevent rapid repeated scaling.", true, "Default 300 seconds."],
    ["An ASG can span multiple Regions.", false, "ASGs span AZs in one Region."],
    ["Lifecycle hooks let you run actions before an instance goes InService or terminates.", true, "E.g., install software or drain logs."]
  ],
  quiz: [
    ["A web tier should keep average CPU near 50% as load changes. Which policy requires the least configuration?", ["Target tracking scaling", "Step scaling", "Simple scaling", "Scheduled scaling"], [0], "Target tracking automatically adjusts to hold a metric."],
    ["Traffic spikes every weekday at 9 AM. Instances take 5 minutes to boot. What prevents slowness at 9 AM?", ["Scheduled scaling to add capacity before 9 AM", "Target tracking on CPU", "Increase the cooldown", "Use Spot Instances"], [0], "Known schedule → scheduled scaling."],
    ["An application has recurring daily patterns and the team wants capacity provisioned ahead of forecast demand. What should it use?", ["Predictive scaling", "Simple scaling", "Manual scaling", "Step scaling with long cooldown"], [0], "Predictive scaling uses ML on history."],
    ["Instances that fail application health checks behind an ALB are not being replaced. What should be changed?", ["Set the ASG health check type to ELB", "Increase the desired capacity", "Add a lifecycle hook", "Use a launch configuration"], [0], "By default ASG uses only EC2 status checks."],
    ["Logs must be copied off instances before they terminate in a scale-in. What should be used?", ["An Auto Scaling lifecycle hook on termination", "A CloudWatch alarm", "Termination protection", "A larger cooldown"], [0], "Lifecycle hooks pause termination for custom actions."],
    ["An ASG needs a mix of On-Demand and Spot across several instance types for cost and availability. What enables this?", ["A mixed instances policy with a launch template", "A launch configuration", "Dedicated Hosts", "Placement groups"], [0], "Mixed instances policy supports multiple types and purchase options."],
    ["New instances take 10 minutes to initialize, delaying scale-out. What reduces this delay?", ["Warm pools", "Shorter cooldown", "Step scaling", "Termination policies"], [0], "Warm pools keep pre-initialized instances ready."],
    ["Which TWO metrics are good target-tracking choices for a web tier behind an ALB? (Choose two.)", ["ALBRequestCountPerTarget", "Average CPU utilization", "Disk free space", "Number of IAM users", "S3 bucket size"], [0, 1], "Request count per target and CPU are standard."],
    ["An ASG must maintain availability across AZs if one AZ fails. What configuration is required?", ["Subnets in multiple AZs with min capacity sized for the loss of one AZ", "One large instance in one AZ", "A cluster placement group", "A single subnet with many instances"], [0], "Multi-AZ subnets let the ASG rebalance after AZ failure."],
    ["A company wants to roll out a new AMI to an ASG gradually while keeping capacity. What feature helps?", ["Instance refresh", "Scheduled scaling", "Termination protection", "Detailed monitoring"], [0], "Instance refresh replaces instances in batches."]
  ]
});

L("monitoring", {
  match: [
    ["CloudWatch metrics", "Numeric time-series data like CPUUtilization"],
    ["CloudWatch Logs", "Store, search and retain log data"],
    ["CloudWatch agent", "Collects memory, disk and custom logs from EC2/on-prem"],
    ["CloudWatch alarm", "Triggers actions when a metric crosses a threshold"],
    ["AWS CloudTrail", "Records API calls: who did what, when"],
    ["AWS X-Ray", "Traces requests across distributed services"]
  ],
  sort: { title: "Which tool answers it?", buckets: ["CloudWatch", "CloudTrail", "AWS Config", "X-Ray"], items: [
    ["Who deleted the S3 bucket?", 1], ["Is CPU above 80%?", 0], ["Was this security group compliant last week?", 2],
    ["Which microservice adds latency?", 3], ["Alert when error logs spike", 0], ["Track resource configuration history", 2]
  ]},
  tf: [
    ["EC2 memory utilization is a default CloudWatch metric.", false, "Install the CloudWatch agent for memory and disk."],
    ["Basic EC2 monitoring publishes metrics every 5 minutes.", true, "Detailed monitoring is every 1 minute."],
    ["CloudTrail management events are logged by default for 90 days in Event history.", true, "Create a trail for longer retention to S3."],
    ["CloudWatch Logs Insights lets you query logs interactively.", true, "Purpose-built query language."],
    ["EventBridge can react to AWS API events recorded by CloudTrail.", true, "E.g., trigger Lambda on a specific API call."],
    ["X-Ray is used to audit IAM changes.", false, "That's CloudTrail."]
  ],
  quiz: [
    ["Operators need alerts when EC2 memory usage exceeds 85%. What is required?", ["Install the CloudWatch agent and create an alarm on the memory metric", "Enable detailed monitoring", "Use CloudTrail", "Enable VPC Flow Logs"], [0], "Memory is not a default hypervisor metric."],
    ["A security team must find out who terminated an EC2 instance yesterday. Where should they look?", ["AWS CloudTrail", "CloudWatch metrics", "AWS X-Ray", "VPC Flow Logs"], [0], "CloudTrail records API calls with identity."],
    ["A distributed serverless app has intermittent latency and the team needs to see which downstream call is slow. What should be used?", ["AWS X-Ray", "AWS Config", "CloudTrail Insights", "Amazon Inspector"], [0], "X-Ray traces requests end to end."],
    ["The company must keep a history of resource configuration changes and evaluate them against rules. What service?", ["AWS Config", "CloudWatch Logs", "AWS X-Ray", "Trusted Advisor"], [0], "Config records configuration and compliance."],
    ["A Lambda function should run automatically whenever someone creates an IAM access key. What is the simplest design?", ["An EventBridge rule matching the CloudTrail CreateAccessKey event", "Poll IAM every minute", "Use a CloudWatch metric filter on EC2 logs", "Use AWS Config with no rules"], [0], "EventBridge reacts to CloudTrail-delivered API events."],
    ["CloudTrail logs must be protected from tampering. What should be enabled? (Choose two.)", ["Log file integrity validation", "Store logs in a separate, locked-down S3 bucket (ideally another account) with Object Lock", "Detailed monitoring", "X-Ray tracing", "CloudWatch dashboards"], [0, 1], "Integrity validation + protected storage."],
    ["Teams need one place to view metrics and alarms from many accounts and Regions. What should be used?", ["CloudWatch cross-account observability with dashboards", "Separate consoles per account", "CloudTrail Lake", "AWS Config aggregators only"], [0], "CloudWatch supports cross-account, cross-Region dashboards."],
    ["The team must count occurrences of the word ERROR in application logs and alarm on it. What should be created?", ["A CloudWatch Logs metric filter and an alarm", "A CloudTrail trail", "An X-Ray group", "An AWS Config rule"], [0], "Metric filters turn log patterns into metrics."],
    ["An instance should automatically recover when it fails the system status check. What should be configured?", ["A CloudWatch alarm with the EC2 recover action", "A CloudTrail event", "A Config rule with no remediation", "An SNS topic only"], [0], "Alarm actions can recover, stop, terminate or reboot."],
    ["Logs must be retained cheaply for 7 years while only recent logs are searched. What is the best approach?", ["Export or subscribe CloudWatch Logs to S3 with lifecycle to Glacier, and set a short log group retention", "Keep all logs in CloudWatch Logs forever", "Store logs in EBS volumes", "Use X-Ray retention"], [0], "S3 + Glacier is far cheaper for long retention."]
  ]
});

L("dr", {
  match: [
    ["Backup and restore", "Lowest cost; RPO/RTO in hours"],
    ["Pilot light", "Core data replicated, minimal services off until needed"],
    ["Warm standby", "Scaled-down but fully running copy of production"],
    ["Multi-site active/active", "Full production in 2+ Regions, near-zero RTO"],
    ["RPO", "How much data loss is acceptable (time since last good copy)"],
    ["RTO", "How long until service is restored"]
  ],
  order: { title: "Cheapest to most expensive", prompt: "Order the DR strategies from lowest cost (highest RTO) to highest cost (lowest RTO).", steps: [
    "Backup and restore", "Pilot light", "Warm standby", "Multi-site active/active"
  ]},
  tf: [
    ["Pilot light keeps a full-size copy of the app running in the DR Region.", false, "That's closer to warm standby/active-active; pilot light keeps only core pieces like the DB."],
    ["RTO measures acceptable data loss.", false, "RPO = data loss; RTO = downtime."],
    ["AWS Elastic Disaster Recovery continuously replicates servers for fast recovery.", true, "Block-level replication, RPO in seconds."],
    ["Lower RTO/RPO usually means higher cost.", true, "Trade-off between cost and recovery speed."],
    ["AWS Backup can copy backups across Regions and accounts.", true, "Cross-Region and cross-account copies."],
    ["Multi-site active/active has the highest RTO.", false, "It has the lowest RTO."]
  ],
  quiz: [
    ["A company can tolerate 24 hours of downtime and wants the lowest-cost DR. Which strategy?", ["Backup and restore", "Pilot light", "Warm standby", "Multi-site active/active"], [0], "Long RTO → cheapest option."],
    ["Recovery must be within 10 minutes with minimal data loss, but cost must be lower than full duplication. Which strategy?", ["Warm standby", "Backup and restore", "Pilot light with AMIs only", "Active/active"], [0], "A scaled-down running copy can scale up quickly."],
    ["The DR plan keeps the database replicated to another Region but app servers are only launched during a disaster. What is this?", ["Pilot light", "Warm standby", "Backup and restore", "Multi-site"], [0], "Core data live, rest off."],
    ["A business-critical app needs near-zero RTO and RPO across Regions. What should be used?", ["Multi-site active/active with Route 53 and global databases", "Daily snapshots copied cross-Region", "Pilot light", "A single Region with Multi-AZ"], [0], "Active/active minimizes both."],
    ["The company needs to replicate on-prem physical servers to AWS for DR with RPO in seconds. What service?", ["AWS Elastic Disaster Recovery", "AWS DataSync", "AWS Snowball", "AWS Backup Vault Lock"], [0], "DRS does continuous block-level replication."],
    ["Which TWO services help centralize and automate backups across many AWS services and accounts? (Choose two.)", ["AWS Backup", "AWS Organizations backup policies", "Amazon Inspector", "AWS X-Ray", "Amazon Macie"], [0, 1], "AWS Backup with org backup policies."],
    ["Backups must be immutable so even administrators cannot delete them. What should be used?", ["AWS Backup Vault Lock in compliance mode", "S3 Standard", "EBS snapshots without tags", "CloudTrail"], [0], "Vault Lock enforces WORM on backups."],
    ["A team defines RPO as 1 hour. What does this mean?", ["At most 1 hour of data may be lost", "Service must be back within 1 hour", "Backups are kept for 1 hour", "Failover takes exactly 1 hour"], [0], "RPO = maximum acceptable data loss."],
    ["Route 53 should send traffic to the DR Region only if the primary fails. Which routing policy?", ["Failover routing with health checks", "Weighted 50/50", "Geolocation routing", "Simple routing"], [0], "Failover routing for active/passive."],
    ["An Aurora-based app needs cross-Region DR with RPO about 1 second. What fits?", ["Aurora Global Database", "Daily snapshot copy", "Multi-AZ only", "RDS Proxy"], [0], "Global Database replicates with ~1s lag."]
  ]
});

L("route53", {
  match: [
    ["Simple routing", "One record, no health checks, can return multiple values randomly"],
    ["Weighted routing", "Split traffic by percentage, e.g., canary releases"],
    ["Latency-based routing", "Send users to the Region with the lowest latency"],
    ["Failover routing", "Active/passive with health checks"],
    ["Geolocation routing", "Route by user's country or continent"],
    ["Alias record", "Points to AWS resources like ELB/CloudFront, works at zone apex, free queries"]
  ],
  sort: { title: "Pick the routing policy", buckets: ["Weighted", "Latency", "Failover", "Geolocation"], items: [
    ["Send 10% of users to a new version", 0], ["EU users must see EU-compliant content", 3], ["Fastest Region for each user", 1],
    ["Switch to standby site when primary is unhealthy", 2], ["Restrict content distribution by country", 3], ["Blue/green shift in steps", 0]
  ]},
  tf: [
    ["A CNAME can be created at the zone apex (example.com).", false, "Use an alias record at the apex."],
    ["Alias queries to AWS resources are free.", true, "No charge for alias queries to AWS resources."],
    ["Geoproximity routing can shift traffic using a bias.", true, "Requires Traffic Flow."],
    ["Route 53 health checks can monitor CloudWatch alarms.", true, "Useful for private resources."],
    ["Multi-value answer routing is a replacement for a load balancer.", false, "It returns up to 8 healthy records; not a true LB."],
    ["Route 53 Resolver endpoints enable DNS between on-prem and VPCs.", true, "Inbound and outbound endpoints."]
  ],
  quiz: [
    ["The root domain example.com must point to an Application Load Balancer. Which record?", ["Alias A record", "CNAME record", "MX record", "TXT record"], [0], "CNAME can't be at the apex; alias can."],
    ["A company wants to send 5% of traffic to a new application version. Which routing policy?", ["Weighted", "Latency", "Geolocation", "Simple"], [0], "Weighted routing splits by percentage."],
    ["Users worldwide should be routed to the Region that gives them the fastest response. Which policy?", ["Latency-based", "Geolocation", "Failover", "Weighted"], [0], "Latency routing chooses the lowest-latency Region."],
    ["Content must be served only to users in Germany from a specific endpoint for licensing. Which policy?", ["Geolocation", "Latency-based", "Weighted", "Multi-value"], [0], "Geolocation routes by user location."],
    ["An active/passive setup must switch to a static S3 maintenance site when the primary ALB fails. What should be configured?", ["Failover routing with a health check on the primary", "Weighted routing 100/0", "Simple routing with two values", "Geoproximity with bias"], [0], "Failover routing + health checks."],
    ["On-premises servers must resolve private hosted zone names in a VPC. What should be used?", ["Route 53 Resolver inbound endpoint", "Route 53 Resolver outbound endpoint", "A public hosted zone", "VPC peering"], [0], "Inbound endpoints accept queries from on-prem."],
    ["Applications in a VPC must resolve names hosted on an on-premises DNS server. What should be used?", ["Route 53 Resolver outbound endpoint with forwarding rules", "Inbound endpoint", "Public hosted zone", "Alias records"], [0], "Outbound endpoints forward queries to on-prem."],
    ["Which TWO are benefits of alias records over CNAMEs? (Choose two.)", ["Can be used at the zone apex", "No charge for queries to AWS resources", "Can point to any external domain", "Support TTL customization for AWS targets", "Work only with EC2 IPs"], [0, 1], "Apex support and free queries."],
    ["A company wants to shift more traffic to a Region by expanding its geographic area. Which policy?", ["Geoproximity with a bias", "Geolocation", "Latency", "Simple"], [0], "Bias grows or shrinks the area served."],
    ["A health check must monitor an internal resource in a private subnet. What is the approach?", ["Create a CloudWatch alarm on a metric and base the health check on the alarm", "Point the health check at the private IP", "Use a public hosted zone", "Use multi-value routing"], [0], "Route 53 checkers are on the internet; use alarm-based checks for private resources."]
  ]
});

L("caching", {
  match: [
    ["CloudFront", "Global CDN caching content at edge locations"],
    ["Origin Access Control", "Lets only CloudFront read a private S3 bucket"],
    ["Global Accelerator", "Two static anycast IPs over the AWS backbone, fast failover"],
    ["CloudFront Functions", "Lightweight JS at the edge for header/URL rewrites"],
    ["Lambda@Edge", "Heavier Node/Python logic at regional edge caches"],
    ["Signed URLs / cookies", "Restrict access to private content via CloudFront"]
  ],
  sort: { title: "CloudFront or Global Accelerator?", buckets: ["CloudFront", "Global Accelerator"], items: [
    ["Cache images and video at the edge", 0], ["Static IPs for a global TCP/UDP game", 1], ["Non-HTTP traffic needing fast Regional failover", 1],
    ["Serve a private S3 website over HTTPS", 0], ["Restrict content with signed cookies", 0], ["Improve performance without caching for UDP", 1]
  ]},
  tf: [
    ["Global Accelerator caches content at edge locations.", false, "It routes traffic; it doesn't cache."],
    ["CloudFront can use an ALB or EC2 as a custom origin.", true, "Any HTTP origin."],
    ["Invalidations remove objects from CloudFront caches before TTL expires.", true, "Or use versioned file names."],
    ["CloudFront geo restriction can block countries.", true, "Allow list or block list."],
    ["CloudFront Functions can access the network and request bodies.", false, "That's Lambda@Edge; Functions are lightweight."],
    ["Global Accelerator provides two static anycast IP addresses.", true, "Good for allow-listing."]
  ],
  quiz: [
    ["A website serves static assets to users worldwide from S3 and must reduce latency and keep the bucket private. What should be used?", ["CloudFront with Origin Access Control", "S3 Transfer Acceleration", "Global Accelerator in front of S3", "Public bucket with Route 53 latency routing"], [0], "CloudFront caches globally; OAC keeps S3 private."],
    ["A multiplayer game uses UDP and needs static IP addresses and fast Regional failover. What should be used?", ["AWS Global Accelerator", "Amazon CloudFront", "Route 53 latency routing", "Application Load Balancer"], [0], "Global Accelerator supports UDP, static IPs and fast failover."],
    ["Premium videos should only be viewable by paying subscribers for a limited time via CloudFront. What should be used?", ["CloudFront signed URLs or signed cookies", "S3 presigned URLs to the origin", "Geo restriction", "WAF rate rules"], [0], "Signed URLs/cookies restrict CloudFront content."],
    ["After deploying new CSS files, users still see old versions from CloudFront. What fixes this immediately?", ["Create a CloudFront invalidation (or use versioned file names)", "Restart the origin", "Reduce the S3 storage class", "Enable Origin Shield"], [0], "Invalidations clear cached objects."],
    ["A company must block access to its content from specific countries. What CloudFront feature?", ["Geo restriction", "Signed cookies", "Origin failover", "Field-level encryption"], [0], "Geo restriction allow/block lists."],
    ["Headers must be rewritten on every request at the edge with sub-millisecond execution at the lowest cost. What should be used?", ["CloudFront Functions", "Lambda@Edge", "API Gateway", "An ALB rule"], [0], "CloudFront Functions are cheap, lightweight edge code."],
    ["CloudFront must automatically switch to a secondary origin if the primary returns 5xx errors. What should be configured?", ["An origin group with origin failover", "Two distributions", "Route 53 weighted routing", "Global Accelerator"], [0], "Origin groups provide failover."],
    ["Which TWO reduce load on the origin for a CloudFront distribution? (Choose two.)", ["Increase cache TTLs for static content", "Enable Origin Shield", "Forward all headers and cookies to the origin", "Disable compression", "Use query strings in every cache key"], [0, 1], "Longer TTLs and Origin Shield improve hit ratio."],
    ["Sensitive form fields like credit card numbers must be encrypted at the edge so only a specific backend can decrypt them. What feature?", ["CloudFront field-level encryption", "SSE-KMS", "TLS 1.3 only", "WAF managed rules"], [0], "Field-level encryption protects specific fields end to end."],
    ["A REST API in one Region has global users and needs to improve TCP connection performance without caching responses. What should be used?", ["AWS Global Accelerator (or CloudFront with caching disabled)", "S3 Transfer Acceleration", "ElastiCache", "DynamoDB global tables"], [0], "Edge entry onto the AWS backbone reduces latency without caching."]
  ]
});
