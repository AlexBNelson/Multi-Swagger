import React, { cloneElement } from "react"
import PropTypes from "prop-types"
import { fromJSOrdered  } from "core/utils"

//import "./topbar.less"
import {parseSearch, serializeSearch} from "../../core/utils"

export default class Topbar extends React.Component {

  static propTypes = {
    layoutActions: PropTypes.object.isRequired,
    authActions: PropTypes.object.isRequired
  }

  constructor(props, context) {
    super(props, context)
    this.state = { url: props.specSelectors.url(), selectedIndex: 0, json: null }


    this.props.specActions.setBaseUrl("http://localhost:8521")


    
  }



  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ url: nextProps.specSelectors.url() })
  }

  onUrlChange =(e)=> {
    let {target: {value}} = e


     this.setState({url: value})
  }

  flushAuthData() {
    const { persistAuthorization } = this.props.getConfigs()
    if (persistAuthorization)
    {
      return
    }
    this.props.authActions.restoreAuthorization({
      authorized: {}
    })
  }

  refresh(){
    window.location.reload()
  }

  // loadSpec = (url) => {
  //   console.log(url)
  //   this.flushAuthData()
  //   this.props.specActions.updateUrl(url)


  //   fetch(url)
  //   .then( response => response.json()
  //     .then(json => {
  //       console.log(json)

  //     }))


  //   this.props.specActions.setManifest(this.props.specSelectors.specStr())

  //   let obj = JSON.parse(this.props.specSelectors.specStr())

  //   let arr = obj["Services"]

  //   let currDoc = this.props.specSelectors.currentDoc()

  //   if(currDoc==undefined){
  //     this.props.specActions.setCurrentDoc('RoomServiceApi')
  //   }






  //   let doc = arr.find(item=>item.Name=="RoomServiceApi");

  //   let baseUrl = this.props.specSelectors.baseUrl()


  //   let currentDocUrl = baseUrl + '/' + this.props.specSelectors.currentDoc() + doc["Endpoints"]


  //   this.props.specActions.download(currentDocUrl)

  //    let manifest = JSON.parse("{\r\n  \"openapi\": \"3.0.1\",\r\n  \"info\": {\r\n    \"title\": \"RoomBookingApi\",\r\n    \"version\": \"1.0\"\r\n  },\r\n  \"paths\": {\r\n    \"\/roomBookings\": {\r\n      \"get\": {\r\n        \"tags\": [\r\n          \"RoomBookingApi\"\r\n        ],\r\n        \"operationId\": \"GetRoomBookings\",\r\n        \"responses\": {\r\n          \"200\": {\r\n            \"description\": \"OK\",\r\n            \"content\": {\r\n              \"application\/json\": {\r\n                \"schema\": {\r\n                  \"type\": \"array\",\r\n                  \"items\": {\r\n                    \"$ref\": \"#\/components\/schemas\/RoomBooking\"\r\n                  }\r\n                }\r\n              }\r\n            }\r\n          }\r\n        }\r\n      }\r\n    }\r\n  },\r\n  \"components\": {\r\n    \"schemas\": {\r\n      \"DateOnly\": {\r\n        \"type\": \"object\",\r\n        \"properties\": {\r\n          \"year\": {\r\n            \"type\": \"integer\",\r\n            \"format\": \"int32\"\r\n          },\r\n          \"month\": {\r\n            \"type\": \"integer\",\r\n            \"format\": \"int32\"\r\n          },\r\n          \"day\": {\r\n            \"type\": \"integer\",\r\n            \"format\": \"int32\"\r\n          },\r\n          \"dayOfWeek\": {\r\n            \"$ref\": \"#\/components\/schemas\/DayOfWeek\"\r\n          },\r\n          \"dayOfYear\": {\r\n            \"type\": \"integer\",\r\n            \"format\": \"int32\",\r\n            \"readOnly\": true\r\n          },\r\n          \"dayNumber\": {\r\n            \"type\": \"integer\",\r\n            \"format\": \"int32\",\r\n            \"readOnly\": true\r\n          }\r\n        },\r\n        \"additionalProperties\": false\r\n      },\r\n      \"DayOfWeek\": {\r\n        \"enum\": [\r\n          0,\r\n          1,\r\n          2,\r\n          3,\r\n          4,\r\n          5,\r\n          6\r\n        ],\r\n        \"type\": \"integer\",\r\n        \"format\": \"int32\"\r\n      },\r\n      \"RoomBooking\": {\r\n        \"type\": \"object\",\r\n        \"properties\": {\r\n          \"roomNumber\": {\r\n            \"type\": \"integer\",\r\n            \"format\": \"int32\"\r\n          },\r\n          \"checkInDate\": {\r\n            \"$ref\": \"#\/components\/schemas\/DateOnly\"\r\n          },\r\n          \"checkOutDate\": {\r\n            \"$ref\": \"#\/components\/schemas\/DateOnly\"\r\n          }\r\n        },\r\n        \"additionalProperties\": false\r\n      }\r\n    }\r\n  }\r\n}")

  //   this.props.specActions.setClientJson(fromJSOrdered(manifest))

    
  // }

  // onUrlSelect =(e)=> {
  //   let url = e.target.value || e.target.href
  //   this.loadSpec(url)
  //   this.setSelectedUrl(url)
  //   e.preventDefault()
  // }

  // downloadUrl = (e) => {
  //   this.loadSpec(this.state.url)
  //   e.preventDefault()
  // }

  // setSearch = (spec) => {
  //   let search = parseSearch()
  //   search["urls.primaryName"] = spec.name
  //   const newUrl = `${window.location.protocol}//${window.location.host}${window.location.pathname}`
  //   if(window && window.history && window.history.pushState) {
  //     window.history.replaceState(null, "", `${newUrl}?${serializeSearch(search)}`)
  //   }
  // }

  // setSelectedUrl = (selectedUrl) => {
  //   const configs = this.props.getConfigs()
  //   const urls = configs.urls || []

  //   if(urls && urls.length) {
  //     if(selectedUrl)
  //     {
  //       urls.forEach((spec, i) => {
  //         if(spec.url === selectedUrl)
  //           {
  //             this.setState({selectedIndex: i})
  //             this.setSearch(spec)
  //           }
  //       })
  //     }
  //   }
  // }

  componentDidMount() {
    // const configs = this.props.getConfigs()
    // const urls = configs.urls || []

    // if(urls && urls.length) {
    //   var targetIndex = this.state.selectedIndex
    //   let search = parseSearch()
    //   let primaryName = search["urls.primaryName"] || configs["urls.primaryName"]
    //   if(primaryName)
    //   {
    //     urls.forEach((spec, i) => {
    //       if(spec.name === primaryName)
    //         {
    //           this.setState({selectedIndex: i})
    //           targetIndex = i
    //         }
    //     })
    //   }

    //   this.loadSpec(urls[targetIndex].url)
    // }





  }

  onFilterChange =(e) => {
    let {target: {value}} = e
    this.props.layoutActions.updateFilter(value)
  }

  render() {
    let { getComponent, specSelectors, getConfigs } = this.props
    const Button = getComponent("Button")
    const Link = getComponent("Link")
    const Logo = getComponent("Logo")

    let isLoading = specSelectors.loadingStatus() === "loading"
    let isFailed = specSelectors.loadingStatus() === "failed"

    const classNames = ["download-url-input"]
    if (isFailed) classNames.push("failed")
    if (isLoading) classNames.push("loading")

    const { urls } = getConfigs()
    let control = []
    let formOnSubmit = null

    if(urls) {
      let rows = []
      urls.forEach((link, i) => {
        rows.push(<option key={i} value={link.url}>{link.name}</option>)
      })

      control.push(
        <label className="select-label" htmlFor="select"><span>Select a definition</span>
          <select id="select" disabled={isLoading} onChange={ this.onUrlSelect } value={urls[this.state.selectedIndex].url}>
            {rows}
          </select>
        </label>
      )
    }
    else {
      formOnSubmit = this.downloadUrl
      control.push(<input className={classNames.join(" ")} type="text" onChange={ this.onUrlChange } value={this.state.url} disabled={isLoading} />)
      control.push(<Button className="download-url-button" onClick={ this.downloadUrl }>Explore</Button>)
    }

    return (
      <div className="topbar">
        <div className="wrapper">
          <div className="topbar-wrapper">
            <Link>
              <Logo/>
            </Link>
            <form className="download-url-wrapper" onSubmit={formOnSubmit}>
              {control.map((el, i) => cloneElement(el, { key: i }))}
            </form>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <img height={"32px"} width={"32px"} fill={"#7AEC4E"} src={require("../../img/house-solid.svg")} onClick={this.refresh}/>
          </div>
        </div>
      </div>
    )
  }
}

Topbar.propTypes = {
  specSelectors: PropTypes.object.isRequired,
  specActions: PropTypes.object.isRequired,
  getComponent: PropTypes.func.isRequired,
  getConfigs: PropTypes.func.isRequired
}
