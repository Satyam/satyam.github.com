---
title: "Cintas Magnéticas"
date: "2025-11-14"
categories: ["Historia/Informática"]
language: "es-ES"
---
> Nunca subestimes el ancho de banda de una camioneta familiar cargada  de cintas magnéticas que circula a toda velocidad por la autopista.
> <address>Andrew S. Tanenbaum</address>
---

No pude resistir la tentación de comenzar este artículo con una cita de un libro fundamental de la informática, Computer Networks, de Andrew Tanenbaum, publicado inicialmente en 1981.  Me pregunto si en su más reciente edición, la sexta, del 2021, aún la conserva pues lo que era verdad en aquel entonces hace rato que no lo es.  En esa época teníamos modems de 64kbps (kilo bits por segundo) para larga distancia, Ethernet a 10Mbps para conexiones locales, y una cinta magnética que, en el mejor de los casos, podía contener 170MB pero usualmente se quedaba en 130MB a 140MB.   Estamos hablando de *kilos* y de *megas*. *Gigas* no había por ningún lado. ¡Ni siquiera sabíamos que después venía *tera*!  Acabo de consultar en Amazon y el *pen drive* más chico que ofrecen es de 1GB y lo venden a menos 20€ en packs de 10.  En cada uno de esos pen drives caben unas 6 cintas de aquellas. Si tenemos fibra óptica en nuestras casas, es posible que recibamos el equivalente de varias docenas de cintas magnéticas todos los días simplemente viendo series y películas.

Pero, la cinta magnética ocupó un espacio fundamental durante varias décadas cuando reemplazó a las tarjetas perforadas como principal medio de almacenamiento. Grandes empresas tenían enormes salas dedicadas a guardar las fichas de sus clientes, proveedores y/o empleados.  Como los centros de cómputo solían estar en la misma sede central de la entidad, en edificios donde el metro cuadrado de oficina era caro, el espacio que ocupaban no era barato.  Y el trabajo de andar cargando con ellas de un lado a otro era interminable.

<figure>
 <a title="Erik Pitti from San Diego, CA, USA, CC BY 2.0 &lt;https://creativecommons.org/licenses/by/2.0&gt;, via Wikimedia Commons" href="https://commons.wikimedia.org/wiki/File:IBM_System_360_tape_drives.jpg">
    <img alt="Unidades de cinta magnética" src="assets/img/512px-IBM_System_360_tape_drives.jpg">
  </a>
  <figcaption>Conjunto de unidades de cinta magnética para el IBM System/360.</figcaption>
</figure>

Las unidades de cinta magnética como las de la imagen de arriba eran típicas en cualquier centro de cómputos.  Junto con los paneles con luces y botones, eran siempre parte del escenario de las películas de ciencia ficción, con los carretes siempre girando de un lado para el otro.  La cinta en sí cobró protagonismo en la presentación de la clásica serie de marionetas animadas de Joe-90, de los mismos productores de Supercar, El Capitán Marte y el XL5 o Rescate Internacional.

Volviendo a la realidad, los carretes girando a un lado y otro intermitente y los lazos de cinta que subían y bajaban por el par de canaletas verticales en la mitad inferior de la unidad eran lo que más llamaban la atención pero, en realidad, lo crucial ocurría en el rectángulo abajo entre los dos carretes y las ruedas a cada lado.  Las cabezas de grabación y lectura se encuentran debajo de esa cubierta y esos rodillos son los que mueven la cinta sobre ellas.  Las rodillos toman y sueltan la cinta en la canaleta, que es la *reserva* de cinta para trabajar.  Las canaletas tienen una bomba de aire que chupa suavemente la cinta hacia abajo.  Sensores de luz a los lados de las canaletas detectan cuando sobra o falta cinta de reserva y mueven los carretes para mantener la reserva a punto.  De esta forma, la cinta se puede mover sobre los cabezales con agilidad, dado que los rodillos solo tienen que lidiar con unos gramos de cinta y no con los carretes.

Posteriores algunas unidades de cinta utilizaban un mecanismo aún más ingenioso para enhebrar la cinta. El carrete de cinta iba cerrado por un cinturón que lo abrazaba por la periferia abierta.  El carrete, cerrado con su cinturón, se cargaba en el unidad de cinta y, al pulsar un botón el botón de carga, la puerta de vidrio se cerraba, un simple mecanismo abría ligeramente el cinturón permitiendo que el carrete en sí girara libremente dentro del mismo y dejando al descubierto un pequeño agujero de centímetro y medio de lado por el cual, gracias a chorros de aire apuntados estratégicamente, extraía la punta de la cinta y la enhebraba automáticamente también con corrientes de aire hasta que era succionada y envuelta sobre el eje que normalmente sostendría un carrete vacío pero que, en este caso, ni siquiera era necesario.  Una maravilla neumática donde uno menos lo espera.

Los cabezales de grabación y lectura eran bastante grandes pues la cinta se grababa en 9 canales, 8 para cada byte de datos y uno extra para la paridad.  La cabeza lectora se encontraba después de la grabadora de tal manera que la unidad verificaba que todo estuviera bien grabado de inmediato.

La grabación se realizaba en bloques, cuyo tamaño el programador podía definir a su vez, cada bloque podía contener 1 o más registros.  Los bloques estaban separados por brechas o *gaps* que le daban espacio al mecanismo para frenar y volver a arrancar. Esta pausa le daba tiempo al procesador de operar sobre cada registro de cada bloque de datos que iba leyendo.  De allí la importancia de que el mecanismo de lectura tuviera muy poca inercia pues eso permitía reducir el *gap* entre los bloques de datos. Si se usaba polvillo magnético, era posible ver los bloques y los gaps pues eran elementos físicos.  Los registros en que se subdivide un bloque son definidos por el programa.  

Por eso, a diferencia de un disco, que se formatea en pistas y sectores fijos y, por tanto, tiene una capacidad fija establecida, las cintas nunca especificaban la capacidad porque esta dependía del tamaño de los bloques y la eficiencia del mecanismo.  Con el máximo tamaño de bloque posible, una cinta tenia algo así como 170MB de capacidad pero, en la práctica, sólo se podía almacenar de 130 a 140MB. Es la proporción entre el espacio útil que ocupan los bloques de datos y el peso muerto de los *gaps* lo que termina definiendo la capacidad.  Cuanto más grandes los bloques, mayor capacidad y mayor velocidad de lectura, pero terminamos atosigando a la CPU con enormes bloques de datos en una época cuando la memoria para almacenarlos no abundaba.

Una especificación importante de las unidades era la densidad de grabación que permitían.  Había de 800bpi, 1600bpi y el máximo de 6250bpi o *bytes per inch* (bytes por pulgada) y el carrete más grande era de 10,5 pulgadas de diámetro conteniendo 2400 pies de cinta, pero también había carretes de 1200 y 600 pies.  En todos los casos la cinta era de media pulgada o 12,5mm de ancho.  Durante algún tiempo se usaron cintas de 7 pistas, 6bits de datos y uno de paridad, pero pronto se pasó a las de 9 pistas.

Había dos grandes diferencias entre las unidades de disco que usamos actualmente y las cintas magnéticas.  La primera y más fundamental, es que eran de acceso secuencial, eso es, no resultaba práctico buscar en una cinta un bloque de datos específico, el programa debía ir procesando los datos en la medida que los iba recibiendo de la cinta, no podía buscar lo que quisiera sino que tenía que aceptar lo que encontrara en el orden en que lo encontrara.

Segundo, los bloques en si no se podían actualizar in-situ.  Ligeras variaciones en el posicionamiento de la cinta podían hacer que un bloque se solapara con el siguiente o redujera el *gap*.

Aunque ambas restricciones no eran absolutas pues nada impedía perder tiempo en tener los carretes girando a lo tonto para uno y otro lado mientras el procesador espera cierto dato, ni era imposible regrabar un bloque, pero ciertamente no era recomendado dado que había opciones muchos más simples.

Para continuar la explicación tenemos que distinguir entre dos tipos de archivo habituales.  Los archivos *maestros* que contienen la información básica de la empresa.  Por ejemplo, el *maestro* de proveedores, el *maestro* de clientes o los de inventario, empleados, cuentas corrientes y otros.  

Otro tipo de archivo es el de *movimientos*. Estos son los que contienen las novedades que hay que procesar.  Por ejemplo, pagos hechos a proveedores, ventas a los clientes, entrada o salida de artículos del depósito, horas trabajadas u otras novedades de los empleados o depósitos y extracciones de las cuentas corrientes.

Los *maestros* son cruciales para la empresa y se actualizan con los *movimientos*, las novedades.  Como no queremos dañarlos, lo que se hace es generar un *maestro* actualizado.  Se pone la cinta, digamos, con el *maestro* de clientes en una unidad, los *movimientos* de ventas, entregas o facturación a los clientes o sus pedidos y pagos y se pone una cinta en blanco o que se pueda reutilizar, en otra unidad que será el nuevo *maestro*.  Se procesan todos los *movimientos* contra el *maestro* de entrada y se genera el nuevo *maestro*.   El viejo, *maestro* no se descarta de inmediato pues, junto con los *movimientos* sirven de copia de resguardo porque, si se arruinara el nuevo *maestro* es posible reconstituirlo a partir de la versión anterior.  Lo habitual era conservar 2 copias previas o *generaciones* y se les llamaba el abuelo, el padre y el hijo.  Cuando se generaba una nueva versión, el abuelo pasaba a *disponible* el padre a abuelo, el hijo a padre y el nuevo era el hijo.  Todas las cintas, a la larga, se reutilizaban, pero se mantenían un limitado número de generaciones previas como resguardo, junto con los *movimientos* que permitieron pasar de una a la siguiente.

Con este mecanismo de generar nuevas copias de los *maestros* evitamos actualizar una cinta con un *maestro*, operación ineficiente sino arriesgada y, además, tenemos una suerte de copia de resguardo.

El otro problema a resolver es cómo procesar los datos en el orden en que vienen. Los *maestros* son los que mandan, el *maestro* de clientes estará ordenado por el número de cliente, el de proveedores por el número del proveedor y así cada uno de los maestros tendrá un orden preestablecido. La solución entonces está en ordenar los *movimientos* en el mismo orden que sus respectivos *maestros*.  Si vamos a facturar, vamos a ordenar los *movimientos* de entrega a los clientes por el número de cliente para que se corresponda con el *maestro*.  Es frecuente que varios *movimientos* afecten al mismo cliente.  El registro del *maestro* se retiene en memoria hasta que nos encontramos con un movimiento para otro cliente.  Recién entonces se graba.  También hay clientes que no nos han comprado nada recientemente.  Esos no tendrán *movimientos* y se copian directamente de la entrada a la salida.

Es posible que un *movimiento* afecte a más de un *maestro*.  Una salida de mercadería afecta al *maestro* de inventario y al *maestro* de clientes, a quienes se les debe enviar un remito o albarán y restar de su crédito.   En ese caso se ejecutan dos programas separados y el archivo de *movimientos* ha de ser ordenado acorde al *maestro* contra el cual se opere en cada etapa.

Ya hemos visto como se ordenan o [*sortean*](2025/11/06/poniendo-los-datos-en-orden.html) los datos en las tarjetas. A la llegada de las cintas magnéticas, las clasificadoras de tarjetas desparecieron por ineficientes, pero las perforadoras de tarjetas se mantuvieron mucho más allá reemplazadas, eventualmente, por las grabadoras en diskette.   Tanto las tarjetas como los diskettes con los *movimientos* se copiaban a cinta magnética, que era más eficiente. En algunos centros de cómputos era tal el volumen de tarjetas perforadas a procesar que había máquinas dedicadas a transferir lotes de tarjetas a cinta para no ocupar el procesador principal en algo tan trivial.

Obviamente, *sortear* una cinta no se puede hacer igual que con las tarjetas que se manipulaban físicamente.  Recordemos que estamos relatando como fue avanzando el procesamiento de datos y, a esta altura de nuestra historia todavía no teníamos discos rígidos y aún los *mainframes* más poderosos no tenían suficiente memoria para *sortear* los datos en memoria en una sola pasada.

En ese caso, el *sort* se hacía de cinta a cinta.  Esto era un proceso que se llamaba *sort-merge* o sea, clasificar y unir.  En una primera etapa, se leían tantos registros como cupieran en la memoria, se los ordena allí y luego, se grababa ese lote en una cinta magnética auxiliar.  Luego se leía otro lote, se ordenaba en memoria y se grababa en cinta y así con todos los lotes que fuera necesario distribuyéndolos en tantas cintas como hubiera disponibles.  Cada cinta terminaba con varios lotes de datos.  Entonces, venía la etapa de unión (*merge*) en el que se entremezclaban ordenadamente los registros de los varios lotes de las cintas y el resultado iba a una nueva cinta.  

Imaginemos el proceso con una sola cinta auxiliar.  Al final de la primera etapa, terminamos con dos lotes en la misma cinta auxiliar:

<table><caption>Resultado del sort inicial en la cinta de entrada</caption>
<tr>
<th>Casilla</th>
<td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td><td>8</td><td>9</td></tr>
<tr>
<th>Valor</th>
<td>1</td><td>2</td><td>7</td><td>8</td><td>12</td><td>4</td><td>5</td><td>9</td><td>10</td></tr>
</table>

Uso el término *casilla* en lugar de *bloque* o *registro* para no complicar la explicación con tecnicismos.

El primer lote abarca de las casillas 1 a la 5 pues en la casilla 6, el 4 es menor que el 12 por lo que es obvio que allí comienza otro lote.  Para hacer el *merge* el procesador toma nota de la posición del primer valor, el más bajo de cada lote y su posición. En la casilla 1 hay un 1 yen la 6 un 4. En memoria, el procesador tiene la siguiente tabla:

<table>
<caption>Cabezas de cada loteen memoria</caption>
<tr><th>Casilla</th><th>Valor</th></tr>
<tr><td align="center">1</td><td align="center">1</td></tr>
<tr><td align="center">6</td><td align="center">4</td></tr>
</table>

Como el 1 es menor que 4 comienza a leer de las casillas siguientes: `1:1`, `2:2`, `3:7`.  Pero el 7 es mayor que el 4 en la casilla 6.  Por el momento, en la salida tiene:

<table><caption>Primer <i>merge</i> en la cinta de salida</caption>
<tr>
<th>Casilla</th>
<td>1</td><td>2</td></tr>
<tr>
<th>Valor</th>
<td>1</td><td>2</td></tr>
</table>


El 7 de la casilla 3 no lo ha copiado, pero se acuerda de él para retomar más adelante.  

<table>
<caption>Cabezas de cada lote en memoria</caption>
<tr><th>Casilla</th><th>Valor</th></tr>
<tr><td align="center"><b>3</b></td><td align="center"><b>7</b></td></tr>
<tr><td align="center">6</td><td align="center">4</td></tr>
</table>

Avanza la cinta hasta al siguiente lote y lee las casillas 6, 7 y 8, pero, nuevamente, se da cuenta que el 8 es mayor que el 7.  

Hasta ahora tiene:

<table><caption>Segundo <i>merge</i> en la cinta de salida</caption>
<tr>
<th>Casilla</th>
<td>1</td><td>2</td><td>3</td><td>4</td></tr>
<tr>
<th>Valor</th>
<td>1</td><td>2</td><td>4</td><td>5</td></tr>
</table>

Y las cabezas de lote quedan así

<table>
<caption>Cabezas de cada lote en memoria</caption>
<tr><th>Casilla</th><th>Valor</th></tr>
<tr><td align="center">3</td><td align="center">7</td></tr>
<tr><td align="center"><b>8</b></td><td align="center"><b>9</b></td></tr>
</table>

Vuelve entonces a la casilla 3, donde está el 7, y lee `3:7`, `4:8` y `5:12` donde se interrumpe pues el 9 en la casilla 8 es menor.

<table>
<caption>Cabezas de cada lote en memoria</caption>
<tr><th>Casilla</th><th>Valor</th></tr>
<tr><td align="center"><b>5</b></td><td align="center"><b>12</b></td></tr>
<tr><td align="center">8</td><td align="center">9</td></tr>
</table>

Hasta ahora tiene:

<table><caption>Tercer <i>merge</i> en la cinta de salida</caption>
<tr>
<th>Casilla</th>
<td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td></tr>
<tr>
<th>Valor</th>
<td>1</td><td>2</td><td>4</td><td>5</td><td>7</td><td>8</td></tr>
</table>

Y así sigue hasta agotar todos los valores en todos los lotes.  Obviamente, no es cuestión de ordenar solamente los números, al copiar, se copian todos los datos ya sea del cliente, del proveedor o el empleado correspondiente a ese número. Pero, la tabla de las cabezas de cada lote sí se mantienen en memoria sin el resto de los datos.

Si se dispone de más unidades de cinta  donde poner 2 o más cintas auxiliares, el proceso es mucho más rápido pues puede ir leyendo alternativamente de una u otra reduciendo el rebobinado.

El *sort* era un proceso utilitario, incluido con el software de base de cualquier sistema y bastaba con decirle las columnas de los datos a ordenar, en que unidad de cinta estaban los datos originales, en qué unidad debían grabarse los datos ordenados y cuántas unidades iba a disponer con carretes de cinta *de borrador* y el sistema lo manejaba todo.  Había muchas optimizaciones que aceleraban el proceso. 

Las primeras unidades de disco o tambores magnéticos que llegaron a los centros de cómputo no eran removibles, se utilizaban como lo que hoy llamamos *memoria virtual*. Eso le permitía extender los pocos kilobytes de memoria principal a cientos de kilobytes o unos pocos megabytes.  Con ello, los lotes intermedios eran sustancialmente más grandes y el proceso se aceleraba enormemente.  Un primer ejemplo fue el [IBM 305 RAMAC](https://en.wikipedia.org/wiki/IBM_305_RAMAC) que podía almacenar 3,75MB. La [imagen](https://www.tomshardware.com/pc-components/hdds/ibm-announced-the-worlds-first-hdd-the-3-75mb-ramac-350-disk-storage-unit-69-years-ago-today-unit-weighed-more-than-a-ton-50-platters-ran-at-1-200-rpm#5e92e344-07d0-4f34-aeb9-81a996109f53) de los transportistas descargando el colosal aparato contrastado con un pen-drive de varios gigabytes se ha propagado por la web.
