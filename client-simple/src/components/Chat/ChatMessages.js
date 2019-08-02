import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql, compose } from "react-apollo";
import _ from "lodash";
import { Message, MessageText } from "../Message/Message";
import withSocket from "../withSocket";
import withUserContext from "../withUserContext";
import Filter from "bad-words";

class ChatMessages extends Component {
  state = {
    messages: [],
    guestId: localStorage.getItem("guest_ID") || null,
    guestName: localStorage.getItem("guest_Username") || null
  };

  Filter = require("bad-words");
  filter = new Filter();

  loggedUserId = () => _.get(this.props, ["context", "userState", "user", "id"], null);

  componentDidMount = async () => {
    const { socket } = this.props;
    
    socket.on("message", msg => this.handleIncomingMessage(msg));
  };

  componentDidUpdate() {
    this.scrollToBottomElement.scrollIntoView({behavior: "smooth"});
  }

  handleIncomingMessage = msg => this.setState({messages: [...this.state.messages, msg]});

  renderMessage = (message) => {
    const {guestId } = this.state;

    const getMsgAuthorNickname = () => {
      const _socketIoNickname = message.from && message.from.nickname;
      const _graphQlNickname = _.get(message, ["from", "profile", "firstName"], null);
      const {guestName} = message;

      return _socketIoNickname || _graphQlNickname || guestName || "Unknown User";
    };

    const isMsgOfMine = (message.from && message.from._id || message.guestId) === (this.loggedUserId() || guestId);

    return (
      <Message key={message._id} author={getMsgAuthorNickname()} toRight={isMsgOfMine} timestamp={message.createdAt}>
        <MessageText variant={(isMsgOfMine) ? "primary" : ""}>{this.filter.clean(message.msg)}</MessageText>
      </Message>
    );
  };

  render() {
    const { messages } = this.state;
    const {previousMessages = []} = this.props;
    const newPreviousAndNewMessages = [...previousMessages, ...messages];

    return (
      <>
        {newPreviousAndNewMessages.map((message) => this.renderMessage(message))}
        <div ref={el => {this.scrollToBottomElement = el; }} />
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
  options: (props) => ({ variables: { chatroom: props.match.params.chatId }}),
  props: ({ data }) => ({previousMessages: data.messages})
});

export default compose(withPreviousMessages)(withSocket(withUserContext(ChatMessages)));