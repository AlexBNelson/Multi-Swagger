# <img src="https://raw.githubusercontent.com/swagger-api/swagger.io/wordpress/images/assets/SWU-logo-clr.png" width="300">

***PLEASE NOTE, THIS PACKAGE IS STILL IN DEVELOPMENT***

## Introduction

Multi-Swagger is a script that allows you to link swagger specifications for services that call each other and navigate between them. 

It's a fork of the [swagger-ui](https://github.com/swagger-api/swagger-ui) repository. Please see the swagger-ui package for more extensive documentation.

![demo](multi-swagger-demo.gif)

## Getting Started

In order to run multi-swagger, you need to create a json file like below called `manifest.json`, consisting of a list of services. Then, in the same directory, you need to run `npm run multi-swagger` or `npx multi-swagger`.

Each service has a name, url of the swagger file and a list of clients. The list of clients consists of a list of service
names that call into that service. E.g. In the file below, RoomBookingApi and Delivery Api both call into the StockKeeping Api

```javascript
{
  "Services": [
    {
      "Name": "RoomBookingApi",
      "Endpoints": "C:\\roomBookingApi.json"

    },
    {
      "Name": "StaffAvailabilityApi",
      "Endpoints": "C:\\staffAvailabilityApi.json"

    },
    {
      "Name": "DeliveryApi",
      "Endpoints": "C:\\deliveryApi.json"
    },
    {
      "Name": "DeliveryApi",
      "Endpoints": "C:\\cleaningScheduleService.json"
    },
    {
      "Name": "StockKeepingApi",
      "Endpoints": "C:\\stockKeepingApi.json",
      "Clients": [
        "DeliveryApi",
        "CleaningScheduleService"
      ]
    },
    {
      "Name": "RoomServiceApi",
      "Endpoints": "C:\\roomServiceApi.json",
      "Clients": [
        "RoomBookingApi",
        "StockKeepingApi"
      ]
    }
  ]
}
```

Please note, relative paths are not supported at the moment.

## How it works

Multi-Swagger will recreate the files used in a temporary directory in the temp folder. It will then run a http-server on port 8521, and open the swagger-ui React app in the default browser on port 8532.

The homepage with links to the different services:



## Advanced Usage

You can also add services that only consume other services, and don't expose any endpoints of their own, simply remove the 'Endpoints' property

```
...
{
  "Name": "KeyReader",
      "Clients": [
        "RoomBookingApi",
        "CleaningScheduleService"
      ]    
}
```