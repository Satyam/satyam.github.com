---
title: "My first and proudest day on the job"
date: "2021-10-07"
categories: ["Tecnología"]
language: "en-US"
---

My first paid job was an internship at an electronics repair shop at Olivetti Argentina while I was still at university studying Electrical Engineering. We repaired digital calculators like that on the image above, which were quickly replacing the mechanical ones. Yes, it was the early days, now a calculator is just an app in your smartphone then, the mechanical ones were being replaced by electronic ones using medium-scale integrated circuits (ICs). They didn't run on batteries. The digits of the display took some power, but it was the paper strip printer that required so much power that it had to be plugged. People liked the printed copy of their calculations as the mechanical ones provided. As a matter of fact it was standard practice to have the printed strip with the calculation stapled on whatever forms the clerks were producing or checking.

----

<figure>
<img
src="assets/img/512px-Olivetti_Logos_43_PD.jpg"
title="Museon Netherlands, CC BY 3.0 https://creativecommons.org/licenses/by/3.0, via Wikimedia Commons"
/>
<figcaption>
  Olivetti Logos 43
</figcaption>
</figure>

Integrated circuits and the printed circuit boards (PCBs) they were soldered to were becoming smaller and more delicate. The [soldering guns](https://en.wikipedia.org/wiki/Soldering_gun) we used in those days were great for the relatively large discrete components of earlier days, but they had too much power for the smaller components and were likely to melt the internals of the ICs if held for just a bit too long or even detach the copper traces on the PCB. That is the reason why they were switching to the pencil-like soldering irons seen nowadays.

In that repair shop they had just bought a batch of very tiny soldering irons, small as a regular ballpen which used 12V. It was perfect for the delicate job we were doing. They had set up a full row of 6 workbenches with those tiny soldering irons and supplied them with a single 220V to 12V transformer instead of individual ones.

I was in the manager's office introducing myself to my new boss. Electronics was my hobby but I had no training in any trade school and my would-be degree was in electrical engineering not in electronics. But it just happened to be a plus, because they had an electrical problem.

Those workbenches with the fancy little soldering irons? Out of the 6 only 4 worked. Two of them didn't work, they weren't able to reach enough temperature to melt anything. Could I figure out what was wrong? The transformer was rated for 2 or 3 times as much power as they needed all combined. Actually, they had swapped the transformer they originally bought, which should have had enough power, for one that much bigger. What was going on?

I borrowed a multimeter and measured the voltage in the 12V socket on each workstation. The first couple of stations got the full 12V, as expected, the third got just slightly less, the 4th less still and the last two were barely getting 10V or thereabouts. From this, it was clear that the current installation couldn't deliver enough power beyond the fourth workbench.

What was the solution? Put the transformer in the middle of the row of six so it had only three workbenches on either side. Thus, I moved the transformer, patched in the 12V output of the transformer to the middle of the 12V line supplying the workbenches and added a 220V extension cable to reach the transformer from the wall socket.

How come this works? After all, since I had to add more cable, the total length of the installation was longer than it was before. But, the extra length was on the 220V side, not the 12V. Power can be transmitted over longer distances with less loss of power in the line itself when you do it at higher voltages.

Historically, that is why Westinghouse beat Edison in the early days of electrical distribution to homes. It was called the [War of the Currents](https://en.wikipedia.org/wiki/War_of_the_currents) and it even had a [movie](https://www.imdb.com/title/tt5259822/) made. Edison installations used direct current (DC) and transformers, to step up or down the voltage on a line, don't work with DC. Edison was forced to install his generators within the city itself, with all the noise and smoke it produced, as he generated and transmitted electricity at the same voltage as it was consumed, 110V, and could not reach customers further than a mile away.

In Westinghouse's system, using alternate current (AC) allowed him to use transformers, stepping up the voltage on the transmission lines and reach further away and then transforming it back again to distribute in homes. Westinghouse could serve the city of Buffalo, New York from a power station in Niagara Falls, more than 20km away. Westinghouse's AC system is what is being used still today.

As it happens, one of the things that Electrical Engineers deal with, but Electronics Engineers don't, is power transmission lines, and what these guys had was a classical problem on such lines, though in a much smaller scale. Instead of transmitting power in the thousands or millions of volts range over hundreds or thousands of kilometers, they were sending it at 12V over a few meters.

I was ready with all the technical explanations, equations and figures to present to my boss, should he ask, as a dutiful student would but in reality nobody was testing me so nobody asked.

And that is how I earned my workspace. The 6th workbench which was up to then unuseable was now mine. A brand new one. It wasn't quite a prize, it was simply because it was empty so the boss said, "you can take that one". But it still felt good.