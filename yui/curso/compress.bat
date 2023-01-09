del *-min.js
del *-min.css
setlocal
set comp=C:\web\YUI-Compressor\yuicompressor-2.3.5.jar
set charset=iso-8859-15
for %%f in (*.js *.css) do java -jar %comp% -v --charset %charset% %%f -o %%~nf-min%%~xf 2>%%~nf.log
endlocal