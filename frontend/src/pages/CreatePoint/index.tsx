import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet'
import {LeafletMouseEvent} from 'leaflet';
import axios from 'axios';
import api from '../../services/api';

import './styles.css';

import logo from '../../assets/logo.svg';

interface Item {
  id:number;
  title:string;
  image_url:string;
}

interface IBGEUFResponse {
  //sigla: string;
term: string;

}





interface IBGECityResponse {
  nome: string;
}


const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [codeUfs, setCodeUfs] = useState<number[]>([]);
  const [selectedUf, setSelectedUf] = useState<number>(0);
  const [nameSelectedUf, setNameSelectedUf] = useState<string>('0')
  const [cities, setCities] = useState<string[]>([]);
  const [selectedCity, setSelectedCity] = useState<string>('0');
  const [selectedPoisition, setSelectedPoisition] = useState<[number,number]>([0,0]);
  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0]);
  const [formData, setFormData] = useState({
    name:'',
    email:'',
    whatsapp:''
  });
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const history = useHistory();



useEffect(()=>{
  navigator.geolocation.getCurrentPosition(position => {
    const {latitude, longitude} = position.coords;

    setInitialPosition([
      latitude,
      longitude
    ])
  })
},[]);

  useEffect(()=>{
    api.get('items').then(response => {
     setItems(response.data);
    })
  },[])

  // useEffect(()=>{
  //   axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
  //     .then(response => {
  //       const ufInitials = response.data.map(uf=>uf.sigla);
  //       setUfs(ufInitials);

  //   });
  // },[])

  useEffect(()=>{
    axios.get('http://geogratis.gc.ca/services/geoname/en/codes/province.json')
      .then(response => {

        const {definitions} = response.data;
        const ufInitials = definitions.map((province: { description: any; }) => province.description);
        const ufCode = definitions.map((province: { code: any; }) =>
            {
              return (
                province.code
              )
            }

        );

        console.log(ufInitials);
        console.log(ufCode);
        setUfs(ufInitials);
        setCodeUfs(ufCode);

      });
  },[])

  useEffect(()=>{
    if (selectedUf===0){
      return;
    }
    axios
      .get(`http://geogratis.gc.ca/services/geoname/en/geonames.json?province=${selectedUf}&concise=CITY&sort-field=name`)
      .then(response => {
        const {items} = response.data;
        //console.log(response.data);
        const cityNames = items.map((city: { name: any; })=>city.name);
        //console.log(cityNames);
        setCities(cityNames);
    })
  },[selectedUf]);
  // useEffect(()=>{
  //   if (selectedUf==='0'){
  //     return;
  //   }
  //   axios
  //     .get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
  //     .then(response => {
  //       const cityNames = response.data.map(city=>city.nome);
  //       setCities(cityNames);
  //   })
  // },[selectedUf]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement> ) {
    const uf = event.target.value;
    const indexSelectedUf = event.currentTarget.selectedIndex
   // console.log(codeUfs[indexSelectedUf-1]);
    setSelectedUf(codeUfs[indexSelectedUf-1]);
    setNameSelectedUf(uf);

  }
  function handleSelectCity(event: ChangeEvent<HTMLSelectElement> ) {
    const city = event.target.value;
    setSelectedCity(city);
  }

  function handleMapClick(event: LeafletMouseEvent){
    setSelectedPoisition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement> ) {

    const {name, value} = event.target;
    setFormData({...formData, [name]: value});
  }


  function handleSelectItem(id: number){

    const alreadySelected = selectedItems.findIndex(item => item ===id);

    if(alreadySelected >= 0 ){
      const filteredItems = selectedItems.filter(item=>item!==id)
      setSelectedItems(filteredItems);

    }else{
    setSelectedItems([...selectedItems, id]);
    }
  }

  async function handleSubmit(event: FormEvent){
    event.preventDefault();


    const {name, email, whatsapp} = formData;
    const uf = nameSelectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPoisition;
    const items = selectedItems;

    const data = {
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    };
    try {
        await api.post('points', data);
        alert('Success! Thank you for register your depot.');
        history.push('/');
    } catch (error) {
       console.log(error);
    }

  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Back</Link>
      </header>
      <form onSubmit={handleSubmit}>
        <h1>Create the <br/> recycling depot</h1>
        <fieldset>
          <legend>
            <h2>Information</h2>
            </legend>
        </fieldset>
        <div className="field">
          <label htmlFor="name">Name of organization</label>
          <input
            type="text"
            name="name"
            id="name"
            onChange={handleInputChange}
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input
              type="email"
              name="email"
              id="email"
              onChange={handleInputChange}
            />
          </div>

          <div className="field">
            <label htmlFor="whatsapp">Phone Number</label>
            <input
              type="text"
              name="whatsapp"
              id="whatsapp"
              onChange={handleInputChange}
            />
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Address</h2>
            <span>Select the exact point using the map</span>
          </legend>

          <Map center={initialPosition} zoom={15} onClick={handleMapClick}>
          <TileLayer
          attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

          <Marker position={selectedPoisition}/>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Province</label>
              <select
                name="uf"
                id="uf"
                value={nameSelectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Select the province</option>
                {ufs.map(uf=>{
                  return(
                    <option key={uf} value={uf}>{uf}</option>
                  )
                })}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">City</label>
              <select name="city" id="city" value={selectedCity}
                onChange={handleSelectCity}>
                <option value="0">Select the city</option>
                {cities.map(city=>{
                  return(
                    <option key={city} value={city}>{city}</option>
                  )
                })}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Accepted items in this location</h2>
            <span>Select one or more materials below</span>
          </legend>

          <ul className="items-grid">
            {items.map(item=> (
              <li
                key={item.id}
                onClick={()=>handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.image_url} alt={item.title}/>
                <span>{item.title}</span>
              </li>
            ))}


          </ul>
        </fieldset>

        <button type="submit">Create the depot</button>

      </form>
    </div>
  )
}

export default CreatePoint;
