#NAMES AND PATHS

name=manigen.iti.sidi
dist_dir=dist

rm -rf $curr_dist
#GET VERSION
version=`node -e "console.log(require('./package.json').version);"`

# CREATE TEMP FOLDER TO PROD SETUP
package_name=$name-$version.tar.gz

rm -rf $dist_dir/$name-$version
mkdir $dist_dir/$name-$version
cp -R  out $dist_dir/$name-$version/
mkdir $dist_dir/$name-$version/node_modules
cp -R node_modules/vscode $dist_dir/$name-$version/node_modules
cp package.json $dist_dir/$name-$version/
cp README.adoc $dist_dir/$name-$version/
cp manigen_installer.sh $dist_dir/
cd $dist_dir/$name-$version/

#INSTALL NODE MODULES
npm install --only=production
cd ..
#PACKAGE
tar -czf $package_name $name-$version
rm -rf $name-$version



