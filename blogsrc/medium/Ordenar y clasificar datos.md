---
title: "Ordenar y clasificar datos"
date: "2024-11-06"
categories: ["Tecnología","Historia"]
language: "en-US"
draft: true
---

waelder, CC BY-SA 3.0 , via Wikimedia Commons

Cuando comencé a trabajar en informática, el clasificador de tarjetas perforadas como el 
de la imagen ya estaba obsoleto, nunca vi uno operando, sólo los he visto en museos. En las películas de ciencia-ficción más antiguas o documentales sobre los avances de la ciencia todavía se los veía. En películas posteriores fueron reemplazados por largas líneas de gabinetes con carretes de cinta magnética girando caprichosamente. Y tableros de luces, muchas luces parpadeando frente a la atenta mirada de los actores como si significaran algo. Sin embargo, durante décadas, mucho antes de que la informática se asociara con la electrónica, la clasificadora de tarjetas perforadas era un elemento importantísimo en el procesamiento de datos. Permitía clasificar y también ordenar o, en la jerga 'sortear' las tarjetas para su posterior procesamiento. 

----

Si bien los clasificadores de tarjetas perforadas desaparecieron, la función de clasificar y ordenar los datos siguió luego con las cintas magnéticas y persiste aún en nuestros días. Un algoritmo es una descripción de un proceso paso a paso. Por ejemplo, el algoritmo para sumar manualmente dos cifras de varios dígitos comienza más o menos así "tomamos los dígitos de más a la derecha de cada una de las cifras, las sumamos y anotamos solamente el dígito de las unidades de esa suma", y continuaría detallando qué hacer con las decenas de esa suma, el resto, y como proceder con los siguientes dígitos de cada una de las cifras. Es muy posible que los algoritmos para ordenar datos, esto es, la cantidad de distintas formas de realizar esta operación, sean los más numerosos de todos los algoritmos conocidos, como muestra esta breve lista en Wikipedia que apenas muestra una fracción de los existentes.

¿Por qué son tan importantes estos algoritmos?

Imaginemos que somos un empleado en un gran depósito de mercancías y que tenemos que buscar los items de una orden de compra. Vamos con nuestro carro de mano recorriendo los muchos largos pasillos dentro de la nave, recogiendo un artículo de aquí, otro de allí y algo más un tanto más allá. Esto funciona bien cuando la cantidad de artículos es corta, pero con listas más largas, el proceso se hace extremadamente largo e ineficiente. Ordenando los artículos de tal manera que se pueda minimizar el recorrido del operario, hace todo más eficiente. Otro tanto ocurre con el reparto postal. Los envíos se clasifican por sucursal y por la ronda que hace cada cartero, y este mismo, conocedor de la zona, los ordena para minimizar su trayecto. 

¿Por qué hay tantos algoritmos?

En buena parte es porque hallar un algoritmo requiere mucho ingenio y no siempre sale bien. Por ejemplo, el método ruso para multiplicar es distinto del que usamos nosotros (ver en Wikipedia) pero, fundamentalmente, por razones históricas relacionadas con el medio en que se guardan los datos a procesar, esto es, tarjetas de cartulina, cintas magnéticas, discos rígidos o tarjetas de memoria y los medios para hacerlo, concretamente, cuánta memoria y capacidad de procesamiento y los mecanismos para acceder a los datos. 

Hasta no hace mucho, y en muchas empresas todavía se hace así, los grandes ordenadores principales de una empresa, aquellos que, junto con el personal asociado, habitualmente ocupaban una planta en las oficinas centrales de una institución, no eran tan poderosos en términos actuales. Es habitual decir que aquellos primitivos ordenadores eran menos poderosos que nuestros teléfonos móviles. El caso es que algunos de ellos eran menos poderosos que el chip contenido dentro del cargador de nuestro teléfono móvil. 

La información se almacenaba en distintos medios, como los ya mencionados. La mayoría de estos medios, las tarjetas perforadas, las cintas de papel perforado o las cintas magnéticas, eran de acceso secuencial. Esto quiere decir que sólo se pueden ir leyendo un dato después de otro, como en un juego de baraja en que los naipes van saliendo uno a uno y no se puede cambiar el orden en que van saliendo. En cambio en una unidad de disco o un lápiz de memoria USB es como si dispusiéramos todos los naipes boca arriba en una amplia mesa donde podríamos verlos todos a la vez y acceder a cualquier naipe a voluntad.

El acceso secuencial al medio de almacenamiento de los datos hace que ordenarlos sea tan difícil.

Por ello, puede ser interesante ver algunas formas que se han venido usando a lo largo de los años.

Clasificadora de tarjetas perforadas

La clasificadora de tarjetas de la imagen superior dispone de 13 casilleros de salida, que se corresponden a las 12 posiciones de perforación en cada columna de las tarjetas perforadas estándar de la época más una extra. El operador podía configurar la máquina para detectar las perforaciones de cualquiera de las 80 columnas de la tarjeta. La decimotercera casilla era para las tarjetas con errores o que no tenían ninguna perforación. Las tarjetas, que se cargaban en el compartimento a la derecha, arriba de los controles iban cayendo en sus respectivos casilleros, según se hubiera configurado. Así, si representaban pasillos de estanterías en un depósito industrial o códigos postales, las tarjetas se iban clasificando, de a un dígito a la vez. 

Willem van de Poll, CC0, via Wikimedia Commons

Para clasificar múltiples dígitos, las clasificadoras llevaban un gabinete con casillas, como el que se muestra en esta imagen, donde el operador podía ir apilando las tarjetas de cada ronda de clasificación. Así, cuando ya hubiera clasificado todas las tarjetas por el primer dígito podía vaciar los casilleros de la clasificadora y pasar las pilas de tarjeta al gabinete superior. Luego, ajustando la clasificadora para ahora clasificar por el segundo dígito, podía ir pasando las tarjetas de cada una de las pilas por la clasificadora una vez más. Así, si en la primera ronda podía clasificar las tarjetas cuyo primer dígito era 1, 2, 3, etc, en la segunda ronda podía tomar las pila de las que comenzaban con 1 y obtener las que comienzan por 11, 12, 13, etc y, en una tercera pasada, tomar las que comienzan por 11 y obtener las que comienzan por 111, 112, 113, 114 etc y así sucesivamente.

Para ordenar un juego de tarjetas, curiosamente, se comenzaba al revés, por el dígito menos significativo. 

A partir de la pila de tarjetas desordenadas, a la izquierda, hacemos una primera clasificación por el dígito de las unidades, obteniendo 3 pilas para aquellas tarjetas que terminan en 2, 3 y 4. Hacemos una única pila, al centro, con todas las tarjeta cuidando de ir tomando las tarjetas de las casillas de manera consistente, si apilamos de derecha a izquierda, continuaremos así para todas las casillas. Luego hacemos una segunda clasificación de la pila así formada pero esta vez por el dígito de las decenas, obteniendo 3 pilas que comienzan con 1, 2 y 3. Volvemos a hacer una única pila, a la derecha, cuidando de hacerlo en el mismo orden que la primera vez. Esta pila ya está ordenada. Podríamos repetir la operación para centenas y miles, si los hubiere. Como en cada sucesiva clasificación se mantiene el orden relativo de las tarjetas obtenido en la clasificación previa, la pila final estará totalmente ordenada.

El ordenamiento aquí no lo hace la clasificadora, que simplemente las ubica cada tarjeta en la casilla que le corresponde, sino el operador, que en cada etapa apila las tarjetas tomándolas de las casillas de izquierda a derecha o viceversa. En este caso se han ordenando en forma ascendente, pero de haber querido hacerlo en forma descendente, habría que haber tomado las tarjetas de las casillas en el orden inverso.