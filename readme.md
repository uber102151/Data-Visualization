# Data-Visualization of Traffic Fatalities in USA in Year 2015

This data visualization is the final project as part of the Udacity Nanodegree
for Data Analysis. It makes use of a vast data set, published by the National
Highway Traffic Safety Administration (NHTSA). It is a collection of each
recorded vehicle crash in the United States of America. NHTSA uses data from
many sources, including the Fatality Analysis Reporting System (FARS) which
began operating in 1975. The analysis focuses on year 2015.
I have chosen d3.js as visualization tool. As a side product I generated a
homebrewn map of US states by using topojson.

## Initial Visualization

To get started I wrangled the data files with Excel and sketched charts, which
I later generated and polished with D3.js.

## Summary

Although the trend of accidents is declining over the past years, it is in the
public interest to further bring it down. The provided analysis discloses
interesting insights. Drawing conclusion could lower accident rates for individuals.

For instance, the distribution of injury types shows that
44% of records concern casualties. The peak season for accidents is from months
July to October. Whereas it seems that people tend to drive less or more carefully
during winter time. At the end of the week, that is from Friday to Sunday, the
number of accidents are booming. You can pin this down to increased alcohol
consumption. Although I thought differently, I could not see a pattern that
weather conditions are impacting the occurance of accidents. There is also no
clear zenith obserable during the course of the day. Obscurely, there is a small peak
at 09:00 a.m., stemming from passengers finding their death in traffic accidents.
Sadly almost 800 children with age below or equal 10 years die in accidents.
In the age group 10 - 20 years a high amount of fatalities need to be mourned.
The highest peak is in the age group from 20 - 30 years with more than 7,500
casualties. The numbers remain on a consistent plateau until 70 year olds.
Beyond the age of 70 years the fatality rate decreases.
Taking a look at the spatial distribution of fatal accidents, you can see that
metropolitan areas, where motorized vehicles and other road users are naturally
packed closely together are clustered with accidents.
One can recognize interstate routes and motorways connecting major cities like
spider webs. Sparsely populated states have naturally a higher rate of accidents
in rural areas. Among others the indicator 'accidents per 1,000 registered cars'
is referenced. The mean value is approximately 0.3. Outliers with 0.7 and 0.6 are
the states Mississipi and Wyoming, respectively.

## Design

I decided to offer a narrative visualization and implemented four different
chart types to disclose insights into the data set from various perspectives:
* Pie chart   
* Bar charts and grouped bar charts  
* Line chart
* Map with a circle for each road casualty 

The **pie chart** shall present the principal clustering of the traffic accident
records into severities of injuries. The color coding is intentionally chosen to
represent the classification, i.e. from fatal (dark red) to no injury (green).
Following a reviewers feedback, I replaced the pie chart with a bar chart.

The **map** highlights the geographical distribution, showing the majority of
accidents taking place in areas of high population density or traffic arteries
(freeways and highways). The implemented tooltip provides more detailed accident
statistics in the corresponding states.

I extensively used **bar charts** to give a temporal overview, over months and
week days of accidents. Also the distribution of fatalities into age groups is
presented as a bar chart. When breaking down data clusters into weather or light
conditions under which accidents occured, I used a sequential blue color palette
to distinguish the variables and changed the chart type to **grouped bar charts**.

I limited the visual effects to simple fade-in effects; since I personally think
that too much visualization distracts from the data and the story it tells.

## Feedback

For the initial visualization I received the following feedback from Evan in the
Udacity forum:
*I looked briefly through your data. I noticed that you lumped all the data
together for many of the graphs. I think it would be beneficial to look at
individual areas. Specifically for rush hour traffic accidents, I think in
cities we may see a trend of more accidents or fewer accidents, whereas in the
"country" this wouldn't be true. Possibly coding some buttons to isolate the
data for specific times of day, or specific geographical areas.*

Picking up his ideas, I implemented a slider in the map chart to narrow down
the shown accidents to individual hours.
Furthermore, I broke down the accidents to the categories 'rural' and 'urban',
depending on where the accident happened. I added those numbers to the tooltip
for the individual states.

The second comprehensive feedback I received from Emmanuelle:

* *The most interesting visualization and the most interactive is the map.
I like the tooltip with detailed information. My wish would be that we can drill
down by county and by city for one given state.*  


* *Distribution over the month: Very clean and simple. I'll just add that
people travel most during summer, hence more accidents. It would be interesting
to to see if the October peak is due to Halloween.*  

In fact indeed slightly more accidents than average occured on Halloween.
Although I blame this to the circumstance that it was a Saturday, where in
general more accidents happen.  

* *Day time : The chart is very appealing and I was looking at it before
reading your comment. The line label should not be under the chart. I thought
they were label of categories defined by the white, red, white, red areas and
it did not made sense at all, until I read your comment. So I strongly suggest
you put these labels on the left side.*  

I moved the labels to the right bottom corner of the chart and added a title.

* *Severity of traffic accident: It is my least favorite visualization.
Not only it is a pie chart, but it uses red and green. The two big No No I
learned in class. I would transform them in a chart and keep the red for the
fatal accident and use subdue value for the other one.*

I changed the pie chart to a bar chart and removed the colors completely.

Another feedback of a family member was the following:

In the week days overview no values are stated and the y-axis ranges are different.
Thus it is hard to grasp the different dimensions. Also the legend elements are
overlapping with the most right bars. The description in the tab 'Severity of Accidents'
seem to mix up between injured persons and accidents.

Therefore I added data labels to all charts, but kept the y-axis range flexible.
I also aligned legend elements not to interfere with the bars and made the
explanations of the 'severity of accidents' clearer.

## Resources

1. Fade in bars one by one with D3, www.stackoverflow.com/questions/21988294/fade-in-bars-one-by-one-with-d3  
2. Giants with Feets of Clay, Gabriel Forn-Cuní, http://dataviz.bitsandgen.es/#text-story  
4. D3 Tips and Tricks, https://leanpub.com/D3-Tips-and-Tricks/read  
5. d3.nest() key and values conversion to name and children, http://stackoverflow.com/questions/17416186/d3-nest-key-and-values-conversion-to-name-and-children  
6. How to create a map, https://bost.ocks.org/mike/map/  
7. HTML Layouts, http://www.w3schools.com/html/html_layout.asp  
8. ftp://ftp.nhtsa.dot.gov/fars/  
9. Fatality Analysis Reporting System, https://www.nhtsa.gov/research-data/fatality-analysis-reporting-system-fars  
10. A  Complete Guide to Flexbox, https://css-tricks.com/snippets/css/a-guide-to-flexbox/  
11. Font Awesome, http://fontawesome.io/icons/  
12. Visualizing 5 years of traffic fatalities: what is the deadliest time to drive?,  http://io9.gizmodo.com/5970486/visualizing-5-years-of-traffic-fatalities-what-is-the-deadliest-time-to-drive  
13. Interaction and Animation: D3 Transitions, http://duspviz.mit.edu/d3-workshop/transitions-animation/  
14. Stacked Bar Chart, https://bl.ocks.org/mbostock/1134768  
15. Multi-line graph, http://www.d3noob.org/2014/07/d3js-multi-line-graph-with-automatic.html  
