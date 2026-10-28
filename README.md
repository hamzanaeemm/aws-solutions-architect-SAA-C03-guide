# AWS Solutions Architect – SAA-C03 Study Guide

A single self-contained HTML study guide covering the AWS Certified Solutions Architect – Associate (SAA-C03) exam.

Requires Node.js for the local server and build; no dependencies.

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

The published site is password protected: `index.html` is encrypted, and readable sources live only in the gitignored `src/` folder (backed up encrypted in `source.enc`).

1. `cp .env.example .env` and set `SITE_PASSWORD` (site login + encryption key, use 12+ characters) and `EXPLAIN_PASSWORD` (edit/delete saved explanations).
2. Fresh clone? Run `node build.js --restore` to recreate `src/`.
3. `node build.js` re-encrypts `index.html` and `source.enc` from `src/`. Commit and push; GitHub Pages serves the encrypted page.
4. Saved AI explanations live in `notes.enc` (encrypted). The site itself adds, edits and deletes them by committing that file through the GitHub API: the first time on each device it asks for your `EXPLAIN_PASSWORD` and a fine-grained GitHub token (Contents: read and write, this repo only), which it stores encrypted in that browser. Run `git pull` before working locally so you pick up those commits.
5. Changed `SITE_PASSWORD`? Run `OLD_SITE_PASSWORD=<old> node build.js` once to re-encrypt `notes.enc`.
