export AWS_ACTIVE_PROFILE=noowow
export AWS_S3_BUCKET=operation-adrenaline.com
export AWS_CLOUDFRONT_DISTRIBUTION_ID=EURE4R4CZRYTB

npm run build

cp ./dist/env/environments.production.js ./dist/env/environments.js

npm run aws-s3-deploy