holecutter.fma: clean *.html js/*.js js/lib/*.js css/*.css images/*.png images/*.jpg icon.png package.json
	zip holecutter.fma *.html js/*.js js/lib/*.js css/*.css images/*.png images/*.jpg icon.png  package.json

.PHONY: clean

clean:
	rm -rf holecutter.fma
