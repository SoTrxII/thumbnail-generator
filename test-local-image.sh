#! /bin/sh
npm run build:f
kubectl port-forward -n openfaas svc/gateway 8080:8080 &
# Start local docker registry
docker stop registry -y && docker rm registry -y && docker run -d -p 5000:5000 --name registry registry:2
cd build/thumbnail-generator
docker build -t localhost:5000/create-thumbnail .
docker push localhost:5000/create-thumbnail


faas-cli deploy --image "localhost:5000/create-thumbnail" --name "create-thumbnail" -e="MAH=meh"
