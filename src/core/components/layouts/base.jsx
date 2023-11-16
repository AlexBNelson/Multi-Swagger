import React from "react"
import PropTypes from "prop-types"
import Im from "immutable"
import { fromJS, Set, Map, OrderedMap, List } from "immutable"
import { fromJSOrdered } from "core/utils"
import { sorters } from "core/utils"
import resolveSubtree from "swagger-client/es/subtree-resolver"
import SwaggerLogo from "../swagger.svg"

export default class BaseLayout extends React.Component {
  constructor() {
    super()

  }


  TransformClients(serviceName, clients) {

    let serviceClientMap = this.props.specSelectors.clientData()


    let clientMap = []

    clients.forEach((client) => {
      let clientUrl = this.props.specSelectors.baseUrl() + "/" + client + ".json"

      fetch(clientUrl)
        .then(response => response.json()
          .then(json => {
            let localClients = []
            localClients.push(fromJSOrdered(json))
            let clientJson = this.props.specSelectors.clientJson();
            clientJson = clientJson.set(client, json)

            this.props.specActions.setClientJson(clientJson)
            // need to set using 'setClientJson' action
            let multiClients = this.taggedClients(localClients)

            this.TransformClientDetails(multiClients, json)

            clientMap.push(multiClients)
            // jsonMap.push(json)
          }))

    })
    serviceClientMap = serviceClientMap.set(serviceName, clientMap)
    
    this.props.specActions.setClients(serviceClientMap)

    return null
  }



  TransformClientDetails(multiClients, json) {

    // Can this list ever be longer than 1?
    let multiClientList = List(multiClients)


    multiClientList.forEach(multiClient => {

      let mcl = List(multiClient)

      let innerMap = Map()

      mcl.get(0)[1].get("operations").forEach(async op => {
        const path = op.get("path")
        const method = op.get("method")
        const specPath = Im.List(["paths", path, method])

        const {
          modelPropertyMacro,
          parameterMacro,
          requestInterceptor,
          responseInterceptor
        } = this.props.getConfigs()


        const prom = resolveSubtree(json, specPath.toArray(), {
          baseDoc: this.props.specSelectors.baseUrl(),
          modelPropertyMacro,
          parameterMacro,
          requestInterceptor,
          responseInterceptor
        })

        prom.then(({ spec }) => {

          let ClientDetails = fromJSOrdered(spec)

          innerMap = innerMap.set(method + path, ClientDetails)

          let outerMap = this.props.specSelectors.clientDetails()

          outerMap = outerMap.set(mcl.get(0)[0], innerMap)

          this.props.specActions.setClientDetails(outerMap)
        })

      })

    })



  }


  componentDidMount() {
    let clientUrl = "http://localhost:8521/manifest.json"
    fetch(clientUrl)
      .then(response => response.json()
        .then(json => {
          this.props.specActions.setManifest(json)

          let services = json["Services"]


          services.forEach(service => {
            if (service["Clients"] != undefined) {
              this.TransformClients(service["Name"], service["Clients"])
            }
          })
        }))
  }



  getMappedClient = (tagObj) => {
    return tagObj
  }




  generateClientDetails = (tagObj, json, serviceKey, clientKey) => {
    const clients = tagObj.get("operations")

    let clientDetailsToReturn = null

    clients.map(op => {
      const path = op.get("path")
      const method = op.get("method")
      const specPath = Im.List(["paths", path, method])


      const {
        modelPropertyMacro,
        parameterMacro,
        requestInterceptor,
        responseInterceptor
      } = this.props.getConfigs()


      const prom = resolveSubtree(json, specPath.toArray(), {
        baseDoc: this.props.specSelectors.baseUrl(),
        modelPropertyMacro,
        parameterMacro,
        requestInterceptor,
        responseInterceptor
      })


      prom.then(({ spec }) => {

        let ClientDetails = fromJSOrdered(spec)

        clientDetailsToReturn = ClientDetails


        let stateMap = this.props.specSelectors.clientDetails()


        let serviceStateMap = null

        if (stateMap.has(serviceKey)) {
          serviceStateMap = stateMap.get(serviceKey)
        }

        let innerMap = serviceStateMap ?? Map()

        innerMap = innerMap.set(clientKey, clientDetailsToReturn)


        let outerMap = stateMap

        outerMap = outerMap.set(serviceKey, innerMap)

        this.props.specActions.setClientDetails(outerMap)

      })

    })

    if (clientDetailsToReturn != null) {

      return clientDetailsToReturn
    }


  }





  tags = function (clients) {

    let clientArr = []

    clients.forEach((client) => {
      let tags = (client.get("tags", List()))
      let tagRes = List.isList(tags) ? tags.filter(tag => Map.isMap(tag)) : List()
      clientArr.concat(tagRes)
    })
    return clientArr
  }


  tagDetails = (clients, tag) => {
    let currentTags = this.tags(clients) || List()
    return currentTags.filter(Map.isMap).find(t => t.get("name") === tag, Map())
  }

  OPERATION_METHODS = [
    "get", "put", "post", "delete", "options", "head", "patch", "trace"
  ]

  mergerFn = (oldVal, newVal) => {
    if (Map.isMap(oldVal) && Map.isMap(newVal)) {
      if (newVal.get("$$ref")) {
        // resolver artifacts indicated that this key was directly resolved
        // so we should drop the old value entirely
        return newVal
      }

      return OrderedMap().mergeWith(
        oldVal,
        newVal
      )
    }

    return newVal
  }

  clientSpec = function () {
    let retValue = this.state.clients
    return retValue
  }

  clientJson = function () {
    return this.state.clients
  }

  clientTags = function (clients) {
    let clientArr = []

    clients.forEach((client) => {
      const tags = client.get("tags", List())
      clientArr.push(List.isList(tags) ? tags.filter(tag => Map.isMap(tag)) : List())

    })

    return clientArr
  }

  clientConsumes = function (clients) {
    let clientArr = []

    clients.forEach((client) => {
      //seems to be the source of the multi-client issues
      clientArr.push(Set(client.get("consumes")))
    })

    return clientArr

  }

  clientProduces = function (clients) {
    let clientArr = []

    clients.forEach((client) => {
      clientArr.push(Set(client.get("produces")))
    })

    return clientArr

  }

  clientJsonWithResolvedSubtrees = function (clients) {
    let clientArr = []

    clients.forEach((client) => {
      clientArr.push(OrderedMap().mergeWith(
        this.mergerFn,
        client
        // Was causing the client summaries to duplicate for some reason
        // spec.get("resolvedSubtrees")
      ))
    })

    return clientArr
  }


  clientPaths = function (clients) {
    let clientArr = []

    this.clientJsonWithResolvedSubtrees(clients).forEach((client) => {
      clientArr.push(client.get("paths"))
    })

    return clientArr

  }

  clients = function (clients) {
    let clientArr = []

    // clientPaths unwraps according to paths
    this.clientPaths(clients).forEach((clientOps) => {
      if (!clientOps || clientOps.size < 1)
        clientArr.push(List())

      let list = List()

      if (!clientOps || !clientOps.forEach) {
        clientArr.push(List())
      }


      // this is what's causing the duplication in the clientArr
      clientOps.forEach((path, pathName) => {
        if (!path || !path.forEach) {
          clientArr.push({})
        }

        // will need to fix for multiple operation scenario
        path.forEach((operation, method) => {
          // if (this.OPERATION_METHODS.indexOf(method) < 0) {

          // }
          list = list.push(fromJS({
            path: pathName,
            method,
            operation,
            id: `${method}-${pathName}`
          }))

          // clientArr.push(list) where it was pushing to client array before
        })


      })


      clientArr.push(list)
    })
    //if two paths, then incorrectly return a list of one path and a list of two paths
    return clientArr
  }


  clientsWithRootInherited = function (clients) {

    let clientsArray = []


    // This function is where the second client object seems to disappear

    for (let i = 0; i < this.clients(clients).length; i++) {
      clientsArray.push(this.clients(clients)[i].map(ops => ops.update("operation", op => {
        if (op) {
          if (!Map.isMap(op)) { return }
          return op.withMutations(op => {
            if (!op.get("consumes")) {
              op.update("consumes", a => Set(a).merge(this.clientConsumes(clients)[i]))
            }
            if (!op.get("produces")) {
              op.update("produces", a => Set(a).merge(this.clientProduces(clients)[i]))
            }
            return op
          })
        } else {
          // return something with Immutable methods
          return Map()
        }

      })))
    }

    return clientsArray
  }


  clientsWithTags = function (clients) {

    let clientArr = []

    for (let i = 0; i < this.clientsWithRootInherited(clients).length; i++) {
      const DEFAULT_TAG = "default"
      clientArr.push(this.clientsWithRootInherited(clients)[i].reduce((taggedMap, op) => {
        let tags = Set(op.getIn(["operation", "tags"]))
        if (tags.count() < 1)
          return taggedMap.update(DEFAULT_TAG, List(), ar => ar.push(op))
        return tags.reduce((res, tag) => res.update(tag, List(), (ar) => ar.push(op)), taggedMap)
      }, this.clientTags(clients)[i].reduce((taggedMap, tag) => {


        return taggedMap.set(tag.get("name"), List())
      }, OrderedMap())))

    }

    return clientArr
  }



  taggedClients = function (clients) {

    let { tagsSorter, operationsSorter } = this.props.getConfigs()


    let clientsArr = []

    this.clientsWithTags(clients).forEach((client) => {

      clientsArr.push(client
        .sortBy(
          (val, key) => key, // get the name of the tag to be passed to the sorter
          (tagA, tagB) => {
            let sortFn = (typeof tagsSorter === "function" ? tagsSorter : sorters.tagsSorter[tagsSorter])
            return (!sortFn ? null : sortFn(tagA, tagB))
          }
        )
        .map((ops, tag) => {
          let sortFn = (typeof operationsSorter === "function" ? operationsSorter : sorters.operationsSorter[operationsSorter])
          let operations = (!sortFn ? ops : ops.sort(sortFn))


          return Map({ tagDetails: this.tagDetails(clients, tag), operations: operations })
        }))

    })

    return clientsArr
  }




  static propTypes = {
    errSelectors: PropTypes.object.isRequired,
    errActions: PropTypes.object.isRequired,
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    oas3Selectors: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    getConfigs: PropTypes.func.isRequired
  }


  render() {
    let { errSelectors, specSelectors, getComponent } = this.props

    let SvgAssets = getComponent("SvgAssets")
    let InfoContainer = getComponent("InfoContainer", true)
    let VersionPragmaFilter = getComponent("VersionPragmaFilter")
    let Operations = getComponent("operations", true)
    let Clients = getComponent("clients", true)
    let Models = getComponent("Models", true)
    let Row = getComponent("Row")
    let Col = getComponent("Col")
    let Errors = getComponent("errors", true)

    // const ServersContainer = getComponent("ServersContainer", true)
    // const SchemesContainer = getComponent("SchemesContainer", true)
    // const AuthorizeBtnContainer = getComponent("AuthorizeBtnContainer", true)
    const FilterContainer = getComponent("FilterContainer", true)
    let isSwagger2 = specSelectors.isSwagger2()
    let isOAS3 = specSelectors.isOAS3()

    const isSpecEmpty = !specSelectors.specStr()

    const loadingStatus = specSelectors.loadingStatus()

    let loadingMessage = null

    if (loadingStatus === "loading") {
      loadingMessage = <div className="info">
        <div className="loading-container">
          <div className="loading"></div>
        </div>
      </div>
    }

    if (loadingStatus === "failed") {
      loadingMessage = <div className="info">
        <div className="loading-container">
          <h4 className="title">Failed to load API definition.</h4>
          <Errors />
        </div>
      </div>
    }

    if (loadingStatus === "failedConfig") {
      const lastErr = errSelectors.lastError()
      const lastErrMsg = lastErr ? lastErr.get("message") : ""
      loadingMessage = <div className="info failed-config">
        <div className="loading-container">
          <h4 className="title">Failed to load remote configuration.</h4>
          <p>{lastErrMsg}</p>
        </div>
      </div>
    }

    if (!loadingMessage && isSpecEmpty) {
      loadingMessage = <h4>No API definition provided.</h4>
    }

    if (loadingMessage) {
      return <div className="swagger-ui">
        <div className="loading-container">
          {loadingMessage}
        </div>
      </div>
    }

    const servers = specSelectors.servers()
    const schemes = specSelectors.schemes()


    let serviceLinks = []

    if (specSelectors.specJson().getIn(["Services"]) != undefined) {


      let services = specSelectors.specJson().getIn(["Services"])

      services.forEach((service) => {


        serviceLinks.push(
          <div><p><a onClick={(e) => {
            e.stopPropagation()

            let serviceUrl = specSelectors.baseUrl() + "/" + service.getIn(["Name"]) + ".json"

            this.props.specActions.updateUrl(this.props.specSelectors.url())

            this.props.specActions.setManifest(this.props.specSelectors.specStr())

            this.props.specActions.download(serviceUrl)

            this.props.specActions.setCurrentDoc(service.getIn(["Name"]))
          }}>

            <h4>
              &nbsp;&nbsp;&nbsp;&nbsp;<img src={SwaggerLogo} style={{
                width: 15,
                height: 15
              }} />&nbsp;&nbsp;
              {service.getIn(["Name"])}
            </h4>
          </a></p></div>)
      })


    }

    const hasServers = specSelectors.servers() && specSelectors.servers().size
    const hasSchemes = specSelectors.schemes() && specSelectors.schemes().size
    const hasSecurityDefinitions = !!specSelectors.securityDefinitions()


    return (
      <div className='swagger-ui'>
        {serviceLinks}
        <SvgAssets />
        <VersionPragmaFilter isSwagger2={isSwagger2} isOAS3={isOAS3} alsoShow={<Errors />}>
          <Errors />
          <Row className="information-container">
            <Col mobile={12}>
              <InfoContainer />
            </Col>
          </Row>

          {/* {hasServers || hasSchemes || hasSecurityDefinitions ? (
            <div className="scheme-container">
              <Col className="schemes wrapper" mobile={12}>
                {hasServers ? (<ServersContainer />) : null}
                {hasSchemes ? (<SchemesContainer />) : null}
                {hasSecurityDefinitions ? (<AuthorizeBtnContainer />) : null}
              </Col>
            </div>
          ) : null} */}

          <FilterContainer />
          {/* <Row>
            <Col mobile={12} desktop={12} >
              <ConnectedServices />
            </Col>
          </Row> */}
          <Row>
            <Col mobile={12} desktop={12} >
              <Clients />
            </Col>
          </Row>
          <Row>
            <Col mobile={12} desktop={12} >
              <Operations />
            </Col>
          </Row>
          <Row>
            <Col mobile={12} desktop={12} >
              <Models />
            </Col>
          </Row>
        </VersionPragmaFilter>
      </div>
    )
  }
}