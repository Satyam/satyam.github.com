---
title: "Procesador de 1 bit de ancho de palabra"
date: "2022-06-02"
categories: ["Tecnología"]
language: "es-ES"
---
¿Por qué un bit de ancho? Pues los elementos constituyentes de un ordenador son los mismos cualquiera que sea el ancho de palabra. El conjunto o set de instrucciones es, obviamente, más breve dado que no se pueden hacer tantas operaciones: con un solo bit no hay diferencia entre operaciones ‘bit a bit’ (*bitwise*) y ‘lógicas’ (*logical*), como habitualmente se las conoce, y sumar es lo mismo que hacer un or exclusivo (`XOR`) si ignoramos el resto y multiplicar es lo mismo que hacer un `AND`, así que las instrucciones son menos, pero sigue habiendo, usando las abreviaturas habituales en la industria, `LOAD`, `SAVE`, `AND`, `OR`, `NOT`, `XOR` y saltos condicionales o no. También tiene un puntero al paso de programa y podría tener una pila o *stack* para llamar subrutinas y volver.

----

Si nos ponemos en teóricos, la máquina de Turing era de un bit de ancho de palabra y su importancia estriba en que con ella Alan Turing demuestra que toda máquina de Turing puede emular a otra máquina de Turing, con más o menos esfuerzo. Por lo tanto un chip de un bit de ancho de palabra no es tan extraño a fines teóricos/didácticos. La máquina de Turing tenía una cinta (su memoria) infinita y un procesador de un bit también requeriría muchísimos bits de memoria para resolver cualquier operación de una de mayor ancho de palabra, pero la teoría dice que es posible.

Por ejemplo, sumar dos posiciones de memoria de 8 bits puede hacerse en un solo ciclo en un procesador de 8 bits o en 8 ciclos en uno de un bit, de a un bit a la vez. En realidad se necesitan 16 ciclos para llevar el resto y muchos más si se va a controlar si el resultado es cero, o si una resta es negativa o si ha habido overflow, cosa que cualquier procesador de 8 bits hace en paralelo con la suma en sí. De todas maneras estas comprobaciones que se hacen automáticamente en un chip multi-bit no se usan siempre, la mayor parte de las veces se ignoran. Habitualmente se usan junto con instrucciones de salto condicional: `JZ` (*Jump if Zero*), `JC` (*Jump if Carry*), `JN` (*Jump if Negative*), `JV` (*Jump if oVerflow*) y sus opuestas: `JNZ` (*Jump of Not Zero*) y demás negaciones de las primeras. En el caso de un procesador de 1 bit emulando uno de mayor ancho de palabra, valdría la pena postergar el cálculo de los bits de estado hasta que la presencia de la instrucción de salto condicional lo requiriera. En otras palabras, que los procesadores multi-bit calculen estos bits automáticamente es una optimización que pueden hacer a costo nulo, pero si ello demandara ciclos de ejecución, bien puede omitirse y hacerlas bajo demanda.

Fuera de la teoría, tiempo ha existía un micro-controlador de un bit de ancho de palabra, un simple chip de 20 o 22 patitas. Si ese chip existía y se comercializaba, será porque servía para algo. A fin de cuentas controlar un ascensor no necesita más, de hecho, en aquella época se hacía con simples relés electromecánicos, que son de un sólo bit con lógica cableada (*hard-wired*).

## ALU

El caso es que la ALU (por las siglas en inglés de Unidad Aritmética y Lógica) o, en este caso, LU dado que no haría aritmética, se podría componer simplemente de 4 compuertas, `AND`, `OR`, `XOR` y `NOT`. Todas ellas procesarían en paralelo el mismo par de valores (excepto la `NOT` que procesa un sólo valor) y se generarían los 4 posibles resultados. Una compuerta a la salida de cada una de ellas se activaría para dejar pasar el resultado que se busca. Esto, básicamente, formaría la (A)LU que, normalmente, se representa como una Y griega con dos entradas y una única salida,como un embudo, con una flecha lateral que indica las líneas de control que seleccionan la operación. Las cuatro salidas se alimentan a un multiplexor que es un circuito que selecciona uno de 4 valores de entrada en función de dos líneas de control, por ejemplo, el [74x153](https://www.ti.com/lit/ds/symlink/sn74ls153.pdf).

<figure>
<img src="assets/img/alu.webp" title="ALU" />
<figcaption>
Los bits A y B se combinan en la primera fila de compuertas obteniendo `A AND B`, `A OR B`, `A XOR B` y `NOT B`. Luego, según que línea S esté activa, el resultado de una de estas operaciones llega a R
</figcaption>
</figure>

Los bits A y B se combinan en la primera fila de compuertas obteniendo `A AND B`, `A OR B`, `A XOR B` y `NOT B`. Luego, según cuál línea S esté activa, el resultado de una de estas operaciones llega a R. Las dos filas inferiores pueden reemplazarse por un chip como el [74x153](https://www.ti.com/lit/ds/symlink/sn74ls153.pdf)

Según la arquitectura del chip hay dos opciones extremas para las dos entradas de la Y y la salida. La más flexible es leer los dos valores a procesar de sendas posiciones de memoria y volcar el resultado en otra posición de memoria. Eso implica poner multiplexores/demultiplexores en cada uno de los brazos de la Y para seleccionar independientemente las entradas y la salida. Si se tienen 256 posiciones de memoria, se necesitan 8 bits para seleccionar cada posición y en este esquema, con selección independiente de 3 posiciones de memoria, implicaría usar 24 pines nada más que para seleccionar el origen de los operandos y el destino del resultado. Acabaríamos con más pines que silicio.

Lo más práctico suele ser predeterminar parte de estas direcciones. De allí surge lo que se conoce como el ‘acumulador’, que es una celda de memoria interna dentro de la CPU que es el origen predeterminado de uno de los dos operandos y es el destino predeterminado del resultado. Este es el otro extremo del espectro.

<figure>
<img src="assets/img/acumulador.webp" title="Acumulador" />
<figcaption>
A la izquierda una ALU que recibe datos de cualquier posible posición de memoria A y B y envía al resultado R a cualquier posible posición de memoria. A la derecha, una ALU con un acumulador ACC que es siempre el destino del resultado y el origen de uno de sus operandos mientras el otro puede venir de cualquier posición de memoria M. La primera requiere muchas más líneas de datos conectando la ALU con memoria que la segunda.
</figcaption>
</figure>

¿Dónde está la ventaja de usar un acumulador si nos obliga, primero, a que cargar uno de los operandos en el acumulador, hacer la operación con el segundo operando y, si el resultado ha de ir a memoria, guardar el resultado en el destino final? El caso es que lo más frecuente es que se encadenen varias operaciones sobre los mismos valores por lo que, en realidad, las más de las veces se sigue operando con el acumulador. Dada la poca variedad de operaciones que se pueden hacer con un bit, esto no es tan probable, pero habiendo más operaciones disponibles, las probabilidades de reutilizar el acumulador en una misma secuencia aumentan.

## Set de instrucciones

Entonces, tenemos 8 operaciones posibles, que se pueden codificar muy sencillamente en 3 bits que llamaremos por sus abreviaturas habituales en algunos lenguajes ensambladores (*assembler*): `AND`, `OR`, `XOR`, `NOT`, `LOAD`, `SAVE`, `JMP` (*JuMP*, incondicional), `JT` (*Jump if True*).

Cada una de estas instrucciones va seguida de una dirección de memoria, ya sea para el operando que no es el acumulador, que está implícito, ya sea para indicar donde se encuentra el valor a cargar o donde guardar el resultado, o para indicar la dirección a donde se ha de saltar (excepto el `NOT` que no tiene segundo operando).

Las posiciones de memoria, en nuestro procesador de un bit, pueden no estar realmente en un chip de memoria sino ser dispositivos binarios a manipular tales como pulsadores de llamada de un ascensor, sensores de ubicación de la cabina en cada piso, control del motor y el freno y accionamiento de puertas y sí, también algo de memoria para memorizar las llamadas de los varios pisos y también para recordar en qué dirección estaba yendo.

## Registros internos

Aquí podemos seguir un paso más en el diseño de nuestra CPU y optar por disponer de registros internos, esto es, posiciones de trabajo internas dentro del mismo chip del procesador. Ya hemos hablado del acumulador como una posición de memoria dentro del procesador. Podemos tener más de estas posiciones de trabajo. ¿Cuál es la ventaja? Por un lado, estando dentro del chip son más rápidas de acceder. Toda vez que una señal sale del chip hay un retardo. La velocidad de la luz es de unos 30cm por nanosegundo y, a la velocidad del procesador, cualquier cosa que esté fuera del chip está lejos (hay razones eléctricas también, pero no vienen al caso).

En segundo lugar, los registros también nos ofrecen más casillas de trabajo en que guardar resultados intermedios y encadenar secuencias de operaciones. Además, al haber menos registros que memoria, se puede referir a cualquier registro con muchos menos bits que una posición de memoria. Por ejemplo, podemos tener 16 registros de trabajo y usar 4 bits de dirección de registro. Habiendo registros, podemos establecer que todas las operaciones se hacen entre un registro y el acumulador con el resultado en otro registro, siendo el acumulador el registro 0.

Nuestro set de instrucciones puede convertirse en algo como se muestra en la siguiente tabla donde cada número en las primeras tres columnas indican un bit seguido de 8 bits (representados por letras) para el/los operandos, seguidos de su mnemónico y la explicación:

<figure>
<img src="assets/img/setInstrucciones.webp" title="Set de Instrucciones" />
<figcaption>
Las primeras columnas, bajo el encabezado de Código binario representan bits individuales. Los fondos de colores sirven para destacar la regularidad en la interpretación de los bits de cada grupo.
</figcaption>
</figure>

Como se puede ver, todas las instrucciones son de una única ‘palabra’ de 11 bits de ancho (ya sé que es un ancho de palabra extraño, pero también lo es un procesador de un bit 😉 ). Es muy homogéneo pues ya los primeros 3 bits, en amarillo, indican qué hacer.

Tenemos una primera subdivisión, si el primer bit está en cero, como en las 4 primeras filas, es una operación que implica el acceso a memoria externa y los últimos 8 bits (`mmmmmmmm`) indican la dirección. Si el primer bit es 1, es una operación entre registros siendo `ssss` y `dddd` los registros de origen y destino de la operación.

Una segunda subdivisión nos da cuatro grupos de 2 instrucciones cada uno, a saber:

* `LOAD` y `SAVE` nos permite acceder a datos a memoria, con el tercer bit indicando la dirección (carga o graba).
* `JMP` y `JT` son saltos en la ejecución del programa, con el tercer bit indicando si es condicional al estado del acumulador o no.
* `AND` y `OR` son las operaciones lógicas básicas entre un registro y el acumulador con el resultado en otro (o el mismo) registro.
* `MOVE` y `NOT`, copian un registro en otro donde el tercer bit nos dice si ha de invertirse en el proceso.

La regularidad en la interpretación de cada bit dentro del código de la instrucción es importante porque facilita su decodificación y la activación de los varios circuitos dentro de la CPU. Por ejemplo, ya comentamos que todas las operaciones fuera del chip necesitan más tiempo en ejecutarse, por lo que ya el primer bit del código de la instrucción nos dice si estirar el ciclo de ejecución (usualmente el procesador deja pasar el siguiente tic del reloj) para darle tiempo al dato externo a llegar o ejecutarse de inmediato al ser una operación interna, y también permite saber cómo interpretar los últimos 8 bits, si como una dirección de memoria absoluta de 8 bits o dos referencias a registros internos de trabajo de 4 bits cada una.

Es un set de instrucciones muy RISC (*Reduced Instruction Set Computer*). Instrucciones simples, todas de una sola palabra, codificando toda la información relevante de la forma más regular posible. Esto es a diferencia de una CPU CISC (*Complex Instruction Set Computer*) donde se disponen de muchas más instrucciones, algunas de ellas requiriendo múltiples palabras para completar toda la información que se necesita, obligando a un proceso de decodificación mucho más complejo. Por ejemplo los chips tipo ARM o RISC-V son RISC, la familia ix86 es CISC donde una instrucción puede llegar a 15 bytes de largo.

Aparentemente, en este set de instrucciones faltan cosas, por ejemplo no hay `JF` (*Jump if False*) pero este se puede codificar con la secuencia de un `NOT` seguido de un `JT`.

Hemos perdido la operación `XOR` que aparecía en el diagrama lógico de la ALU de más arriba. Ocurre que al disponer de registros, estamos obligados a proveer la capacidad de mover los datos de un registro a otro y al tener que agregar la instrucción `MOVE`, nos hemos visto obligados a hacer un hueco en las 8 posibles combinaciones de 3 bits de que disponemos, y por eso hemos dejado caer el `XOR` que, de todas formas, al igual que el JF, se puede reemplazar por una secuencia de operaciones lógicas.

Nos falta algún mecanismo para poner un registro en cero o en uno. Para ello, no es inusual destinar un registro fantasma que siempre esté en 0 (y potencialmente otro para que siempre esté en uno). Digamos que el registro 15 (`1111`) está siempre en 0 y el 14 (1110) en 1. Poner en cero el registro `xxxx` se hace con `MOVE 15, xxxx`. Siempre se trata de mantener cierta regularidad en la circuitería, por ejemplo, los dos registros falsos comienzan con `111`.

Y, como en toda decisión de ingeniería, hay que buscar un compromiso. ¿Qué opción podrá dar mejor provecho? ¿Vale más, destinar dos registros fantasmas a guardar 0 y 1 o tener un solo registro falso con 0 y obtener el 1 negando un 0 en la instrucción siguiente? Lo segundo es mejor pues, disponer del cero es indispensable, mientras que el 1 se puede generar, cuando se quiera.

Un procesador CISC dispondría de las operaciones `JF` y `XOR`, un RISC deja a cargo del compilador o ensamblador reemplazarlo con su equivalente si fuera necesario.

## Macro-ensamblador

Hasta ahora, apenas nos hemos referido a la representación de las operaciones de la CPU usando sus valores binarios, bit a bit, en el cuadro más arriba. Es raro programar usando binario. Aún al nivel más básico, se utiliza un ensamblador (*assembler*) que traduce mnemónicos como `ADD` o `MOVE` y que también nos permite usar números decimales (o cualquier otra base) en lugar de binarios o hacer referencia a posiciones del código con nombres para usar en `JMP` o `JT`.

El macro-ensamblador (*macro-assembler*) agrega la facilidad de crear aliases ya sea para los operandos o los mnemónicos o incluso a secuencias de ellos. Por ejemplo, en un macro-assembler se puede tener pre-definido `ACC = 0` para referirse al acumulador (que es nuestro registro 0) o `ZERO = 15` para el registro fantasma que contiene un cero. También podríamos definir nuevos mnemónicos, algunos que ya hemos visto, otros nuevos (en assembler, se usa el carácter `;` para indicar un comentario)

<pre><code class="language.asm">
    DEF ACC 0     ; definimos la constante ACC igual a 0

    DEF ZERO 15 

    MACRO JF dest ; macro-instrucción JF con un único argumento
    NOT ACC       ; Negar el acumulador usando la macro previa
    JT dest
    ENDMACRO

    MACRO RESET r  
    MOVE ZERO, r
    ENDMACRO

    MACRO SET r
    RESET r
    NOT r, r
    ENDMACRO
</code></pre>
Las pseudo-instrucciones `DEF`, `MACRO` y `ENDMACRO` no se traducen directamente en códigos de operación para la CPU sino que son declaraciones para el macro-assembler para ya sea *DEF*inir constantes o *MACRO*-instrucciones formadas por múltiples instrucciones y posiblemente operandos.

## Otros componentes

Además de la A(LU), y los 16 registros internos, entre ellos el acumulador y otro fantasma conteniendo un 0, la CPU ha de tener,

1. un registro de instrucción, en este caso, de 11 bits, que guarde la instrucción en curso mientras se está procesando.
2. un registro de paso de programa, en nuestro caso de 8 bits, donde se indica la posición de memoria de la próxima instrucción a ser ejecutada y que se incrementa automáticamente tras cargar cada instrucción en el registro de instrucción. Este habitualmente se abrevia como `PC` por *Program Counter*.

Por ejemplo, si los 3 primeros bits del registro de instrucción son son `010` (`JMP`) quiere decir que los últimos 8 bits del registro de instrucción se deben copiar en el `PC`, para que la ejecución del programa continúe en dicha dirección. Si la instrucción comienza con `011` (`JT`), la copia se hace condicional a que el acumulador esté en 1.

Si los dos primeros bits del registro de instrucción son `00` (`LOAD` y `SAVE`), entonces los últimos 8 bits se deben exponer en el bus de direcciones para seleccionar la posición de memoria y el tercer bit dice si esa posición se ha de leer o grabar.

## Eficiencia.

Cada circuito que se agrega implica una demora. Ya en la primera página del demultiplexor [74153](https://www.ti.com/lit/ds/symlink/sn74ls153.pdf) que señalé más arriba se ofrece el dato de “typical average propagation delay times” lo que resalta su importancia. El problema con sumar mucha circuitería es que estas demoras de propagación se van sumando y hacen al procesador más lento. Una solución es describir el circuito como ecuaciones Booleanas y simplificarlas como cualquier operación algebraica.

Sabemos que, en aritmética normal la ecuación `(a + -b * c) * d` podemos simplificarla como `a * -b * d + a * c * d`. La ventaja de esta última representación es que podemos procesar los dos términos `(a * -b * d)` y `(a * c * d)` en paralelo y luego sumarlos entre si mientras que en la primera ecuación, tenemos que esperar el resultado de `(-b * c)` para recién sumarlo a la `a` para finalmente multiplicarlo por `d`, agregando un paso a la otra alternativa. En circuitos digitales eso de ‘esperar’ no es bueno. Entonces en lugar de encadenar ‘bloques funcionales’ que en la práctica son compuertas de diversos tipos compuestas a su vez de varias cadenas de otros circuitos conectados en serie unos detrás de otros, podemos simplificar la ecuación lógica de buena parte del circuito para hacer más cosas en paralelo y reducir la demora a no más de dos o tres “propagation delay times”.

Viendo el diagrama lógico interno del demultiplexor [74x153](https://www.ti.com/lit/ds/symlink/sn74ls153.pdf), al pie de la segunda página observamos el efecto de esta simplificación de las ecuaciones lógicas, algo que se puede aplicar a muchos circuitos lógicos. Todos se pueden reducir a tres pasos:

1. Negar todas las entradas.
   Con esto se ofrece en las barras verticales, todas las señales de entrada y sus opuestos.
2. El `AND` de las señales que se quieran de estas barras verticales
   (todos estos resultados se podrían también conectar a una segunda serie de barras verticales)
3. El `OR` de las salidas de los `AND` para obtener el resultado

Entre las etapas 2. y 3. podría haberse dispuesto otro grupo de barras verticales con todos los `AND`, pero reagrupando apropiadamente las compuertas, el delineante lo ha evitado. Tampoco es necesario más compuertas inversoras intermedias dado que `NOT (a AND b)` es igual a `(NOT a OR NOT b)`, o sea que haciendo todas las negaciones al inicio, se cubren todas las posibilidades. (Nota: el circuito muestra algunas compuertas inversoras extra al inicio, pero estas están allí por consideraciones eléctricas, no de la lógica del circuito).

## Clock

La diferencia en los tiempos de propagación de las señales es la razón para el clock que usan las CPUs y por qué este afecta la eficiencia del procesador. El caso es que dados estos varios tiempos de propagación de los varios circuitos internos, hay momentos de inestabilidad mientras las señales de unos circuitos llegan a los que le siguen en la cadena mientras los de otros todavía están al llegar. Esto quiere decir que hay momentos en que los datos no son confiables.

De hecho, hay operaciones que nunca podrían ser estables, tal como un `NOT` de un registro sobre si mismo. Si originalmente fuera 0, el `NOT` produciría un 1, pero como ahora ese registro contiene un 1, su `NOT` es 0, cuyo `NOT` es 1 y así siguiendo tan rápido como la demora en la propagación del resultado lo permitiera.

Uno de los primeros ordenadores de uso académico en la Universidad de Buenos Aires se llamaba [Clementina](https://es.wikipedia.org/wiki/Clementina_(computadora)). El panel de control del operador tenía un altavoz y el fabricante había provisto, como muestra, un programa que hacía sonar en este altavoz la canción *Oh my darling, Clementine*. De allí surgió el nombre. La función real de este altavoz era detectar si un programa había entrado en bucle. Si una operación tardaba demasiado (y dada la velocidad de procesamiento de aquella época, todos los programas tardaban bastante) el operador podía subir el volumen de ese altavoz y, si sonaba un tono uniforme, había entrado en bucle. Habitualmente emitía ruido blanco.

Por ello, debemos interrumpir esta realimentación para estabilizar el resultado una vez hecho el primer ciclo.

Es necesario disponer de ‘latches’ (que se traduce como pestillo, aunque quizás sería mejor llamarlo ‘barrera’ o algo así) como el [74100](https://pdf1.alldatasheet.es/datasheet-pdf/view/107803/TI/SN74100.html) que mantienen estable el valor de la operación anterior y sólo dejan pasar el valor de una nueva operación cuando ha transcurrido la demora del camino de propagación más lento del circuito y por ello el nuevo dato está estable y es confiable, evitando así las inestabilidades en los momentos de transición.

Y para accionar estos latches se necesita el clock que vaya marcando los tiempos de espera para estas demoras. Suele haber dos etapas bien marcadas en la operación de una CPU que son ‘búsqueda’ y ‘ejecución’ (*fetch* y *execute*). En la búsqueda se lee el código de la operación a ejecutar y se retiene en el registro de instrucción para que pueda ir siendo decodificado y se accionen las compuertas que habilitarán las varias partes del circuito. En el segundo se ejecuta esta instrucción y para ello se habilita el paso de los datos a ser procesados y, finalmente, se retiene el resultado final, cuando está estable, para que pueda disponerse de él.

En principio, el clock nos ofrece dos estados (0 y 1) por ciclo. En ocasiones, es necesario hilar más fino y en lugar de operar en dos fases por ciclo, es necesario dar distintos tiempos a distintas operaciones. Para ello, el clock puede operar al doble de la velocidad y, tras dividirlo en dos, ofrecer 4 fases, (0, 1, 2 y 3) con cada latch y demás componentes activándose en una o más fases de esta secuencia. Lo que en música diríamos pasar del simple *um-pa* de la polca a la métrica más compleja del tango, *um-pa-pa-pa*.

## Micro-código

La CPU que hemos venido describiendo es extremadamente simple, pero no demasiado útil. Si quisiéramos agregarle más habilidades, nos podríamos encontrar con operaciones que no se pueden resolver en un solo ciclo. De hecho, sabemos que todas las operaciones que implican acceso a memoria externa requieren un par de ciclos, aunque en este caso, en el segundo ciclo no se hace nada, simplemente se espera. También hemos creado macro-instrucciones como `JF` o `SET` y otras más que ya veremos, que requieren más de una instrucción, o sea que realmente no pueden resolverse en un solo ciclo.

Acabamos de ver que muchos circuitos se pueden reducir a una sucesión de 3 tipos de compuertas con barras de señales distribuyendo por todo el circuito los resultados de una etapa a las compuertas de la etapa siguiente. Alguien se podrá preguntar si no podría hacerse un circuito que tuviera estas tres etapas de compuertas y sus barras de distribución ya grabadas en el silicio del chip y se pudieran programar las conexiones. Eso, obviamente, ya existe y se llama PLA (*Programmable Logic Array*) y, como se puede ver en el diagrama en [Wikipedia](https://commons.wikimedia.org/wiki/File:Programmable_logic_array_(schematic_drawing_example).svg), su estructura interna se corresponde a lo ya descrito donde los círculos huecos en los cruces representan las conexiones que pueden programarse.

Eso se puede ver en circuitos reales como [esta imagen](https://en.wikipedia.org/wiki/MOS_Technology_6502#/media/File:BreakNES_MOS_6502.jpg) de una CPU de 8 bits, el MOS 6502 que es el chip que usaron varios de los primeros ordenadores hogareños como la Apple ][, Commodore 64 o tantos otros de aquella época. Haciendo zoom en la parte superior, se llegan a ver los puntos de conexión que conectan juegos de barras. La técnica no es nueva, en [esta imagen](https://www.computerhistory.org/revolution/mainframe-computers/7/164/582) podemos ver una tarjeta de micro-código de una IBM 360 que es un ordenador que antecede a los circuitos integrados y donde el micro-código es una serie de tarjetas Hollerith en plástico (aislante) con trazas de aluminio donde las intersecciones que no se quieren se perforan con una [perforadora de tarjetas](https://es.wikipedia.org/wiki/Perforadora_de_tarjetas#/media/Archivo:IBM_card_punch_029.JPG) que, en aquella época, cualquier centro de cómputos tenía.

Otro tipo de chip que se presta a esto es una memoria de lectura-solamente o ROM (*Read-Only Memory*) en cualquiera de sus variantes (PROM, EPROM, EEROM, etc). Si pensamos en sus líneas de dirección como entradas y las de dato como salidas, una ROM nos puede ofrecer en sus salidas cualquier posible combinación lógica de sus entradas. No parece obvio y no es el uso habitual, pero si vemos el caso de la vieja tarjeta de micro-código de la IBM-360, acaso no es una tarjeta de datos Hollerith tradicional, pero en lugar de ser de papel y leerse por transparencia, se lee eléctricamente. Una ROM es lo mismo que una colección de estas tarjetas, como lo era el micro-código de la IBM-360, que era un bastidor conteniendo docenas de estas tarjetas (una para cada código de instrucción).

A diferencia del uso habitual de una memoria ROM que tiene muchos pines de entrada (16 para una memoria de 64k de profundidad) y pocos de salida (8 para una memoria de 8 bits de ancho de palabra) las memorias de micro-código son más anchas que profundas con menos pines de entrada que de salida. En el caso de nuestro set de instrucciones, tendría solamente 3 bits de entrada pero bastantes más de salida, para accionar las varias partes del circuito.

¿Qué pasa si le ponemos más micro-código y hacemos un chip CISC con instrucciones más complejas? Eso nos permitiría, por ejemplo, condensar en un sólo código de operación algunas de las macros que mencionamos arriba. Obviamente, en el set de instrucciones en la tabla de más arriba, no hay huecos donde meter más instrucciones, todas las posibles combinaciones de bits están tomadas, pero ya estaríamos hablando de otra CPU con otro set de instrucciones, que por el momento no analizaremos.

Utilizaremos una ROM donde cada dirección de memoria corresponderá con un paso de la micro-instrucción. La dirección de cada micro-instrucción la compondremos con la parte del código que representa la operación a ejecutar, no sus argumentos, que en el caso de nuestro viejo set de instrucciones serían 3 bits pero que, como debemos ampliar, dado que no tenemos huecos libres, le asignaremos 4 bits.

Para identificar el paso concreto dentro de la secuencia de micro-instrucciones, agregamos internamente un micro-contador de micro-instrucción. Para ello tenemos que ver cuántos pasos requiere la secuencia más larga de micro-instrucciones. Digamos que la secuencia de micro-instrucciones más larga es de 5, que tenemos que redondear a la potencia de 2 siguiente, esto es 8, que implica 3 bits que debemos sumar a los 4 bits anteriores.

Finalmente, debemos prever nuestro clock. ¿Será del tipo polca (*um-pa*) o tango (*um-pa-pa-pa*)? Si fuera este último, debemos agregar dos bits más.

Entonces, nuestra ROM deberá tener 9 bits de profundidad que representa 512 palabras de memoria.

Eso nos permite que el micro-código ejecute para cada código de (macro-)operación, (en nuestro ejemplo previo de macro-instrucciones, digamos `JF`) una secuencia de micro-instrucciones (`NOT` y `JT`) en las fases del clock que correspondan.

Esto nos dice la profundidad de la ROM, no nos dice el ancho de palabra. Habitualmente, siendo que las ROM las usamos para datos, solemos tener 8, 16 o hasta 32 bits de ancho de palabra. Acá no estamos pensando en datos sino en controlar compuertas dentro de nuestra CPU, entonces, la cantidad de bits de salida dependerá de cuántas señales necesitemos para controlar cada una de esas compuertas. En nuestro ejemplo original, nada más que en la ALU necesitábamos 4 bits para activar una de cuatro posibles salidas. Luego tenemos que agregar los latches que retienen los datos, los selectores de registros o de memoria y una larga lista de etcéteras que, sin un diseño concreto, no podemos precisar.

A esto le tenemos que sumar un bit extra para señalar el fin de una micro-secuencia. Como las micro-secuencias tienen distinta cantidad de pasos, debemos saber cuándo una secuencia está completa para pasar así a la siguiente macro-instrucción. Cuando el bit de fin de micro-secuencia está activo, el contador de paso de la micro-secuencia vuelve a cero y se lee la siguiente macro-instrucción.

## Subrutinas

Una subrutina es un segmento de código que ejecuta una funcionalidad genérica. ¿Qué se necesita para llamar una subrutina y volver de ella? Básicamente, guardar el contador de paso de programa, el `PC`, en una pila o *stack* y recuperarlo al volver.

A nuestro set de instrucciones (que como lo dejamos la última vez no tiene huecos libres pero, siendo un ejercicio, podemos inventar otro set) tenemos que agregar dos instrucciones más:

* `CALL mmmmmmmm` para llamar una subrutina que comienza en la instrucción de memoria que se indica
* `RET` para retornar de ella.

Ya tenemos una instrucción `JMP mmmmmmmm` que pasa a ejecutar la instrucción en la dirección que se indica, esto es, carga `mmmmmmmm` en el contador de paso de programa `PC`. La diferencia con hacer un `CALL` es que primero tenemos que guardar el `PC` actual en un stack antes de cargar la nueva dirección. Para ello necesitamos el micro-código, dado que estamos hablando de dos operaciones internas separadas.

En una CPU normal de múltiples bits de ancho de palabra, con memoria RAM suficiente, la pila o *stack* suele ser un bloque de memoria asignado por el sistema operativo en la misma memoria principal donde se guarda tanto el programa como los datos. La CPU simplemente necesita incorporar lo que se llama un puntero al tope de la pila habitualmente abreviado como `SP` (por *stack pointer*).

En una CPU como la nuestra, que tiene un solo bit de ancho de palabra, para hacer un stack necesitamos algún tipo de memoria RAM, en este caso de 8 bits de ancho de palabra, y un contador como el [74x191](https://www.ti.com/lit/ds/symlink/cy74fct191t.pdf) que tiene 4 bits y se puede encadenar con otros (el pin marcado RC para llevar el ‘resto’ *carry*) para dar 8, 12, 16 o más bits de conteo.

De hecho, el contador de paso de programa `PC` en nuestra CPU podría hacerse con dos de estos chips [74x191](https://www.ti.com/lit/ds/symlink/cy74fct191t.pdf) encadenados para poder contar con 8 bits, que es nuestro ancho de palabra de direcciones de programa. Se puede apreciar que el chip tiene tanto pines de entrada como de salida. Son estos pines de entrada los que, en el caso de un `JMP` o un `CALL`, cargan el `PC` con el nuevo valor mientras el pin marcado `CP` recibe el clock para ir avanzando la cuenta.

Lo importante para el `CALL` y `RET` es el `up/down`. El chip tiene un pin marcado `U/D` (por *Up/Down*) que le permite contar para arriba o para abajo. Entonces, cuando se hace un `CALL`, se incrementa el puntero al tope de la pila `SP` para que apunte a la siguiente posición disponible y se guarda el `PC` actual en esa casilla. Cuando se hace un `RET`, se carga el `PC` con el valor al tope de la pila y se decrementa el `SP` para que apunte al valor al tope del resto de la pila. Es importante que la secuencia entre acceder (en lectura y escritura) y el incremento/decremento del `SP` sea a la inversa en el `CALL` y el `RET` pues una operación revierte la otra y deben ejecutarse en la secuencia inversa la una de la otra. Es indistinto si la pila crece hacia valores más altos o si crece hacia abajo, basta ser consistente.

¿Cómo se pasan parámetros en las subrutinas? Usualmente, en sistemas chicos, como es el descrito, se designan registros internos para pasar los valores sobre los que la subrutina ha de operar. En sistemas más complejos, los parámetros se pasan en memoria, frecuentemente en la misma pila en que se guarda el stack de ejecución. Para ello existen instrucciones, habitualmente denominadas `PUSH` y `POP`, que implícitamente usan el puntero al tope de la pila, `SP` para acceder a la memoria.

* `PUSH rrrr` Se incrementa el `SP` para que apunte a la próxima posición disponible en la pila y se guarda el valor del registro `rrrr` en ella.
* `POP rrrr` Se lee el valor al tope de la pila para llevarlo llevarlo al registro `rrrr` y se decrementa el `SP`.

Suele ser responsabilidad del programador o del compilador retirar de la pila (`POP`) tantos datos como se hubieran guardado (`PUSH`) para que el `RET` encuentre el valor del `PC` guardado y no confunda un dato con código.

Existen procesadores donde el `PC` y el `SP` son parte de los registros internos tal como lo son el `ACC` (registro 0) o el `ZERO` (registro 15). En ellos, puede no existir `CALL` y `RET` dado que se pueden reemplazar por macros:

```asm
    DEF PC 14  ; supongamos que el PC es el registro 14
    
    MACRO CALL m  ; defino la macro CALL con un argumento m
    PUSH PC  ; guardo el contador de paso de programa en la pila
    JMP m    ; voy a ejecutar el código en la dirección m
    ENDMACRO

    MACRO RET  ; defino la macro RET que no lleva argumentos
    POP PC
    ENDMACRO
```

Esto, en definitiva, es lo que termina haciendo el micro-código si `CALL` y `RET` formaran parte del set de instrucciones.

## Huecos en el set de instrucciones

Ya hemos visto que nuestro primer set de instrucciones está completo, para agregar cualquier otra capacidad interna al chip, o sea, que no sea a través de macros en el ensamblador, tenemos que ampliar el set de instrucciones. En lugar de los 3 bits originales (más operandos) tendríamos que pasar a 4, 5 o más.

Dado que sólo podemos hacerlo en potencias de 2, cada nueva ampliación nos ofrece todo un abanico de posibles códigos de instrucción. ¿Podremos usarlas todas como hemos hecho con nuestro primer set de instrucciones? Y si no podemos usar todas las posibles combinaciones de bits de nuestro set ampliado, ¿qué pasa con los huecos?

Hay varias posibilidades. La más simple es no hacer nada. Si alguien incluyera en su programa el patrón de bits de estos huecos, el resultado podría ser indeterminado e imprevisible.

La segunda opción es que todo hueco sea un `NOOP`, una abreviatura corriente para una instrucción que no hace nada (del inglés *NO-OPeration*). Dado que ningún ensamblador o compilador podría producir uno de estos códigos, si el programa, en ejecución, se encuentra una de estas instrucciones, lo más probable es que el código esté corrupto, que el programa haya encontrado con una posición de datos en lugar de código, que casualmente contenga uno de estos códigos. Por ejemplo, si al llamar una subrutina los PUSHs y POPs para los argumentos no estén apareados como corresponde. En este caso, el programa está perdido de todas formas, su `PC` está apuntando a memoria de datos en lugar de código y, por lo tanto, aunque esta instrucción NOOP no haga nada, el resto de lo que el chip ahora cree que es el programa tampoco tendrá sentido.

La mejor opción es tratar el código en esos huecos como una llamada a una subrutina, un `CALL`, a una posición pre-determinada. La ventaja de esto es que podemos escribir código que responda a esta instrucción y decidir qué hacer, por ejemplo, reiniciar el chip desde cero. Otra posibilidad es aprovechar esa subrutina para ampliar, experimentalmente, el set de instrucciones del procesador. Esto es más habitual de lo que podría suponerse. Hay familias de chips que tienen todos el mismo set de instrucciones base, pero algunos miembros de esa familia tienen extensiones al set de instrucciones básico, por ejemplo, para hacer aritmética de punto flotante, y otros chips no. Es lo que ocurre con el [set de instrucciones del RISC-V](https://es.wikipedia.org/wiki/RISC-V#ISA_Base_y_extensiones) que tiene su base y varias posibles extensiones ya establecidas.

¿Qué pasa si usamos una instrucción del set de aritmética de punto flotante en un chip que no tiene esa extensión? Se puede cargar un emulador en software de estas operaciones de punto flotante y ejecutar el mismo programa que usa esas operaciones sin que el programa se entere que, en realidad, están siendo simuladas. Se ejecutarán más lento, pero el programa funcionará.

Y como el chip, al encontrar la instrucción inexistente, ha hecho un `CALL` esta subrutina puede retomar la ejecución del programa inicial con un simple `RET`, como cualquier otra subrutina.

## Turing y Von Neuman

Si bien la descrita es una máquina de Turing (limitada, porque no tiene una cinta infinita, ni de lejos) no responde a una arquitectura de Von Neuman. ¿Por qué? El gran concepto de Von Neuman fue tratar los programas como datos y usar la misma memoria tanto para el programa como para la información a procesar. Esto permite hacer cosas como un compilador o un intérprete que trata un programa como datos y es fundamental para LISP y otros programas de inteligencia artificial de la misma familia que modifican su código mientras se ejecutan. En la práctica el uso más frecuente de esta capacidad está en poder cargar un programa desde un dispositivo de almacenamiento como si fuera datos y luego ejecutarlo en ese mismo espacio de memoria.

La que hemos descrito hasta ahora claramente no es una máquina de Von Neuman. El ancho de palabra de los códigos de ejecución del set de instrucciones que vimos es de 11 bits mientas que los datos son de a 1 bit. Hemos designado 8 bits tanto para direcciones de memoria de programa como de memoria de datos pero esto ha sido, más que nada, para realzar la regularidad del set de instrucciones, no porque sea necesario. Podríamos hacer diferente la cantidad de bits de direcciones para `LOAD` y `SAVE` que para `JMP`, `JT` y `CALL`. Hasta donde hemos llegado, conceptualmente, son opciones válidas.

No es inusual que los micro-controladores no sean máquinas de Von Neuman. Tiene sentido que no lo sean porque raramente van a ejecutar un programa distinto al que llevan grabado de fábrica, programa que se graba por un mecanismo distinto de aquel en que lo ejecutan. Incluso el tipo de memoria es distinta para una y otra, ROM o EPROM o FLASH para programa, RAM para datos. La compilación del programa de un micro-controlador habitualmente se hace en otra máquina, como en el caso del Arduino, donde el código fuente en C se compila en la PC donde se carga el soft de desarrollo.

En una máquina de arquitectura de Von Neuman en la que los códigos del programa y los datos residen en la misma memoria y se acceden por los mismos buses de datos y direcciones, debemos reservar momentos distintos del ciclo de ejecución para acceder unos y otros.

En una máquina de Von Neuman, cuando nos encontramos con un `LOAD` o `SAVE` no podemos leer la siguiente instrucción inmediatamente pues debemos esperar que el dato que se carga o guarda se transita por el mismo bus de datos antes de ocuparlo leyendo la siguiente instrucción.

Al no ser una máquina de Von Neuman, podemos leer los códigos de operación del programa de forma continuada pues estos transitan por sus buses independientes de los datos.

## Reset

Se debe prever circuitería para el reset de la CPU, concretamente, cargar el `PC` con 0 (o cualquier valor predeterminado) y limpiar los latches que fuera necesario. Algunos cargan el `SP` con algún valor fijo.

Algunos procesadores de uso general (o sea, de Von Neuman) cargan el `PC` con el valor grabado en una cierta posición de memoria. Es costumbre utilizar las direcciones bajas de la memoria para RAM que, obviamente, contendrá basura al arrancar. La ROM (por ejemplo el BIOS) suele ponerse en direcciones altas, por ello, al resetear es normal ir a buscar la dirección de inicio en esas posiciones altas donde está la ROM. Esta dirección, a su vez, usualmente apuntará también al inicio del programa en esa misma ROM. En ordenadores más antiguos, las llaves y pulsadores que se veían en los paneles de control eran para indicar la dirección de inicio del código (entre otras cosas)

Ningún procesador borra la memoria principal ni los registros, estos deben inicializarse expresamente.

— — — — — —

Conceptualmente creo que esto cubre todo lo fundamental en el diseño de una CPU. Faltarían:

* anchos de palabra mayores
* operaciones aritméticas
* interrupciones (`CALL`s disparados por señales de hardware, importante para responder rápidamente a sucesos externos)
* acceso a memoria indexado por registros internos por ejemplo, para acceder a sucesivos elementos de un array cuya base está guardada en un registro interno, o al segundo parámetro de una subrutina, que está guardada en el stack y por ello está indexado relativo al `SP`.

Pero estos no hacen a lo fundamental de una CPU.