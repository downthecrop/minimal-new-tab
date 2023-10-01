import React from "react";
import appsIcon from "../img/apps.webp";

const Header = ({ showTopBarEnabled }) => {
  return (
    <header>
      <ul style={{ visibility: showTopBarEnabled ? "visible" : "hidden" }}>
        <li><a href="#user"><button className="signbutton" type="button">Sign in</button></a></li>
        <li><a href="#apps"><img className="grid" src={appsIcon} title="Google apps" /></a></li>
        <li><a href="https://www.google.ca/imghp?hl=en&tab=ri&ogbl">Images</a></li>
        <li><a href="https://mail.google.com/mail/?tab=rm&ogbl">Gmail</a></li>
      </ul>
    </header>
  )
}

export default Header;