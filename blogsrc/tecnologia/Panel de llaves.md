---
title: "Panel de llaves"
date: "2025-11-03"
categories: ["Historia/Informática"]
language: "es-ES"
---
Cómo se arrancaban esos grandes computadores de antaño

---

Estamos acostumbrados a interactuar con el computador a través de una pantalla, táctil o no, acompañada posiblemente de un teclado y un ratón.  Las grandes máquinas de antaño, los *mainframes* y las *minicomputadoras* medianas en ocasiones no tenían ni lo uno ni lo otro.  Sí tenían esos grandes paneles de luces y llaves que llamaban mucho la atención en las películas de ciencia ficción de otra época.   Si bien los más grandes podían tener varias hileras de luces y llaves o diales, aún las más reducidas tenían llaves y luces como estas:

<figure>
  <a 
    title="Digital_PDP11-IMG_1498.jpg: Rama &amp; Musée Bolo derivative work: Morn, CC BY-SA 2.0 FR &lt;https://creativecommons.org/licenses/by-sa/2.0/fr/deed.en&gt;, via Wikimedia Commons" 
    href="https://commons.wikimedia.org/wiki/File:Digital_PDP11-IMG_1498_cropped.jpg">
    <img alt="Digital PDP-11" src="assets/img/1024px-Digital_PDP11-IMG_1498_cropped.jpg">
  </a>
  <figcaption>Panel de control de una PDP-11 de Digital Equipment Corporation</figcaption>
</figure>

Este panel se usaba habitualmente para iniciar la máquina.  Es el único dispositivo de entrada/salida que el ordenador tiene para interactuar con el operador directamente, sin contar con periféricos adicionales.  Hay paneles más o menos complejos. Tras las dos bandas de colores del medio, arriba de las llaves, hay luces.  Se aprecia que los tonos de claros y oscuros se corresponden con el grupo principal de llaves numeradas, y que forman grupos de a tres.  En esa época, para representar números binarios en forma compacta se usaba el octal, o sea, 8 dígitos, del 0 a 7, que usan 3 bits, resultando en 8 combinaciones 2³ == 8.  Actualmente es más frecuente el uso de hexadecimal, o sea, 16 símbolos, del 0 al 9 y las letras de la A a la F, que representan 4 bits. 

| Decimal | Octal | Hexadecimal |
| ------: | ----: | ----------: |
|       0 |     0 |           0 |
|       1 |     1 |           1 |
|       2 |     2 |           2 |
|       3 |     3 |           3 |
|       4 |     4 |           4 |
|       5 |     5 |           5 |
|       6 |     6 |           6 |
|       7 |     7 |           7 |
|       8 |    10 |           8 |
|       9 |    11 |           9 |
|      10 |    12 |           A |
|      11 |    13 |           B |
|      12 |    14 |           C |
|      13 |    15 |           D |
|      14 |    16 |           E |
|      15 |    17 |           F |
|      16 |    20 |          10 |

Hay algo que hoy damos por descontado y es que tanto los datos como las direcciones de memoria de los ordenadores van en potencias de 2 a partir de 8, por ejemplo: 8, 16, 32, 64.  Pero eso no era así en aquel entonces, cada modelo de cada fabricante tenía su ancho de palabra que podían ser anchos inusuales hoy en día como 24 ó 36 o, como se ve en la linea de luces superior, y en las llaves, 18.   Al normalizarse el ancho de palabra en potencias de 2, el uso de hexadecimal resulta más conveniente al representar valores que son potencia de 2.  No es el caso del octal, como se puede apreciar en la segunda fila de luces, justo arriba de las llaves, que representa 16 bits agrupados en 5 dígitos octales completos con un bit extra suelto a la izquierda, esto es (3 * 5) + 1 == 16.   Claro, si el ordenador usa 18, 24 ó 36 que son múltiplos enteros de 3, el octal va como anillo al dedo, pero con 8, 16 ó 32 es un lío, siempre quedan bits sueltos.

Debemos considerar que los primeros ordenadores estaban diseñados principalmente para hacer cálculos numéricos donde, cuantos más bits se usen, mejor precisión se obtendrá en el resultado.  Así es como los primeros co-procesadores de punto flotante (FPU) para ordenadores de escritorio, el i8087 de Intel para la CPU i8086 (de 16 bits de ancho de palabra) o el 68881 de Motorola para las CPUs 68020 (16 bits) y 68030 (32 bits) ofrecían 80 bits, varias veces lo que sus correspondientes CPUs.   Estos co-procesadores fueron luego integrados dentro de la misma CPU pero, en la época de las CPUs mencionadas, eran opcionales por una cuestión de coste, las FPU costaban varias veces lo que las CPUs.

El uso de anchos de palabra potencias de 2 o, visto desde otro punto de vista, múltiplos de 8 es gracias a IBM cuyos clientes querían también representar texto.  No estamos hablando todavía de programas de procesamiento de texto.  Simplemente querían imprimir una factura con nombres, direcciones, descripciones, comentarios o cualquier otro texto que hace al papeleo habitual de una empresa. IBM fue la primera en ofrecer ordenadores (familia [IBM System/360](https://en.wikipedia.org/wiki/IBM_System/360) ) que podían segmentar los amplísimos registros de datos en grupos de a 8 bits que permitían representar letras y símbolos además de números.  Por ello, el [EBCDIC](https://es.wikipedia.org/wiki/EBCDIC) que, a diferencia del [ASCII](https://en.wikipedia.org/wiki/ASCII), que usa solo 7 bits y no contempla caracteres de otros idiomas fuera del inglés, al usar 8 bits le permitía atender las necesidades de todos los idiomas que usaran sus clientes en sus respectivos países.

Tenía, además, otro truco bajo la manga.  El acrónimo EBCDIC (se pronuncia *ebcidic*) significa Extended BCD Interchange Code (código de intercambio BCD extendido) donde, a su vez, BCD significa Binary Coded Decimal (codificación en binario de dígitos decimales), un código usado puramente para representar dígitos decimales usando 4 bits.  Es lo que aún usan las calculadoras actualmente.  El EBCDIC es la *Extensión* de esa codificación numérica para representar letras y la IBM/360 tenía también instrucciones para operar en BCD, agrupando dos dígitos decimales, de 4 bits cada uno, por byte.  Esto es muy útil para usos contables donde el redondeo de los números en punto flotante producen resultados inesperados.  El BCD es perfectamente predecible pues opera en dígitos decimales, no se pierde nada en la conversión de binario a decimal.

----

Ya hemos visto por qué el peculiar agrupamiento de las llaves en grupos de 3 pero no hemos dicho para qué servían.  Cotidianamente se usaban para el arranque de la máquina.  Actualmente estamos acostumbrados a que el BIOS de nuestro ordenador arranque automáticamente con la configuración que hubiéramos seleccionado.  En aquella época, no existía el BIOS por dos buenas razones, a) no había chips de memoria ROM de suficiente capacidad y b) no existía la memoria *flash* donde guardar la configuración.  Al configurar cada *mainframe* o *mini* con su gran variedad de periféricos disponibles, nada de esto quedaba registrado en la CPU. El único y muy breve programa que tenía la CPU era el IPL o *Initial Program Load* (carga inicial del programa), un brevísimo programa que consultaba las llaves para obtener el código numérico del periférico que contenía lo que ahora llamamos el *bootstrap* que luego cargaría el sistema operativo. 

El operador, al encender el equipo, debía indicar el código de la lectora de tarjetas, cinta de papel perforada, cinta magnética o unidad de disco donde había puesto las tarjetas o cinta de donde cargar el sistema operativo. Era normal que los gabinetes de estos dispositivos tuvieran adhesivos con los números que les correspondían. En este proceso de carga, el programa también podría pedir al operador ingresar múltiples opciones, por ejemplo, cargar y ejecutar uno o más diagnósticos o entrar en modo paso a paso o cargar alguno de entre varios sistemas operativos. 

En equipos de uso industrial, donde el ordenador controlaba directamente una máquina industrial, el medio principal de interacción con el sistema eran esas llaves y luces.

Obviamente, aquellos *mainframes* no tenían Windows, MacOS o Linux, tenían sus propios sistemas operativos y, muchas veces, ofrecían varios.  Habitualmente había dos familias principales de sistemas operativos, uno para procesar *batch* y otro *interactivo*.

En los sistemas *interactivos* es donde el *mainframe* atiende a múltiples terminales locales o remotas (esto es, pantallas y teclados o teletipos) que le permite a varios usuarios interactuar (de allí el nombre) directamente con el sistema. Por ejemplo, las terminales de caja en el mostrador de un banco.

El procesamiento *batch* o *por lotes* se hacía sin interacción de usuarios.  El 100% de la CPU se dedicaba a uno o más procesos *batch* para permitir la actualización masiva de los datos de la empresa sin distracciones.

Por ejemplo, un banco cerraba sus sucursales a las 15hs.  De allí hasta las 18hs los empleados tenían la oportunidad de ingresar todo lo que les hubiera quedado pendiente del día y, finalmente, si la sucursal no estaba conectada, generar los diskettes o cintas con las operaciones del día pues a las, digamos, 18hs, pasaba la camioneta para recoger la cinta y llevarla, de alguna manera, a la central.  A las 18hs, se apagaba el *interactivo*; era el *piedra libre* del juego.

Si las sucursales tenían conexión directa con el centro de cómputo principal, en ese mismo instante se podía cargar el sistema operativo *batch* para comenzar a procesar todos los movimientos.  Si había sucursales sin conexión, había que esperar la llegada de los diskettes o cintas con la información.   En ese caso, ese momento de pausa lo aprovechaban para compilar y/o probar los programas que habían presentado los programadores.  Eso explica por qué en esa época era usual que los programadores trabajaran hasta tarde pues era el único momento en que podían compilar o probar sus programas. La compilación habitualmente generaba un listado que, si contenía errores, el programador podía corregir en el momento (perforando nuevas tarjetas con las correcciones o editando la cinta perforada) y, con suerte, conseguir otra compilación o prueba esa misma noche, antes del *batch* o en la madrugada, después del *batch* y antes de reiniciar el *interactivo*.  En este último caso el programador simplemente dejaba sus correcciones en la bandeja de entrada del centro de cómputos y vería los resultados al día siguiente.

En el *batch* es cuando, por ejemplo, se actualizaban los saldos de los clientes y también cuando se generaban los diskettes y/o cintas para las sucursales que no estuvieran conectadas, y se imprimían resmas y resmas de papel, al menos una para cada sucursal, aún las que tuvieran conexión con el *interactivo* por si se caía la conexión o el sistema.

Cuando todo este volumen de papel, cintas, diskettes o lo que fuera estaba listo, se despachaba en camioneta a cada una de las sucursales para que estuviera disponible al arrancar el día.

Los memoriosos recordarán la época en que las operaciones bancarias estaban bastante restringidas. Esta forma de operar el *batch* nocturno es la razón para ello. No se podía retirar efectivo o cobrar un cheque sino en la sucursal de la cuenta, simplemente porque era la única que tenía el listado con los saldos de las cuentas al día.  No se podía saber si un pago había sido hecho sino hasta al día siguiente porque esa actualización se hacía en el *batch* durante la noche y no estaba disponible en el momento.

----

Volviendo al tema de las llaves y las luces, algunos sistemas en lugar de llaves que representaban 1 bit cada una, agrupadas de a 3, usaban diales con números en el contorno.  Cuestión de gustos, todo dependía del fabricante.  En ocasiones se podía alterar alguna posición de memoria del sistema mediante estas llaves, escribir un programa completo con estas llaves, una labor más que ingrata.  Algunos sistemas tenían más llaves y luces para funciones especiales como el grupo de llaves y luces en el lado derecho de la imagen superior.

Otra función de las luces era ver si el sistema se había *colgado*, o sea, si había entrado en un *loop* infinito.  Habitualmente las luces parpadeaban y cambiaban de intensidad de manera prácticamente aleatoria, al menos para la percepción del operador.  Si las luces se congelaban en un patrón fijo, es que estaba repitiendo siempre lo mismo, confirmación de que se había *colgado*.   Esto podía ocurrir de manera intencional.  Si el sistema operativo detectaba un error tan grave que podría no ser capaz de mostrar o imprimir un mensaje en la consola del operador (si la había), siempre podía mostrar un código numérico de error en las luces, a las cuales siempre tenía acceso.

Finalmente, los sistemas más grandes tenían luces que no estaban en absoluto relacionadas con la computación.  Cosas tan triviales como alertas de temperatura, fluctuaciones de tensión o tantas otras cosas asociadas al funcionamiento de una máquina que podía llegar a ser bastante grande. Algo así como la alerta de presión de aceite en el tablero de un automóvil.


