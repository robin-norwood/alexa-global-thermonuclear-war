# Alexa plays Global Thermonuclear War

A simple Alexa skill to play "Global Thermonuclear War".

## Install

```sh
npm install
```

## Test

```sh
npm run test
```

## Build

```sh
npm run build
```

## Deploy

1. Have a function called 'alexaGlobalThermonuclearWar' in AWS lambda.
2. Install the [AWS CLI](http://docs.aws.amazon.com/cli/latest/userguide/installing.html) or `brew install awscli`.
3. Configure the AWS CLI:
```sh
aws configure
AWS Access Key ID [None]: <>
AWS Secret Access Key [None]: <>
Default region name [None]: us-east-1
Default output format [None]: json
```
4. Deploy:
```sh
npm run deploy
```

## TODO

1. Finish basic gameplay
2. Fix terrible README.md
