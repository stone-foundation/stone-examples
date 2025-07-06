profile=noowow
fileName=archive.zip
functionName=Operation-Adrenaline-API
s3Bucket=operation-adrenaline-artifactory
s3Key=roulette-api/$fileName

# npm run lint:fix

# npm run build

zip -r -j $fileName dist/*

aws s3 cp ./$fileName s3://$s3Bucket/$s3Key --profile $profile \

aws lambda update-function-code \
  --function-name $functionName \
  --s3-bucket $s3Bucket \
  --s3-key $s3Key \
  --profile $profile

rm -f ./$fileName
