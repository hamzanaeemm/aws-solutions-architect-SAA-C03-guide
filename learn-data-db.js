/* Practice data: Databases & Machine Learning. */

L("rds", {
  match: [
    ["Multi-AZ instance deployment", "Synchronous standby in another AZ with automatic failover"],
    ["Read replica", "Asynchronous copy that offloads read traffic"],
    ["Aurora Global Database", "Cross-Region replication under 1 second, RPO ~1s, RTO under 1 min"],
    ["RDS Proxy", "Pools connections, ideal for Lambda, speeds up failover"],
    ["Aurora Serverless v2", "Scales capacity in fine-grained ACUs automatically"],
    ["Automated backups", "Daily snapshot + transaction logs for point-in-time restore up to 35 days"]
  ],
  sort: { title: "High availability or read scaling?", buckets: ["Multi-AZ", "Read replica"], items: [
    ["Synchronous replication", 0], ["Asynchronous replication", 1], ["Standby cannot serve reads (instance deployment)", 0],
    ["Can be promoted to a standalone DB", 1], ["Can live in another Region", 1], ["Automatic DNS failover on outage", 0]
  ]},
  tf: [
    ["An unencrypted RDS instance can be encrypted in place.", false, "Snapshot → copy with encryption → restore."],
    ["Aurora stores 6 copies of data across 3 AZs.", true, "Two copies per AZ."],
    ["Aurora supports up to 15 read replicas.", true, "Aurora Replicas share the cluster storage volume, so replica lag is low."],
    ["RDS gives you SSH access to the underlying host.", false, "Only RDS Custom gives OS access."],
    ["IAM database authentication works for MySQL and PostgreSQL on RDS.", true, "Uses a short-lived auth token instead of a password."],
    ["Automated backups can be retained for up to 35 days.", true, "Use manual snapshots or AWS Backup for longer."]
  ],
  quiz: [
    ["A production MySQL database on RDS must automatically fail over if an AZ fails. What should be enabled?", ["Multi-AZ deployment", "A read replica in the same AZ", "Automated backups only", "Enhanced Monitoring"], [0], "Multi-AZ keeps a synchronous standby with automatic failover."],
    ["Reporting queries are slowing down the primary RDS PostgreSQL database. What is the best fix with minimal changes?", ["Create a read replica and point reporting to it", "Enable Multi-AZ and read from the standby", "Increase backup retention", "Move to a larger storage volume"], [0], "Read replicas offload read-heavy workloads."],
    ["A global application needs a relational database with sub-second cross-Region replication and recovery in under a minute if a Region fails. What should be used?", ["Aurora Global Database", "RDS cross-Region read replicas for MySQL", "DynamoDB global tables", "Multi-AZ RDS with snapshots copied hourly"], [0], "Aurora Global Database: RPO ~1s, RTO < 1 min."],
    ["Thousands of Lambda invocations open new connections and exhaust database connections on RDS. What fixes this?", ["Put RDS Proxy in front of the database", "Increase the Lambda timeout", "Add a read replica", "Enable Multi-AZ"], [0], "RDS Proxy pools and reuses connections."],
    ["A company must encrypt an existing unencrypted RDS instance. What is the correct procedure?", ["Snapshot it, copy the snapshot with encryption enabled, restore from the encrypted copy", "Modify the instance and enable encryption", "Enable TLS on connections", "Create an encrypted read replica directly"], [0], "Encryption can't be turned on in place."],
    ["An application has unpredictable, spiky relational workloads and the team wants no capacity management. What fits best?", ["Aurora Serverless v2", "RDS on a fixed large instance", "Redshift", "RDS Custom"], [0], "Aurora Serverless v2 scales automatically."],
    ["A legacy app needs OS-level access and custom agents on its Oracle database host while keeping managed backups. What should be used?", ["Amazon RDS Custom for Oracle", "Standard RDS for Oracle", "Aurora PostgreSQL", "DynamoDB"], [0], "RDS Custom allows OS and DB customization."],
    ["Which TWO features help an Aurora cluster scale reads? (Choose two.)", ["Aurora Replicas with the reader endpoint", "Aurora Auto Scaling for replicas", "Multi-AZ standby instances in RDS for MySQL", "Increasing backup retention", "Enabling Performance Insights"], [0, 1], "Aurora Replicas behind the reader endpoint, with replica auto scaling, scale reads."],
    ["A team needs to restore a database to its state 3 hours ago after a bad deployment. What feature enables this?", ["Point-in-time recovery from automated backups", "Multi-AZ failover", "Read replica promotion", "RDS Proxy"], [0], "PITR uses backups + transaction logs to restore to any second in the retention period."],
    ["Developers need fast, isolated copies of a large Aurora production database for testing. What is the quickest and most storage-efficient option?", ["Aurora cloning", "Restore from a manual snapshot", "Create a read replica", "Export to S3 and re-import"], [0], "Clones use copy-on-write and are created in minutes."]
  ]
});

L("dynamodb", {
  match: [
    ["DAX", "In-memory cache for DynamoDB with microsecond reads"],
    ["Global tables", "Multi-Region, multi-active replication"],
    ["DynamoDB Streams", "Ordered item-level change log for 24 hours"],
    ["On-demand capacity", "Pay per request; unpredictable traffic"],
    ["GSI", "Index with a different partition key, can be added anytime"],
    ["TTL", "Automatically deletes expired items at no cost"]
  ],
  sort: { title: "On-demand or provisioned?", buckets: ["On-demand", "Provisioned"], items: [
    ["New app with unknown traffic", 0], ["Steady, predictable traffic and cost focus", 1],
    ["Spiky, unpredictable bursts", 0], ["Use Auto Scaling on RCU/WCU", 1], ["Can buy reserved capacity", 1], ["No capacity planning at all", 0]
  ]},
  tf: [
    ["DynamoDB items can be up to 400 KB.", true, "Store larger objects in S3 and keep a pointer."],
    ["An LSI can be added after the table is created.", false, "LSIs must be defined at table creation; GSIs can be added anytime."],
    ["DynamoDB supports ACID transactions across multiple items.", true, "TransactWriteItems / TransactGetItems."],
    ["DAX is useful for write-heavy workloads.", false, "DAX accelerates reads (microsecond latency)."],
    ["Point-in-time recovery restores to any second in the last 35 days.", true, "PITR window is 35 days."],
    ["DynamoDB requires you to manage servers and patching.", false, "It's fully serverless."]
  ],
  quiz: [
    ["A gaming leaderboard on DynamoDB has read-heavy traffic needing microsecond latency. What should be added?", ["DynamoDB Accelerator (DAX)", "ElastiCache for Memcached in front of the app", "A read replica", "DynamoDB Streams"], [0], "DAX is the native in-memory cache for DynamoDB."],
    ["An app must be writable in two Regions with automatic multi-active replication. What should be used?", ["DynamoDB global tables", "DynamoDB Streams + Lambda copying data", "Aurora read replicas", "S3 Cross-Region Replication"], [0], "Global tables provide managed multi-Region, multi-active replication."],
    ["Every new order written to a DynamoDB table must trigger an email notification. What is the simplest serverless design?", ["Enable DynamoDB Streams and trigger a Lambda function that publishes to SNS", "Poll the table with a cron job on EC2", "Use DAX events", "Use a GSI to notify"], [0], "Streams + Lambda reacts to item changes."],
    ["A startup launches a new app with completely unknown traffic and wants to pay only for what it uses. Which mode?", ["On-demand capacity", "Provisioned with reserved capacity", "Provisioned without auto scaling", "DAX"], [0], "On-demand scales instantly and bills per request."],
    ["Session data should be removed automatically after 24 hours without extra cost. What feature?", ["Time to Live (TTL)", "DynamoDB Streams", "A scheduled Lambda scan", "PITR"], [0], "TTL deletes expired items for free."],
    ["The team needs to query a table by a different attribute than the partition key after launch. What should they add?", ["A global secondary index", "A local secondary index", "A new sort key on the base table", "DAX"], [0], "GSIs can be added anytime with a different partition key."],
    ["Which TWO options protect DynamoDB data from accidental deletes or writes? (Choose two.)", ["Point-in-time recovery", "On-demand backups / AWS Backup", "DAX", "Global secondary indexes", "Provisioned capacity"], [0, 1], "PITR and on-demand backups allow restores."],
    ["A company needs to run SQL analytics on DynamoDB data without impacting table performance. What is the recommended approach?", ["Export the table to S3 and query with Athena", "Run Scan operations hourly", "Add more RCUs and use PartiQL scans", "Enable DAX"], [0], "Export to S3 uses PITR and doesn't consume read capacity."],
    ["A table shows throttling on one hot partition key while total capacity is not used. What design change helps most?", ["Choose a higher-cardinality partition key (or add a random suffix)", "Increase total WCU", "Add an LSI", "Enable TTL"], [0], "Even key distribution prevents hot partitions."],
    ["A serverless app needs a key-value database with single-digit-ms latency at any scale and no servers. What service?", ["Amazon DynamoDB", "Amazon RDS for MySQL", "Amazon Redshift", "Amazon Neptune"], [0], "DynamoDB is the serverless key-value choice."]
  ]
});

L("otherdb", {
  match: [
    ["ElastiCache for Redis", "In-memory cache with replication, persistence and sorted sets"],
    ["Amazon Neptune", "Graph database for relationships and social networks"],
    ["Amazon DocumentDB", "MongoDB-compatible document database"],
    ["Amazon Keyspaces", "Managed Apache Cassandra-compatible database"],
    ["Amazon Timestream", "Time-series data for IoT and metrics"],
    ["Amazon QLDB", "Immutable, cryptographically verifiable ledger"]
  ],
  sort: { title: "Which purpose-built DB?", buckets: ["Neptune", "DocumentDB", "Timestream", "ElastiCache"], items: [
    ["Fraud detection across connected accounts", 0], ["Migrate a MongoDB app with minimal changes", 1],
    ["Store sensor readings every second", 2], ["Session store with sub-ms latency", 3],
    ["Friend-of-friend recommendations", 0], ["Leaderboard using sorted sets", 3]
  ]},
  tf: [
    ["Memcached supports replication and persistence.", false, "Redis has those; Memcached is simple multi-threaded caching."],
    ["Neptune is a graph database.", true, "Supports Gremlin, openCypher and SPARQL."],
    ["DocumentDB is compatible with MongoDB APIs.", true, "Migrate MongoDB workloads."],
    ["ElastiCache requires application code changes to use.", true, "The app must read/write the cache explicitly."],
    ["Keyspaces is compatible with Cassandra Query Language (CQL).", true, "Serverless Cassandra."],
    ["Timestream is designed for document storage.", false, "It is for time-series data."]
  ],
  quiz: [
    ["A social network needs to query relationships like friends-of-friends quickly. Which database?", ["Amazon Neptune", "Amazon DynamoDB", "Amazon Redshift", "Amazon RDS for MySQL"], [0], "Graph relationships → Neptune."],
    ["A company wants to migrate a MongoDB workload to a managed AWS service with minimal code changes. What should it use?", ["Amazon DocumentDB", "Amazon Keyspaces", "Amazon Neptune", "Amazon Timestream"], [0], "DocumentDB is MongoDB-compatible."],
    ["An IoT platform stores trillions of timestamped sensor readings and queries recent data fast. Which service?", ["Amazon Timestream", "Amazon QLDB", "Amazon DocumentDB", "Amazon Neptune"], [0], "Timestream is purpose-built for time-series."],
    ["A web app must store user sessions with sub-millisecond latency and survive a node failure. What should be used?", ["ElastiCache for Redis with Multi-AZ replication", "ElastiCache for Memcached", "Amazon S3", "RDS read replicas"], [0], "Redis supports replication and failover; Memcached doesn't."],
    ["A gaming company needs real-time leaderboards ranked by score. Which feature fits?", ["Redis sorted sets in ElastiCache", "DynamoDB Streams", "Memcached multi-threading", "Neptune graph traversal"], [0], "Sorted sets provide ranked leaderboards."],
    ["A company running Apache Cassandra wants a serverless, managed alternative using CQL. What service?", ["Amazon Keyspaces", "Amazon DocumentDB", "Amazon DynamoDB Accelerator", "Amazon EMR"], [0], "Keyspaces is managed Cassandra-compatible."],
    ["Database reads are slow and repeated for the same product catalog data. What reduces database load most with in-memory caching?", ["Amazon ElastiCache using lazy loading", "Add Multi-AZ", "Use S3 Glacier", "Enable RDS automated backups"], [0], "Caching hot reads offloads the database."],
    ["Which TWO are reasons to choose ElastiCache for Redis over Memcached? (Choose two.)", ["Replication and automatic failover", "Persistence and backups", "Simpler multi-threaded architecture", "No data structures needed", "Cheapest for simple caching only"], [0, 1], "Redis adds replication, persistence and data structures."],
    ["A fraud detection system needs to find suspicious patterns across linked accounts, devices and transactions. Which database fits best?", ["Amazon Neptune", "Amazon Timestream", "Amazon ElastiCache for Memcached", "Amazon Redshift Spectrum"], [0], "Graph traversal is ideal for connected-data fraud patterns."],
    ["An app needs a cache to reduce read load on RDS, with the cache populated only when data is requested. Which strategy?", ["Lazy loading (cache-aside)", "Write-through", "TTL of zero", "Read replicas"], [0], "Lazy loading loads data into the cache on a miss."]
  ]
});

L("redshift", {
  match: [
    ["Amazon Redshift", "Columnar data warehouse for OLAP and BI"],
    ["Redshift Spectrum", "Query data in S3 directly from Redshift"],
    ["Amazon EMR", "Managed Hadoop/Spark clusters for big data processing"],
    ["EMR core nodes", "Run tasks and store HDFS data"],
    ["EMR task nodes", "Compute only, safe to run on Spot"],
    ["Redshift Serverless", "Data warehouse without managing clusters"]
  ],
  sort: { title: "OLTP or OLAP?", buckets: ["OLTP (RDS/Aurora)", "OLAP (Redshift)"], items: [
    ["Process customer orders as they happen", 0], ["Quarterly sales trends across 5 years", 1],
    ["Many small row-level inserts/updates", 0], ["Complex aggregations on billions of rows", 1],
    ["BI dashboards in QuickSight on historical data", 1], ["User login and profile updates", 0]
  ]},
  tf: [
    ["Redshift is optimized for OLTP transactions.", false, "Redshift is OLAP/analytics."],
    ["Redshift Spectrum queries data in S3 without loading it.", true, "External tables via the Glue Data Catalog."],
    ["EMR task nodes are a good fit for Spot Instances.", true, "They hold no HDFS data."],
    ["Redshift can automatically copy snapshots to another Region.", true, "Cross-Region snapshot copy for DR."],
    ["EMR master/primary nodes should run on Spot to save money.", false, "Losing the primary node kills the cluster."],
    ["Redshift stores data in columns.", true, "Columnar storage speeds analytics."]
  ],
  quiz: [
    ["A company needs to run complex SQL analytics on petabytes of historical sales data for BI dashboards. What should it use?", ["Amazon Redshift", "Amazon RDS for PostgreSQL", "Amazon DynamoDB", "Amazon ElastiCache"], [0], "Redshift is the AWS data warehouse for OLAP."],
    ["Analysts want to join Redshift tables with years of raw data stored in S3 without loading it. What should be used?", ["Redshift Spectrum", "Redshift COPY into new tables", "S3 Select", "DynamoDB export"], [0], "Spectrum queries S3 data in place."],
    ["A Spark job runs on EMR daily and the company wants to cut costs while keeping the cluster stable. What is the best approach?", ["Use On-Demand for primary and core nodes and Spot for task nodes", "Run all nodes on Spot", "Run all nodes on Reserved Instances", "Use Dedicated Hosts"], [0], "Task nodes hold no data, so Spot interruptions are safe."],
    ["A data warehouse must survive a Regional outage. What should be configured?", ["Cross-Region snapshot copy for Redshift", "Multi-AZ RDS", "S3 Transfer Acceleration", "EMR task nodes in another Region"], [0], "Copy snapshots to another Region for DR."],
    ["A team occasionally runs analytics queries and wants no cluster management or idle cost. What fits?", ["Redshift Serverless", "Provisioned Redshift RA3 cluster", "EMR on EC2", "RDS Multi-AZ"], [0], "Serverless scales automatically and bills per use."],
    ["A company must process large log datasets with Apache Spark and Hive and manage the frameworks with minimal ops. What should it use?", ["Amazon EMR", "Amazon Redshift", "AWS Glue DataBrew", "Amazon RDS"], [0], "EMR runs managed Hadoop ecosystem tools."],
    ["Which TWO characteristics make Redshift fast for analytics? (Choose two.)", ["Columnar storage", "Massively parallel processing (MPP)", "Row-based storage", "Single-node design", "Synchronous Multi-AZ standby"], [0, 1], "Columnar + MPP are the core of Redshift performance."],
    ["Many BI users run the same dashboards at peak times and queries queue up on Redshift. What helps with minimal effort?", ["Enable concurrency scaling", "Add an RDS read replica", "Use S3 Glacier", "Switch to DynamoDB"], [0], "Concurrency scaling adds transient capacity for bursts."],
    ["Data from Aurora must appear in Redshift for analytics in near real time without building ETL pipelines. What should be used?", ["Aurora zero-ETL integration with Redshift", "Nightly mysqldump to S3", "DMS to DynamoDB", "Kinesis Data Firehose from Aurora"], [0], "Zero-ETL replicates Aurora data into Redshift automatically."],
    ["Which service is the right choice for transactional order processing rather than analytics?", ["Amazon Aurora", "Amazon Redshift", "Amazon EMR", "Redshift Spectrum"], [0], "OLTP belongs in RDS/Aurora."]
  ]
});

L("streaming", {
  match: [
    ["Kinesis Data Streams", "Real-time streams with shards, custom consumers, replay up to 365 days"],
    ["Amazon Data Firehose", "Loads streaming data into S3, Redshift, OpenSearch; near real time"],
    ["Amazon MSK", "Managed Apache Kafka"],
    ["Shard", "1 MB/s or 1,000 records/s in, 2 MB/s out"],
    ["Partition key", "Decides which shard a record goes to and keeps order per key"],
    ["Managed Service for Apache Flink", "Real-time analytics on streams with SQL/Java"]
  ],
  sort: { title: "Data Streams or Firehose?", buckets: ["Data Streams", "Firehose"], items: [
    ["Custom real-time consumers with replay", 0], ["Deliver to S3 with no code", 1], ["Buffers by size/time, near real time", 1],
    ["You manage shards or use on-demand mode", 0], ["Can transform with Lambda and convert to Parquet", 1], ["Multiple apps consume the same records", 0]
  ]},
  tf: [
    ["Firehose stores data for replay like Data Streams.", false, "Firehose delivers and doesn't retain data for replay."],
    ["Records with the same partition key go to the same shard in order.", true, "Ordering is per shard."],
    ["Kinesis Data Streams retention can be extended to 365 days.", true, "Default 24 hours."],
    ["MSK is a good choice when migrating existing Kafka applications.", true, "Kafka APIs are unchanged."],
    ["Firehose can deliver directly to Amazon Redshift.", true, "Via an intermediate S3 COPY."],
    ["Kinesis Data Streams is a batch ETL tool.", false, "It is for real-time streaming."]
  ],
  quiz: [
    ["Clickstream data must be loaded into S3 in Parquet format for Athena with no custom code. What should be used?", ["Amazon Data Firehose with format conversion", "Kinesis Data Streams with custom consumers", "Amazon SQS", "AWS Batch"], [0], "Firehose delivers to S3 and converts to Parquet/ORC."],
    ["Multiple applications must process the same real-time stream independently and replay data from 3 days ago. What should be used?", ["Kinesis Data Streams with extended retention", "Amazon Data Firehose", "Amazon SNS", "Amazon SQS standard queue"], [0], "Data Streams supports multiple consumers and replay."],
    ["A company runs Apache Kafka on premises and wants a managed AWS service without changing producer/consumer code. What fits?", ["Amazon MSK", "Kinesis Data Streams", "Amazon MQ", "Amazon SQS"], [0], "MSK is managed Kafka."],
    ["A Kinesis stream throws ProvisionedThroughputExceeded errors. What should be done? (Choose two.)", ["Increase the number of shards (or use on-demand mode)", "Use a better-distributed partition key", "Switch to Firehose for replay", "Reduce the retention period", "Use FIFO SQS instead"], [0, 1], "More shards and even key distribution raise throughput."],
    ["Events for each customer must be processed in order in a Kinesis stream. How?", ["Use the customer ID as the partition key", "Use a random partition key", "Use one consumer per shard with random keys", "Enable server-side encryption"], [0], "Same key → same shard → ordered."],
    ["A company needs real-time anomaly detection with SQL over streaming data. What service?", ["Amazon Managed Service for Apache Flink", "AWS Glue batch jobs", "Amazon Athena", "Amazon Redshift COPY"], [0], "Flink (formerly Kinesis Data Analytics) processes streams in real time."],
    ["Logs must be delivered to Amazon OpenSearch Service for near-real-time search with minimal operations. What should be used?", ["Amazon Data Firehose", "Kinesis Data Streams with EC2 consumers", "AWS DataSync", "S3 Batch Operations"], [0], "Firehose delivers directly to OpenSearch."],
    ["A team has unpredictable streaming volumes and does not want to manage shards. What should it choose?", ["Kinesis Data Streams on-demand mode", "Provisioned mode with 1 shard", "Amazon SQS FIFO", "MSK provisioned with fixed brokers"], [0], "On-demand mode scales capacity automatically."],
    ["What is the write capacity of a single Kinesis shard?", ["1 MB/s or 1,000 records per second", "2 MB/s or 2,000 records per second", "10 MB/s", "5 transactions per second"], [0], "1 MB/s in, 2 MB/s out per shard."],
    ["Firehose must transform JSON records (mask PII) before delivery to S3. What should be used?", ["A Lambda transformation function on the Firehose stream", "S3 Object Lambda", "Glue crawler", "SNS message filtering"], [0], "Firehose invokes Lambda for record transformation."]
  ]
});

L("analytics", {
  match: [
    ["Amazon Athena", "Serverless SQL on data in S3, pay per TB scanned"],
    ["AWS Glue", "Serverless ETL and Data Catalog with crawlers"],
    ["AWS Lake Formation", "Build data lakes with fine-grained column/row permissions"],
    ["Amazon QuickSight", "Serverless BI dashboards"],
    ["Amazon OpenSearch Service", "Search and log analytics"],
    ["Glue crawler", "Infers schemas and populates the Data Catalog"]
  ],
  order: { title: "Build a simple data lake", prompt: "Order the steps of a typical S3 data lake pipeline.", steps: [
    "Land raw data in S3", "Run a Glue crawler to catalog the schema", "Transform to Parquet with a Glue ETL job", "Query with Athena", "Visualize in QuickSight"
  ]},
  tf: [
    ["Athena charges by data scanned, so columnar formats and partitions reduce cost.", true, "Parquet/ORC + partitioning scan less."],
    ["Athena requires you to provision a cluster.", false, "It is serverless."],
    ["Lake Formation can enforce column-level security for Athena queries.", true, "Fine-grained access control."],
    ["QuickSight is a database.", false, "It's a BI/visualization service."],
    ["The Glue Data Catalog is shared by Athena, EMR and Redshift Spectrum.", true, "One central metadata store."],
    ["OpenSearch is the best fit for full-text search over logs.", true, "Search and log analytics."]
  ],
  quiz: [
    ["Analysts need to run ad hoc SQL queries on CSV logs in S3 with no infrastructure. What should they use?", ["Amazon Athena", "Amazon Redshift provisioned cluster", "Amazon EMR", "Amazon RDS"], [0], "Athena is serverless SQL over S3."],
    ["Athena costs are high because queries scan entire datasets. What reduces cost the most? (Choose two.)", ["Convert data to Parquet", "Partition data by date", "Use larger CSV files", "Enable S3 versioning", "Use S3 Standard-IA"], [0, 1], "Columnar formats and partitions reduce bytes scanned."],
    ["A company wants to discover schemas of new datasets in S3 automatically and make them queryable. What should be used?", ["AWS Glue crawlers with the Data Catalog", "Amazon Macie", "S3 Inventory", "Amazon Kendra"], [0], "Crawlers infer schemas into the Data Catalog."],
    ["Different teams must see only certain columns and rows of a shared S3 data lake. What is the simplest centralized control?", ["AWS Lake Formation permissions", "Separate buckets per team", "S3 bucket policies per object", "IAM user per column"], [0], "Lake Formation provides fine-grained permissions."],
    ["Executives need interactive dashboards on data in Athena and Redshift with per-user pricing and no servers. What should be used?", ["Amazon QuickSight", "Amazon OpenSearch Dashboards", "Amazon Managed Grafana", "AWS Glue Studio"], [0], "QuickSight is the serverless BI service."],
    ["An application needs full-text search with relevance ranking over product descriptions. Which service?", ["Amazon OpenSearch Service", "Amazon Athena", "Amazon DynamoDB", "Amazon Redshift"], [0], "OpenSearch is built for search."],
    ["A serverless ETL job must convert JSON in S3 to Parquet every night. What is the least-ops option?", ["AWS Glue ETL job on a schedule", "EC2 cron script", "EMR cluster running 24/7", "Lambda with 15-minute loops"], [0], "Glue is serverless Spark ETL."],
    ["A company needs to clean and normalize data visually without writing code. What service fits?", ["AWS Glue DataBrew", "AWS Glue crawler", "Amazon Athena", "Amazon EMR"], [0], "DataBrew is visual data prep."],
    ["Which service centrally stores table metadata used by Athena, EMR and Redshift Spectrum?", ["AWS Glue Data Catalog", "Amazon DynamoDB", "AWS Systems Manager Parameter Store", "Amazon S3 Inventory"], [0], "The Glue Data Catalog is the shared Hive-compatible metastore."],
    ["Glue jobs should only process new files since the last run. What feature enables this?", ["Glue job bookmarks", "S3 Event Notifications", "Athena workgroups", "Glue DataBrew recipes"], [0], "Bookmarks track processed data."]
  ]
});

L("ml", {
  match: [
    ["Amazon Rekognition", "Image and video analysis: faces, labels, moderation"],
    ["Amazon Comprehend", "NLP: sentiment, entities, key phrases, PII"],
    ["Amazon Textract", "Extract text, forms and tables from scanned documents"],
    ["Amazon Transcribe", "Speech to text"],
    ["Amazon Polly", "Text to speech"],
    ["Amazon SageMaker AI", "Build, train and deploy custom ML models"]
  ],
  sort: { title: "Which AI service?", buckets: ["Rekognition", "Comprehend", "Textract", "Translate"], items: [
    ["Detect inappropriate images uploaded by users", 0], ["Find sentiment in customer reviews", 1], ["Pull fields from scanned invoices", 2],
    ["Localize product pages into 10 languages", 3], ["Detect PII in support tickets", 1], ["Verify a face matches an ID photo", 0]
  ]},
  tf: [
    ["Amazon Lex builds conversational chatbots.", true, "Same tech as Alexa."],
    ["Amazon Kendra is an intelligent document search service.", true, "Natural-language enterprise search."],
    ["Amazon Polly converts speech to text.", false, "Polly is text to speech; Transcribe is speech to text."],
    ["Amazon Forecast is for time-series forecasting.", true, "Demand forecasting."],
    ["Using Rekognition requires training your own model.", false, "It's pre-trained (Custom Labels is optional)."],
    ["Amazon Personalize builds recommendation engines.", true, "Same tech as Amazon.com."]
  ],
  quiz: [
    ["A photo-sharing app must automatically detect and block explicit images with no ML expertise. Which service?", ["Amazon Rekognition content moderation", "Amazon SageMaker AI custom model", "Amazon Comprehend", "Amazon Textract"], [0], "Rekognition has built-in moderation."],
    ["A company wants to extract key-value pairs and tables from scanned loan forms. What should it use?", ["Amazon Textract", "Amazon Rekognition", "Amazon Comprehend", "Amazon Transcribe"], [0], "Textract extracts text, forms and tables."],
    ["A call center wants to transcribe recorded calls and then analyze customer sentiment. Which TWO services? (Choose two.)", ["Amazon Transcribe", "Amazon Comprehend", "Amazon Polly", "Amazon Lex", "Amazon Rekognition"], [0, 1], "Transcribe for speech-to-text, Comprehend for sentiment."],
    ["An e-commerce site wants real-time personalized product recommendations without ML expertise. What fits?", ["Amazon Personalize", "Amazon Forecast", "Amazon Kendra", "Amazon Translate"], [0], "Personalize builds recommendation models."],
    ["A company needs to build a chatbot for its website that understands natural language. What should it use?", ["Amazon Lex", "Amazon Polly", "Amazon Comprehend Medical", "Amazon Textract"], [0], "Lex provides conversational interfaces."],
    ["Employees need natural-language search across documents stored in S3, SharePoint and Confluence. What service?", ["Amazon Kendra", "Amazon OpenSearch with manual indexing", "Amazon Athena", "Amazon Comprehend"], [0], "Kendra is ML-powered enterprise search with connectors."],
    ["Data scientists need to build, train and deploy a custom fraud model with managed infrastructure. Which service?", ["Amazon SageMaker AI", "Amazon Rekognition", "Amazon Lex", "AWS Glue"], [0], "SageMaker AI is the managed ML platform."],
    ["A news site wants articles read aloud to users in lifelike voices. Which service?", ["Amazon Polly", "Amazon Transcribe", "Amazon Translate", "Amazon Lex"], [0], "Polly is text-to-speech."],
    ["A retailer wants to predict product demand for the next 90 days using historical sales. What should it use?", ["Amazon Forecast (or SageMaker Canvas forecasting)", "Amazon Personalize", "Amazon Comprehend", "Amazon Kendra"], [0], "Time-series demand forecasting."],
    ["A company must detect PII such as names and addresses in free-text customer emails. Which service?", ["Amazon Comprehend", "Amazon Macie", "Amazon Rekognition", "Amazon Polly"], [0], "Comprehend detects PII in text; Macie scans S3 objects for sensitive data."]
  ]
});
