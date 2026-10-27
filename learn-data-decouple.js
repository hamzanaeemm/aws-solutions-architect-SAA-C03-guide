/* Practice data: Decoupling, Serverless & Automation, plus Miscellaneous Services. */

L("sqs", {
  match: [
    ["Standard queue", "Nearly unlimited throughput, at-least-once, best-effort order"],
    ["FIFO queue", "Exactly-once processing and strict order per message group"],
    ["Visibility timeout", "Hides a message while a consumer processes it"],
    ["Dead-letter queue", "Holds messages that failed processing too many times"],
    ["Long polling", "Waits up to 20 s for messages, fewer empty responses"],
    ["Delay queue", "Postpones delivery of new messages up to 15 minutes"]
  ],
  sort: { title: "Standard or FIFO?", buckets: ["Standard", "FIFO"], items: [
    ["Bank transactions that must be processed in order", 1], ["Image thumbnail jobs at massive scale", 0],
    ["Duplicates must never be processed", 1], ["Order doesn't matter, throughput does", 0],
    ["Uses message group IDs", 1], ["Occasional duplicate delivery is fine", 0]
  ]},
  tf: [
    ["SQS retains messages for up to 14 days.", true, "Default 4 days."],
    ["The maximum SQS message size is 256 KB.", true, "Use the Extended Client Library with S3 for larger payloads."],
    ["A message is deleted automatically once a consumer reads it.", false, "The consumer must call DeleteMessage."],
    ["Long polling reduces cost by reducing empty receives.", true, "Set ReceiveMessageWaitTimeSeconds up to 20."],
    ["Auto Scaling on queue depth (backlog per instance) is a common pattern.", true, "Scale workers on ApproximateNumberOfMessages."],
    ["If processing takes longer than the visibility timeout, the message can be processed twice.", true, "Raise the timeout or call ChangeMessageVisibility."]
  ],
  quiz: [
    ["A web tier drops orders when the processing tier is overloaded. How can the tiers be decoupled so no orders are lost?", ["Put an SQS queue between the tiers", "Add an NLB between the tiers", "Increase EC2 instance size", "Use Route 53 failover"], [0], "Queues buffer requests until workers are ready."],
    ["Financial transactions must be processed exactly once and in order. Which service?", ["SQS FIFO queue", "SQS standard queue", "SNS standard topic", "Kinesis Data Firehose"], [0], "FIFO = ordering + deduplication."],
    ["Messages are being processed twice because processing takes 90 seconds. What should be changed?", ["Increase the visibility timeout above the processing time", "Enable long polling", "Use a delay queue", "Reduce retention"], [0], "Messages reappear when the timeout expires before deletion."],
    ["Some malformed messages fail forever and block processing. What should be configured?", ["A dead-letter queue with a maxReceiveCount", "A longer retention period", "FIFO ordering", "Short polling"], [0], "DLQs isolate poison messages."],
    ["Consumers make many empty ReceiveMessage calls, raising cost. What fixes this?", ["Enable long polling", "Use short polling", "Increase message size", "Add a DLQ"], [0], "Long polling waits for messages."],
    ["Worker EC2 instances should scale with the number of messages in an SQS queue. What should be used?", ["Target tracking on a custom backlog-per-instance metric", "Scheduled scaling", "CPU-based simple scaling only", "Fixed capacity"], [0], "Scale on queue backlog per instance."],
    ["Messages up to 1 GB must flow through SQS. What is the recommended approach?", ["Store payloads in S3 and send a reference using the SQS Extended Client Library", "Increase the SQS max message size", "Use FIFO queues", "Split across many queues randomly"], [0], "SQS max is 256 KB; use S3 pointers."],
    ["Which TWO statements about SQS standard queues are true? (Choose two.)", ["At-least-once delivery", "Best-effort ordering", "Exactly-once delivery", "Strict FIFO ordering", "Maximum 300 TPS"], [0, 1], "Standard = at-least-once, best-effort order, very high throughput."],
    ["A FIFO queue must process orders for different customers in parallel while keeping order per customer. What should be used?", ["Use the customer ID as the message group ID", "Use one message group for all messages", "Switch to a standard queue", "Use a delay queue"], [0], "Ordering is per message group; different groups process in parallel."],
    ["A Lambda function processes SQS messages. A batch fails because one message is bad, causing all to retry. What helps?", ["Enable partial batch responses (ReportBatchItemFailures)", "Increase batch size", "Disable the DLQ", "Use short polling"], [0], "Only failed items return to the queue."]
  ]
});

L("sns", {
  match: [
    ["SNS topic", "Pub/sub channel that pushes messages to many subscribers"],
    ["Fan-out", "SNS topic delivering to several SQS queues"],
    ["Message filtering", "Subscription policy so a subscriber gets only matching messages"],
    ["SNS FIFO", "Ordered, deduplicated pub/sub to SQS FIFO queues"],
    ["Subscriber", "Endpoint like SQS, Lambda, HTTP, email or SMS"],
    ["Message attributes", "Metadata used by filter policies"]
  ],
  sort: { title: "SNS or SQS?", buckets: ["SNS", "SQS"], items: [
    ["Push one event to many systems at once", 0], ["Consumers pull work when ready", 1], ["Send SMS alerts", 0],
    ["Buffer requests during spikes", 1], ["Retain messages for days until processed", 1], ["Email operators on alarm", 0]
  ]},
  tf: [
    ["SNS stores messages for later retrieval like SQS.", false, "SNS pushes; it doesn't persist for polling."],
    ["SNS + SQS fan-out lets each consumer process messages independently.", true, "Each queue gets its own copy."],
    ["SNS can deliver to Lambda functions.", true, "Lambda is a subscriber type."],
    ["Filter policies let subscribers receive only a subset of messages.", true, "Based on attributes or payload."],
    ["CloudWatch alarms can publish to SNS.", true, "Standard alerting path."],
    ["SNS FIFO topics can deliver to email subscribers.", false, "SNS FIFO delivers to SQS (FIFO or standard) queues."]
  ],
  quiz: [
    ["An order event must be processed by billing, shipping and analytics services independently and reliably. What is the best pattern?", ["SNS topic fanning out to three SQS queues", "One SQS queue polled by all three", "Three Lambda functions calling each other", "Kinesis Firehose"], [0], "Fan-out gives each service its own durable queue."],
    ["The shipping service should only receive messages where orderType = 'physical'. What should be used?", ["SNS subscription filter policy", "A separate SNS topic per field", "SQS visibility timeout", "Lambda polling"], [0], "Filter policies route a subset to a subscriber."],
    ["An ops team must receive an email when a CloudWatch alarm fires. What is the simplest solution?", ["Alarm action publishing to an SNS topic with email subscription", "Lambda sending email with SES on a schedule", "SQS queue with email consumers", "CloudTrail notification"], [0], "SNS email subscription is native."],
    ["Events must be fanned out in strict order with deduplication to multiple consumers. What should be used?", ["SNS FIFO topic with SQS FIFO queues", "SNS standard with SQS standard", "EventBridge default bus", "Kinesis Firehose"], [0], "FIFO topics + FIFO queues preserve order."],
    ["Which TWO are valid SNS subscriber types? (Choose two.)", ["Amazon SQS", "AWS Lambda", "Amazon EBS", "Amazon RDS", "AWS Glue crawler"], [0, 1], "SQS, Lambda, HTTP/S, email, SMS, Firehose, mobile push."],
    ["An S3 upload must trigger three independent processes. What is the most scalable approach?", ["S3 event notification to an SNS topic that fans out", "Three separate S3 buckets", "A cron job listing the bucket", "One SQS queue shared by all processes"], [0], "SNS fan-out from S3 events (or EventBridge)."],
    ["Messages published to SNS that fail delivery to an SQS subscriber should be kept for analysis. What should be configured?", ["A dead-letter queue on the SNS subscription", "SQS long polling", "SNS message filtering", "A CloudFront distribution"], [0], "Subscriptions can have DLQs."],
    ["A mobile app needs push notifications to iOS and Android devices. What service?", ["Amazon SNS mobile push", "Amazon SQS", "Amazon MQ", "AWS AppSync"], [0], "SNS supports APNs and FCM."],
    ["What is the key difference between SNS and SQS?", ["SNS pushes to subscribers; SQS consumers poll for messages", "SQS pushes to subscribers; SNS is polled", "Both store messages for 14 days", "Neither supports Lambda"], [0], "Push vs pull."],
    ["Sensitive data published to SNS must be encrypted at rest. What should be used?", ["SNS server-side encryption with KMS", "TLS only", "Message filtering", "SNS FIFO"], [0], "SNS supports SSE with KMS keys."]
  ]
});

L("apigw", {
  match: [
    ["REST API", "Full-featured: usage plans, API keys, request validation, caching"],
    ["HTTP API", "Cheaper, lower latency, JWT authorizers"],
    ["WebSocket API", "Persistent two-way connections for chat and real-time apps"],
    ["Lambda authorizer", "Custom auth logic that returns an IAM policy"],
    ["Usage plan", "Throttle and quota per API key"],
    ["Edge-optimized endpoint", "Routed via CloudFront for global clients"]
  ],
  sort: { title: "Which API Gateway feature?", buckets: ["Throttling / usage plan", "Authorizer", "Caching"], items: [
    ["Limit a partner to 1,000 requests per day", 0], ["Validate a JWT from Cognito", 1], ["Reduce repeated identical backend calls", 2],
    ["Protect backend from bursts with 429 errors", 0], ["Custom token check against a 3rd-party IdP", 1]
  ]},
  tf: [
    ["API Gateway can integrate directly with AWS services like SQS without Lambda.", true, "Service integrations."],
    ["Private REST APIs are reachable only from VPCs via interface endpoints.", true, "Private endpoint type."],
    ["API Gateway's default throttle is 10,000 requests per second per Region.", true, "Soft limit with 5,000 burst."],
    ["WebSocket APIs are a good fit for real-time chat.", true, "Two-way persistent connections."],
    ["HTTP APIs support response caching like REST APIs.", false, "Caching is a REST API feature."],
    ["API Gateway can use Cognito user pools to authorize requests.", true, "Cognito authorizer."]
  ],
  quiz: [
    ["A serverless REST API must authenticate users from a Cognito user pool with minimal code. What should be used?", ["Cognito user pool authorizer on API Gateway", "IAM users per customer", "Lambda function URL with no auth", "Security groups"], [0], "Native Cognito authorizer."],
    ["Partners must be limited to 500 requests per second and 1 million per month. What should be used?", ["API keys with usage plans", "WAF rate rules only", "Lambda reserved concurrency", "CloudFront geo restriction"], [0], "Usage plans enforce throttles and quotas per key."],
    ["A chat app needs persistent bidirectional connections between clients and a serverless backend. Which API type?", ["WebSocket API", "REST API", "HTTP API", "Private REST API"], [0], "WebSocket for real-time two-way."],
    ["An API needs the lowest cost and latency, using JWT auth from an OIDC provider. What should be chosen?", ["HTTP API with a JWT authorizer", "REST API with Lambda authorizer", "WebSocket API", "ALB with Lambda"], [0], "HTTP APIs are cheaper with native JWT."],
    ["An internal API must be reachable only from within the company's VPCs. What endpoint type?", ["Private REST API with an interface VPC endpoint", "Edge-optimized API", "Regional API with public DNS", "HTTP API with CORS"], [0], "Private APIs are accessible via VPC endpoints."],
    ["Repeated GET requests with identical parameters overload the backend. What feature reduces load?", ["API Gateway stage caching (REST API)", "Usage plans", "Mapping templates", "Canary deployments"], [0], "Response caching avoids backend calls."],
    ["An API should accept requests and write them directly to an SQS queue without a Lambda function. What is this?", ["An API Gateway AWS service integration", "A Lambda proxy integration", "A VPC link", "A WebSocket route"], [0], "Direct service integrations reduce cost and latency."],
    ["Which TWO help protect an API Gateway endpoint from abuse? (Choose two.)", ["AWS WAF web ACL on the API stage", "Throttling limits and usage plans", "Increase Lambda memory", "Disable logging", "Use edge caching only"], [0, 1], "WAF + throttling."],
    ["A new API version should receive 10% of traffic before full rollout. What feature?", ["Canary release deployment on the stage", "Weighted Route 53 records only", "Usage plans", "Mapping templates"], [0], "Stage canary settings shift a percentage."],
    ["API Gateway must reach a private ALB/NLB inside a VPC. What is needed?", ["A VPC link", "A NAT gateway", "A public subnet for the API", "VPC peering to API Gateway"], [0], "VPC links connect APIs to private resources."]
  ]
});

L("batch", {
  match: [
    ["AWS Batch", "Managed batch job scheduling on EC2, Spot or Fargate"],
    ["Job queue", "Holds submitted jobs until compute is available"],
    ["Compute environment", "Managed or unmanaged EC2/Fargate capacity for jobs"],
    ["Job definition", "Container image, vCPU, memory and retry settings"],
    ["Array job", "Runs many copies of a job with an index"],
    ["Lambda limit", "15 minutes max run time"]
  ],
  sort: { title: "Lambda or AWS Batch?", buckets: ["Lambda", "AWS Batch"], items: [
    ["Resize an image in 2 seconds per upload", 0], ["Genomics job running 6 hours", 1], ["Needs GPUs and 64 GB RAM", 1],
    ["React to an S3 event quickly", 0], ["Thousands of long containerized jobs on Spot", 1], ["API backend under 1 s", 0]
  ]},
  tf: [
    ["AWS Batch has no additional charge beyond the underlying compute.", true, "You pay for EC2/Fargate."],
    ["Lambda is suitable for jobs running 2 hours.", false, "Lambda max is 15 minutes."],
    ["Batch can use Spot Instances to reduce cost.", true, "Spot compute environments."],
    ["Batch jobs run as Docker containers.", true, "Job definitions reference container images."],
    ["Batch requires you to manage the job scheduler.", false, "Scheduling is managed."],
    ["Batch can run on Fargate for serverless jobs.", true, "Fargate compute environments."]
  ],
  quiz: [
    ["A research team runs thousands of containerized simulations taking 3 to 8 hours each and wants lowest cost with managed scheduling. What should it use?", ["AWS Batch with Spot compute environments", "AWS Lambda", "API Gateway", "EC2 On-Demand with cron"], [0], "Batch + Spot suits long, interruptible jobs."],
    ["A job must run for 45 minutes processing a file. Why is Lambda not suitable?", ["Lambda has a 15-minute maximum timeout", "Lambda can't read S3", "Lambda needs VPC", "Lambda can't run Python"], [0], "Use Batch, ECS or Step Functions instead."],
    ["Which component in AWS Batch defines the container image, vCPU and memory?", ["Job definition", "Job queue", "Compute environment", "Scheduling policy"], [0], "Job definition is the template for jobs."],
    ["A company wants to run batch jobs without managing EC2 instances at all. What should it choose?", ["AWS Batch on Fargate", "AWS Batch on unmanaged EC2", "EMR on EC2", "EC2 Auto Scaling"], [0], "Fargate removes server management."],
    ["The same processing must run for 10,000 input files with an index per file. What feature?", ["Array jobs", "Job dependencies", "Multi-node parallel jobs", "Job queues with priority"], [0], "Array jobs fan out with an index."],
    ["Which TWO are good fits for AWS Batch? (Choose two.)", ["Nightly financial risk calculations", "Large-scale media transcoding jobs", "Sub-second API responses", "Static website hosting", "DNS routing"], [0, 1], "Batch is for long-running compute jobs."],
    ["High-priority jobs should run before low-priority ones on shared compute. What should be configured?", ["Multiple job queues with priorities", "One queue with larger instances", "Lambda reserved concurrency", "Route 53 weighted records"], [0], "Job queue priority controls ordering."],
    ["A tightly coupled MPI job needs multiple EC2 instances working together. Which Batch job type?", ["Multi-node parallel job", "Array job", "Single-container job", "Fargate job"], [0], "Multi-node parallel jobs span instances."],
    ["A batch workflow must run job B only after job A finishes. What feature?", ["Job dependencies", "Array index", "Retry strategy", "Compute environment order"], [0], "Batch supports dependsOn."],
    ["A batch job must be triggered when a file lands in S3. What is the simplest design?", ["EventBridge rule on the S3 event with AWS Batch SubmitJob as target", "Poll S3 from an EC2 instance", "SNS email", "CloudTrail Lake query"], [0], "EventBridge can submit Batch jobs directly."]
  ]
});

L("orchestration", {
  match: [
    ["AWS Step Functions", "Visual workflows with retries, branching and waits"],
    ["Amazon MQ", "Managed ActiveMQ/RabbitMQ for existing apps using MQTT, AMQP, STOMP"],
    ["Amazon AppFlow", "Moves SaaS data (Salesforce, Slack) to AWS without code"],
    ["Standard workflow", "Up to 1 year, exactly-once, auditable"],
    ["Express workflow", "High-volume, short (≤5 min) event processing"],
    ["Amazon EventBridge", "Event bus routing events between AWS, SaaS and apps"]
  ],
  sort: { title: "Which service?", buckets: ["Step Functions", "Amazon MQ", "AppFlow", "EventBridge"], items: [
    ["Order workflow with retries and human approval", 0], ["Migrate an on-prem app using JMS/AMQP", 1], ["Sync Salesforce records to S3 daily", 2],
    ["Route SaaS partner events to Lambda by rule", 3], ["Coordinate several Lambda functions in sequence", 0], ["Run a Lambda on a cron schedule", 3]
  ]},
  tf: [
    ["Amazon MQ is the right choice for new cloud-native apps needing massive scale.", false, "Prefer SQS/SNS; MQ is for protocol compatibility."],
    ["Step Functions can call over 200 AWS services directly.", true, "SDK integrations."],
    ["Express workflows can run for up to one year.", false, "Standard workflows run up to a year; Express up to 5 minutes."],
    ["AppFlow can encrypt data and use PrivateLink with some SaaS apps.", true, "Secure data transfer."],
    ["EventBridge Scheduler can trigger targets on a schedule.", true, "Cron-like scheduling."],
    ["Step Functions supports a wait-for-callback pattern for human approval.", true, "Task tokens."]
  ],
  quiz: [
    ["A company is migrating an on-prem app that uses ActiveMQ with JMS and wants minimal code changes. What should it use?", ["Amazon MQ", "Amazon SQS", "Amazon SNS", "Amazon Kinesis"], [0], "MQ supports the existing protocols."],
    ["An order process calls several Lambda functions in sequence, needs retries, error handling and a manual approval step. What should coordinate it?", ["AWS Step Functions", "Amazon SQS", "Lambda calling Lambda directly", "Cron on EC2"], [0], "Step Functions orchestrates workflows with retries and callbacks."],
    ["Salesforce data must be copied into S3 every hour with no custom code. What service?", ["Amazon AppFlow", "AWS DataSync", "AWS Glue crawler", "Amazon MQ"], [0], "AppFlow connects SaaS apps to AWS."],
    ["IoT telemetry triggers 100,000 short workflows per second, each under 1 minute. Which workflow type is most cost-effective?", ["Step Functions Express workflows", "Step Functions Standard workflows", "AWS Batch", "Amazon MQ"], [0], "Express is designed for high-volume, short workflows."],
    ["A Lambda function should run every day at 2 AM. What is the simplest serverless approach?", ["Amazon EventBridge Scheduler", "An EC2 instance with cron", "SQS delay queue", "Step Functions wait state for 24 hours"], [0], "EventBridge schedules targets."],
    ["Events from a SaaS partner must be routed to different targets based on content. What should be used?", ["EventBridge partner event bus with rules", "Amazon MQ", "SNS without filters", "API Gateway usage plans"], [0], "EventBridge integrates SaaS sources and filters by content."],
    ["Which TWO are reasons to choose Amazon MQ over SQS/SNS? (Choose two.)", ["Existing apps use AMQP, MQTT, STOMP or JMS", "Lift-and-shift of an on-prem message broker", "Need for unlimited serverless scaling", "Want the lowest operational overhead for new apps", "Need native Lambda event source for every queue"], [0, 1], "MQ = protocol compatibility for migrations."],
    ["Amazon MQ must be highly available. How should it be deployed?", ["Active/standby brokers across two AZs", "One broker with larger instance", "Brokers in two Regions with Route 53", "Behind an ALB"], [0], "Active/standby with shared storage across AZs."],
    ["A workflow must process items of a large S3 dataset in parallel. Which Step Functions feature?", ["Distributed Map state", "Wait state", "Choice state", "Pass state"], [0], "Distributed Map runs up to 10,000 parallel child workflows."],
    ["An auditable workflow must guarantee exactly-once execution of each step and run for up to several days. Which type?", ["Step Functions Standard workflow", "Express workflow", "Lambda destinations", "SQS standard queue"], [0], "Standard: exactly-once, up to a year."]
  ]
});

L("serverless", {
  match: [
    ["AWS Lambda", "Run code on events, pay per request and duration, max 15 min"],
    ["AWS Fargate", "Serverless compute for containers on ECS or EKS"],
    ["Amazon ECS", "AWS-native container orchestration"],
    ["Amazon EKS", "Managed Kubernetes"],
    ["Amazon ECR", "Private container image registry"],
    ["Provisioned concurrency", "Keeps Lambda environments initialized to avoid cold starts"]
  ],
  sort: { title: "Lambda, Fargate or EC2 launch type?", buckets: ["Lambda", "Fargate", "ECS on EC2"], items: [
    ["Event-driven code under 15 minutes", 0], ["Containers with no servers to manage", 1], ["Need GPU instances and host-level control for containers", 2],
    ["Long-running container web service, no OS patching", 1], ["Process S3 uploads on demand", 0], ["Use Reserved Instances for steady container hosts", 2]
  ]},
  tf: [
    ["Lambda's maximum memory is 10 GB.", true, "CPU scales with memory."],
    ["Lambda functions in a VPC need a NAT gateway to reach the internet.", true, "Lambda in a VPC has no public IP."],
    ["Fargate requires you to manage EC2 instances.", false, "Fargate is serverless."],
    ["ECS task roles give each task its own IAM permissions.", true, "Least privilege per task."],
    ["EKS is the best choice when a company already uses Kubernetes.", true, "Keeps K8s tooling."],
    ["Lambda SnapStart reduces cold start time for Java.", true, "Also Python and .NET."]
  ],
  quiz: [
    ["A company wants to run containers without managing servers or clusters of EC2 instances. What should it use?", ["Amazon ECS on AWS Fargate", "Amazon ECS on EC2", "EC2 with Docker installed", "AWS Batch on unmanaged EC2"], [0], "Fargate removes server management."],
    ["An organization already runs Kubernetes on premises and wants a managed Kubernetes control plane on AWS. What should it use?", ["Amazon EKS", "Amazon ECS", "AWS Elastic Beanstalk", "AWS Lambda"], [0], "EKS is managed Kubernetes."],
    ["A Lambda-based API suffers from cold-start latency during traffic spikes. What reduces this?", ["Provisioned concurrency", "Reserved concurrency", "Larger timeout", "Dead-letter queue"], [0], "Pre-initialized environments avoid cold starts."],
    ["A Lambda function in a private subnet must call a public third-party API. What is required?", ["A NAT gateway in a public subnet with a route from the Lambda subnet", "An internet gateway attached to the private subnet", "A public IP on the function", "A gateway endpoint"], [0], "VPC Lambdas reach the internet via NAT."],
    ["Each ECS task needs different AWS permissions. What is the best practice?", ["Assign an IAM task role per task definition", "Use the EC2 instance profile for all tasks", "Store access keys in environment variables", "Use a shared IAM user"], [0], "Task roles provide per-task credentials."],
    ["A function must not consume all account concurrency and starve other functions. What should be set?", ["Reserved concurrency on the function", "Provisioned concurrency", "A larger memory size", "Lambda layers"], [0], "Reserved concurrency caps (and guarantees) concurrency."],
    ["Which TWO are valid ways to store container images for ECS/EKS? (Choose two.)", ["Amazon ECR", "Docker Hub or another public registry", "Amazon EBS snapshots", "AWS Secrets Manager", "Amazon SQS"], [0, 1], "ECR is native; public registries also work."],
    ["Developers want to deploy a web app quickly while AWS handles provisioning, load balancing and scaling of EC2. What should they use?", ["AWS Elastic Beanstalk", "AWS CloudFormation from scratch", "Amazon EKS", "AWS Batch"], [0], "Beanstalk is PaaS over EC2/ELB/ASG."],
    ["A Lambda function processes S3 uploads and must handle failures without losing events. What should be configured?", ["An on-failure destination or DLQ for asynchronous invocations", "A larger timeout only", "Provisioned concurrency", "An ALB"], [0], "Async failures go to destinations/DLQ after retries."],
    ["A company wants to run an existing containerized web app with the least operational overhead and automatic HTTPS. What is simplest?", ["AWS App Runner", "Self-managed Kubernetes on EC2", "ECS on EC2 with manual ALB", "EC2 with Docker Compose"], [0], "App Runner builds, deploys and scales containers with HTTPS."]
  ]
});

L("automation", {
  match: [
    ["AWS CloudFormation", "Infrastructure as code in JSON/YAML templates"],
    ["StackSets", "Deploy stacks across many accounts and Regions"],
    ["AWS CDK", "Define infrastructure in programming languages, synthesizes CloudFormation"],
    ["Systems Manager Session Manager", "Shell access without SSH keys or open inbound ports"],
    ["Systems Manager Patch Manager", "Automates OS patching across fleets"],
    ["Parameter Store", "Stores config values and secure strings"]
  ],
  sort: { title: "Which tool?", buckets: ["CloudFormation", "Systems Manager", "Elastic Beanstalk"], items: [
    ["Recreate an entire environment from a template", 0], ["Patch 500 EC2 instances weekly", 1], ["Upload code and let AWS handle the platform", 2],
    ["Run a command on all instances without SSH", 1], ["Detect drift from the declared infrastructure", 0], ["Store DB connection strings", 1]
  ]},
  tf: [
    ["CloudFormation drift detection finds manual changes to stack resources.", true, "Compares live config to template."],
    ["Session Manager requires port 22 to be open.", false, "No inbound ports needed; uses the SSM agent."],
    ["Change sets preview what a stack update will modify.", true, "Review before executing."],
    ["DeletionPolicy: Retain keeps a resource when the stack is deleted.", true, "Also Snapshot for supported resources."],
    ["Parameter Store can rotate secrets automatically like Secrets Manager.", false, "Automatic rotation is a Secrets Manager feature."],
    ["StackSets can deploy to all accounts in an AWS Organization.", true, "Service-managed permissions."]
  ],
  quiz: [
    ["A company must deploy identical infrastructure to 3 Regions repeatedly and consistently. What should it use?", ["AWS CloudFormation templates (with StackSets)", "Manual console setup", "AWS Config", "AWS Trusted Advisor"], [0], "IaC ensures repeatable deployments."],
    ["Administrators need shell access to private EC2 instances without bastion hosts, SSH keys or open ports, with sessions logged. What should be used?", ["AWS Systems Manager Session Manager", "EC2 Instance Connect via public IP", "A bastion host", "VPN with SSH"], [0], "Session Manager uses the SSM agent and logs sessions."],
    ["A security baseline (CloudTrail, Config rules) must be deployed to every account in an organization automatically. What should be used?", ["CloudFormation StackSets with service-managed permissions", "One stack per account manually", "AWS CDK locally per account", "Elastic Beanstalk"], [0], "StackSets deploy across accounts/Regions automatically."],
    ["The team wants to preview changes before updating a production stack. What feature?", ["Change sets", "Drift detection", "Stack policies", "Nested stacks"], [0], "Change sets show the planned changes."],
    ["Someone modified a security group created by CloudFormation in the console. How can this be found?", ["Run drift detection on the stack", "Check Trusted Advisor", "Use X-Ray", "Use CloudFront logs"], [0], "Drift detection compares actual vs template."],
    ["A production RDS database created by CloudFormation must not be lost if the stack is deleted. What should be set?", ["DeletionPolicy: Snapshot or Retain on the resource", "A stack policy only", "Termination protection on EC2", "Change sets"], [0], "DeletionPolicy controls what happens on delete."],
    ["Operating system patches must be applied to a fleet of EC2 and on-prem servers on a schedule. What should be used?", ["Systems Manager Patch Manager with maintenance windows", "Lambda with SSH", "AWS Config", "Amazon Inspector"], [0], "Patch Manager automates patching."],
    ["Which TWO can store application configuration such as database endpoints? (Choose two.)", ["Systems Manager Parameter Store", "AWS Secrets Manager", "Amazon CloudFront", "Amazon SNS", "AWS Shield"], [0, 1], "Parameter Store for config; Secrets Manager for secrets with rotation."],
    ["Developers prefer TypeScript over YAML to define infrastructure but want CloudFormation's deployment engine. What should they use?", ["AWS CDK", "AWS SAM only", "Elastic Beanstalk", "AWS OpsWorks"], [0], "CDK synthesizes CloudFormation."],
    ["A team must run a script on hundreds of instances at once and see the output centrally. What feature?", ["Systems Manager Run Command", "EC2 user data", "CloudFormation init", "AWS Batch"], [0], "Run Command executes at scale without SSH."]
  ]
});

L("migration", {
  match: [
    ["AWS DMS", "Migrate databases with minimal downtime using CDC"],
    ["AWS SCT", "Converts schemas between different database engines"],
    ["AWS DataSync", "Online transfer of files from NFS/SMB/HDFS to S3, EFS or FSx"],
    ["Snowball Edge", "Rugged device for offline transfer of tens of TB"],
    ["Storage Gateway", "Hybrid cloud storage: File, Volume and Tape gateways"],
    ["AWS Transfer Family", "Managed SFTP/FTPS/FTP into S3 or EFS"]
  ],
  sort: { title: "Which transfer tool?", buckets: ["DataSync", "Snowball", "Storage Gateway", "Transfer Family"], items: [
    ["Move 80 TB with only 100 Mbps bandwidth", 1], ["Scheduled sync of NFS share to EFS over the network", 0],
    ["Keep on-prem apps using SMB while data lives in S3", 2], ["Partners upload via SFTP into S3", 3],
    ["Replace physical tape backups", 2], ["One-time online migration of 5 TB of files", 0]
  ]},
  tf: [
    ["DMS can keep source and target in sync with change data capture.", true, "Minimal-downtime migrations."],
    ["Migrating Oracle to Aurora PostgreSQL requires SCT for schema conversion.", true, "Heterogeneous migrations need schema conversion."],
    ["Snowball is the best choice for 1 TB over a fast 10 Gbps link.", false, "Online transfer would be faster."],
    ["Tape Gateway presents a virtual tape library backed by S3/Glacier.", true, "Works with existing backup software."],
    ["AWS Application Migration Service rehosts servers (lift and shift).", true, "Formerly CloudEndure Migration."],
    ["DataSync can transfer data between AWS storage services.", true, "E.g., S3 to EFS."]
  ],
  quiz: [
    ["A company must migrate a 2 TB Oracle database to Aurora PostgreSQL with minimal downtime. What should it use? (Choose two.)", ["AWS Schema Conversion Tool", "AWS DMS with CDC", "AWS Snowball Edge", "AWS DataSync", "S3 Transfer Acceleration"], [0, 1], "SCT converts schema; DMS migrates and syncs data."],
    ["A company needs to move 500 TB to S3 within 2 weeks and has a 1 Gbps link already heavily used. What should it use?", ["Multiple AWS Snowball Edge devices", "AWS DataSync over the internet", "S3 Transfer Acceleration", "Site-to-Site VPN"], [0], "500 TB would take far longer online."],
    ["On-premises applications must keep using an SMB file share while data is stored durably in S3 with local caching. What should be used?", ["S3 File Gateway", "Volume Gateway stored mode", "AWS DataSync", "Amazon FSx for Lustre"], [0], "File Gateway exposes NFS/SMB backed by S3."],
    ["A company wants to replace physical tapes with cloud storage without changing its backup software. What should it use?", ["Tape Gateway", "S3 Glacier Deep Archive directly", "Snowcone", "EBS snapshots"], [0], "Tape Gateway presents a VTL."],
    ["Partners upload files via SFTP and the company wants them in S3 without managing servers. What service?", ["AWS Transfer Family", "AWS DataSync", "Amazon AppFlow", "EC2 with OpenSSH"], [0], "Managed SFTP into S3."],
    ["Files must be copied from an on-prem NFS server to Amazon EFS on a schedule, with verification and encryption. What should be used?", ["AWS DataSync", "AWS Snowball", "Storage Gateway Volume Gateway", "S3 Batch Operations"], [0], "DataSync handles scheduled, verified online transfer."],
    ["A company wants to lift-and-shift 200 VMware servers to EC2 with minimal changes and short cutover. What service?", ["AWS Application Migration Service", "AWS DMS", "AWS SCT", "AWS Backup"], [0], "MGN does block-level replication for rehosting."],
    ["Before migrating, a company needs an inventory of on-prem servers and their dependencies. What helps?", ["AWS Application Discovery Service", "AWS Config", "Amazon Inspector", "AWS X-Ray"], [0], "Discovery Service collects server data for planning."],
    ["Which TWO statements about Volume Gateway are true? (Choose two.)", ["Cached mode keeps primary data in S3 and frequently accessed data locally", "Stored mode keeps primary data on premises with async backups to AWS", "It provides SMB file shares", "It replaces Direct Connect", "It stores data only in EFS"], [0, 1], "Volume Gateway offers iSCSI volumes in cached or stored mode."],
    ["A remote site with no network needs edge compute and data collection before shipping data to AWS. What fits?", ["AWS Snowball Edge Compute Optimized", "AWS DataSync", "AWS Transfer Family", "S3 Transfer Acceleration"], [0], "Snowball Edge provides local compute and storage offline."]
  ]
});

L("frontend", {
  match: [
    ["AWS Amplify", "Build and host full-stack web/mobile apps with CI/CD"],
    ["AWS AppSync", "Managed GraphQL APIs with real-time subscriptions"],
    ["AWS Device Farm", "Test apps on real mobile devices and browsers"],
    ["AWS Elemental MediaConvert", "File-based video transcoding"],
    ["Amazon Pinpoint", "Targeted multichannel user engagement and campaigns"],
    ["Amazon SES", "Send bulk and transactional email"]
  ],
  sort: { title: "Which service?", buckets: ["Amplify", "AppSync", "Device Farm", "MediaConvert"], items: [
    ["Host a React app with Git-based deployments", 0], ["GraphQL API combining DynamoDB and Lambda", 1], ["Test an Android app on 50 real phones", 2],
    ["Convert uploaded videos into HLS formats", 3], ["Real-time data sync for a mobile app via GraphQL subscriptions", 1]
  ]},
  tf: [
    ["AppSync supports real-time subscriptions over WebSockets.", true, "GraphQL subscriptions."],
    ["Device Farm uses emulators only.", false, "It uses real devices."],
    ["Amplify Hosting provides CI/CD from a Git repository.", true, "Push to deploy."],
    ["MediaConvert is used for live streaming ingest.", false, "MediaConvert is file-based; MediaLive is for live."],
    ["SES can be used to send marketing and transactional emails.", true, "Scalable email service."],
    ["AppSync can resolve data from DynamoDB, Lambda and HTTP sources.", true, "Multiple data sources per API."]
  ],
  quiz: [
    ["A front-end team wants to host a single-page app with Git-based CI/CD, custom domains and HTTPS with minimal setup. What should it use?", ["AWS Amplify Hosting", "EC2 with Nginx", "Elastic Beanstalk with Docker", "AWS Batch"], [0], "Amplify Hosting provides managed CI/CD and hosting."],
    ["A mobile app needs a GraphQL API that aggregates data from DynamoDB and REST services with real-time updates. What service?", ["AWS AppSync", "Amazon API Gateway REST API", "Amazon MQ", "AWS Step Functions"], [0], "AppSync is managed GraphQL with subscriptions."],
    ["A company must test its iOS and Android apps on many real devices before release. What should it use?", ["AWS Device Farm", "Amazon Inspector", "AWS CodeBuild only", "AWS X-Ray"], [0], "Device Farm runs tests on real devices."],
    ["Uploaded videos must be transcoded into multiple adaptive bitrate formats. What should be used?", ["AWS Elemental MediaConvert", "Amazon Kinesis Video Streams", "Amazon Rekognition", "AWS DataSync"], [0], "MediaConvert does file-based transcoding."],
    ["A marketing team wants to send targeted campaigns via email, SMS and push based on user segments. What service?", ["Amazon Pinpoint", "Amazon SQS", "Amazon SES only", "AWS AppSync"], [0], "Pinpoint handles segmented multichannel engagement."],
    ["An application needs to send password-reset emails reliably at scale. What should be used?", ["Amazon SES", "Amazon SNS SMS", "Amazon Pinpoint push", "Amazon MQ"], [0], "SES is the email sending service."],
    ["Which TWO are features of AppSync? (Choose two.)", ["GraphQL APIs", "Real-time subscriptions and offline sync", "SFTP endpoints", "Video transcoding", "SQL data warehousing"], [0, 1], "AppSync = GraphQL + real-time."],
    ["A team wants to add user sign-up and sign-in to its Amplify web app quickly. What does Amplify use under the hood?", ["Amazon Cognito", "IAM users", "AWS Directory Service", "AWS IAM Identity Center"], [0], "Amplify Auth is built on Cognito."],
    ["A live sports event must be encoded and streamed in real time. Which media service?", ["AWS Elemental MediaLive", "AWS Elemental MediaConvert", "Amazon Transcribe", "AWS Batch"], [0], "MediaLive handles live encoding."],
    ["Video from millions of camera devices must be ingested for ML analysis. What should be used?", ["Amazon Kinesis Video Streams", "Amazon SQS", "Amazon Data Firehose", "AWS Device Farm"], [0], "Kinesis Video Streams ingests and stores video streams."]
  ]
});
