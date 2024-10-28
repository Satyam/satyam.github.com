---
title: "Lotus vs. Excel Novell NetWare vs. Windows NT"
date: "2024-10-26"
categories: ["Tecnología/Fracasos","Historia/Informática"]
language: "es-ES"
draft: true
---
Cómo Lotus perdió la carrera de las hojas de cálculo.

---
Este mes se cumplen 40 años del lanzamiento de Microsoft Excel, uno de esas marcas que definen una categoría de productos, como quien dice *kleenex* o usamos *goolear* como verbo.  Pocos recuerdan que hace 40 años no se decía "una planilla de Excel" sino "una planilla de Lotus" mucho menos que hubiera una empresa que se llamaba Lotus Software.

La hoja o panilla de cálculo fue el producto que afianzó al menos un par de hitos de la computación.  La primer hoja de cálculo llamada VisiCalc por *visual calculator* fue el programa que permitió a la Apple II entrar en la oficina.  Hasta entonces había sido una computadora para aficionados de la electrónica y la computación, como plataforma para juegos electrónicos y comenzaba a ser promovida en el ámbito de la enseñanza, pero todavía no tenía un lugar claro en la empresa.

Fue VisiCalc, el primer programa de hoja de cálculo del mundo, el que llevo la Apple II incluso hasta los bancos, como explicara en otro [artículo](2024/10/16/la-ibm-pc-y-la-ps2-en-la-argentina.html).

Fueron también dos de los productos básicos de software de oficinas, el procesador de texto, en su momento WordStar o WordPerfect y las hojas de cálculo, SuperCalc o MultiPlan, las que aseguraron la entrada de la IBM PC en las oficinas.  En realidad estos programas ya existían de antes de la PC, habían nacido con las computadoras con procesador Z-80 de 8 bits bajo el sistema operativo CP/M y todas ellas fueron convertidas para funcionar en máquinas IBM PC o compatibles usando MS-DOS o PC-DOS.

Todas ellas funcionaban en pantalla de texto de 24 ó 25 líneas de 80 caracteres cada una.  No existía todavía la interfaz gráfica o el mouse, ni en las PC ni en las Apple. De hecho, en las computadoras de 8 bits como no estaban normalizados los teclados, no siempre había teclas de cursor en cuyo caso habitualmente se usaba la tecla `Ctrl` junto con las teclas `E`, `X`, `S` y `D` que forman una suerte de rombo que insinúa la dirección a que apuntan.

Los procesadores de texto no podían mostrar los distintos tipos de letras que permitían las impresoras.  Por ejemplo, en Wordstar el texto "Así se veía un texto en **negritas**." en pantalla se mostraba "`As´^Hi se ve´^Hia un texto en ^Bnegritas^B`" pues los caracteres `^B` cambiaban el *modo normal* a *modo negritas* y el `^H` permitía la sobre-impresión del caracter que le sucede sobre el que le precede, logrando así sobreimprimir una tilde `´` sobre la `i`.  Y todo se veía con el tipo de fuente que ofreciera la pantalla, sin importar como se fuera a imprimir.

Las hojas de cálculo la tenían más fácil dado que básicamente muestran tablas de números y su aspecto poco importaba. Por otra parte, la capacidad de rehacer los cálculos de una planilla de gran tamaño y la disponibilidad de funciones para operar sobre los datos, más allá de las operaciones aritméticas habituales si son importantes y eso requiere bastante capacidad de procesamiento.

Las primeras IBM PC no eran un cambio tan radical en rendimiento, las mejores máquinas de 8 bits solían ser más veloces. Pero, mientras que estas últimas ya rozaban el límite de sus posibilidades, por ejemplo, la capacidad máxima de 64kB de memoria, las PCs tenían un enorme potencial de crecimiento, 10 veces la capacidad de memoria y más velocidad de procesador, que era el primero de una larga familia que llega hasta el día de hoy.

Y aunque las primeras PCs permitían agregar memoria hasta el límite de 640kB, *kilo* bytes, no *mega* ni *giga* bytes, esto era caro en las primeras épocas, así que el límite estaba bastante por encima de lo que los compradores podrían pagar o las aplicaciones usar.

Lotus 1-2-3 fue la primera hoja de cálculo diseñada expresamente para la IBM PC, a diferencia de las existentes hasta entonces que venían del mundo de los procesadores de 8 bits, VisiCalc de la Apple II y SuperCalc y MultiPlan para CP/M.  Por ello era capaz de utilizar toda la memoria disponible en el sistema y con ello podía integrar otras funcionalidades,

1. Hoja de cálculo con una amplia variedad de funciones complejas
2. Funciones de bases de datos (*sort*, búsqueda por clave, operaciones por lotes)
3. Gráficos (de barras, líneas o de torta)

De allí el "1-2-3" en el nombre. Vale la pena recordar que no todas las PC contaban con placa de vídeo gráfica, las interfaces gráficas como Windows no existían aún, con lo que las funciones de gráficos no podían usarse en todas las máquinas.  

Lotus 1-2-3 se convirtió en el rey de las hojas de cálculo al punto que era habitual referirse a una hoja de cálculo como "*Una planilla de Lotus*".

Lotus Software había programado el Lotus 1-2-3 en assembler, o sea, prácticamente código de máquina, para el procesador de la PC, el 8088, y aprovechaba al máximo todos los trucos conocidos tanto del hardware de la PC (p.ej, para el uso de gráficos) o del MS-DOS para mejorar el rendimientos del programa. Esto lo hacía incompatible con cualquier otro sistema.  En Apple no podía competir con VisiCalc, así que poco importaba.

Cuando finalmente surgieron las interfaces gráficas con la Macintosh de Apple o el Windows de Microsoft, Lotus se vió forzada a independizar su software del hardware de la PC y del MS-DOS. Eso implicaba reescribir todo el producto en un lenguaje de programación que fuera fácil de transportar entre máquinas y eliminar todos los trucos que habían explotado en busca de la eficiencia. 

La versión 3 del Lotus 1-2-3 iba a funcionar tanto en PC con MS-DOS o Windows y también en Macintosh.  Vale la pena recordar que originalmente Windows era un programa, no un sistema operativo.  La PC arrancaba con MS-DOS y, si se quería, se podía ejecutar Windows como un programa más.  Esto quiere decir que se podía seguir usando Lotus en una PC con Windows, pero fuera de Windows.

Lotus no supo en lo que se metía.  La total re-escritura del programa se demoraba más y más. Terminó durando más de un año por encima de lo estimado.  Mientras tanto, los usuarios de la versión anterior seguían necesitando soporte, resolución de *bugs*, gestores de nuevas placas gráficas que iban apareciendo en el mercado.  Todo esto consumía recursos internos y creaba malestar entre los clientes que esperaban contar con la prometida versión 3 tan mejorada, pero que seguía sin llegar.  

Cuando finalmente pudieron lanzar al mercado una primera versión, era lenta y usaba muchísima memoria, tanto es así que no funcionaba en muchas máquinas. Estamos hablando no de usuarios individuales sino de grandes empresas con cientos o miles de PCs, todas ellas con Lotus 1-2-3 que, si querían usar la versión 3 habrían tenido que renovar prácticamente todo su parque de PCs, un costo enorme. Para aplacar a estos usuarios frustrados tuvieron que lanzar una versión del viejo software con algunas de las mejoras de la versión 3, con lo que terminaron con el doble de la estructura de soporte al tener que brindar apoyo a dos versiones al mismo tiempo.

Con la aparición de Windows, Microsoft decidió, sobre la base de MultiPlan, lanzar una nueva hoja de cálculo para sacar provecho de la interfaz gráfica de Windows como así también la de la Macintosh de Apple.   Ese producto se convirtió en el Excel que conocemos hoy en día.   

Mientras Lotus seguía penando con su Lotus 1-2-3 versión 3, Excel iba ganando mercado y agregando funcionalidad, por ejemplo, se podía programar con Visual Basic. Mientras para usar Lotus había que salir de Windows, Excel funcionaba dentro de Windows. 

Tiempo después Microsoft lanzó su paquete de oficina, Microsoft Office, que incluía Excel, un procesador de textos Office, editor de presentaciones PowerPoint, base de datos Access y algunas otras cosas más que no me acuerdo.  El éxito de este paquete de aplicaciones hizo que Microsoft ya no vendiera separadamente las aplicaciones que lo formaban.  

Lotus, en cambio, no tenía un paquete integrado que ofrecer, pero no era el único.  WordPerfect era un excelente procesador de textos con un noble linaje que se remontaba a la época de el CP/M de 8 bits. AMI tenía un procesador de textos muy popular el AMI Pro.  Lotus incorporó una cantidad de productos de diversas empresas existentes, incluido el AMI Pro, formando el Lotus Smartsuite.  WordPerfect lanzo el WordPerfect Works y así tantos otros.

Era prácticamente imposible uniformar el aspecto y la operatoria de estos programas que habían sido diseñados para una interfaz de texto.  El estilo era diferente entre ellas.  En todas ellas, tanto los menúes como los íconos, si los había, eran atajos a los comandos de texto de siempre.  Tampoco había uniformidad en los iconos, en tamaño o uso de colores.   Y no porque Microsoft escatimara información sobre los principios de diseño de una interfaz gráfica, aspecto, colores, tamaños, cómo se esperaba que el usuario interactuara con ellos.  Todo estaba en un manual que costaba lo que un libro cualquiera pues, en la época pre-internet no existían la documentación en la red, y realmente había que pagar por el coste del papel y la distribución y la ganancia del librero.  Yo usaba ese manual, que venía incluido en el paquete de desarrollo de Visual Basic, y así podía programar aplicaciones que realmente se veían como aplicaciones de Windows.  No fue el caso 

