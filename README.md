# AWS Solutions Architect – SAA-C03 Study Guide

A single self-contained HTML study guide covering the AWS Certified Solutions Architect – Associate (SAA-C03) exam.

Open [saa-c03-study-guide.html](saa-c03-study-guide.html) in any browser — no build step or dependencies required.

## Topics covered

- AWS basics: infrastructure, shared responsibility, Well-Architected pillars
- IAM, VPC networking and connectivity
- EC2, EBS, AMIs, EFS, FSx, AWS Backup
- S3, RDS, Aurora, DynamoDB, and purpose-built databases
- Big data (Redshift, EMR), streaming (Kinesis, MSK), analytics (Athena, Glue, OpenSearch)
- Machine learning services
- Elastic Load Balancing, Auto Scaling, and high availability
- Monitoring (CloudWatch, Grafana, Prometheus) and disaster recovery strategies
- Route 53/DNS, caching (CloudFront, ElastiCache, DAX, Global Accelerator)
- Decoupling with SQS, SNS, API Gateway, Batch, Amazon MQ, Step Functions, AppFlow
- Serverless, containers, and automation (CloudFormation, Elastic Beanstalk, Systems Manager)
- Migration/data transfer, front-end web/mobile/media
- Security: DDoS protection, firewalls, detection/audit, encryption/secrets, identity, governance
- Cost management
- Exam triggers and key numbers to memorize

## Usage

Clone the repo and open the HTML file directly, or download it and open it locally — it works offline.

## Saved AI explanations

Run `cp .env.example .env`, set `EXPLAIN_PASSWORD`, then `node server.js` and open http://localhost:8080.
After an AI answer, click **💾 Save to page**. The explained text gets a dotted underline and a ⓘ icon; click either to see the explanation. Editing and deleting ask for the password.
Explanations are stored in `explanations.json`. Commit it so the static site shows them read-only.
