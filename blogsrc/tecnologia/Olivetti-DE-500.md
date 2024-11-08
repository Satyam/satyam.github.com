---
title: "Olivetti DE-5xx / Sycor DE-300"
date: "2024-11-07"
categories: ["Tecnología/Fracasos","Historia/Informática"]
language: "es-ES"
---
Cómo Olivetti vendió promesas y perdió un mercado

---

Estaba estudiando todavía en la universidad y conseguí un trabajo de media jornada en un taller de reparación de equipos de computación electrónica que Olivetti tenía en Colegiales.  Comencé en un taller de reparación de calculadoras electrónicas, que fue mi primer trabajo asalariado y que describí en [otro artículo](2021/10/07/my-first-and-proudest-day-on-the-job.html) (en inglés). Mi jefe allí me habrá visto alguna aptitud y me ofreció trabajar en el taller de Colegiales donde atendían los equipos más complejos.  

Allí es donde conocí la DE-500, la primera computadora que tuve oportunidad de destripar pues, en definitiva, ese era mi trabajo, abrirlas para arreglarlas.

<figure>
  <img src="assets/img/Olivetti_DE-523.jpeg" alt="Olivetti DE 500" /> 
  <figcaption>Olivetti DE-500.  La pantalla, pequeña, arriba a la izquierda, y dos caseteras a la derecha.  El fuste contenía el grueso de la electrónica. Abajo, el teclado estándar más múltiples teclas de función.  El grueso cable de alimentación asoma por detrás.</figcaption>
</figure>

Esta es una máquina anterior a los microprocesadores.  Nada de i8080, M6502 o Z80, la CPU eran un par de ALUs (Unidad Aritmética-Lógica, en inglés) [74181](https://en.wikipedia.org/wiki/74181) con toda la circuitería adicional para convertirla en un procesador completo, abarcando 2 ó 3 placas llenas de chips.

No cabe esperar demasiada memoria, a lo sumo 16kB.  Una vez llegó al taller un modelo bastante viejo que tenía [memoria de núcleos de ferrita](https://es.wikipedia.org/wiki/Memoria_de_n%C3%BAcleos_magn%C3%A9ticos), esas donde unas anillas de  ferrita del tamaño de semillas de amapola van tejidas, usualmente a mano, formando bandejas que luego se apilan y, si mal no me acuerdo, tenía apenas 4kB.

Tampoco tenía discos ni rígidos ni flexibles, nada.  Su único almacenamiento, para programas y para datos, era a través de una o dos unidades de casete digital, que no hay que confundirlo con las primeras computadoras de hogar como la [Sinclair ZX Spectrum](https://es.wikipedia.org/wiki/Sinclair_ZX_Spectrum) que se podían conectar a un grabador de audio corriente.  La cinta que tenían estos casetes digitales estaba pensada para almacenar información digital, no analógica y, si bien físicamente se podían insertar y usar en un grabador de audio, distorsionaba mucho.  A la inversa, si se usaba un casete de audio en la DE-500, se perdían bits y los datos salían aparentemente bien, pero tenían baches donde los bits estaban cambiados y salía cualquier cosa.

Esta máquina estaba diseñada fundamentalmente para el ingreso de datos, reemplazando las antiguas perforadoras de tarjetas como las viejas IBM 029:

<figure>
  <a 
    title="waelder, CC BY-SA 3.0 &lt;http://creativecommons.org/licenses/by-sa/3.0/&gt;, via Wikimedia Commons" 
    href="https://commons.wikimedia.org/wiki/File:IBM_card_punch_029.JPG"
  >
    <img alt="IBM card punch 029" src="assets/img/800px-IBM_card_punch_029.jpeg">
  </a>
  <figcaption>Una perforadora de tarjetas IBM 029.</figcaption>
</figure>

La funcionalidad de grabación o verificación de registros estaba integrada fija en memoria ROM y se activaba con las teclas de función, que también permitían seleccionar casetera, rebobinar, grabar, verificar, borrar, copiar y demás operaciones básicas.

Cada casete digital podía contener el equivalente de varios miles de tarjetas ocupando así menos espacio (los depósitos conteniendo estanterías llenas cajas y más cajas de tarjetas eran interminables), mucho más rápidos de leer en el computador central a que iban destinadas y, además, el casete se podía reutilizar, mientras las tarjetas eran de un solo uso.

No todos los centros de cómputos tenían lectora de casetes digitales por lo que existía la opción de conectar una unidad de cinta magnética estándar que podía ser usada en cualquier gran centro de cómputos.  Esta unidad externa era relativamente pequeña, del tamaño de un horno de microondas, pero cara y, muchas veces se tenía una única unidad de cinta conectada a una máquina que se usaba para transferir los datos de los casetes del resto de las máquinas a una única cinta que se enviaba al centro de cómputos.

Hay que comprender cómo se usaban estas máquinas en su conjunto.  Era raro tener una sola  perforadora de tarjetas o grabadora de casete o cinta, lo habitual era tener una sala de *perfo-verificación*, que así le llamaban, como esta:

<figure>
  <a 
    title="NTT Public Corporation, Public domain, via Wikimedia Commons" 
    href="https://commons.wikimedia.org/wikiFile:Keypunch_department_in_Tokyo_Telegraph_and_Telephone_Fees_Office.jpg"
  >
    <img 
      alt="Keypunch department in Tokyo Telegraph and Telephone Fees Office" 
      src="assets/img/Keypunch_department_in_Tokyo_Telegraph_and_Telephone_Fees_Office.jpg"
    >
  </a>
  <figcaption>Sala de perforación y verificación de tarjetas</figcaption>
</figure>

Allí es donde llegaban, por ejemplo, los miles y miles de talones de pago con tarjeta de crédito, de la época cuando los datos de la tarjeta se transferían mediante un formulario con múltiples copias al carbón por presión desde el embozado mismo de la tarjeta, más el importe fecha y firma del ciente agregados a mano.

Cada operadora (pues usualmente eran mujeres) recibía un fajo de estos talones, cada uno con una transacción, y los iba ingresando manualmente en la perforadora o, en nuestro caso, en una grabadora DE-500.  La velocidad y precisión con que lo hacían era asombrosa e incluso eran capaces de hacerlo tan automáticamente que no era inusual que charlaran de cualquier tema mientas lo hacían.

Cada lote de talones se grababa (o perforaba) primero y luego se verificaba.  Para verificarlo una segunda operadora volvía a ingresar los mismos datos y la máquina, en modo de verificación, lo comparaba con lo grabado.  Aunque pareciera que es más trabajo, la velocidad conque podían teclear era tal que esto era más eficiente que si lo leyeran y compararan visualmente.  Si la comparación fallaba se borraba el registro (o se tiraba la tarjeta) y el talón original, que había sido mal grabado, se ponía en otra pila para volver a procesar.

Este mismo proceso de perforar y verificar tarjetas, o hacerlo con casetes, era el primer paso de prácticamente todo sistema informático de aquel entonces.  Ya fueran las planillas de los cajeros de las sucursales bancarias, las listas de entrada y salida de personal, la recepción de mercadería o el despacho de pedidos, todos los datos llegaban al centro de cómputos a través de los ágiles dedos de estas damas. El procesamiento **digital** comenzaba aquí.

Mientras que las perforadoras de tarjetas eran tan grandes que venían integradas dentro de su propio escritorio la DE-500 era del tamaño de las viejas PCs y se podía poner en cualquier lado.

La DE-500 no estaba limitada al ingreso de datos.  Era una máquina totalmente programable y, dentro de sus limitaciones en memoria y almacenamiento, podría afrontar cualquier tarea.  Era, en definitiva, una versión de mesa de las primeras computadoras comerciales de los 50 que costaban fortunas y ocupaban salas enteras.

Para usar en ingreso de datos, se configuraba con un mínimo de memoria y una sola casetera, pero con el máximo de memoria y doble casetera podía hacer trabajos contables al viejo estilo, por ejemplo, con un casete conteniendo una copia del inventario más reciente (que se conserva como resguardo) en una casetera, el *maestro* y en la otra los entradas y salidas de mercaderías, los *movimientos*, ambas ordenadas por el código del artículo.  Se lee un artículo del maestro, y se leen los movimientos que hubiera habido de ese artículo y, si los hubiera habido, se regraba el maestro con la nueva cantidad (por eso se trabaja sobre una copia, por si algo fallara).

Esto requiere que ambos casetes estuvieran ordenados por código de artículo, lo que en la jerga se llama *sort*.  Este era un paso previo que se hacía con un programa estándar del sistema. Tardaba bastante, dependiendo de cuánta memoria interna tuviera la máquina, pero era algo habitual en cualquier sistema informático de la época.

Mejor aún que andar haciendo malabares con sólo dos casetes, que son medios de almacenamiento secuencial, es ofrecer un medio de almacenamiento de acceso directo, como son los *floppies*,  *diskettes* (o "disquetes", como recomienda la Real Academia).  Ya para esa época, IBM mismo había pasado del uso de tarjetas perforadas usando los *diskettes* de 8 pulgadas.

En lugar de las ruidosas perforadoras de tarjetas la IBM 3741 grababa directamente en *diskettes* de 8 pulgadas junto con los periféricos correspondientes en sus sistemas mayores, que podían cargar con docenas de *diskettes* insertándolos individualmente en el lector.

<figure>
  <a 
    title="Museo de Informática, CC BY-SA 2.0 &lt;https://creativecommons.org/licenses/by-sa/2.0&gt;, via Wikimedia Commons" 
    href="https://commons.wikimedia.org/wiki/File:IBM_3741_Data_Station_(1).jpg"
  >
    <img alt="IBM 3741 Data Station" src="assets/img/IBM_3741_Data_Station.jpg">
  </a>
  <figcaption>Grabadora / verificadora de datos IBM 3741</figcaption>
</figure>

Este formato se hizo muy popular aunque, en principio, tenía menos capacidad de almacenamiento en cada *floppy* que en un casete, pero era mucho más flexible y rápidos.  Con el tiempo, además, los *diskettes* fueron aumentando de capacidad, igualándose con los casetes, y reduciéndose en tamaño: 5 ¼ pulgadas y, finalmente, 3 ½ pulgadas.

Aquí cabe revelar un secreto, Olivetti no había diseñado la DE-500, la vendía y creo que la fabricaba bajo licencia de Sycor, una empresa de Ann Harbor, MI, en los EEUU.   Para Sycor, era la DE-340.  Ante el auge del *diskette*, diseñaron la DE-350 que en lugar de casetes disponía de una unidad doble de *diskettes* de 8 pulgadas.  Era, básicamente, la misma máquina, con un nuevo diseño, con algo más de memoria interna.

<figure>
  <img src="assets/img/sycor_de_3xx.png" title="Sycor 340/350" />
  <figcaption>Composición fotográfica de los modelos 350 (arriba) y 340 (abajo) de un folleto de Sycor</figcaption>
</figure>