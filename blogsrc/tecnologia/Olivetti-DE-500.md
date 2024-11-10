---
title: "Olivetti DE-5xx / Sycor DE-3xx"
date: "2024-11-07"
categories: ["Tecnología/Fracasos","Historia/Informática"]
language: "es-ES"
---
Cómo Olivetti vendió promesas y perdió un mercado.

---

Estaba estudiando todavía en la universidad y conseguí un trabajo de media jornada en un taller de reparación de equipos de computación electrónica que Olivetti tenía en Colegiales.  Comencé en un taller de reparación de calculadoras electrónicas, que fue mi primer trabajo asalariado y que describí en [otro artículo](2021/10/07/my-first-and-proudest-day-on-the-job.html) (en inglés). Mi jefe allí me habrá visto alguna aptitud y me ofreció trabajar en el taller de Colegiales donde atendían los equipos más complejos.  

Allí es donde conocí la DE-500, la primera computadora que tuve oportunidad de destripar pues, en definitiva, ese era mi trabajo, abrirlas para arreglarlas.

<figure>
  <img src="assets/img/Olivetti_DE-523.jpeg" alt="Olivetti DE 500" /> 
  <figcaption>Olivetti DE-500.  La pantalla, pequeña, arriba a la izquierda, y dos *caseteras* a la derecha.  El fuste contenía el grueso de la electrónica. Abajo, el teclado estándar más múltiples teclas de función.  El grueso cable de alimentación asoma por detrás.</figcaption>
</figure>

Esta es una máquina anterior a los microprocesadores.  Nada de i8080, M6502 o Z80, la CPU eran un par de ALUs (Unidad Aritmética-Lógica, en inglés) [74181](https://en.wikipedia.org/wiki/74181) con toda la circuitería adicional para convertirla en un procesador completo, abarcando 2 ó 3 placas llenas de chips.

No tenía demasiada memoria para los estándares actuales, a lo sumo 16kB, pero era bastante para la época.  Una vez llegó al taller un modelo bastante viejo que tenía [memoria de núcleos de ferrita](https://es.wikipedia.org/wiki/Memoria_de_n%C3%BAcleos_magn%C3%A9ticos), esas donde unas anillas de  ferrita del tamaño de semillas de amapola van tejidas, usualmente a mano, formando bandejas que luego se apilan y, si mal no me acuerdo, esa máquina tenía apenas 4kB.

Tampoco tenía discos ni rígidos ni flexibles, nada.  Su único almacenamiento, para programas y para datos, era a través de una o dos unidades de casete digital, que no hay que confundirlo con las primeras computadoras de hogar como la [Sinclair ZX Spectrum](https://es.wikipedia.org/wiki/Sinclair_ZX_Spectrum) que se podían conectar a un grabador de audio corriente.  La cinta que tenían estos casetes digitales era de un material distinto del habitual y estaba pensada para almacenar información digital, no analógica y, si bien físicamente se podían insertar y usar en un grabador de audio, distorsionaba mucho.  A la inversa, si se usaba un casete de audio en la DE-500, se perdían bits y los datos salían aparentemente bien, pero tenían baches donde los bits estaban cambiados y salía cualquier cosa.

Esta máquina estaba diseñada fundamentalmente para el ingreso de datos, reemplazando las antiguas perforadoras de tarjetas como las viejas IBM 029, similar a aquella en la que perforé mi primer programa en Fortran:

<figure>
  <a 
    title="waelder, CC BY-SA 3.0 &lt;http://creativecommons.org/licenses/by-sa/3.0/&gt;, via Wikimedia Commons" 
    href="https://commons.wikimedia.org/wiki/File:IBM_card_punch_029.JPG"
  >
    <img alt="IBM card punch 029" src="assets/img/800px-IBM_card_punch_029.jpeg">
  </a>
  <figcaption>Una perforadora de tarjetas IBM 029.</figcaption>
</figure>

La funcionalidad de grabación o verificación de registros estaba integrada fija en memoria ROM y se activaba con las teclas de función, que también permitían seleccionar *casetera*, rebobinar, grabar, verificar, borrar, copiar y demás operaciones básicas.

Cada casete digital podía contener el equivalente de varios miles de tarjetas ocupando así menos espacio (los depósitos conteniendo estanterías llenas cajas y más cajas de tarjetas eran un problema para las empresas), mucho más rápidos de leer en el computador central a que iban destinados y, además, el casete se podía reutilizar, mientras las tarjetas eran de un solo uso.

No todos los centros de cómputos tenían lectora de casetes digitales por lo que existía la opción de conectar una unidad de cinta magnética estándar que podía ser usada en cualquier gran centro de cómputos.  Esta unidad externa era relativamente pequeña, del tamaño de un horno de microondas, pero cara, y muchas veces se tenía una única unidad de cinta conectada a una máquina que se usaba para transferir los datos de los casetes del resto de las máquinas a una única cinta que se enviaba al centro de cómputos.

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

Cada lote de talones se grababa (o perforaba) primero y luego se verificaba.  Para verificarlo una segunda operadora volvía a ingresar los mismos datos y la máquina, en modo de verificación, lo comparaba con lo grabado.  Aunque pareciera que es más trabajo, la velocidad y precisión conque podían teclear era tal que esto era más eficiente que si lo leyeran y compararan visualmente.  Si la verificación fallaba se borraba el registro (o se tiraba la tarjeta) y el talón original, el que había sido mal grabado, se ponía en otra pila para volver a procesar.

Este mismo proceso de perforar y verificar tarjetas, o hacerlo con casetes, era el primer paso de prácticamente todo sistema informático de aquel entonces.  Ya fueran las planillas de los cajeros de las sucursales bancarias, las listas de entrada y salida de personal, la recepción de mercadería o el despacho de pedidos, todos los datos llegaban al centro de cómputos después de haber pasado por los ágiles dedos de estas damas. El procesamiento **digital** comenzaba con ellas.

Mientras que las perforadoras de tarjetas eran tan grandes que venían integradas dentro de su propio escritorio la DE-500 era del tamaño de las viejas PCs y se podía poner en cualquier lado.

La DE-500 no estaba limitada al ingreso de datos.  Era una máquina totalmente programable y, dentro de sus limitaciones en memoria y almacenamiento, podría afrontar cualquier tarea.  Era, en definitiva, una versión de mesa de aquellas primeras computadoras comerciales de los 50 que costaban fortunas y ocupaban salas enteras.

Las destinadas a ingreso de datos, se configuraban con un mínimo de memoria y una sola *casetera* pero si iban a hacer trabajos contables, se les ponía el máximo de memoria y doble *casetera*, trabajando al viejo estilo, por ejemplo, con un casete conteniendo una copia del inventario más reciente (que se conserva como resguardo), el *maestro*, en una *casetera* y en la otra los entradas y salidas de mercaderías, los *movimientos*, ambas ordenadas por el código del artículo.  Se lee un artículo del maestro, y se leen los movimientos que hubiera habido de ese artículo y, si los hubiera habido, se regraba la correspondiente entrada en el maestro con la nueva cantidad (por eso se trabaja sobre una copia, por si algo fallara).  Esa era otra de las virtudes de las *caseteras* digitales, la posibilidad de regrabar in-situ.

Esto requiere que ambos casetes estuvieran ordenados por código de artículo, lo que en la jerga se llama *sort*.  Este era un paso previo que se hacía con un programa estándar del sistema. Tardaba bastante, dependiendo de cuánta memoria interna tuviera la máquina, pero era algo habitual en cualquier sistema informático de la época.

Mejor aún que andar haciendo malabares con sólo dos casetes, que son medios de almacenamiento secuencial, es ofrecer un medio de almacenamiento de acceso directo, como son los *floppies*,  *diskettes* (o "disquetes", como recomienda la Real Academia).  Ya para esa época, IBM mismo había pasado del uso de tarjetas perforadas usando los *diskettes* de 8 pulgadas.

En lugar de las ruidosas perforadoras de tarjetas, la IBM 3741 grababa directamente en *diskettes* de 8 pulgadas. También había unidades lectoras de *diskettes* para los sistemas mayores que podían cargar con docenas de *diskettes* de una vez insertándolos automáticamente de uno en uno en el lector.

<figure>
  <a 
    title="Museo de Informática, CC BY-SA 2.0 &lt;https://creativecommons.org/licenses/by-sa/2.0&gt;, via Wikimedia Commons" 
    href="https://commons.wikimedia.org/wiki/File:IBM_3741_Data_Station_(1).jpg"
  >
    <img alt="IBM 3741 Data Station" src="assets/img/IBM_3741_Data_Station.jpg">
  </a>
  <figcaption>Grabadora / verificadora de datos IBM 3741</figcaption>
</figure>

Este formato se hizo muy popular aunque, en principio, tenía menos capacidad de almacenamiento en cada *floppy* que en un casete, pero era mucho más flexible y rápido.  Con el tiempo, además, los *diskettes* fueron aumentando de capacidad, igualándose con los casetes, y reduciéndose en tamaño: 5 ¼ pulgadas y, finalmente, 3 ½ pulgadas.

Aquí cabe revelar un secreto, Olivetti no había diseñado la DE-500, la vendía y creo que la fabricaba en Europa bajo licencia de Sycor, una empresa de Ann Harbor, MI, en los EE.UU..   Para Sycor era el modelo DE-340.  Ante el auge del *diskette*, diseñaron la DE-350 que en lugar de casetes disponía de una unidad doble de *diskettes* de 8 pulgadas.  Era, básicamente, la misma máquina, con un nuevo diseño, y la posibilidad de tener algo más de memoria interna.

<figure>
  <img src="assets/img/sycor_de_3xx.png" title="Sycor 340/350" />
  <figcaption>Composición fotográfica de los modelos 350 (arriba) y 340 (abajo) de un folleto de Sycor</figcaption>
</figure>

Una cosa curiosa de la DE-350 es que la *diskettera* era una unidad doble con un único motor para girar ambos *diskettes* y otro motor para posicionar ambos cabezales de lectura/grabación. O sea, no existía una configuración con una única *diskettera*.  Al no poder operar independientemente en ambas unidades, dado que los dos cabezales se desplazaban a la par, podía llegar a ser más lenta que dos unidades totalmente independientes, pero en operación normal, para ingresar datos, no era relevante.  Sí era más lenta de lo que podría haber sido al ejecutar programas contables o administrativos, pero aún así era más rápida que la DE-340 con sus casetes.

Olivetti también tuvo que reaccionar a la creciente popularidad del *diskette* y diseñaron una unidad externa de *diskettes* que se conectaba con una placa de expansión dentro mismo de la DE-500.   No recuerdo haberlas visto en Argentina, pues para ese entonces ya no trabajaba en Olivetti, pero sí las vi en las sucursales del Banco de la República Oriental del Uruguay.   El conjunto constaba de un escritorio con la DE-500 a la izquierda, una impresora a la derecha y el gabinete conteniendo las dos unidades de *diskette* colgando debajo del escritorio, bajo la impresora formando un conjunto muy compacto, práctico y bastante elegante.

El gran plan de Olivetti era desarrollar su propia máquina para reemplazar la DE-500, que llamaron la DE-700 que iba a ser fantástica.  Estaban tan convencidos de las virtudes de su futuro diseño que la sacaron a la venta antes de tenerla lista.  Los vendedores de Olivetti que manejaban esta línea de productos empezaron a promocionarla como una maravilla y, el gran error, comenzaron a hablar mal de la vieja y fiel DE-500, para tratar de convencer a los clientes de cambiarla.

El caso es que la DE-700, hasta donde yo sé, nunca se vendió en grandes cantidades.  Se decía, aunque no tengo ninguna constancia de que así fuera, que un banco importante que había puesto una orden por varias docenas, recibió una de las primeras unidades que entraron al país y que, en la época en que corría este rumor, estaba encerrada en un cubículo precintado porque le estaban haciendo juicio a Olivetti para anular el contrato por lo mala que era la dichosa máquina, pues no cumplía en absoluto con las especificaciones que les habían prometido y fallaba con frecuencia.

A todo esto, Olivetti no podía decir "nos equivocamos, la DE-700 no funciona. ¿No quieren más DE-500?" pues habiendo hablado pestes de ella ahora no podían decir que, a fin de cuentas, no era tan mala como ellos mismos habían dicho insistentemente durante tantos meses. 

Esto cerró el capítulo de la informática en Olivetti de Argentina.  

El personal de Olivetti de esa área, visto que el futuro en Olivetti se veía negro, crearon una empresa nueva que, gracias a que tenían contactos con Sycor de los EE.UU., el fabricante original de las máquinas, pudieron negociar la representación de la firma y ganaron los contratos de mantenimiento y renovación de las DE-500, o sea, las DE-340 de Sycor, por la DE-350, la de doble *diskettera* y, más adelante, la Sycor 445, de la que hablé en [otro artículo](2021/11/06/eight-users-working-from-a-single-i8080-processor.html) (en inglés) una máquina excepcional para la época.

Olivetti había sido pionera en el área informática, ofreciendo desde grandes computadoras (un negocio que luego vendió a General Electric) hasta la primera computadora programable de escritorio, la [Programma 101](https://es.wikipedia.org/wiki/Programma_101).

Fue una pena que perdiera así un mercado en el que ya contaba con una importante clientela. La mayoría de las sucursales bancarias del país tenían maquinas de escribir, calculadoras y terminales de caja o, como en el caso del Banco de la ROU, sistemas DE-500 completos.   Podrían haber continuado la relación con Sycor ofreciendo los nuevos productos. Podrían al menos haberse abstenido de vender lo que todavía no tenían o machacar con la obsolescencia de la DE-500 con la intención de inducir el cambio de modelo pero, al final, se quedaron totalmente fuera.  La DE-500, ya como DE-340 siguió funcionando y los sucesivos modelos de Sycor, al menos hasta la llegada de la IBM PC, fueron bastante exitosos.