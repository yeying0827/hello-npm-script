for file in client/styles/*.less
do
	lessc $file > client/styles/$(basename $file .less).css
	lessc $file | cssmin > dist/styles/$(basename $file .less).css
done