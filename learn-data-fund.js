/* Practice data: Fundamental Services. Quiz rows are [question, options, correct option indexes, explanation]; options are shuffled at render. */

L("basics", {
  match: [
    ["Region", "Geographic area containing 3 or more AZs"],
    ["Availability Zone", "One or more discrete data centers with independent power and networking"],
    ["Edge location", "Point of presence used by CloudFront and Route 53"],
    ["Local Zone", "Extends a Region into a metro area for single-digit-ms latency"],
    ["Outposts", "AWS-managed hardware running in your own data center"],
    ["Wavelength Zone", "AWS compute embedded in a telecom 5G network"]
  ],
  sort: { title: "Shared responsibility: who owns it?", buckets: ["AWS", "Customer"], items: [
    ["Physical security of data centers", 0], ["Patching the guest OS on EC2", 1], ["Patching the RDS database engine OS", 0],
    ["Configuring security groups", 1], ["Hypervisor maintenance", 0], ["Creating IAM users and policies", 1],
    ["Classifying and protecting customer data", 1], ["Replacing failed disks in the storage fleet", 0]
  ]},
  tf: [
    ["IAM, Route 53 and CloudFront are global services.", true, "They are not scoped to a single Region."],
    ["High availability usually means deploying across multiple Regions.", false, "HA = multiple AZs. Multiple Regions is for disaster recovery."],
    ["us-east-1a in one account is always the same physical AZ as us-east-1a in another account.", false, "Names are mapped per account. Use AZ IDs (use1-az1) to align."],
    ["Sustainability is one of the six Well-Architected pillars.", true, "Added in late 2021."],
    ["With Lambda, the customer patches the runtime OS.", false, "AWS manages the runtime; the more managed the service, the more AWS owns."],
    ["Data does not leave a Region unless you move or replicate it.", true, "Regions are isolated by design."]
  ],
  quiz: [
    ["A company must keep customer data inside Germany for regulatory reasons. What should drive the Region choice FIRST?", ["Compliance and data residency requirements", "Lowest price per instance hour", "Number of services available", "Latency to the development team"], [0], "Compliance/data residency is the first filter; latency, services and price come after."],
    ["An application runs on EC2 in a single AZ. Which change most improves availability with minimal redesign?", ["Run instances in at least two AZs behind a load balancer", "Move to a larger instance type", "Copy AMIs to another Region weekly", "Enable detailed CloudWatch monitoring"], [0], "Multi-AZ deployment is the standard way to survive an AZ failure."],
    ["A media company needs single-digit-millisecond latency for artists editing video in Los Angeles. Which option fits best?", ["AWS Local Zones", "AWS Wavelength", "Amazon CloudFront", "AWS Outposts in us-west-2"], [0], "Local Zones place compute and storage close to a large metro area."],
    ["A manufacturer must process data on premises for latency and data-residency reasons but wants AWS APIs and tooling. Which service meets this?", ["AWS Outposts", "AWS Local Zones", "AWS Snowball Edge", "AWS Direct Connect"], [0], "Outposts runs AWS infrastructure inside your own facility."],
    ["Under the shared responsibility model, which tasks are the customer's responsibility on Amazon EC2? (Choose two.)", ["Patching the guest operating system", "Configuring security group rules", "Maintaining the hypervisor", "Physical security of the host", "Replacing failed hardware"], [0, 1], "Anything you configure in the console (OS, firewall rules) is yours; hardware and hypervisor are AWS's."],
    ["Two accounts need to deploy resources into the exact same physical AZ to reduce cross-AZ latency. What should they use?", ["AZ IDs such as use1-az1", "The same AZ name such as us-east-1a", "A shared VPC endpoint", "Placement groups across accounts"], [0], "AZ names are randomized per account; AZ IDs are consistent."],
    ["Which Well-Architected pillar focuses on running workloads that recover from failure and meet demand?", ["Reliability", "Performance Efficiency", "Operational Excellence", "Security"], [0], "Reliability covers recovery, Multi-AZ and scaling to meet demand."],
    ["A mobile game needs ultra-low latency for players on 5G networks. Which option is designed for this?", ["AWS Wavelength Zones", "AWS Local Zones", "Amazon CloudFront", "AWS Global Accelerator"], [0], "Wavelength embeds AWS compute in telecom 5G networks."],
    ["A company moves a self-managed MySQL database on EC2 to Amazon RDS. Which responsibility shifts to AWS?", ["Patching the database engine and host OS", "Managing database user permissions", "Encrypting data classification decisions", "Designing table schemas"], [0], "With managed services AWS patches the OS and engine; you still own data and access."],
    ["Which design choice best aligns with the Sustainability pillar?", ["Use managed services and Graviton instances to maximize utilization", "Overprovision instances to avoid throttling", "Keep all environments running 24/7", "Store all data in S3 Standard indefinitely"], [0], "Sustainability favors high utilization, managed services and efficient hardware."]
  ]
});

L("iam", {
  match: [
    ["IAM user", "Long-term identity for one person or app with its own credentials"],
    ["IAM role", "Identity assumed for temporary credentials via STS"],
    ["IAM group", "Collection of users that share attached policies"],
    ["Permissions boundary", "Sets the maximum permissions an identity-based policy can grant"],
    ["Resource-based policy", "Attached to a resource like an S3 bucket; names a Principal"],
    ["Instance profile", "Container that passes an IAM role to an EC2 instance"]
  ],
  order: { title: "Policy evaluation order", prompt: "Order how AWS evaluates an IAM request.", steps: [
    "Start with an implicit deny", "Check for any explicit Deny (it always wins)", "Apply SCP / permissions boundary limits", "Look for an explicit Allow in applicable policies", "No Allow found → request is denied"
  ]},
  tf: [
    ["An explicit Deny overrides any Allow.", true, "Explicit deny always wins."],
    ["Groups can contain other groups.", false, "IAM groups cannot be nested."],
    ["The root user should be used for daily administration.", false, "Lock it away with MFA; use it only for the few root-only tasks."],
    ["Applications on EC2 should use an IAM role rather than stored access keys.", true, "Roles give automatically rotated temporary credentials."],
    ["IAM is a regional service.", false, "IAM is global."],
    ["A new IAM user has no permissions by default.", true, "Everything is implicitly denied until allowed."]
  ],
  quiz: [
    ["An application on EC2 needs to read objects from an S3 bucket. What is the MOST secure way to grant access?", ["Attach an IAM role with S3 read permissions to the instance", "Store an IAM user's access keys in the application config", "Make the bucket public-read", "Embed root credentials in user data"], [0], "Instance roles provide temporary, auto-rotated credentials."],
    ["A developer team should be able to create IAM roles but must never grant more than a defined set of permissions. What should be used?", ["Permissions boundaries", "Service control policies on the root", "An IAM group with AdministratorAccess", "Resource-based policies on each role"], [0], "Boundaries cap what an identity (and roles it creates) can ever be allowed."],
    ["A user has an identity policy allowing s3:* and a bucket policy that explicitly denies s3:DeleteObject for that user. What happens when the user deletes an object?", ["Access is denied", "Access is allowed", "Allowed only with MFA", "Allowed only from the console"], [0], "An explicit Deny overrides any Allow."],
    ["A company wants to require MFA before users can stop EC2 instances. How can this be enforced?", ["Use an IAM policy condition on aws:MultiFactorAuthPresent", "Enable MFA on the root account only", "Use a security group rule", "Turn on CloudTrail"], [0], "Policy conditions can require MFA for specific actions."],
    ["Users in account A need temporary access to resources in account B. What is the recommended approach?", ["Create a role in account B that trusts account A, and have users assume it", "Create duplicate IAM users in account B", "Share account B root credentials", "Use a VPC peering connection"], [0], "Cross-account roles + STS AssumeRole is the standard pattern."],
    ["Which TWO practices follow IAM best practices? (Choose two.)", ["Grant least privilege", "Enable MFA for privileged users", "Share IAM users across team members", "Use root for billing changes daily", "Hard-code access keys in source code"], [0, 1], "Least privilege and MFA are core IAM best practices."],
    ["Auditors need a report of all IAM users and the status of their passwords, access keys and MFA. What provides this with least effort?", ["IAM credential report", "AWS Config advanced queries", "CloudTrail Lake", "IAM Access Analyzer"], [0], "The credential report lists every user and their credential status."],
    ["A security team wants to find resources such as S3 buckets and KMS keys that are shared with external accounts. Which service helps?", ["IAM Access Analyzer", "Amazon Inspector", "AWS Trusted Advisor", "Amazon Macie"], [0], "Access Analyzer identifies resources shared outside your zone of trust."],
    ["A Lambda function must write to a DynamoDB table. How should permissions be granted?", ["Attach an execution role with dynamodb:PutItem on that table", "Pass an IAM user's keys as environment variables", "Use a resource-based policy on the table only", "Grant AdministratorAccess to the function"], [0], "Lambda assumes its execution role; scope it to the specific table."],
    ["Fifty developers need identical permissions that change often. What is the simplest way to manage this?", ["Put them in an IAM group and attach policies to the group", "Attach inline policies to each user", "Create one shared IAM user", "Use a permissions boundary for each user"], [0], "Groups centralize permissions for many users."]
  ]
});

L("vpc", {
  match: [
    ["Internet gateway", "Lets public subnets reach the internet, horizontally scaled and HA"],
    ["NAT gateway", "Gives private subnets outbound-only IPv4 internet access"],
    ["Security group", "Stateful, instance-level firewall with allow rules only"],
    ["Network ACL", "Stateless subnet-level firewall with ordered allow and deny rules"],
    ["Egress-only internet gateway", "Outbound-only internet access for IPv6"],
    ["VPC Flow Logs", "Capture IP traffic metadata for ENIs, subnets or the VPC"]
  ],
  sort: { title: "Security group or NACL?", buckets: ["Security group", "NACL"], items: [
    ["Stateful: return traffic is automatically allowed", 0], ["Stateless: return traffic needs its own rule", 1],
    ["Supports explicit DENY rules", 1], ["Applies to an ENI / instance", 0], ["Rules evaluated in number order", 1],
    ["Can reference another security group as a source", 0], ["Applies to every instance in a subnet", 1], ["All rules evaluated before deciding", 0]
  ]},
  tf: [
    ["A subnet is public if its route table has a route to an internet gateway.", true, "That route is the definition of a public subnet."],
    ["A NAT gateway should be placed in a private subnet.", false, "It lives in a public subnet; private subnets route 0.0.0.0/0 to it."],
    ["AWS reserves 5 IP addresses in every subnet.", true, "First four and the last one."],
    ["A subnet can span multiple Availability Zones.", false, "A subnet lives in exactly one AZ."],
    ["Security groups can contain deny rules.", false, "Only allow rules; use NACLs to deny."],
    ["A NAT gateway is zonal, so a highly available design uses one per AZ.", true, "Avoids a single-AZ dependency."]
  ],
  quiz: [
    ["EC2 instances in private subnets need to download patches from the internet without accepting inbound connections. What is the MOST operationally efficient solution?", ["Deploy a NAT gateway in a public subnet and route 0.0.0.0/0 from private subnets to it", "Attach an internet gateway to the private subnets", "Assign Elastic IPs to every instance", "Deploy a NAT instance in each private subnet"], [0], "NAT gateways are managed and provide outbound-only access."],
    ["A company must block traffic from a specific malicious IP range to all instances in a subnet. What should be used?", ["A network ACL deny rule", "A security group deny rule", "A route table blackhole", "An internet gateway policy"], [0], "Only NACLs support explicit deny rules."],
    ["An architect wants NAT for three AZs to survive an AZ failure. What should they do?", ["Create a NAT gateway in each AZ and route each private subnet to its local NAT gateway", "Create one NAT gateway with an Elastic IP", "Use a NAT instance in an Auto Scaling group of 1", "Route all subnets through a single NAT gateway in a different Region"], [0], "NAT gateways are zonal; one per AZ removes the cross-AZ dependency."],
    ["After adding an inbound NACL rule for port 443, clients still cannot connect to a web server. Security groups allow 443. What is the most likely cause?", ["The NACL is missing an outbound rule for ephemeral ports", "Security groups are stateless", "The internet gateway is missing a route for 443", "TLS requires a NAT gateway"], [0], "NACLs are stateless; responses go out on ephemeral ports 1024-65535."],
    ["The application tier should only accept traffic from the web tier instances, which scale in and out. What is the simplest rule?", ["Allow the web tier's security group as the source in the app tier security group", "Allow the web subnet CIDR in a NACL", "Allow each web instance IP individually", "Allow 0.0.0.0/0 on the app port"], [0], "Security group referencing tracks instances automatically."],
    ["Security engineers need to investigate rejected connection attempts to a set of instances. What should they enable?", ["VPC Flow Logs", "AWS CloudTrail data events", "AWS Config", "Amazon Inspector"], [0], "Flow Logs record ACCEPT/REJECT metadata for IP traffic."],
    ["An IPv6-enabled workload in a private subnet needs outbound internet access only. What should be used?", ["Egress-only internet gateway", "NAT gateway", "Virtual private gateway", "Transit gateway"], [0], "NAT gateways are for IPv4; IPv6 uses an egress-only IGW."],
    ["A subnet is created with CIDR /28. How many IP addresses are usable for instances?", ["11", "16", "14", "12"], [0], "/28 = 16 addresses minus 5 reserved = 11."],
    ["Which TWO components are required for an instance in a public subnet to be reachable from the internet over IPv4? (Choose two.)", ["A public or Elastic IP address on the instance", "A route to an internet gateway in the subnet's route table", "A NAT gateway", "A VPC endpoint", "A virtual private gateway"], [0, 1], "It needs a public IP and an IGW route (plus permissive SG/NACL)."],
    ["A company runs a NAT instance and wants to reduce management overhead and improve availability. What should it do?", ["Replace it with a NAT gateway", "Add a second NAT instance in the same AZ", "Increase the instance size", "Disable source/destination check"], [0], "NAT gateway is managed, scales automatically and is HA within an AZ."]
  ]
});

L("connect", {
  match: [
    ["VPC peering", "One-to-one private link between two VPCs, non-transitive"],
    ["Transit Gateway", "Hub that connects many VPCs and on-prem networks transitively"],
    ["Site-to-Site VPN", "Encrypted IPsec tunnels over the internet to a VPC"],
    ["Direct Connect", "Dedicated private physical connection from on-prem to AWS"],
    ["Gateway endpoint", "Route-table target for S3 and DynamoDB at no hourly cost"],
    ["PrivateLink (interface endpoint)", "ENI with private IP that exposes a service privately"]
  ],
  sort: { title: "Which connectivity option?", buckets: ["Peering", "Transit GW", "VPN", "Direct Connect"], items: [
    ["Connect 2 VPCs cheaply with no transitive routing", 0], ["Connect 200 VPCs and on-prem in a hub-and-spoke", 1],
    ["Encrypted link to on-prem set up in hours", 2], ["Consistent bandwidth and latency, private line", 3],
    ["Backup path for a dedicated circuit", 2], ["Central routing with route tables per attachment", 1]
  ]},
  tf: [
    ["VPC peering is transitive: A↔B and B↔C means A can reach C.", false, "Peering is not transitive; use Transit Gateway."],
    ["Peered VPCs cannot have overlapping CIDR blocks.", true, "Overlapping ranges are not allowed."],
    ["Direct Connect traffic is encrypted by default.", false, "Run a VPN over DX or use MACsec for encryption."],
    ["Gateway endpoints exist for S3 and DynamoDB.", true, "Only those two services."],
    ["A new Direct Connect connection usually takes weeks to provision.", true, "Physical circuits take time; VPN is fast to set up."],
    ["PrivateLink requires the consumer and provider VPC CIDRs to be non-overlapping.", false, "PrivateLink works with overlapping CIDRs."]
  ],
  quiz: [
    ["A company has 150 VPCs across accounts and several on-premises sites and wants to simplify routing. What should it use?", ["AWS Transit Gateway", "A full mesh of VPC peering connections", "One Site-to-Site VPN per VPC", "A NAT gateway in each VPC"], [0], "Transit Gateway provides scalable hub-and-spoke transitive routing."],
    ["EC2 instances in a private subnet must access S3 without traversing the internet and at the lowest cost. What should be used?", ["S3 gateway VPC endpoint", "NAT gateway", "S3 interface endpoint", "Direct Connect public VIF"], [0], "Gateway endpoints for S3 are free and keep traffic on the AWS network."],
    ["A SaaS provider wants to expose an application to hundreds of customer VPCs, some with overlapping CIDRs, without peering. What should it use?", ["AWS PrivateLink with a Network Load Balancer", "VPC peering", "Transit Gateway", "Public ALB with IP allow lists"], [0], "PrivateLink (endpoint services behind NLB) supports overlapping CIDRs and one-way access."],
    ["A company needs consistent network performance for large data transfers from its data center and an encrypted backup path. Which combination meets this? (Choose two.)", ["AWS Direct Connect as the primary link", "Site-to-Site VPN as a backup", "VPC peering to the data center", "An internet gateway with Elastic IPs", "CloudFront for uploads"], [0, 1], "DX gives consistent performance; VPN is a common, cheap failover."],
    ["Traffic over a Direct Connect link must be encrypted in transit. What is the simplest solution?", ["Run an IPsec Site-to-Site VPN over the Direct Connect connection", "Enable encryption on the virtual private gateway", "Use a NAT gateway", "Use an S3 gateway endpoint"], [0], "VPN over DX (or MACsec) adds encryption."],
    ["A company needs private connectivity to AWS within one week while a Direct Connect link is being provisioned. What should it use?", ["Site-to-Site VPN", "A second Direct Connect", "VPC peering", "AWS Global Accelerator"], [0], "VPN can be up in hours; DX can take weeks."],
    ["VPC A is peered with VPC B, and VPC B is peered with VPC C. Instances in A cannot reach C. What is the reason?", ["Peering is not transitive", "Security groups block it", "C has no internet gateway", "Peering only works in one Region"], [0], "A needs its own peering (or a Transit Gateway) to reach C."],
    ["Applications in a VPC must call AWS Systems Manager and Secrets Manager APIs privately without a NAT gateway. What should be created?", ["Interface VPC endpoints for those services", "Gateway endpoints for those services", "An egress-only internet gateway", "A Direct Connect public VIF"], [0], "Most services use interface endpoints (PrivateLink); gateway endpoints are only S3/DynamoDB."],
    ["A company wants one Direct Connect connection to reach VPCs in multiple Regions. What should it use?", ["Direct Connect gateway", "VPC peering", "Multiple virtual private gateways in one VPC", "Global Accelerator"], [0], "A DX gateway connects a DX link to VGWs/TGWs in many Regions."],
    ["Two VPCs in different accounts need to communicate privately at the lowest cost. CIDRs do not overlap and only these two VPCs are involved. What is best?", ["VPC peering", "Transit Gateway", "Site-to-Site VPN between the VPCs", "PrivateLink for every service"], [0], "For two VPCs, peering is simplest and has no hourly attachment cost."]
  ]
});

L("ec2", {
  match: [
    ["On-Demand", "Pay per second, no commitment; short or unpredictable workloads"],
    ["Reserved Instances", "1 or 3-year commitment for steady state, up to 72% off"],
    ["Spot Instances", "Spare capacity up to 90% off; can be interrupted with 2-minute notice"],
    ["Dedicated Host", "Physical server for you; bring-your-own per-socket licenses"],
    ["Savings Plans", "Commit to $/hour of compute for 1 or 3 years"],
    ["Capacity Reservation", "Reserve capacity in a specific AZ with no term commitment"]
  ],
  sort: { title: "Placement group types", buckets: ["Cluster", "Spread", "Partition"], items: [
    ["Low-latency, high-throughput HPC in one AZ", 0], ["Max 7 instances per AZ, each on distinct hardware", 1],
    ["Hadoop, Cassandra, Kafka with rack awareness", 2], ["Critical instances that must not fail together", 1],
    ["Up to 7 partitions per AZ, hundreds of instances", 2], ["10 Gbps+ between instances, same rack risk", 0]
  ]},
  tf: [
    ["Spot Instances are good for stateless, fault-tolerant batch jobs.", true, "Interruptions are acceptable for those."],
    ["Instance store data survives a stop and start.", false, "Instance store is ephemeral; data is lost on stop/terminate."],
    ["Hibernation saves RAM to the encrypted EBS root volume.", true, "Requires an encrypted EBS root."],
    ["A cluster placement group spreads instances across AZs.", false, "Cluster = one AZ, close together."],
    ["Public IPv4 addresses, including attached Elastic IPs, are billed hourly.", true, "Since Feb 2024 every public IPv4 address has an hourly charge."],
    ["EC2 user data scripts run as root at first boot by default.", true, "They run once at launch."]
  ],
  quiz: [
    ["A company runs a steady 24/7 web tier for the next 3 years and wants the biggest discount while keeping flexibility to change instance families and Regions. What should it buy?", ["Compute Savings Plan", "Standard Reserved Instances", "Spot Instances", "Dedicated Hosts"], [0], "Compute Savings Plans apply across families, Regions, Fargate and Lambda."],
    ["A nightly image-processing batch can be interrupted and restarted. What is the MOST cost-effective option?", ["Spot Instances", "On-Demand Instances", "Reserved Instances", "Dedicated Instances"], [0], "Interruptible work = Spot, up to 90% off."],
    ["A licensing agreement charges per physical CPU socket. Which option lets the company use existing licenses?", ["Dedicated Hosts", "Dedicated Instances", "Spot Fleet", "On-Demand Capacity Reservations"], [0], "Dedicated Hosts expose sockets/cores for BYOL."],
    ["An HPC application needs the lowest possible network latency between nodes. Which placement strategy fits?", ["Cluster placement group", "Spread placement group", "Partition placement group", "Instances across three AZs"], [0], "Cluster packs instances close together in one AZ."],
    ["A Cassandra cluster must reduce the chance of correlated hardware failures and expose rack info to the application. What should be used?", ["Partition placement group", "Cluster placement group", "Spread placement group", "Dedicated Hosts"], [0], "Partitions map to racks and are visible to the app."],
    ["An application takes 10 minutes to warm in-memory caches after boot. The team wants faster restarts after stopping instances at night. What feature helps?", ["EC2 Hibernate", "Instance store volumes", "Elastic IPs", "Detailed monitoring"], [0], "Hibernate preserves RAM so the app resumes warm."],
    ["A company needs guaranteed EC2 capacity in a specific AZ for a 2-week event without a long-term commitment. What should it use?", ["On-Demand Capacity Reservation", "Standard Reserved Instances", "Spot Instances", "Compute Savings Plan"], [0], "Capacity Reservations have no term and guarantee capacity in an AZ."],
    ["Which TWO statements about instance store volumes are true? (Choose two.)", ["They provide very high IOPS physically attached to the host", "Data is lost when the instance is stopped or terminated", "They can be detached and attached to another instance", "They are replicated across AZs", "They can be snapshotted to S3 like EBS"], [0, 1], "Instance store is fast, ephemeral and host-bound."],
    ["An instance fails a system status check due to underlying host hardware problems. How can it recover automatically with the same IP and instance ID?", ["Create a CloudWatch alarm with the EC2 recover action", "Use an Auto Scaling group of 1", "Reboot the instance via Lambda", "Enable termination protection"], [0], "The recover action moves the instance to new hardware keeping its ID and IPs."],
    ["A workload needs the best price-performance for Linux web servers. Which choice best fits AWS guidance?", ["Graviton (ARM) instance types", "Previous-generation x86 instances", "Dedicated Instances", "Bare-metal instances"], [0], "Graviton offers up to ~40% better price-performance."]
  ]
});

L("storage", {
  match: [
    ["gp3", "General purpose SSD with baseline 3,000 IOPS, IOPS set independently of size"],
    ["io2 Block Express", "Provisioned IOPS SSD up to 256,000 IOPS, sub-ms latency"],
    ["st1", "Throughput-optimized HDD for big sequential workloads"],
    ["EFS", "Managed NFS file system shared by many Linux instances across AZs"],
    ["FSx for Windows File Server", "SMB shares with Active Directory integration"],
    ["FSx for Lustre", "High-performance file system for HPC, linked to S3"]
  ],
  sort: { title: "Pick the storage", buckets: ["EBS", "EFS", "FSx"], items: [
    ["Boot volume for a single EC2 instance", 0], ["Shared home directories for 100 Linux servers", 1],
    ["Windows apps needing SMB and NTFS ACLs", 2], ["Database needing 64,000 IOPS on one instance", 0],
    ["Machine learning training reading TBs from S3 fast", 2], ["Content management system across 3 AZs on Linux", 1],
    ["NetApp ONTAP features like SnapMirror", 2]
  ]},
  tf: [
    ["An EBS volume can be attached to instances in any AZ.", false, "EBS is AZ-locked; snapshot it to move."],
    ["EBS Multi-Attach works with io1/io2 volumes.", true, "Up to 16 Nitro instances in the same AZ."],
    ["EFS works with Windows instances.", false, "EFS is NFS for Linux; Windows uses FSx for Windows."],
    ["EFS Infrequent Access can be applied automatically via lifecycle policies.", true, "Lifecycle moves cold files to IA."],
    ["HDD volumes (st1/sc1) can be used as boot volumes.", false, "Only SSD volumes can be boot volumes."],
    ["gp3 lets you provision IOPS and throughput independently of volume size.", true, "Unlike gp2, which ties IOPS to size."]
  ],
  quiz: [
    ["A database on EC2 needs 50,000 consistent IOPS with sub-millisecond latency. Which EBS volume type should be used?", ["io2 Block Express", "gp2", "st1", "sc1"], [0], "Provisioned IOPS SSD (io2) for high, consistent IOPS."],
    ["A company wants to reduce EBS cost for general workloads currently on gp2 without losing performance. What should it do?", ["Migrate volumes to gp3", "Migrate volumes to st1", "Migrate volumes to io2", "Use instance store"], [0], "gp3 is ~20% cheaper with 3,000 baseline IOPS regardless of size."],
    ["Several Linux EC2 instances across three AZs need concurrent read/write access to the same files. What is the MOST suitable storage?", ["Amazon EFS", "EBS gp3 with Multi-Attach", "Instance store", "S3 Glacier"], [0], "EFS is a Regional, multi-AZ shared NFS file system."],
    ["A Windows application needs shared storage with SMB, NTFS permissions and Active Directory integration. What should be used?", ["Amazon FSx for Windows File Server", "Amazon EFS", "Amazon S3", "FSx for Lustre"], [0], "FSx for Windows provides native SMB and AD integration."],
    ["An HPC workload must process datasets stored in S3 with sub-millisecond latency and hundreds of GB/s throughput. What should be used?", ["FSx for Lustre linked to the S3 bucket", "EFS Standard", "EBS st1", "S3 Transfer Acceleration"], [0], "Lustre is built for HPC and integrates with S3."],
    ["A log-processing job reads large files sequentially and needs low cost per GB with high throughput. Which EBS type fits?", ["st1", "io2", "gp3", "sc1 as a boot volume"], [0], "Throughput-optimized HDD suits big sequential reads."],
    ["How can an EBS volume be moved to an instance in another AZ?", ["Create a snapshot and restore it in the target AZ", "Detach and attach it directly", "Enable Multi-Attach", "Change the volume's AZ setting"], [0], "Snapshots are regional and can be restored into any AZ."],
    ["An EFS file system holds files that are rarely read after 30 days. How can costs be reduced with minimal effort?", ["Enable an EFS lifecycle policy to move files to Infrequent Access", "Copy files to S3 manually each month", "Switch to EBS sc1", "Use FSx for Lustre scratch"], [0], "Lifecycle management moves cold files automatically."],
    ["Which TWO ways can protect EBS data against an AZ failure? (Choose two.)", ["Take regular EBS snapshots", "Use AWS Backup with a backup plan", "Enable EBS Multi-Attach", "Use larger gp3 volumes", "Use instance store mirroring"], [0, 1], "Snapshots (directly or via AWS Backup) are stored regionally across AZs."],
    ["A company migrating NetApp storage wants to keep SnapMirror and multi-protocol (NFS/SMB) access. What should it use?", ["Amazon FSx for NetApp ONTAP", "Amazon EFS", "FSx for OpenZFS", "S3 File Gateway"], [0], "FSx for ONTAP preserves NetApp features."]
  ]
});

L("s3", {
  match: [
    ["S3 Standard-IA", "Infrequent access, millisecond retrieval, multi-AZ"],
    ["S3 One Zone-IA", "Infrequent access stored in one AZ; re-creatable data"],
    ["S3 Glacier Instant Retrieval", "Archive accessed quarterly with millisecond retrieval"],
    ["S3 Glacier Deep Archive", "Cheapest storage, retrieval within 12-48 hours"],
    ["S3 Intelligent-Tiering", "Moves objects between tiers automatically for unknown patterns"],
    ["S3 Object Lock", "WORM protection in governance or compliance mode"]
  ],
  order: { title: "Lifecycle: cheapest path over time", prompt: "Order these storage classes from hottest (newest data) to coldest.", steps: [
    "S3 Standard", "S3 Standard-IA", "S3 Glacier Instant Retrieval", "S3 Glacier Flexible Retrieval", "S3 Glacier Deep Archive"
  ]},
  tf: [
    ["S3 provides 99.999999999% (11 nines) durability.", true, "All classes share it; One Zone classes just store data in a single AZ."],
    ["S3 Cross-Region Replication requires versioning on both buckets.", true, "Versioning is mandatory for replication."],
    ["Existing objects are automatically replicated when you enable CRR.", false, "Only new objects; use S3 Batch Replication for existing ones."],
    ["SSE-S3 is now applied by default to new objects.", true, "Default encryption since Jan 2023."],
    ["A presigned URL grants access using the signer's permissions for a limited time.", true, "Good for temporary uploads/downloads."],
    ["Compliance-mode Object Lock can be removed by the root user.", false, "Nobody can delete or shorten retention in compliance mode."]
  ],
  quiz: [
    ["Objects are accessed often for 30 days, rarely afterward, and must be kept 7 years for audit with retrieval within 48 hours. What is the MOST cost-effective approach?", ["Lifecycle rule: Standard → Standard-IA at 30 days → Glacier Deep Archive later", "Keep everything in S3 Standard", "Store in One Zone-IA from day one", "Use Intelligent-Tiering with no archive tiers"], [0], "Lifecycle transitions match each access phase; Deep Archive meets 48-hour retrieval."],
    ["Regulators require that log files cannot be deleted or overwritten by anyone, including root, for 5 years. What should be used?", ["S3 Object Lock in compliance mode", "S3 Object Lock in governance mode", "Bucket policy denying DeleteObject", "MFA Delete"], [0], "Compliance mode cannot be overridden by any user."],
    ["A data lake has unpredictable access patterns and the team wants to optimize cost without analysis. Which class?", ["S3 Intelligent-Tiering", "S3 Standard-IA", "S3 One Zone-IA", "Glacier Flexible Retrieval"], [0], "Intelligent-Tiering automatically moves objects based on access."],
    ["Users worldwide upload large files to a single S3 bucket in us-east-1 and uploads are slow. What improves upload speed?", ["S3 Transfer Acceleration with multipart upload", "Cross-Region Replication", "CloudFront with GET caching only", "Requester Pays"], [0], "Transfer Acceleration uses edge locations and the AWS backbone."],
    ["A mobile app must let users upload directly to a private bucket for 15 minutes without AWS credentials. What should the backend provide?", ["A presigned URL for PutObject", "A public-write bucket policy", "IAM user keys per app user", "An S3 access point with public access"], [0], "Presigned URLs grant time-limited access to a specific operation."],
    ["Which TWO are required to replicate objects to a bucket in another Region? (Choose two.)", ["Versioning enabled on source and destination buckets", "An IAM role that S3 can assume for replication", "Transfer Acceleration enabled", "Both buckets in the same account", "Object Lock enabled"], [0, 1], "CRR needs versioning on both sides and a replication role."],
    ["A company must protect against accidental deletions and be able to restore prior versions of objects. What should be enabled?", ["S3 Versioning", "S3 Transfer Acceleration", "S3 Inventory", "Static website hosting"], [0], "Versioning keeps previous versions and turns deletes into delete markers."],
    ["Thumbnails can be regenerated from originals and are rarely accessed. Which class is cheapest while keeping ms access?", ["S3 One Zone-IA", "S3 Standard", "S3 Glacier Deep Archive", "S3 Standard-IA"], [0], "One Zone-IA is cheaper and fine for re-creatable data."],
    ["Data must be encrypted with keys whose usage is logged in CloudTrail and can be rotated and controlled by the security team. Which option?", ["SSE-KMS with a customer managed key", "SSE-S3", "SSE-C", "No encryption with bucket policy"], [0], "SSE-KMS gives key policies, rotation and CloudTrail audit."],
    ["A static website on S3 must be served over HTTPS with a custom domain and low latency worldwide while keeping the bucket private. What should be used?", ["CloudFront with Origin Access Control and an ACM certificate", "S3 static website endpoint with public bucket", "Route 53 alias directly to S3 with HTTPS", "S3 Transfer Acceleration"], [0], "CloudFront + OAC keeps the bucket private and serves HTTPS globally."]
  ]
});
