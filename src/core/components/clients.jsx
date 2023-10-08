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

    // if (this.state.clients.length == numberOfClients) {
    //   multiClient = this.taggedClients()
      
    // }

    multiClient = this.props.specSelectors.clientData().get(this.props.specSelectors.currentDoc())

    let clients = []



    if (multiClient != undefined) {
      if (multiClient.length > 0) {

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

    console.log(service)

    if (service != undefined)
      serviceUrl = specSelectors.baseUrl() + '/' + tag + ".json"

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
      }} />&nbsp;&nbsp;{tag}</a>
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

              console.log(tag)
              console.log(specSelectors.clientDetails())

              const path = op.get("path")
              const method = op.get("method")
              const specPath = Im.List(["paths", path, method])

              let specClientDetails = specSelectors.clientDetails().get(tag)
              let clientDetails = specSelectors.clientDetails().get(specSelectors.currentDoc())
              //we want to get details from official source
              //let clientDetails = specSelectors.clientDetails().get(tag)

              let detailParam = op.get("path").slice(1)

              let clientDetail = specClientDetails.get(method + path)

              //.get(op.get("path").slice(1))

              

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
