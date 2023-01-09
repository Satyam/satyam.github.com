#!/bin/sh
convert -crop 18x800+0+0\! sprite.png minus-last.png
convert -crop 18x800+0+800\! sprite.png minus-last-hover.png
convert -crop 18x800+0+1600\! sprite.png no-child-last.png
convert -crop 18x800+0+2400\! sprite.png plus-last.png
convert -crop 18x800+0+3200\! sprite.png plus-last-hover.png
convert -crop 18x800+0+4000\! sprite.png minus.png
convert -crop 18x800+0+4800\! sprite.png minus-hover.png
convert -crop 18x800+0+5600\! sprite.png no-child.png
convert -crop 18x800+0+6400\! sprite.png plus.png
convert -crop 18x800+0+7200\! sprite.png plus-hover.png
convert -crop 18x800+0+8000\! sprite.png line.png

convert -crop 18x22+0+8800\! sprite.png ok-default.png
convert -crop 18x22+0+8822\! sprite.png cancel-disabled.png
convert -crop 18x22+0+8844\! sprite.png ok.png
convert -crop 18x22+0+8866\! sprite.png cancel.png


convert line.png  no-child.png no-child-last.png minus.png minus-hover.png minus-last.png minus-last-hover.png plus.png plus-hover.png plus-last.png plus-last-hover.png ok-default.png cancel-disabled.png ok.png cancel.png check0.gif check1.gif check2.gif line.png +append tvsprite.png
