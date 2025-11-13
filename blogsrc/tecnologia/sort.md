---
title: "Poniendo los datos en orden"
date: "2025-11-06"
categories: ["Historia/Informática"]
language: "es-ES"
---

Una de las operaciones más habituales en el procesamiento de datos es el ordenamiento de listas de datos. 
---
Puede que no pensemos mucho en ello pero, por ejemplo, cuando llenamos un formulario de registro en que ingresamos nuestros datos, o una dirección de envío, alguno de los elementos de la pantalla nos ofrecerá una lista de países o provincias que seguramente estará ordenada alfabéticamente ... aunque a veces no sale bien.  Es habitual encontrar sitios donde España no está en la E sino entre Sudán del Sur y Sri Lanka porque el programador ha ordenado primero la lista de países en inglés: South Sudan, Spain, Sri Lanka, y luego los ha traducido en lugar de ordenar la versión traducida.

Justamente es en España donde al computador se le dice [*ordenador*](https://es.wikipedia.org/wiki/Computadora#Ordenador) del francés *ordinateur* vocablo que los comerciales de IBM en Francia inventaron para resaltar que la nueva máquina no se limitaba a cálculos numéricos sino que *ponía orden* en los datos de un comercio o industria.

En la jerga informática se le dice también *sort* pues es el nombre de la función de ordenamiento en la mayoría de las bibliotecas de funciones de cualquier lenguaje de programación. Por ser breve y singular, usaré este término, y hasta lo usaré como verbo: *sortear*.

<figure>
 <a title="waelder, CC BY-SA 3.0 &lt;http://creativecommons.org/licenses/by-sa/3.0/&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:Punch_card_sorter.JPG">
    <img alt="Una clásica clasificadora electromecánica" src="assets/img/1024px-Punch_card_sorter.jpeg">
  </a>
  <figcaption>Clásica clasificadora electromecánica de tarjetas perforadas usada para *sortear* las tarjetas.</figcaption>
</figure>

Sortear es tan importante que ya en la época de las tarjetas perforadas había máquinas cuyo principal uso era *sortear* tarjetas, como la clasificadora en la imagen superior.  Como su nombre lo indica, esta máquina permite clasificar tarjetas, que se ubican en la bandeja de entrada al lado derecho en esta imagen y, según la columna seleccionada, clasificaría las tarjetas en las 13 casillas de salida.

<figure>
  <a title="ArnoldReinhold, CC0, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:IBM_026_card_code.png">
    <img alt="Tarjeta Hollerith" src="assets/img/IBM_026_card_code.png">
  </a>
  <figcaption>Tarjeta perforada Hollerith</figcaption>
</figure>

Las tarjetas de IBM tenían hasta 80 columnas y 12 filas. No eran las únicas en el mercado, varios fabricantes tenían sus modelos pero, históricamente, esta tarjeta dio origen a la empresa misma cuando Herman Hollerith presentó la abuelita de todas las tarjetas en una licitación para hacer el censo de los EE.UU. y de allí surgió la Herman Hollerith Tabulating Machines, que luego se transformó en IBM.  Aunque el formato cambio desde aquellas originales, la tarjeta se la conoce también como tarjeta Hollerith.

Como se puede ver en la imagen de arriba, 10 de esas filas estaban destinadas a números.  Las dos filas superiores cambiaban la interpretación de las 10 filas inferiores, como si fueran una suerte de tecla mayúscula o `Alt` que le cambia el significado a las otras teclas. A estas dos filas se las llamaba '12' y '11' contando de arriba. Las escribo entre comillas porque, en realidad, podrían haberlas llamado cualquier cosa, 'A' y 'B' o 'Ctrl' y 'Alt' o Pepe y Juan.  Para representar los números no se usaba ninguna perforación en esas dos filas. Si la tarjeta tenía una perforación en la fila '12' las mismas perforaciones que representan del 0 al 9 se interpretaba como las letras A a I y si la perforación estaba en la fila '11' representaban las letras J a R.  Por una cuestión de eficacia, dada la frecuencia con que se usaban, los números se representan con 1 sola perforación por columna, las letras con 2 y los símbolos ortográficos con 3 perforaciones en la misma columna.  Por esa razón, usar solo dos perforaciones, las letras de la S a la Z usan el 0 como *mayúscula*.

En el borde superior de la tarjeta el perforador imprime el texto de la tarjeta, tal como se ve en la imagen.  Cuando las tarjetas se guardan en las largas cajas de archivo, esa línea impresa es fácil de leer cuando se busca una tarjeta determinada.  La esquina superior izquierda tiene un corte en ángulo que permite asegurarse que la tarjeta está orientada correctamente, simplísimo pero efectivo.

En realidad las perforaciones en una tarjeta Hollerith se podían usar para representar cualquier cosa.  Al ser una cartulina normal, se le podría estampar un formulario con casillas que tildar o, en este caso, perforar manualmente.  En un censo, un par de casillas podían usarse para sexo y marcarlas M y F y usar el resto de la columna para otros datos. Sin embargo, mezclar diversos tipos de información en una misma columna no era práctico para su procesamiento automatizado, aunque sí se usó para el censo en que surgió todo pues el procesamiento era puramente manual. En Argentina, los memoriosos reconocerán la tarjeta que entonces llamábamos la "Tarjeta del PRODE" (Pronósticos Deportivos) por una suerte de lotería deportiva donde se podía marcar L, E o V por Local, Empate o Visitante en varios partidos de fútbol del fin de semana.  El cliente se quedaba con la copia en papel de su apuesta y la tarjeta, perforada por el vendedor, se enviaba para procesar.  

Ya vemos por qué la clasificadora disponía de 13 casillas de salida.  La primera, contigua a la bandeja de entrada, era para las que no tenían ninguna perforación en la columna en cuestión y luego, una casilla para cada una de las filas en el orden en que aparecen en la tarjeta, primero la '12', luego la '11' seguidas de las del 0 al 9.

La mayoría de las tarjetas, sin embargo, no se perforaban manualmente sino en máquinas como esta:

<figure>
  <a title="waelder, CC BY-SA 3.0 &lt;http://creativecommons.org/licenses/by-sa/3.0/&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:IBM_card_punch_029.JPG">
    <img alt="Perforadora de tarjetas IBM 029" src="assets/img/800px-IBM_card_punch_029.jpeg">
  </a>
  <figcaption>Perforadora de tarjetas</figcaption>
</figure>

Docenas de operadores ingresaban en máquinas como esta la copia que los comerciantes enviaban a los bancos por las compras hechas con tarjeta de crédito, cuando todo se hacía en papel.  O los horarios de entrada y salida de los empleados cuando estas se marcaban insertando la tarjeta en los relojes de control horario en los accesos a las fábricas u oficinas.  Posteriormente esta información era grabada, según el fabricante, en diskettes de 8", en cassettes como los de audio, pero con una cinta magnética especial para datos ([ver Olivetti DE-500](2024/11/07/olivetti-de-5xx-sycor-de-3xx.html)) u otro tipo de cartucho de cinta magnética.  A diferencia de las tarjetas, que eran de un solo uso, los distintos formatos de cinta magnética permitían la reutilización.

Yo mismo usé una máquina similar a la de la imagen para perforar las tarjetas de mis primeros programas en Fortran IV allá por 1975 cuando estudiaba ingeniería.  Mi universidad no podía, en aquel entonces, afrontar el costo de una computadora, pero sí el de una perforadora donde perforar nuestros programas.  Las tarjetas con nuestros "trabajos prácticos" se enviaban a un centro de cómputo donde se alquilaba tiempo de máquina para procesar, y nos devolvían los impresos con los resultados del programa o el listado de errores detectados por el compilador.

Hay un vínculo curioso entre el Fortran IV y las tarjetas perforadas.  La norma de esa versión del lenguaje establecía el uso de ciertas columnas para ciertas funciones. Establecía que las instrucciones debían ocupar desde la columna 7 a la 72.   Si una instrucción ocupaba más que los 66 caracteres previstos se podía continuar en la tarjeta siguiente, con alguna perforación en la columna 6 y luego la instrucción, a partir de la 7, como era normal.  Las primeras 5 columnas se reservaban para los números que servirían como destino de los saltos dentro del programa, los *rótulos* o *labels*. Así, al igual que en el BASIC de las primeras PC hogareñas, el Fortran disponía de la instrucción `GO TO`(en BASIC era `GOTO` todo junto) que debía ser seguida del número de línea en que debía continuar la ejecución.  A diferencia del BASIC, estos números de líneas no eran obligatorios si la línea en cuestión no era el destino de un salto.  Tampoco tenían por qué estar en orden, dado que eran simples rótulos y no indicaban el orden de ejecución. 

Cabe preguntar, ¿para qué se usaban las columnas de la 73 a la 80?  Para numerar las tarjetas, por si estas se caían y se desordenaban.  Si al manipular las pilas de tarjetas había algún accidente y se desordenaban, se pasaban por la clasificadora y se volvían a poner en orden. Como ayuda visual también era habitual trazar una línea en diagonal sobre el canto de la pila de tarjetas pues, si la línea estaba quebrada es que las tarjetas estaban desordenadas. Por eso la especificación del lenguaje decía que esas casillas eran ignoradas, para dar pie al programador de numerarlas a su antojo, o no hacerlo.  Lo habitual era numerarlas de a 10 en 10, como en el BASIC nativo de las primeras PC, para poder intercalar instrucciones si era necesario. 

Como se puede apreciar, la definición del formato de una línea de instrucción especificaba las columnas en que debían escribirse.  El lenguaje estaba definido por el medio físico en que se registraba, la tarjeta de 80 columnas.  Esas mismas 80 columnas que eran el ancho estándar de una terminal de computadora y era también el ancho normal para las primeras impresoras hogareñas, como la clásica Epson FX-80.

Pero, vamos a lo del título.  ¿Cómo se *sorteaban* estas tarjetas?

Imaginemos que queremos ordenar las tarjetas por los números en un campo de dos posiciones en las columnas 20 y 21. La clasificadora sólo es capaz de seleccionar una columna por vez. Preparamos la clasificadora para seleccionar por la columna 21, o sea, el dígito de las unidades.  Ponemos las tarjetas en la casilla de entrada y la arrancamos.  En esa primera pasada quedará así:

|    9 |    8 |    7 |    6 |    5 |    4 |    3 |    2 |    1 |    0 |   11 |   12 |    - |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|      |      |      |      |      |   04 |      |      |      |   10 |      |      |      |
|   49 |      |   57 |   16 |      |   54 |      |      |   51 |   50 |      |      |      |
|   19 |   38 |   37 |   76 |      |   44 |   33 |      |   61 |   30 |      |      |      |
|   99 |   88 |   57 |   86 |   25 |   24 |   63 |      |   31 |   60 |      |      |      |
|   49 |   18 |   37 |   36 |   95 |   74 |   83 |   02 |   11 |   20 |      |      |      |

En cada casilla están las tarjetas con el número que termina en el de la casilla. No hay tarjetas en las casillas '11' y '12' porque al ser números solo usan una perforación y tampoco hay tarjetas en la casilla del descarte porque todas tienen perforaciones en esa columna.  Las decenas están en cualquier orden, pero eso lo arreglamos en una segunda pasada.  Primero movemos el selector de columna a la columna 20, la de las decenas.  

Las tarjetas se ponen cara para abajo en la casilla de entrada y quedan boca abajo en las casillas de salida.  Entonces recogemos las tarjetas de derecha a izquierda, primero las del 0, luego las del 1 y así siguiendo.  Eso quiere decir que al ponerlas nuevamente en la casilla de entrada, las terminadas en 0 estarán primero, luego las terminadas en 1 y así hasta el 9.  Se arranca de nuevo la clasificadora y queda así:

|    9 |    8 |    7 |    6 |    5 |    4 |    3 |    2 |    1 |    0 |   11 |   12 |    - |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
|      |      |      |      |      |      |   38 |      |      |      |      |      |      |
|      |      |      |      |      |      |   37 |      |      |      |      |      |      |
|      |      |      |      |   57 |      |   37 |      |   19 |      |      |      |      |
|      |      |      |      |   57 |      |   36 |      |   18 |      |      |      |      |
|      |   88 |      |   63 |   54 |   49 |   33 |   25 |   16 |      |      |      |      |
|   99 |   86 |   76 |   61 |   51 |   49 |   31 |   24 |   11 |   04 |      |      |      |
|   95 |   83 |   74 |   60 |   50 |   44 |   30 |   20 |   10 |   02 |      |      |      |

Volviendo a recoger las tarjetas de derecha a izquierda vemos que quedan: 02, 04, 10, 11, 16, 18 ..  y así hasta la 99.  Hay duplicados, como las 37, 49 ó 57 pero eso si eso es válido o no, no nos concierne, las que son iguales están contiguas y en el orden correcto respecto del resto.

¿Cómo se hace para ordenar alfabéticamente?  Al usar dos perforaciones eso requiere dos pasadas. La clasificadora ordena siempre por una única perforación en una única columna en cada pasada.  Si se necesita ordenar por más de una perforación dentro de la misma columna o más de una columna se necesitan más pasadas. Por defecto, la clasificadora decide en base a la primera perforación que encuentra.  Así pues, en principio, no discrimina entre un 3, una C, una L o una T pues todas ellas llevan una perforación en la fila 3.  

Además de seleccionar la columna, la clasificadora tiene la opción de saltear filas.  Las tarjetas las lee de abajo hacia arriba, desde la fila 9 hacia el 0, luego la '11' y la '12'.  Entonces, en una segunda pasada, se le pide saltearse las filas de la 9 a la 1, de tal manera que sólo le queden las filas 0, '11' y '12'.  Al final de la segunda pasada quedarán las tarjetas con 3 en la casilla de descarte, pues el 3 lo salteamos y la columna no tiene más perforaciones en esa columna, las C en la '12', las L en la '11' y las T en la 0.

Si ahora recogemos las tarjetas de derecha a izquierda, como siempre debemos hacer cuando *sorteamos* en orden ascendente, las que contengan números serán las primeras, luego las de la A a la I, luego la J a la R y finalmente la S a la Z.

---

Es admirable cómo, una máquina tan simple como la clasificadora, con un único sensor que sólo es capaz de leer una sola columna por vez y salta a la primera perforación que detecta, a menos que se le haga saltear alguna fila, puede usarse de manera tan ingeniosa.  También es de destacar la eficacia de la codificación usando, como se dijo ya tantas veces, una única perforación para los números, que es lo que más se usa ya sea para códigos de artículo, código de cliente, legajo del empleado, etc.; dos para letras, que es menos usado, y 3 para símbolos, que raramente se usan para ordenar o clasificar nada.

También sorprende cómo la tradicional tarjeta de 80 columnas influyó en lenguajes como Fortran y también COBOL, y posteriores dispositivos como terminales e impresoras.