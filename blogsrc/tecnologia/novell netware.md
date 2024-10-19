---
title: "Novell NetWare vs. Windows NT"
date: "2024-10-19"
categories: ["Tecnología/Fracasos","Historia/Informática"]
language: "es-ES"
---
Cómo Novell cedió el mercado de los servidores de redes locales a Microsoft

---

Las empresas iban apreciando la utilidad de las computadoras personales y seguían sumando PCs en sus oficinas para las más diversas tareas.  En principio este crecimiento era un poco caótico. Las sucesivas máquinas tenían distinta configuración. No todas tenían impresora. De aquellas que tenían, la mayoría tenía la popular Epson FX-80 de matriz de puntos que era confiable y económica, pero era una impresora personal, no tenía gran velocidad de impresión.  Si se quería hacer un gran listado o un gran número de documentos, p.ej. facturas, liquidación de sueldos, pedidos, tardaba horrores, se necesitaba una impresora de línea, más rápida y robusta, como las Printronix.  Para imprimir correspondencia de calidad, se compraba una Diablo 630 de Xerox o la Selectric de IBM (obviamente mucho más cara). Las impresoras laser todavía no existían en aquella época.

Los discos tenían distintas capacidades.  Algunas se quedaban cortas de espacio, otras eran lentas.  Los documentos se copiaban de una a otra, nadie sabía cuál era la última versión de nada. Cada usuario era, de alguna manera, responsable de hacer sus copias de resguardo lo cual incrementaba el riesgo de pérdida de información.  Los diskettes se apilaban con copias más o menos fiables de los datos de toda la empresa. 

La gente iba de una máquina a otra con diskettes para compartir información o para que le imprimieran algo porque no tenía impresora, o la que tenía se había quedado sin tinta, o lo que fuera.  Y esos diskettes se mezclaban con las copias de resguardo.

Era necesario poner orden.

La red de área local o LAN, por sus siglas en inglés, permitía superar muchos de estos problemas.  Con un servidor central al cual se conectaban todas las PCs, todos los usuarios podían disponer de espacio de disco compartido e impresoras de diversos tipos accesibles a todos.  Ya había un lugar designado para tener todos los archivos compartidos de la empresa, con un responsable de hacer las copias de seguridad necesarias.

Al comprar una PC, ya no era necesario que tuviera mucha capacidad de disco, lo importante estaba compartido. Tampoco era necesario pensar si le ponían impresora o no, o de qué tipo habría de ser y la mesa auxiliar donde ponerla, pues en el escritorio ya no cabía un alfiler. 

El mercado del software para los servidores de red estaba, básicamente, monopolizado por Novell con su producto NetWare. Funcionaba en todo tipo de PCs de cualquier fabricante, con un mínimo de memoria, capacidad de disco y velocidad de procesador.  Se podía instalar tantos discos internos como cupieran en el gabinete, pero también externos.  

Aunque admitía una gran variedad de adaptadores de red, Ethernet, Token Ring y muchos otros de tantísimos fabricantes, lo más popular eran las baratísimas placas adaptadoras de red de ARCnet, que admitían poco más de 250 PCs dentro de un red usando el mismo cable coaxial que se usa para televisión que es muy económico.  Las PCs se encadenaban con unos conectores en T permitiendo un tendido de casi 200 metros. En definitiva, mucho más de lo que una pequeña o mediana empresa pudiera necesitar.  El software podía manejar hasta 4 placas de red, de tal manera que si había que poner PCs en distintas plantas de un edificio, se podían hacer tendidos separados de cable para cada piso, cubriendo así un área más amplia.

Para el usuario, en su PC, el disco `A:` era el diskette, el `B:` un segundo diskette si lo había, el `C:` era el disco rígido interno y si alguna máquina tenía más discos internos se usaban sucesivas letras.  El servidor permitía que las PCs conectadas a él usaran letras para acceder a los varios discos y/o directorios del servidor, habitualmente desde la `F:`, previendo que una máquina pudiera tener las letras `D:` y `E:` asignadas a discos internos extra, y podrían llegar a la `Z:`.

Disponía de un sistema de seguridad por grupos y usuarios.  No todo el disco estaba accesible a cualquiera. Había que identificarse para acceder al servidor y según estuviera configurado, cada persona podía acceder sólo a esto o aquello, para leerlo solamente, grabarlo o borrarlo.

Las impresoras también aparecían como si fueran impresoras físicamente conectadas a la PC, `LPT1:`, `LPT2`, etc.

Instalar el NetWare en una máquina era tedioso por el número de diskettes que requería.  Sí, eran otros tiempos, todavía no había CDs o DVDs y un pen-drive era inconcebible, muchos menos la Web.  Luego venía la configuración, no del hardware que en su mayoría lo detectaba automáticamente, sino de la estructura de directorios, los grupos y usuarios, y los permisos de cada uno para acceder a dichos directorios.

Esto se hacía desde una interfaz de texto de pantalla completa, algo así como las pantallas de configuración de un Windows o un Linux recién instalado. No había interfaz gráfica, ni tampoco mouse, ni se necesitaban.  El acceso a las varias secciones de la configuración se hacía a través de menúes cuyos items iban precedidos de letras.  Todos estábamos familiarizados con las secuencias de letras para acceder a cada opción, no había ninguna necesidad de sacar las manos del teclado.

Una vez instalado, el servidor usaba su propio sistema operativo, ni MS-DOS ni nada que un usuario pudiera usar.  No se podían correr otros programas.  El servidor era servidor y nada más, no se podía hacer más que administrarlo.  En general la pantalla del servidor permanecía apagada, salvo cuando llegaba el técnico. 

Recuerdo la versión 2.15C, la más fiable y veloz.  Una maravilla. 

