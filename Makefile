default: compile

compile:
	traceur --script src/*.js --out out/js13kgames-2015.js
	uglifyjs --compress --mangle -- out/js13kgames-2015.js > out/js13kgames-2015.min.js
	rm out/js13kgames-2015.js
	cp -f src/*.{html,css} out/

zip: compile
	rm -f js13kgames2015-aaronfischer.zip
	zip -9 -r js13kgames-2015-aaronfischer.zip out/*

stats: zip
	ls -al js13kgames-2015-aaronfischer.zip

watch:
	while true; do \
		make stats; \
		inotifywait -qre close_write src/.; \
	done

clean:
	rm -rf out/
	rm js13kgames-2015-aaronfischer.zip
