import React, {Component} from "react";
import gql from "graphql-tag";
import {compose, graphql} from "react-apollo";
import _ from "lodash";
import {Message, MessageText} from "../Message/Message";
import withSocket from "../withSocket";
import withUserContext from "../withUserContext";
import {NotificationContainer, NotificationManager} from "react-notifications";
import "react-notifications/lib/notifications.css";

class ChatMessages extends Component {
  state = {
    messages: [],
    guestId: localStorage.getItem("guest_ID") || null,
    guestName: localStorage.getItem("guest_Username") || null
  };

  loggedUserId = () => _.get(this.props, ["context", "userState", "user", "id"], null);

  componentDidMount = async () => {
    const {socket} = this.props;

    socket.on("message", msg => this.handleIncomingMessage(msg));
  };

  componentDidUpdate() {
    this.scrollToBottomElement.scrollIntoView({behavior: "smooth"});
  }

  handleIncomingMessage = msg => {
    this.setState({
      messages: [...this.state.messages, msg]
    });

    if (msg.from._id !== this.loggedUserId() && msg.from._id !== this.state.guestId) {
      let checkedMessage = "";

      if (msg.msg.length > 20) {
        checkedMessage = msg.msg.substring(0, 20);
      } else {
        checkedMessage = msg.msg;
      }

      NotificationManager.success(checkedMessage, msg.from.nickname, 10000);
    }

  };

  renderMessage = (message) => {
    const {guestId} = this.state;

    const getMsgAuthorNickname = () => {
      const _socketIoNickname = message.from && message.from.nickname;
      const _graphQlNickname = _.get(message, ["from", "profile"], null);
      const {guestName} = message;

      return _socketIoNickname || _graphQlNickname && _graphQlNickname.firstName + " " + _graphQlNickname.lastName || guestName || "Unknown User";
    };

    const isMsgOfMine = (message.from && message.from._id || message.guestId) === (this.loggedUserId() || guestId);

    return (
      <Message key={message._id} author={getMsgAuthorNickname()} toRight={isMsgOfMine} timestamp={message.createdAt}>
        <MessageText chosenLink={this.props.chosenLink} variant={(isMsgOfMine) ? "primary" : ""}>{message.msg}</MessageText>
      </Message>
    );
  };

  render() {
    const {messages} = this.state;
    const {previousMessages = []} = this.props;
    const newPreviousAndNewMessages = [...previousMessages, ...messages];

    return (
      <>
        {newPreviousAndNewMessages.map((message) => this.renderMessage(message))}
        <div ref={el => {
          this.scrollToBottomElement = el;
        }}/>
        <NotificationContainer/>
      </>
    );
  }
}

const GET_PREVIOUS_MESSAGES = gql`
  query($chatroom: String!) {
    messages(chatroom: $chatroom) {
      _id
      from {
        _id
        profile {
          firstName
          lastName
        }
      }
      msg
      guestId
      guestName
      createdAt
    }
  }
`;

const withPreviousMessages = graphql(GET_PREVIOUS_MESSAGES, {
  options: (props) => ({variables: {chatroom: props.match.params.chatId}}),
  props: ({data}) => ({previousMessages: data.messages})
});

export default compose(withPreviousMessages)(withSocket(withUserContext(ChatMessages)));