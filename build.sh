echo 'Creating a distribution version of the project...'
webpack --config webpack.prod.js
rm -rf dist
mkdir dist
cp -R build dist
cp -R server dist
cp -R bower_components dist
cp package.json dist
cp index.html dist
echo 'Your project is ready to be deployed to the cloud.'
echo 'Run cf push to deploy.'