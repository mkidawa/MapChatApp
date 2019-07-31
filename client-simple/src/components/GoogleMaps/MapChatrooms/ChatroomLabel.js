import React, { Component } from "react";
import MarkerWithLabel from "react-google-maps/lib/components/addons/MarkerWithLabel";
import { withRouter } from "react-router-dom";
import axios from "axios";
import Termo from "../../../assets/svg/termo.svg";
class ChatroomLabel extends Component {
  state = {
    temperature: null,
    main: null,
    description: null,
  }
  
  gotoChatroom(evt, roomId) {

    evt.preventDefault();
    evt.stopPropagation();

    console.log(`gotoChatroom.id: `, roomId);

    if (roomId)
      this.props.history.push(`/chat/${roomId}`); // DK: This causes react error
  }

  componentDidMount(){
    console.log(this.props);
    const url = `https://cors-anywhere.herokuapp.com/https://api.darksky.net/forecast/69cd3206ef1d5da506b4a4d38c85ece9/${this.props.chatroom.latitude},${this.props.chatroom.longitude}?units=auto`;
    axios({
      url: url,
      responseType: "json",
      crossdomain: true
    }).then(data => this.setState({temperature : data.data.currently.temperature , description: data.data.currently.summary})); 
  }

  render() {
    const { chatroom: { _id, name, description, latitude, longitude } } = this.props;
    return <MarkerWithLabel
      position={{ lat: latitude, lng: longitude }}
      labelClass="chatrooms-map__label"
      labelAnchor={{ x: -20, y: 20 }}
      onClick={(e) => this.gotoChatroom(e, _id)}
    >
      <div className="chatrooms-map__label-content">
        <h2 className="chatrooms-map__label-title">#{name}</h2>
        {description ? <p>{description}</p> : ""}
        <h3 className="chatrooms-map__label-weather">Weather:</h3>
        <h4 className="chatrooms-map__label-summary">{this.state.description}</h4>
        <h4 className="chatrooms-map__label-temp">Temp: {this.state.temperature}C</h4> 
      </div>
    </MarkerWithLabel>;
  }
}

export default withRouter(ChatroomLabel);