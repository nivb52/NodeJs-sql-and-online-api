# NodeJs-sql-and-online-api

## Using Queue
This NodeJS App using external api, after getting a POST request,
In case of no connection error and from the external api, or NodeJs app crash 
the request will be saved in the database and pulled again
be order of FIFO (first in first out).

