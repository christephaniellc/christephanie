# ONE TIME THINGS (pre CDK)
- Created new AWS Account:
	AWS Organizations > New OU > New Account 
- Gave login access to stepy user
	IAM Identity Center > AWS Accounts > Select Account > Assign Users or Groups > (AdministratorAccess)
- Created CLI user (christephanie-dev-stepy)
	IAM > Users > Create User 
	IAM > User groups > Create group > (added CDK permissions to json policy) cdk-group
	Moved this user under this group 
- Gave CDK permissions to this user.
	copy policy from dev 
- Generate access key for local CLI use
	aws configure --profile your-profile-name
	Saves to C:\Users\<username>\.aws\credentials
x ?Run UserStack to set up all deploy permissions for this user
	cdk deploy --context env=dev UserStack
x Prod: in Route53 owner account: gave dev AWS account permissions to assume role for Route53 zone
	IAM > Roles > Create Role > AWS Account > (dev account ID) > added Route53 permissions as json policy		
		arn:aws:iam::<prod account id>:role/Route53_TrustChristephanieDev
# Set up local aws cli
## aws cli profile: C:\Users\Steph Stubler\.aws\config
	aws configure --profile dev
	[access key] for dev account
	[secret access key]
	us-east-1
	json 
	-----------
	CONFIG
	[profile dev]
	region = us-east-1
	output = json

	[profile prod]
	region = us-east-1
	output = json

	CREDENTIALS
	[dev]
	aws_access_key_id = <key id>
	aws_secret_access_key = <key>

	[prod]
	region = us-east-1
	aws_access_key_id = <key id>
	aws_secret_access_key = <key>
	---------------
# Check which profile is being used:
aws configure list

# Install/update CDK
npm install -g aws-cdk
	
# Bootstrap for the development account
cdk bootstrap aws://<dev account id>/us-east-1 --profile dev

# Bootstrap for the production account
cdk bootstrap aws://<prod account id>/us-east-1 --profile prod

x Added role to aws cli profile: C:\Users\Steph Stubler\.aws\config
	[profile dev]
	region = us-east-1
	output = json
	role_arn = arn:aws:iam::<prod account id>:role/Route53_TrustChristephanieDev
	source_profile = dev
# Switched cli role:
 $env:AWS_PROFILE="dev"
 $env:AWS_PROFILE="prod"
 aws sts get-caller-identity (verify credentials appear)
 
# AWS: buy / register domain in Route53, set up Hosted Zone

# ONE TIME CDK DEPLOYMENT (initial deploy)
cdk deploy HostedzoneStack-create-dev --context env=dev --profile dev
	add "existingHostedZoneId": "Z...T27L" to dev.json
	add named entries to prod hosted zone 
	add named entries to prod.json
		"delegateHostedNameServers": ["name1","name2"]
cdk deploy CertificateStack-create-dev --context env=dev --profile dev
	add "existingCertificateArn" to dev.json 
cdk deploy --all --context env=dev --profile dev

# UPDATE parameter values manually in AWS > Systems Manager > Parameters > /config/usps/api-credentials

## Test but do not deploy:
	cdk synth --context env=dev
## Teardown:
	cdk destroy --all --context env=dev
	
# ONCE CREATED DEV ENV, must update DNS entries in prod Route53:
https://www.reddit.com/r/aws/comments/18lclmd/how_do_you_handle_domains_certificates_and_dns/
Dev > Route 53 > Hosted Zones > dev.wedding.christephanie.com
	Copy dev.wedding.christephanie.com NS records:
		<record 1>.
		<record 2>.
		<record 3>.
		<record 4>.
Prod > Route 53 > Hosted Zones > christephanie.com > Create record 
	Record name: dev.wedding [.christephanie.com] 
	Record type: NS 
	Value: (addresses above)
	TTL: 300 (short for change quick updates)
--------------------------------------	
DESTROY STEPS:
cdk destroy --all --context env=dev --profile dev

DESTROY/DEPLOY STEPS:
cdk destroy AuthStack-dev --context env=dev --profile dev

(Recreate API gateway and lambdas)
cdk destroy ApiStack-dev --context env=dev --profile dev
cdk deploy DnsStack-dev --context env=dev --profile dev

cdk deploy ParamsStack-dev --context env=dev --profile dev

cdk destroy RoleStack-dev --context env=dev --profile dev
cdk deploy RoleStack-dev --context env=dev --profile dev

If you want to keep backup:
dynamoTable.addBackup({
  backupName: `${applicationName}-backup-${environment}`,
});

cdk bootstrap aws://<dev account id>/us-east-1 --profile dev

----------------------	
# Frontend

Update 
	auth_config.ts

Update NPM packages:
- VSCode > frontend/src > 
	yarn install
	yarn run dev	
-----------------------
# Backend

Deploy single Lambda:
Visual Studio > Open file for Wedding.Lambdas.[project name] > Deploy Lambda button
	Update "dev" param
-----------------------
	./infra/scripts/deploy.sh dev	# Initial infra deploy
REPEATING DEPLOY (publish lambdas and frontend)
	./infra/scripts/build.sh dev	# Deploy all lambdas 
	TODO: frontend 


Step 4: Automating with CI/CD
You can integrate these scripts into a CI/CD pipeline using GitHub Actions, AWS CodePipeline, or Jenkins:
name: Deploy to AWS

Example GitHub Actions workflow:
on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v3

      - name: Install AWS CDK
        run: npm install -g aws-cdk

      - name: Configure AWS Credentials
        uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Build Lambdas
        run: ./infra/scripts/build.sh dev

      - name: Deploy Infrastructure
        run: ./deploy.sh dev

