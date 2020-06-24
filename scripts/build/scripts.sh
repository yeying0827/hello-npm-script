for file in client/scripts/*.js
do 
	uglifyjs $file --mangle > dist/scripts/$(basename $file)
done