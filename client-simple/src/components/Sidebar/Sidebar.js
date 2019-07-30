import React, { Component } from "react";
import gql from "graphql-tag";
import MenuIconSvg from "../../assets/svg/menu.svg";
import { compose, graphql } from "react-apollo";
import _ from "lodash";
import LeaveSvg from "../../assets/svg/leave.svg";
import logo from "../../assets/images/logo.png";
import Button from "../Button/Button";
import "./Sidebar.style.scss";
import { UserContext } from "../../services/userContext";
import { Link } from "react-router-dom";
import NightToggler from "../NightToggler/NightToggler";

const SidebarMessage = ({ children }) => {
  return (
    <div className="sidebar__message">
      <span className="sidebar__text">{children}</span>
    </div>
  );
};

const SidebarItem = ({ title, url, exitUrl }) => {
  return (
    <div className="sidebar__item">
      <a href={url} className="sidebar__title">{title}</a>

      {exitUrl && (
        <a href={exitUrl}>
          <img src={LeaveSvg} className="sidebar__icon" alt="Leave Channel" />
        </a>
      )}
    </div>
  );
};

const SidebarArea = ({ heading, children }) => {
  return (
    <div className="sidebar__area">
      <h2 className="sidebar__heading sidebar__heading--small">{heading}</h2> 
      {children}
    </div>
  );
};

class Sidebar extends Component {
  state = {
    sidebarOpen: false,
    darkMode: false
  };

  getUserName(userState = {user: {}}) {
    const { user } = userState;
    
    if (!user) return "Guest";
    else return user.profile && user.profile.firstName;
  }

  renderAccountsActions(userState, {logOut = () => null}) {
    if (!userState.user)
      return <p className={this.state.darkMode ? "sidebar__dark-acc-actions" : "sidebar__acc-actions"}><a href="/login" className="sidebar__link">Login</a> or <a href="/register" className="sidebar__link">register</a> if you don't have an account yet!</p>;
    else {
      // DK: NOBODY GOT TIME FOR THAT（╯°□°）╯︵ ┻━┻
      // eslint-disable-next-line jsx-a11y/anchor-is-valid
      return <p className="sidebar__acc-actions"><a onClick={logOut} className="sidebar__link">Logout</a></p>;
    }
  }

  toggleDarkMode = () => {
    this.setState({darkMode: !this.state.darkMode});
  }

  render() {
    const { darkMode } = this.state;
    const { sidebarOpen } = this.state;
    const isActive = sidebarOpen ? "is-active" : "";

    return (
      <>
        <button className="sidebar__toggler" onClick={() => this.setState({sidebarOpen: !this.state.sidebarOpen}) }>
          <img src={MenuIconSvg} alt="" />
        </button>

        <section className={"sidebar " + isActive} style={this.state.darkMode ? {backgroundColor: "#7c7c7c"} : {backgroundColor: "#443060"} }>
          <header className={this.state.darkMode ? "sidebar__dark-header" : "sidebar__header"}>
            <UserContext.Consumer>
              {({ logOut, userState }) => <>
                <Link to="/">
                  <img src={logo} className="sidebar__img" alt="" />
                </Link>
                <h1 className="sidebar__heading">Hello, {this.getUserName(userState)}</h1>
                {this.renderAccountsActions(userState, {logOut})}
              </>}
            </UserContext.Consumer>
          </header>

          <div className="sidebar__content">
            {this.props.children}
          </div>

          <UserContext.Consumer>
            {({ userState }) => <>
              <footer className="sidebar__footer">
                {userState.user ? (
                  <Button href="/create" variant="primary" additionalClass="sidebar__btn" isLink>Create Channel</Button>
                ) : (
                  <Button href="/register" variant="primary" additionalClass="sidebar__btn" isLink>Create Account</Button>
                )}
                <NightToggler isChecked={darkMode} toggleNightMode={this.toggleDarkMode} />
              </footer>
            </>}
          </UserContext.Consumer>
        </section>
      </>
    );
  }
}

export default Sidebar;
export { SidebarArea, SidebarItem, SidebarMessage };