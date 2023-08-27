import React from "react"
import PropTypes from "prop-types"
import Im from "immutable"
import { fromJS, Set, Map, OrderedMap, List } from "immutable"
import { fromJSOrdered } from "core/utils"
import { sorters } from "core/utils"
import SwaggerLogo from "./swagger.svg"
import debounce from "lodash/debounce"
import resolveSubtree from "swagger-client/es/subtree-resolver"
import set from "lodash/set"

let index = 0

const SWAGGER2_OPERATION_METHODS = [
  "get", "put", "post", "delete", "options", "head", "patch"
]

const OAS3_OPERATION_METHODS = SWAGGER2_OPERATION_METHODS.concat(["trace"])


export default class Clients extends React.Component {
  constructor() {
    super();
    this.state = { clients: [], json: [], collapsed: false };


  }










  debResolveSubtrees = debounce(async () => {
    // requestBatch.push(path)
    // let requestBatch
    // requestBatch.system = system
    // const system = requestBatch.system // Just a reference to the "latest" system

    // if(!system) {
    //   console.error("debResolveSubtrees: don't have a system to operate on, aborting.")
    //   return
    // }
    const {
      errActions,
      errSelectors,
      fn: {
        resolveSubtree,
        fetch,
        AST = {}
      },
      specSelectors,
      specActions,
    } = system

    if (!resolveSubtree) {
      console.error("Error: Swagger-Client did not provide a `resolveSubtree` method, doing nothing.")
      return
    }
    const {
      modelPropertyMacro,
      parameterMacro,
      requestInterceptor,
      responseInterceptor
    } = this.props.getConfigs()

    try {
      var batchResult = await requestBatch.reduce(async (prev, path) => {
        const { resultMap, specWithCurrentSubtrees } = await prev
        const { errors, spec } = await resolveSubtree(specWithCurrentSubtrees, path, {
          baseDoc: specSelectors.url(),
          modelPropertyMacro,
          parameterMacro,
          requestInterceptor,
          responseInterceptor
        })



        set(resultMap, path, spec)
        set(specWithCurrentSubtrees, path, spec)

        return {
          resultMap,
          specWithCurrentSubtrees
        }
      }, Promise.resolve({
        resultMap: (Map()).toJS(),
        specWithCurrentSubtrees: this.state.clientJson[0].toJS()
      }))

      delete requestBatch.system
      requestBatch = [] // Clear stack
    } catch (e) {
      console.error(e)
    }


    this.setState({ resolved: batchResult.resultMap })
  }, 35)

















  static propTypes = {
    specSelectors: PropTypes.object.isRequired,
    specActions: PropTypes.object.isRequired,
    oas3Actions: PropTypes.object.isRequired,
    getComponent: PropTypes.func.isRequired,
    oas3Selectors: PropTypes.func.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired,
    authSelectors: PropTypes.object.isRequired,
    getConfigs: PropTypes.func.isRequired,
    fn: PropTypes.func.isRequired
  }

  componentDidMount() {

    let clients = []


    let toNullCheck = JSON.parse(this.props.specSelectors.manifest())["Services"].find(service => service.Name === this.props.specSelectors.currentDoc())


    if (toNullCheck != undefined) {
      if ("Clients" in toNullCheck) {
        clients = JSON.parse(this.props.specSelectors.manifest())["Services"].find(service => service.Name === this.props.specSelectors.currentDoc())["Clients"]
      }
    }

    
   



    let clientData = []
    let clientJsonList = []

    clients.forEach((client) => {

      let clientUrl = this.props.specSelectors.baseUrl() + "/" + client

      fetch(clientUrl)
        .then(response => response.json()
          .then(json => {
            //console.log(json)
            clientData.push(fromJSOrdered(json))
            clientJsonList.push((json))
            this.setState({ clientJson: clientJsonList })
            this.setState({ clients: clientData })
          }))
    })

    

  }












  tags = function () {

    let clientArr = []

    this.clientSpec().forEach((client) => {
      let tags = (client.get("tags", List()))
      let tagRes = List.isList(tags) ? tags.filter(tag => Map.isMap(tag)) : List()
      clientArr.concat(tagRes)
    })
    return clientArr
  }


  tagDetails = (tag) => {
    let currentTags = this.tags() || List()
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
        mergerFn,
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

  clientTags = function () {
    let clientArr = []

    this.clientSpec().forEach((client) => {
      const tags = client.get("tags", List())
      clientArr.push(List.isList(tags) ? tags.filter(tag => Map.isMap(tag)) : List())

    })

    return clientArr;
  }

  clientConsumes = function () {
    let clientArr = []

    this.clientSpec().forEach((client) => {
      clientArr.push(Set(client.get("consumes")))
    })

    return clientArr

  }

  clientProduces = function () {
    let clientArr = []

    this.clientSpec().forEach((client) => {
      clientArr.push(Set(client.get("produces")))
    })

    return clientArr

  }

  clientJsonWithResolvedSubtrees = function () {
    let clientArr = []

    this.clientSpec().forEach((client) => {
      clientArr.push(OrderedMap().mergeWith(
        this.mergerFn,
        client
        // Was causing the client summaries to duplicate for some reason
        // spec.get("resolvedSubtrees")
      ))
    })

    return clientArr;
  }


  clientPaths = function () {
    let clientArr = []

    this.clientJsonWithResolvedSubtrees().forEach((client) => {
      clientArr.push(client.get("paths"))
    })

    return clientArr;

  }

  clients = function () {
    let clientArr = []


    this.clientPaths().forEach((clientOps) => {
      if (!clientOps || clientOps.size < 1)
        clientArr.push(List())

      let list = List()

      if (!clientOps || !clientOps.forEach) {
        clientArr.push(List())
      }

      clientOps.forEach((path, pathName) => {
        if (!path || !path.forEach) {
          clientArr.push({})
        }

        path.forEach((operation, method) => {
          if (this.OPERATION_METHODS.indexOf(method) < 0) {

          }
          list = list.push(fromJS({
            path: pathName,
            method,
            operation,
            id: `${method}-${pathName}`
          }))

          
        })
      })
      clientArr.push(list)
    })


    return clientArr
  }


  clientsWithRootInherited = function () {

    let clientsArray = []

    // This function is where the second client object seems to disappear

    for (let i = 0; i < this.clients().length; i++) {

      clientsArray.push(this.clients()[i].map(ops => ops.update("operation", op => {
        if (op) {
          if (!Map.isMap(op)) { return }
          return op.withMutations(op => {
            if (!op.get("consumes")) {
              op.update("consumes", a => Set(a).merge(this.clientConsumes()[i]))
            }
            if (!op.get("produces")) {
              op.update("produces", a => Set(a).merge(this.clientProduces()[i]))
            }
            return op
          })
        } else {
          // return something with Immutable methods
          return Map()
        }

      })))
    }

    return clientsArray;
  }


  clientsWithTags = function () {


    let clientArr = []

    for (let i = 0; i < this.clientsWithRootInherited().length; i++) {
      clientArr.push(this.clientsWithRootInherited()[i].reduce((taggedMap, op) => {
        let tags = Set(op.getIn(["operation", "tags"]))
        if (tags.count() < 1)
          return taggedMap.update(DEFAULT_TAG, List(), ar => ar.push(op))
        return tags.reduce((res, tag) => res.update(tag, List(), (ar) => ar.push(op)), taggedMap)
      }, this.clientTags()[i].reduce((taggedMap, tag) => {


        return taggedMap.set(tag.get("name"), List())
      }, OrderedMap())))

    }

    return clientArr
  }



  taggedClients = function () {

    let { tagsSorter, operationsSorter } = this.props.getConfigs()

    let clientsArr = []

    this.clientsWithTags().forEach((client) => {

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


          return Map({ tagDetails: this.tagDetails(tag), operations: operations })
        }))

    })

    return clientsArr
  }

  getMultiClients = function () {
    let retValue = this.state.clients
    return retValue
  }













  transformOperations = (operations) => {

    return operations.reduce((taggedMap, op) => {
      let tags = Set(op.getIn(["operation", "tags"]))
      return tags.reduce((res, tag) => res.update(tag, List(), (ar) => ar.push(op)), taggedMap)
    }, null)
  }


  taggedOperationsParent = (operations) => {


    let finalMap = Map(['tagDetails', undefined])


  }

  showTag = function () {
    this.setState({ collapsed: !this.state.collapsed });
  }

  render() {
   

    let numberOfClients = 0

    let serviceList = JSON.parse(this.props.specSelectors.manifest())["Services"].find(service => service.Name === this.props.specSelectors.currentDoc())

    if (serviceList != undefined) {
      if ("Clients" in serviceList) {
        numberOfClients = JSON.parse(this.props.specSelectors.manifest())["Services"].find(service => service.Name === this.props.specSelectors.currentDoc())["Clients"].length
      }
    }


    let multiClient = []

    if (this.state.clients.length == numberOfClients) {
      multiClient = this.taggedClients()
      
    }

    console.log(this.props.specSelectors.clientData().get(this.props.specSelectors.currentDoc()))
    // console.log(this.state.clients)


    multiClient = this.props.specSelectors.clientData().get(this.props.specSelectors.currentDoc())

    let clients = []



    if (multiClient != undefined) {
      if (multiClient.length > 0) {

        console.log(multiClient)

        multiClient.forEach((client) => {

          

          index++

          // for now 'client' is assumed to always be 1 element
          clients.push(client[0].map(this.renderOperationTag).toArray())


        })



      }
    }


    return (
      <div>
        <h1 fontWeight='bold'> Clients</h1>
        {clients}

      </div>
    )
  }







  renderOperationTag = (tagObj, tag) => {

  
    const {
      specSelectors,
      getComponent,
      oas3Selectors,
      layoutSelectors,
      layoutActions,
      getConfigs,
    } = this.props

    let services = JSON.parse(this.props.specSelectors.manifest())["Services"]

    let service = services.find(item => item.Name == tag)


    let serviceUrl

    if (service != undefined)
      serviceUrl = specSelectors.baseUrl() + '/' + tag + service["ExposedEndpoints"];

    let serviceLink

    if (tag != specSelectors.currentDoc()) {
      serviceLink = <a onClick={(e) => {
        e.stopPropagation()
        this.props.specActions.download(serviceUrl)

        let clients

        let clientList = JSON.parse(specSelectors.manifest())["Services"].find(service => service.Name === tag)

        if (clientList != undefined) {
          if ("Clients" in clientList) {
            clients = JSON.parse(specSelectors.manifest())["Services"].find(service => service.Name === tag)["Clients"]
          }

        }




        if (clients != undefined) {
          this.props.specActions.setCurrentDoc(tag)
        } else {
          this.props.specActions.setCurrentDoc()
        }


      }}><img src={SwaggerLogo} style={{
        width: 15,
        height: 15
      }} />&nbsp;&nbsp;{serviceUrl}</a>
    }



    const ClientContainer = getComponent("ClientContainer", true)
    const ClientTag = getComponent("ClientTag")
    const clients = tagObj.get("operations")

    let index = 0

    return (
      <ClientTag
        key={"operation-" + tag}
        tagObj={tagObj}
        tag={tag}
        oas3Selectors={oas3Selectors}
        layoutSelectors={layoutSelectors}
        layoutActions={layoutActions}
        getConfigs={getConfigs}
        getComponent={getComponent}
        specUrl={specSelectors.url()}
      >

        <div className="operation-tag-content">
          {


            clients.map(op => {


              let clientDetails = specSelectors.clientDetails().get(specSelectors.currentDoc())


              let clientDetail = clientDetails.get(op.get("path").slice(1))

              //.get(op.get("path").slice(1))

              const path = op.get("path")
              const method = op.get("method")
              const specPath = Im.List(["paths", path, method])

              // FIXME: (someday) this logic should probably be in a selector,
              // but doing so would require further opening up
              // selectors to the plugin system, to allow for dynamic
              // overriding of low-level selectors that other selectors
              // rely on. --KS, 12/17
              const validMethods = specSelectors.isOAS3() ?
                OAS3_OPERATION_METHODS : SWAGGER2_OPERATION_METHODS

              if (validMethods.indexOf(method) === -1) {
                return null
              }



              return (
                <ClientContainer
                  key={`${path}-${method}`}
                  specPath={specPath}
                  op={op}
                  clientDetail={clientDetail}
                  path={path}
                  method={method}
                  tag={tag} />
              )
            }).toArray()
          }
        </div>
        {serviceLink}
      </ClientTag>
    )
  }

}

Clients.propTypes = {
  layoutActions: PropTypes.object.isRequired,
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  layoutSelectors: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  fn: PropTypes.object.isRequired
}
