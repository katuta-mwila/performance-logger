# Performance Logger
Performance Logger is a website and tool that lets users record, view, and analyise a collection of datapoints.
* A datapoint consists of a date paired with a value of a particular metric of the following (Length, Weight, Time, Currency, or Unit).
* As datapoints are logged a graph alongside basic analytics is automatically generated giving a clear view of the trend of the datapoints.
* The way the data is viewed can be configured by changing properties such as the unit, graph type, and by optionally grouping the data by week or month and viewing various analytics attributed to each week or month.

Here is a link to the demo website that already contains generated demo data and gives an idea of what this website is used for\
https://performance-logger-demo.vercel.app/

Here is the link to the final deployment that uses Auth0 authentication where users can create their own collections.
https://performance-logger.vercel.app/


# Development
Performance Logger is a full stack application built using the following key technologies
#### Front End Tech
* JavaScript
* CSS
* TypeScript
* React
* CanvasJS React Charts

#### Backend Tech
* NodeJS
* Express
* Knex
* PostgreSQL

On top of this tech stack Performance Logger uses [Auth0](https://auth0.com/) as the authentication provider facilitating a simple sign in and sign out user experience.

The website was deployed using the cloud service [Vercel](https://vercel.com/).

# What I learned
* How to build charts using React Charts
* How to use Knex and PostgreSQL to store persistent data
* How to deploy a NodeJS application to vercel
* Using Auth0 as the authentication provider

# Links
* [Demo Website](https://performance-logger-demo.vercel.app/)
* [Official Website](https://performance-logger.vercel.app/)
