---
title: "Novell NetWare vs. Windows NT"
date: "2024-10-19"
categories: ["Tecnología/Fracasos","Historia/Informática"]
language: "es-ES"
---
Cómo Novell cedió el mercado de los servidores de redes locales a Microsoft.

---

Las empresas iban apreciando la utilidad de las computadoras personales y seguían sumando PCs en sus oficinas para las más diversas tareas.  En principio este crecimiento era un poco caótico. Las sucesivas máquinas tenían distinta configuración. No todas tenían impresora. De aquellas que tenían, la mayoría tenía la popular Epson FX-80 de matriz de puntos que era confiable y económica, pero era una impresora personal, no tenía gran velocidad de impresión.  Si se quería hacer un gran listado, un gran número de documentos o multicopia (con carbónico), p.ej. facturas, liquidación de sueldos o pedidos, tardaba horrores, se necesitaba una impresora de línea, más rápida y robusta, como las populares Printronix.  Para imprimir correspondencia de calidad, se compraba una Diablo 630 de Xerox o la Selectric de IBM (obviamente mucho más cara). Las impresoras laser todavía no existían en aquella época.

Los discos tenían distintas capacidades.  Algunas se quedaban cortas de espacio, otras eran lentas.  Los documentos se copiaban de una a otra, siempre había múltiples copias del mismo archivo en varias máquinas, nadie sabía cuál era la última versión de nada. Cada usuario era, de alguna manera (en general malamente), responsable de hacer sus copias de resguardo lo cual incrementaba el riesgo de pérdida de información.  Los diskettes se apilaban con copias más o menos fiables de los datos de toda la empresa. 

La gente iba de una máquina a otra con diskettes para compartir información o para que le imprimieran algo porque no tenía impresora, o la que tenía se había quedado sin tinta, o lo que fuera.  Y esos diskettes se mezclaban con las copias de resguardo.  Y las cosas se perdían.

Era necesario poner orden.

La red de área local o LAN, por sus siglas en inglés, permitía superar muchos de estos problemas.  Con un servidor central al cual se conectaban todas las PCs, todos los usuarios podían disponer de espacio de disco compartido e impresoras de diversos tipos accesibles a todos.  El servidor de red era el lugar designado para tener todos los archivos compartidos de la empresa, con un responsable de hacer las copias de seguridad necesarias.

Cuando se agregaba una PC ya no era necesario que tuviera mucha capacidad de disco, lo importante estaba compartido. Tampoco era necesario pensar si le ponían impresora o no, o de qué tipo habría de ser y la mesita auxiliar donde ponerla, pues en el escritorio ya no cabía un alfiler. 

El mercado del software para los servidores de red estaba, básicamente, monopolizado por Novell con su producto NetWare. Funcionaba en todo tipo de PCs de cualquier fabricante, con un mínimo de memoria, capacidad de disco y velocidad de procesador.  Se podía instalar tantos discos internos como cupieran en el gabinete, pero también externos.  

Aunque admitía una gran variedad de adaptadores de red, Ethernet, Token Ring y muchos otros de tantísimos fabricantes, lo más popular eran las baratísimas placas adaptadoras de red de ARCnet, que admitían poco más de 250 PCs dentro de un red usando el mismo cable coaxial que se usa para las antenas de televisión que es muy económico.  Las PCs se encadenaban con unos conectores en T encadenando así un tendido de casi 200 metros, en definitiva, mucho más de lo que una pequeña o mediana empresa pudiera necesitar.  El NetWare podía manejar (creo) hasta 4 placas de red, de tal manera que si había que poner PCs en distintas plantas de un edificio, se podían hacer tendidos separados de cable para cada piso, cubriendo así un área más amplia.

Varios servidores podían conectarse entre sí de tal manera que cada área de una empresa podía tener el suyo y, a su vez, reunirlos en una red empresarial.

Para el usuario, en su PC, el disco `A:` era el diskette, el `B:` un segundo diskette si lo había, el `C:` era el disco rígido interno y si alguna máquina tenía más discos internos se usaban sucesivas letras.  El servidor permitía que las PCs conectadas a él usaran letras para acceder a los varios discos y/o directorios del servidor, habitualmente desde la `F:`, previendo que una máquina pudiera tener las letras `D:` y `E:` asignadas a discos internos extra, y podrían llegar a la `Z:`.

Disponía de un sistema de seguridad por grupos y usuarios.  No todo el disco estaba accesible a cualquiera. Había que identificarse (login) para acceder al servidor y según estuviera configurado, cada persona podía acceder sólo a esto o aquello, para leerlo solamente, grabarlo o borrarlo.

Las impresoras también aparecían como si fueran impresoras físicamente conectadas a la PC, `LPT1:`, `LPT2`, etc.

Instalar el NetWare en una máquina era tedioso por el número de diskettes que requería.  Sí, eran otros tiempos, todavía no había CDs o DVDs y un pen-drive era inconcebible, muchos menos la Web.  Luego venía la configuración, no del hardware que en su mayoría lo detectaba automáticamente, sino de la estructura de directorios, los grupos y usuarios, y los permisos de cada uno para acceder a dichos directorios.

Esto se hacía desde una interfaz de texto de pantalla completa, algo así como las pantallas de configuración de un Windows o un Linux recién instalado. No había interfaz gráfica, ni tampoco mouse, ni se necesitaban.  El acceso a las varias secciones de la configuración se hacía a través de menúes cuyos items iban precedidos de letras.  Todos estábamos familiarizados con las secuencias de letras para acceder a cada opción, no había ninguna necesidad de sacar las manos del teclado.

Una vez instalado, el servidor usaba su propio sistema operativo, ni MS-DOS ni nada a lo que un usuario pudiera acceder.  No se podían ejecutar otros programas.  El servidor era servidor y nada más, desde su pantalla y teclado no se podía hacer nada más que administrarlo.  En general la pantalla del servidor permanecía apagada, salvo cuando llegaba el técnico. El NetWare existía de la época de equipos de escasa potencia y memoria. No tenía nada que no fuera imprescindible, nada de interfaz gráfica u otros extras.

NetWare tenía alguna competencia, pero no era significativa en el mercado.  De pronto surgió el IBM LAN Server o Microsoft LAN Manager que eran lo mismo con distinta marca, desarrollados ambos por Microsoft con ayuda de 3Com. 3Com era una empresa fundada por Bob Metcalf, el inventor de Ethernet, que fabricaba equipamiento de redes, incluso las placas adaptadoras de Ethernet para PC más populares.  Estos funcionaban como una aplicación más en un servidor tipo PC corriendo OS/2, el sistema operativo desarrollado por IBM y Microsoft que, tras unos años, se convirtió en Windows NT, el primero de los Windows multi-tareas  de 32 bits.  Esa versión arrancaba sin la interfaz gráfica, que era un programa que se podía correr si se quería.  Si se iba a usar como servidor, se omitía.

El hecho de que el LAN Manager funcionara en un sistema operativo estándar hacía que fuera posible desarrollar aplicaciones que se ejecutaran como servicios en el servidor, por ejemplo, un servidor de SQL, cosa que Microsoft mismo eventualmente ofreció como producto.

Entiendo que en existió un servidor SQL para NetWare que no fue desarrollado por Novell, pero era carísimo, no demasiado rápido y una consulta de SQL mal diseñada podría congelar el servidor (todo esto de oídas, no sé de nadie que lo hubiera comprado). Novell trató de mejorar y abaratar el entorno de desarrollo para permitir que otras empresas pudieran desarrollar otros servicios, como SQL, en sus servidores y también mejorar el sistema de permisos, usuarios y grupos.

Y ahí es donde perdieron contra IBM/Microsoft.  Pocos clientes necesitaban las mejoras de la nueva versión, el entorno de desarrollo seguía siendo muy complicado, el esquema de certificación del producto para obtener el sello de aprobado por Novell seguía siendo caro y la mayor ofensa para nosotros los técnicos que instalábamos y manteníamos los servidores, es que nos cambiaron la interfaz de usuario y las opciones de administración.  ¡Traición!

LAN Manager había comenzado a hacer ruido en el mercado aún entre empresas que ya tenían redes LAN instaladas, que usualmente usaban NetWare.  Muchas de esas empresas, que ya conocían y tenían gran experiencia con NetWare preferían no invertir en un nuevo producto como LAN Manager.  Es por lo que se llama el *costo de adopción*. Sabían que, si cambiaban tendrían que enviar a sus operadores a hacer cursos, certificarlos y perder tiempo solucionando problemas de interoperatividad entre el NetWare que ya tenían y el nuevo LAN Manager.

Pero resultó que la nueva versión de NetWare parecía un software de servidor distinto, con ciertos problemas de interoperatividad (los permisos de acceso de los usuarios y grupos no eran totalmente compatibles) y un montón de potenciales dolores de cabeza.  Al final, NetWare perdió la gran ventaja de la continuidad, la tranquilidad de saber que las cosas funcionarían igual, que no habría sorpresas al incorporar nuevos servidores.  De pronto, NetWare no gozaba de la ventaja del *costo de adopción cero*.

Así es como Novell comenzó a perder mercado.  Seguramente Novell hizo los cambios atendiendo a necesidades de grandes clientes, pero eran irrelevantes para el gran número de clientes más pequeños como eran la gran mayoría de los clientes que teníamos en Argentina. Los clientes habrían querido seguir comprando la misma versión de NetWare que tenían, pero había desaparecido como producto. Ya no se podía comprar.

En definitiva, con las diferencias entre las versiones, Novell logró que la diferencia en el costo de adopción de  servidores Novell NetWare o Microsoft Lan Manager se redujera muchísimo.  Siendo que el LAN Manager ofrecía muchas más posibilidades (servidor SQL y demás) a menor coste, muchos comenzaron a hacer el cambio.

A los pocos años Microsoft LAN Manager se integró dentro mismo de Windows NT con lo cual todas las PCs eran clientes y servidores de red al mismo tiempo, cosa que no era posible con NetWare. Todos podían compartir todo con todos.  No era obligatorio y, en general, las empresas preferían que hubiera unos servidores centralizados más potentes que compartieran todo y los clientes que no compartieran entre sí, pero era una opción.

Al menos en Argentina, el NetWare comenzó a desaparecer paulatinamente del mercado.
