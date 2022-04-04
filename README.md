### What is this

/cc Maika and Ivan

This project is a demo, it is not meant to be a production solution but only a fun demo to implement a generic web server and show some fun stuff available in javascript/node/typescript in April 2022.

Recipe
- Zero-production dependencies
- An homemade solution to test suites
- An web server implementing middleware and routes using the standard HTTP package (don't get excited too fast, it lacks tons of details) 

## Web and Test

Express JS and Jest are de facto standards. They allow for quick prototypes up to huge applications. **However**, in this test, we are implementing a web server for fun to understand if we can have something similar and ergonomic as ExpressJS in a few lines.

```ts
export const addRoute =
  (method: Method) =>
  (path: string, ...handlers: RouteHandler[]) => {
    routers.push({ method, path, handlers })
  }

export const get = addRoute('GET')

export const post = addRoute('POST')

export const patch = addRoute('PATCH')
```

## Volatile Database

The volatile database is an example of managing controllers, testing them, and implementing them in the routers.

No matter how exemplary the Model's implementation within the volatile storage is, it can constantly be refactored or re-implemented without touching the test or the webserver.


## What about time

This system is not responsible for the time zone, as this service is supposed to be used from multiple locations, we only store **UTC time using Epoch format (in milliseconds)**.<br/>

The given date times (to create new entries or to search by dates) are normalized so that provided date times are set at midnight.
The normalization is done at the middleware level. Check the function normalizeEpoch for more details.


# Hack on it

:warning: This software requires NodeJS >= `v12`

1. clone the repository using `git@github.com:kedoska/demo-maivan.git`
2. change directory `cd demo-maivan`
3. install dev dependencies `npm i`
4. run tests `npm test`
5. run the server `npm start`


## Add Data

`POST cities` creates a new city in the database.

```bash
curl -X POST "http://localhost:3000/cities?name=Barcelona&country=SPA&region=Catalunia&population=1000"
```

`PATCH cities:name` adds incidence information to a specific city.

```bash
# 3 of april 2022
curl -X PATCH "http://localhost:3000/cities/Barcelona?cases=3000&epoch=1649001840000"
# 4 of april 2022
curl -X PATCH "http://localhost:3000/cities/Barcelona?cases=3000&epoch=1649079340000"
```

## Get by date

`GET /reports/:segment/:name` returns the report for the required segment

A segment represents a `city`, a `region` or a `country`.

```bash
curl "http://localhost:3000/reports/city/Barcelona?epoch=1649079340000"
curl "http://localhost:3000/reports/region/Catalunia?epoch=1649079340000"
curl "http://localhost:3000/reports/country/SPA?epoch=1649079340000"
```

```json
{
  "location": { "city": "Barcelona", "country": "SPA", "population": 1000, "region": "Catalunia" },
  "fromEpoch": 1649023200000,
  "toEpoch": 1649023200000,
  "totalDays": 1,
  "totalCases": 3000,
  "incidenceRate": 300000
}
```

## Get by range

```bash
curl "http://localhost:3000/reports/city/Barcelona?fromEpoch=1649001840000&toEpoch=1649079340000"
curl "http://localhost:3000/reports/region/Catalunia?fromEpoch=1649001840000&toEpoch=1649079340000"
curl "http://localhost:3000/reports/country/SPA?fromEpoch=1649001840000&toEpoch=1649079340000"
```

```json
{
  "location": { "city": "Barcelona", "country": "SPA", "population": 1000, "region": "Catalunia" },
  "fromEpoch": 1648936800000,
  "toEpoch": 1649023200000,
  "totalDays": 2,
  "totalCases": 6000,
  "incidenceRate": 600000
}
```

# License

Copyright © 2022 Marco Casula<marco.casula@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
