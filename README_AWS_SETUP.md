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
	
# Onetime setup Auth0:

# Onetime setup Github Actions 
Github > Repo > Actions > Settings > Secrets
	Add prod secrets
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

SET UP BOOTSTRAP FOR EACH PROFILE:
cdk bootstrap aws://<dev account id>/us-east-1 --profile dev

cdk destroy ApiStack-prod --context env=prod --profile prod
cdk deploy ApiStack-prod --context env=prod --profile prod
cdk deploy RoleStack-prod --context env=prod --profile prod
cdk deploy FrontendStack-prod --context env=prod --profile prod
cdk deploy DatabaseStack-prod --context env=prod --profile prod
cdk deploy ParamsStack-prod --context env=prod --profile prod
cdk deploy ThrottleStack-prod --context env=prod --profile prod

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

Deploy all lambdas:
Github > Actions > Deploy Backend Lambdas > Run (select Deploy All checkbox)

Deploy single lambda from local:
Visual Studio > Deploy Lambda (button top right)

Deploy lambdas changed:
Github > Pull request > watch Actions 


-----------------------
# Prod deploy:
Redeploy prod:
	x destroy everything but first two steps
	x delete API gateway
	x delete dynamo tables
	x deploy DNS
	x deploy Dynamo + Throttle
	x update System Params with values for USPS
	
	x turn off authorizer caching (done in CDK)
	x in API gateway, allow Access-Control-Allow-Origin (updated CDK)
	x create an S3 bucket called christephanie-wedding-setup-prod (done in CDK), 
		add folder called Data/ (upload whole folder of guest .jsons and delete items you don't want)
	x Add prod secrets in github
		AWS_ROLE_ARN (role created in RoleStack for github deploy), CLOUDFROUNT_DISTRIBUTION_ID
	x Add new auth0 prod app
	Test new auth0 prod app 



