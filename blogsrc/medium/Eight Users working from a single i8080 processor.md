---
title: "Eight Users working from a single i8080 processor"
date: "2021-11-06"
categories: ["Tecnología"]
language: "en-US"
---
Most Windows users would know that the processor on which it runs is some sort of Intel x86 processor or a compatible one, which comes down from a lineage started with the i8086, the first of Intel's 16 bit microprocessors. It was succeeded by the i80186, i80286 and so on. That is what that 'x' in 'x86' stands for, the ever increasing middle digit in the series, which they dropped once they decided they could no longer carry on with that numbering system and started giving them names, something that started with the Intel Pentium which would have otherwise been an i80586.

----

Even though they later moved to 32 and 64 bit architectures, the basic instruction set, the actual binary codes that tell the processor what to do, is derived from the original 8086 processor.

The 8086 was not the first of Intel's processors. It actually started with the [i4004](https://en.wikipedia.org/wiki/Intel_4004) which was a 4 bit processor. The number of bits in a processor is the size of the set of bits it can operate on at once. With 4 bits, you have 2^4^ symbols, that is 16 different bit combinations which you can easily make to represent each of the 10 decimal digits we regularly use, with 6 symbols to spare. This chip was designed for pocket calculators. It was soon followed by the i4040.

Then came the 8 bit processors which had 2^8^, that is 256, different symbols which were plenty to represent numbers, letters, both upper and lower case, symbols with still plenty of spares left over. IBM's EBCDIC coding use 8 bits and US-ASCII uses 7 bits so they both fit into 8 bits.

Intel had a first try at an 8 bit processor with a chip they called the [i8008](https://en.wikipedia.org/wiki/Intel_8008) meant for an intelligent ASCII terminal, which wasn't much of a success, followed by the i8080 which ruled the world of 8 bit microcomputing for several years along its derivatives, such as the Zilog Z80 which was at the heart of the Tandy / Radio Shack TRS-80 or the Sinclair, all of which competed with 6500 family of processors popular in the Amiga, Commodore and Apple II.

It was in those days, when a punny 8 bit microprocessor was barely able to handle a single micro-computer, that a company from Ann Arbor, Michigan, Sycor Inc. announced a system capable of supporting up to 8 users on a single machine, the [Sycor 445](https://aadl.org/aa_news_19771216-sycor_unveils). Sycor disappeared long ago, sold to Canada's Northern Telecom which continued to manufacture those systems as the NT 445, with slightly different colors on the cabinet and later developed the NT 585. I've lost track of them after that, my guess is they dropped that line of business and dedicated themselves to telecommunications.

I believe Sycor mostly sold its earlier systems through other major brands, at least overseas. Their earlier machines arrived in Argentina through the local subsidiary of Olivetti of Italy, which is why I got involved with them. Olivetti later developed its own competing systems and dropped Sycor's. However, since there was a whole bunch of Sycor machines that had been sold in Argentina, those of us with any experience in those systems moved to other companies that took over the support of the installed systems and even sold new ones directly from Sycor and later from Northern Telecom.

The '445' as we called it was a wonderful machine. The cabinet was waist-high, about 40cm wide about a meter deep. It was a simple and elegant design that could fit in any office, being quiet and having no special installation requirements such as air conditioning. It could handle up to 8 terminals, each up to 2000 feet or 600m away so it could serve not just the administrative offices but could handle terminals in the factory floor or the warehouse.

Internally it had an Intel i8080 micro-processor with up to 256 kB of memory and a fixed disk with 10MB of storage in a single 14 inch platter. Far more storage could be added externally. Remember, these were the late 70's and memory and disc capacities were in those ranges. kilobytes and megabytes, no 'gigas' nor 'teras'. Nobody could imagine that much storage at the time.

The i8080 wasn't really a single-chip microprocessor but a set of 3 chips. All of Intel's designs since the i4004 had been multi-chip. The actual CPU needed a couple of support chips, a clock generator and a bus controller. It also required plus and minus 5 volts and plus 12V power supplies. It's successors such as Intel's own i8085 or the Z80 did without any of those, which made for far more compact designs. That was just the CPU, then you could start adding memory and input/output.

## Extra Circuitry

The i8080 could handle up to 2^16^, that is 64kB of memory. The Sycor guys did a wonderful job extending that to 256kB by doing memory-mapping through an amazingly elegant memory mapper made with plain small-scale integrated circuits (SSI). Any number and combination of 2kB blocks out of those 256kB of main memory space could be mapped into the i8080 64kB memory space. As the operating system moved from task to task, it would take care to provide each task with its corresponding blocks of memory.

All that circuitry, and some more I'll mention momentarily, resided in a printed circuit board (PCB) about the size of a floppy disk, that is an 8" one, since the smaller 5" ¼ ones were yet to come. Both of them were actually floppy or rather flexible, unlike the later 3.5" which were rigid.

The 445 had a *backplane* running all along the chassis, which held and connected all the PCBs together. Unlike other 'bus' systems where all slots in the backplane are more or less alike (all pins 1 are wired together, so are all pins 2 and so on so that any board can be plugged anywhere) each slot or small sets of slots were dedicated to some specific function. Thus, there were two slots reserved for CPUs, four reserved for RAM, 4 for terminals, 1 for the internal disk driver board, one for the magnetic tape cartridge and so on with all peripherals. These were the basic options for the system. Other boards could handle external removable disk units, half-inch open reel tape drives, networking, remote communication and several more external devices.

<figure>
<img 
title="Wire wrapped backplane picture by Retro-Computing Society of Rhode Island - Own work, CC BY-SA 3.0, https://commons.wikimedia.org/w/index.php?curid=5094625"
src="assets/img/512px-PDP-8I-backplane.jpg"
/>
<figcaption>
 PDP-8I wire-wrapped backplane. From the collection of the RCS/RI
</figcaption>
</figure>

The backplane was not a PCB but a series of sockets fixed to a plastic sheet with [wire wrapping posts](https://en.wikipedia.org/wiki/Wire_wrap) on the other side, which was the usual way of building systems in those days. Those posts were cabled together as seen in the image above. As further peripherals became available and others redesigned, some of the slots could be rewired. That allowed for great flexibility and growth, as the design of the system could be changed relatively easy, but rewiring them was really scary as any mistake could be very hard to identify in such a mess of wires. A slip of the wire cutter and you could spend a couple of days finding out what went wrong. Fortunately those design changes involved very few wires which had to be cut and replaced by others. We never had any wholesale rewiring of a base board. Still, we usually had two people doing it, one actually doing the cutting and wire-wrapping, the other reading out the instructions, looking over the shoulder of the first and marking the checkboxes on the worksheet.

Originally, the system was designed to have two CPUs, both i8080. One of them would run as the main CPU while the other would handle all the peripherals. If a dual CPU system ever came out came out of production, and my guess is none did, at least I am sure that none ever reached Argentina. But, before I go into how they fixed this, let me explain how this impacted the design of the CPU board.

The CPU board with its i8080 processor chip set, plus the memory mapper got a few extras. With two CPUs on the system, as it was originally planned, there would be a bottleneck when trying to access memory, as it was shared in between the two CPUs. Thus, they added two further features to that CPU board and the backplane it was plugged into. I am not totally sure of my description of how these features worked, since it was several decades ago and I have kept no copy of the manuals, but they were there if, perhaps, not in the exact way I remember them.

## Caching

All data reads were in 16 bit words. Though the i8080 was an 8 bit processor, extra circuitry was added so that whenever a byte was accessed the one next to it would also be fetched. The byte requested would go right through to the CPU chip, the next byte would go into a simple latch, a one byte cache, if you will. I don't recall how writes were handled, but since most of the time you are reading data, not writing, you may do sub-optimal writes and still make a difference.

Since most data operations usually involve accessing multiple consecutive bytes from memory, such as reading consecutive characters of a string, having the backplane wired for 16 bits and having the CPU board read two bytes at a time made sense. Many compilers can be configured to store variables starting at an even memory location so your binary code ends up optimized for this 16 bit data transfer.

This is important because with two CPUs, you don't want each CPU constantly waiting for the other to do its memory fetches. Thus, if each CPU can read two bytes in a single operation, it fred time for the other to do likewise.

The other trick they did was prefetching instructions. If you are trying to optimize the transfer of data over a shared bus, prefetching blocks of instruction codes is a great way to go, due to the common characteristics of programs.

Most programs are composed of more or less long chains of instruction codes stored in memory one after the other. Branches are instruction codes that tell the CPU to continue execution at some other location. Fortunately, they don't happen that often, less than 1 in 5 instructions is a branch. And many branches are conditional, that is, if the condition fails, the program keeps going straight ahead, it doesn't branch at all. Moreover, in an i8080 many instruction codes require up to three bytes so, statistically, if you read one byte containing an instruction code from memory, you are likely to read the very next one from the location immediately after and the one after that and so on. Every now and then, you will find a branch, which may force you to discard what you pre-fetched, but that is fine, most of the time, on average 9 out of 10, it won't happen.

Furthermore, no well-behaved program will modify itself, thus the memory where the code resides can be assumed to be read only. One of the problems of caching data is that what you have just cached might be modified by other CPUs in the system and your cached copy might no longer reflect the current value in memory. This cannot happen with code which is immutable. Thus, if you prefetch a bunch of instructions, you are safe to assume it is and will remain valid.

Fortunately, the i8080 chip had a pin that signalled whether what was reading was a piece of data to process or an instruction code to execute, thus, it is easy to distinguish when it reads data to process and when it reads code to execute and use different circuitry to fetch one or the other and take advantage of the characteristics of each one.

## Why no second CPU?

Though the backplane had a slot for a second CPU card, I am not aware that any were sold thanks to the i8085. This was a derivative of the original i8080 but better suited to serve as a microcontroller than a main CPU. A microcontroller is what you use to handle external hardware, such as disk or tape drives, parallel printer ports or serial communication ports and other devices. Thus, instead of relying on a second CPU board with an i8080 to handle all input/output (I/O) and dumb controllers, Sycor decided to put an i8085 on each I/O controller board and make each one intelligent.

When an I/O operation was needed, the operating system would write what they called a Device Control Block or DCB somewhere in main memory. The DCB would contain information about what to do and where to locate the data to exchange. It would then signal the I/O controller that it had this DCB waiting to be processed on such and such address and let it do its thing, while the main CPU carried on, possibly switching to other program or user. Once finished, the I/O controller would signal back to the operating system that the operation was done, recording whatever results in the DCB or wherever the DCB pointed at.

Actually, the DCB had a field pointing to the next DCB for the same type of device so, once a controller was done with one DCB, it could go straight to the next DCB in the chain without bothering the main CPU. Likewise, the operating system didn't need to wait for an I/O controller to process one DCB to tell it what to do next, it would simply keep chaining DCBs with all I/O requests it needed and let the I/O controllers deal with them in their own good time.

## Display Terminals

The system could handle up to 8 display terminals, each up to 600 meters away and it did so in the most ingenious way. Remember I mentioned that the CPU had a memory mapper that could map any 2kB block into the 64kB memory space of the CPU? One of those 2kB memory blocks was the display memory, one for each terminal. This memory was not in the main memory PCB boards but in each separate terminal controller board. This is because while the main CPU accessed this memory occasionally, the display controller used it continuously so it made sense to have it within the controller itself.

In computer terms, 2k actually means 2048 bytes, not 2000 as might be expected, simply because 2048 is a round number in binary, it is 2^10^ or a 1 followed by 10 zeroes. The display controller used this memory for several purposes. With 25 lines of 80 characters each (24 of text plus the status line at the bottom), 2000 bytes were used for the characters to be shown on the video screen. The remaining 48 were used for various purposes, such as the cursor position, the status of the caps lock key or whether the shift key was pressed. The rest was left for the keyboard buffer, a short term queue to store keystrokes until the running program could handle them.

The smart part was that the terminal was a totally dumb analog TV monitor. A pair of the wires simply transmitted the plain analog TV signal, a raster line at a time, with its corresponding horizontal sync (HSync) pulse and the vertical VSync pulse for each screen. It even had worst resolution than a regular broadcast TV signal and it didn't do shades of gray, it was simply pixel on or pixel off. That is why the display terminals could be so far away, they were simple TV monitors.

The TV signal came out of continuously stepping through the display memory, converting each character into the pattern of pixels to display, several times a second, and that is why the display memory was in the terminal controller card and not as part of the main memory. The main CPU only needed to access this memory when something in the screen changed, which was comparatively rare.

The trick was with the keyboard. Keyboards usually have a matrix of wires with several columns and rows of wires, with keys at the intersections. The keyboard controller would activate, let us say, a column at a time, and read the rows one at a time for each active column. When pressed, a key would connect one column wire with a row wire so, when the column wire was active, the corresponding row wire would also be active.

This keyboard had a simple counter which was reset to zero with the VSync signal from the monitor and incremented in one for each HSync signal. Each value of the count corresponded to an active column and a row read. The display controller board had the same kind of counter, counting in parallel to the one in the display terminal, using the same VSync and HSync signals. The keyboard would send the key pressed signal to the controller which, since it ran the same count in sync with the keyboard, it would know which coordinate in the matrix was short circuited and to which character it corresponded.

This very simple circuitry allowed the terminals to be up to 600 meters away and still respond as local terminals, which was quite a feat in those days.

## CP/M and MP/M

I learned much of this because of a pet project of mine. The '445' run its own proprietary operating system, as most computers did in those days. It had a COBOL compiler, a very primitive (experimental) BASIC interpreter and a proprietary language to describe and validate data-entry screens. This felt quite insufficient to me. CP/M was the most popular operating system in those days for 8 bit personal computers and it had all sorts of application software for it, such as word processors, spreadsheets and compilers and interpreters for many programming languages besides COBOL. And it could be customized to run on any machine with an i8080-compatible microprocessor.

As the main dealership in the country at the time, we always had some '445's either to develop software for customers or at the repair shop, some working, some as spares or test benches. So, if one of those was idle, I would grab it and play with it.

To customize CP/M you had to write, usually in 8080 Assembler, the drivers for the terminal and the disk drive of your machine. Since in the 445 the disk controller was intelligent, it meant I only had to write those DCBs I mentioned earlier in memory and the disk controller would handle it. That spared me the trouble of actually handling the intricacies of the disk hardware. And it worked! I was able to run CP/M on my machine. But that was only the first step.

CP/M was an operating system for just one user and could handle just the basic 64kB of memory the i8080 could address on its own. I had a machine capable of handle up to 8 users and 256kB of memory. That is when MP/M came in. MP/M was the multi-user version of CP/M, and was also customizable to run on any i8080-compatible machine.

To do so, you had to have a machine running CP/M, which I had, and then add the memory mapper, to map any 2kB block out of those 256kB of memory into a dedicated 64kB for each user.

Unfortunately, I never finished that part and never got the 445 running MP/M. A big project came up and all the resources of the company, the machine I was playing with as well as myself and my colleagues, had to work on it. By the time that project was over, they moved me to another area and rarely touched a 445 again. And, it was a losing proposition anyway since, by then, the IBM PC was becoming a hot item and a multi-user 8bit MP/M machine no longer had any appeal. Besides I was playing with a way larger family of mini and mainframe computers and the 445 felt a little small to me.

## Conclusion

Most of the extra circuitry I described here surrounding the i8080 on the main CPU board should be nothing new to CPU designers. As a matter of fact, the system I later worked with didn't even use a single-chip microprocessor as its main processor, it had it all made out of simple SSI or (medium) MSI circuits in a PCB almost half a meter on a side. But the 445 was the first system I had the full manuals for and I delighted in finding out how they managed to get so much juice out of it.

Nowadays, everything is hidden inside the all-powerful CPU chips the major manufacturers design and produce. Multiple processors on one chip, with plenty of built-in memory for cache, instruction pipelines, branch prediction and many more features that we aren't even aware of. Back then, everything was out there for anyone to see. The internals of the i8080 itself were comprehensible. Now the newest chips are almost black magic.

As for porting MP/M to it, I would also have had another big issue. Even if I did manage to make it work, it would have been unsaleable. Open Source Software (OSS) would come much later. Nowadays, nobody thinks twice about using Linux, an OSS operating system, or the very many OSS applications running on it or on Windows or Mac. It wasn't so in those days, IT managers wanted software fully supported by their vendors. My MP/M version would have been ignored.

There wasn't even a way for me to easily exchange information with Sycor itself to sell them my idea. Actually, it is quite likely that some of their engineers toyed with the very same idea, but I had no way of knowing. There was no eMail in those days, no internet, not even electronic bulletin boards. It was just phone calls, letters, telex or fax, and I was too far away from them. Tough luck.