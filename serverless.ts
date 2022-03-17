import type { AWS } from '@serverless/typescript';



const SERVICE_NAME = "brew-book-api";
const DYNAMO_TABLE = `${SERVICE_NAME}-dev`;
const S3_BUCKET = "brew-book-sls";


const serverlessConfiguration: AWS = {
  service: SERVICE_NAME,
  frameworkVersion: '3',
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
  },
  plugins: ['serverless-webpack'],
  provider: {
    name: 'aws',
    stage: "dev",
    region: "us-east-1",
    runtime: 'nodejs14.x',
    apiGateway: {
      minimumCompressionSize: 1024,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      DYNAMO_TABLE,
      S3_BUCKET,
    },
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: [
          "dynamodb:Query",
          "dynamodb:Scan",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:DescribeTable",
        ],
        Resource: "*",
      },
      {
        Effect: "Allow",
        Action: ["s3:PutObject", "s3:GetObject"],
        Resource: `arn:aws:s3:::${S3_BUCKET}/*`,
      },
    ]
  },
  functions: { 
    save: {
      handler: "handler.saveBrew",
      events: [
        {
          http: {
            method: "post",
            path: "save",
            cors: true,
          },
        },
      ],
    },
    brews: {
      handler: "handler.getBrews",
      events: [
        {
          http: {
            method: "get",
            path: "brews",
            cors: true,
          },
        },
      ],
    },
  },
  // package: { individually: true },
  resources: {
    Resources: {
      BrewsDynamoTable: {
        Type: 'AWS::DynamoDB::Table',
        DeletionPolicy: "Retain",
        Properties: {
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 1,
            WriteCapacityUnits: 1,
          },
          TableName: DYNAMO_TABLE,
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
