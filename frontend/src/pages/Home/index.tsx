import React from 'react';
import { Link } from 'react-router-dom';
import './styles.css';
import logo from '../../assets/logo.svg';
import {FiLogIn} from 'react-icons/fi'


const Home = () => {
  return (
    <div id="page-home">
      <div className="content">
        <header>
        <img src={logo} alt="Ecoleta"/>
        </header>

        <main>
          <h1>
            Your one stop source to find recycling depots.
          </h1>
          <p>We help people find drop-off locations for materials that don’t belong in the blue bin but can be recycled.</p>
          <Link to="/create-point">
            <span> <FiLogIn/> </span>
            <strong>Create a new recycling depot</strong>
          </Link>
        </main>
      </div>
    </div>
  )
}

export default Home;